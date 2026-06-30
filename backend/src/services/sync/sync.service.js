import { markDeviceOnline, markDeviceOffline } from './presence.service.js';
import * as deviceService from './device.service.js';
import logger from '../../config/logger.js';
import { sessionMiddleware } from '../../config/session.js';

let ioInstance = null;

export const initSyncService = (io) => {
  ioInstance = io;

  // 1. Session Middleware
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  // 2. Authentication Middleware
  io.use((socket, next) => {
    const session = socket.request.session;
    if (session && session.userId) {
      socket.user = { id: session.userId };
      return next();
    }
    return next(new Error('Authentication error'));
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.user.id})`);

    // Automatically join the user's private room
    socket.join(`user_${socket.user.id}`);

    // Basic Ping/Pong for heartbeat
    socket.on('ping', (cb) => {
      if (typeof cb === 'function') cb('pong');
    });

    socket.on('register_device', async (data) => {
      try {
        const { deviceId } = data;
        if (deviceId) {
          // Additional layer of security: Ensure the device belongs to the authenticated user
          const device = await deviceService.getDeviceById(deviceId, socket.user.id);
          if (!device || device.user.toString() !== socket.user.id) {
            socket.emit('device_not_found');
            return;
          }

          // Duplicate Connection Prevention
          const deviceRoom = `device_${deviceId}`;
          const existingSockets = await io.in(deviceRoom).fetchSockets();
          for (const s of existingSockets) {
            if (s.id !== socket.id) {
              logger.info(`Disconnecting older socket ${s.id} for device ${deviceId}`);
              s.emit('duplicate_connection');
              s.disconnect(true);
            }
          }

          const updated = await markDeviceOnline(socket.id, deviceId);
          if (!updated) {
            socket.emit('device_not_found');
          } else {
            socket.join(deviceRoom);
            socket.emit('sync_status', { status: 'online', deviceId });
          }
        }
      } catch (e) {
        logger.error('Failed to register device presence', e);
      }
    });

    socket.on('disconnect', async () => {
      await markDeviceOffline(socket.id);
      logger.info(`Socket disconnected: ${socket.id} (User: ${socket.user.id})`);
    });
  });
};

export const broadcastSyncEvent = (userId, eventType, payload) => {
  if (!ioInstance) return;
  // Emit exclusively to the authenticated user's room
  ioInstance.to(`user_${userId}`).emit('sync_event', { userId, eventType, payload });
};

export const forceLogoutDevice = (deviceId) => {
  if (!ioInstance) return;
  ioInstance.to(`device_${deviceId}`).emit('force_logout');
};
