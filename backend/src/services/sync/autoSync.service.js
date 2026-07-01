import { User } from '../../database/index.js';
import logger from '../../config/logger.js';
import { env } from '../../config/env.js';
import * as spotifyTrackService from '../spotify/spotifyTrack.service.js';

const ACTIVE_WINDOW_DAYS = 90;
const STALE_SYNC_MINUTES = 30;

const createSummary = () => ({
  usersChecked: 0,
  usersSynced: 0,
  usersSkipped: 0,
  usersFailed: 0,
  totalTracksAdded: 0,
  totalTracksSkipped: 0
});

const isEnabled = () => String(env.AUTO_SYNC_ENABLED).toLowerCase() === 'true';

const getBatchSize = () => {
  const parsed = Number.parseInt(env.AUTO_SYNC_BATCH_SIZE, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 10;
};

const getActiveCutoff = (now) => new Date(now.getTime() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000);

const getStaleSyncCutoff = (now) => new Date(now.getTime() - STALE_SYNC_MINUTES * 60 * 1000);

const getCandidates = async (now, batchSize, userFilter = {}) => {
  const activeCutoff = getActiveCutoff(now);
  const baseQuery = {
    isActive: { $ne: false },
    $or: [
      { lastLogin: { $gte: activeCutoff } },
      { connectedAt: { $gte: activeCutoff } },
      { updatedAt: { $gte: activeCutoff } }
    ]
  };

  return User.find({ $and: [baseQuery, userFilter] })
    .sort({ 'sync.lastSuccessfulSyncAt': 1, updatedAt: 1 })
    .limit(batchSize)
    .select('+spotify')
    .exec();
};

const hasRefreshToken = (user) => Boolean(user?.spotify?.refreshToken);

const isUserSyncing = (user, now) => (
  user.autoSyncInProgress &&
  user.autoSyncStartedAt &&
  user.autoSyncStartedAt > getStaleSyncCutoff(now)
);

const claimUser = async (userId, now) => User.findOneAndUpdate(
  {
    _id: userId,
    $or: [
      { autoSyncInProgress: { $ne: true } },
      { autoSyncStartedAt: { $lt: getStaleSyncCutoff(now) } },
      { autoSyncStartedAt: { $exists: false } }
    ]
  },
  {
    $set: {
      autoSyncInProgress: true,
      autoSyncStartedAt: now,
      'sync.lastSyncAt': now
    }
  },
  { returnDocument: 'after' }
);

const markSuccess = async (userId, now, result) => User.updateOne(
  { _id: userId },
  {
    $set: {
      autoSyncInProgress: false,
      autoSyncStartedAt: null,
      'sync.lastSuccessfulSyncAt': now,
      'sync.lastSyncError': null,
      'sync.tracksAdded': result.newTracks || 0,
      'sync.tracksSkipped': result.duplicates || 0
    }
  }
);

const markFailure = async (userId, now, error) => User.updateOne(
  { _id: userId },
  {
    $set: {
      autoSyncInProgress: false,
      autoSyncStartedAt: null,
      'sync.lastFailedSyncAt': now,
      'sync.lastSyncError': error?.message || 'Auto sync failed'
    }
  }
);

export const runAutoSync = async ({
  syncRecentlyPlayed = spotifyTrackService.syncRecentlyPlayed,
  now = new Date(),
  userFilter = {}
} = {}) => {
  const summary = createSummary();

  if (!isEnabled()) {
    logger.info('[AutoSync] Skipped because AUTO_SYNC_ENABLED is not true.');
    return summary;
  }

  const users = await getCandidates(now, getBatchSize(), userFilter);
  summary.usersChecked = users.length;

  for (const user of users) {
    if (user.autoSyncEnabled === false || !hasRefreshToken(user) || isUserSyncing(user, now)) {
      summary.usersSkipped += 1;
      continue;
    }

    const claimedUser = await claimUser(user._id, now);
    if (!claimedUser) {
      summary.usersSkipped += 1;
      continue;
    }

    try {
      const result = await syncRecentlyPlayed(claimedUser, {
        after: claimedUser.sync?.lastSuccessfulSyncAt
      });
      await markSuccess(claimedUser._id, new Date(), result);

      summary.usersSynced += 1;
      summary.totalTracksAdded += result.newTracks || 0;
      summary.totalTracksSkipped += result.duplicates || 0;
    } catch (error) {
      await markFailure(claimedUser._id, new Date(), error);
      summary.usersFailed += 1;
      logger.warn(`[AutoSync] User sync failed for user ${claimedUser._id}: ${error?.message || 'Unknown error'}`);
    }
  }

  logger.info('[AutoSync] Completed run', summary);
  return summary;
};

export default {
  runAutoSync
};
