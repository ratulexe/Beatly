import SyncQueue from '../../models/SyncQueue.model.js';
import logger from '../../config/logger.js';
import { User } from '../../database/index.js';
import * as deviceService from './device.service.js';
import * as friendService from '../group/friend.service.js';
import * as groupService from '../group/group.service.js';
import * as spotifyTrackService from '../spotify/spotifyTrack.service.js';
import * as spotifyUserService from '../spotify/spotifyUser.service.js';

const MAX_RETRIES = 5;
const BACKOFF_BASE_MS = 1000; // 1s, 2s, 4s, 8s, 16s

export const enqueueMutations = async (mutations, user, deviceId) => {
  const queued = [];
  for (const m of mutations) {
    if (!m.mutationId || !m.type || !m.action || !m.clientTimestamp) {
      throw new Error('Mutation must include mutationId, type, action, and clientTimestamp');
    }

    // Check if already exists (idempotency)
    const existing = await SyncQueue.findOne({ mutationId: m.mutationId, user: user._id });
    if (!existing) {
      const newQueue = await SyncQueue.create({
        mutationId: m.mutationId,
        user: user._id,
        device: deviceId,
        type: m.type,
        action: m.action,
        payload: m.payload,
        clientTimestamp: m.clientTimestamp
      });
      queued.push(newQueue);
    }
  }
  return queued;
};

export const processQueue = async () => {
  // Find pending or failed (with retries left and backoff elapsed)
  const now = new Date();
  
  const tasks = await SyncQueue.find({
    status: { $in: ['pending', 'failed'] },
    retryCount: { $lt: MAX_RETRIES }
  }).sort({ clientTimestamp: 1 }).limit(50); // Process in order, batch of 50

  for (const task of tasks) {
    // Check exponential backoff
    if (task.status === 'failed' && task.lastRetry) {
      const backoffMs = BACKOFF_BASE_MS * Math.pow(2, task.retryCount);
      const nextRetry = new Date(task.lastRetry.getTime() + backoffMs);
      if (now < nextRetry) continue; // Wait longer
    }

    task.status = 'processing';
    await task.save();

    try {
      const result = await processMutation(task);
      task.status = 'completed';
      task.payload = {
        request: task.payload,
        result
      };
      task.error = null;
      await task.save();
    } catch (error) {
      logger.error(`SyncQueue Error Processing ${task.mutationId}:`, error);
      task.retryCount += 1;
      task.lastRetry = new Date();
      task.error = error.message || 'Unknown error';
      
      if (task.retryCount >= MAX_RETRIES) {
        task.status = 'dlq'; // Dead Letter Queue
      } else {
        task.status = 'failed';
      }
      await task.save();
    }
  }
};

const processMutation = async (task) => {
  const user = await User.findById(task.user);
  if (!user) throw new Error('Sync user not found');

  switch (task.type) {
    case 'api_request':
      return await processApiRequestMutation(task, user);
    case 'friend':
      return await processFriendMutation(task, user);
    case 'group':
      return await processGroupMutation(task, user);
    case 'track':
      return await spotifyTrackService.syncRecentlyPlayed(user);
    case 'profile':
      return await spotifyUserService.updateUserProfile(user._id);
    default:
      throw new Error(`Unsupported sync mutation type: ${task.type}`);
  }
};

const normalizePath = (value = '') => {
  try {
    const parsed = value.startsWith('http') ? new URL(value) : new URL(value, 'http://beatly.local');
    return parsed.pathname;
  } catch {
    return value.split('?')[0];
  }
};

const processApiRequestMutation = async (task, user) => {
  const payload = task.payload || {};
  const method = String(payload.method || '').toUpperCase();
  const path = normalizePath(payload.url || task.action);
  const data = payload.data || {};

  if (method === 'PATCH' && path === '/api/tracks/sync') {
    return await spotifyTrackService.syncRecentlyPlayed(user);
  }

  if (method === 'PATCH' && path === '/api/user/sync') {
    return await spotifyUserService.updateUserProfile(user._id);
  }

  if (method === 'POST' && path === '/api/friends/request') {
    return await friendService.sendFriendRequest(user._id, data.receiverId);
  }

  const friendRequestMatch = path.match(/^\/api\/friends\/request\/([^/]+)$/);
  if (method === 'PATCH' && friendRequestMatch) {
    return await friendService.respondToFriendRequest(friendRequestMatch[1], user._id, data.status);
  }

  const friendMatch = path.match(/^\/api\/friends\/([^/]+)$/);
  if (method === 'DELETE' && friendMatch) {
    await friendService.removeFriend(user._id, friendMatch[1]);
    return { success: true };
  }

  if (method === 'POST' && path === '/api/groups') {
    return await groupService.createGroup(data, user._id);
  }

  const groupMemberMatch = path.match(/^\/api\/groups\/([^/]+)\/members\/([^/]+)$/);
  if (method === 'DELETE' && groupMemberMatch) {
    return await groupService.removeMember(groupMemberMatch[1], groupMemberMatch[2], user._id);
  }

  const groupMatch = path.match(/^\/api\/groups\/([^/]+)$/);
  if (method === 'PATCH' && groupMatch) {
    return await groupService.updateGroup(groupMatch[1], data, user._id);
  }
  if (method === 'DELETE' && groupMatch) {
    return await groupService.deleteGroup(groupMatch[1], user._id);
  }

  const deviceMatch = path.match(/^\/api\/devices\/([^/]+)$/);
  if (method === 'PATCH' && deviceMatch) {
    return await deviceService.updateDevice(deviceMatch[1], user._id, data);
  }
  if (method === 'DELETE' && deviceMatch) {
    return await deviceService.removeDevice(deviceMatch[1], user._id);
  }

  throw new Error(`Unsupported API replay mutation: ${method} ${path}`);
};

const processFriendMutation = async (task, user) => {
  const payload = task.payload || {};
  if (task.action === 'send_request') {
    return await friendService.sendFriendRequest(user._id, payload.receiverId);
  }
  if (task.action === 'respond_request') {
    return await friendService.respondToFriendRequest(payload.requestId, user._id, payload.status);
  }
  if (task.action === 'remove_friend') {
    await friendService.removeFriend(user._id, payload.friendId);
    return { success: true };
  }
  throw new Error(`Unsupported friend mutation action: ${task.action}`);
};

const processGroupMutation = async (task, user) => {
  const payload = task.payload || {};
  if (task.action === 'create') {
    return await groupService.createGroup(payload.groupData || payload, user._id);
  }
  if (task.action === 'update') {
    return await groupService.updateGroup(payload.groupId, payload.updateData || payload.data, user._id);
  }
  if (task.action === 'delete') {
    return await groupService.deleteGroup(payload.groupId, user._id);
  }
  if (task.action === 'remove_member') {
    return await groupService.removeMember(payload.groupId, payload.userId, user._id);
  }
  throw new Error(`Unsupported group mutation action: ${task.action}`);
};

export const getSyncStatus = async (user) => {
  const [pending, failed, completed, dlq, latestCompleted] = await Promise.all([
    SyncQueue.countDocuments({ user: user._id, status: 'pending' }),
    SyncQueue.countDocuments({ user: user._id, status: 'failed' }),
    SyncQueue.countDocuments({ user: user._id, status: 'completed' }),
    SyncQueue.countDocuments({ user: user._id, status: 'dlq' }),
    SyncQueue.findOne({ user: user._id, status: 'completed' }).sort({ updatedAt: -1 }).select('updatedAt')
  ]);
  
  return {
    pending,
    failed,
    completed,
    dlq,
    lastSuccessfulSync: latestCompleted?.updatedAt || null
  };
};
