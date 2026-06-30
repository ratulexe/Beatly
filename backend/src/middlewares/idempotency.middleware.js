import { SyncQueue } from '../database/index.js'; // Exported from database/index.js
import * as deviceService from '../services/sync/device.service.js';

export const idempotencyMiddleware = async (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const idempotencyKey = req.headers['x-idempotency-key'];
    if (idempotencyKey && req.user && req.headers['x-device-id']) {
      try {
        const device = await deviceService.getDeviceById(req.headers['x-device-id'], req.user._id);
        if (!device) {
          return res.status(403).json({ success: false, message: 'Invalid device for idempotent request' });
        }

        const existing = await SyncQueue.findOne({ mutationId: idempotencyKey, user: req.user._id });
        if (existing) {
          // If already completed, just return success
          if (existing.status === 'completed') {
            return res.json({ success: true, message: 'Already processed (Idempotent)', data: existing.payload });
          } else if (existing.status === 'processing') {
            return res.status(409).json({ success: false, message: 'Currently processing' });
          }
        } else {
          // Record it as completed once response is sent
          const originalSend = res.json;
          res.json = function(data) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              SyncQueue.create({
                mutationId: idempotencyKey,
                user: req.user._id,
                device: req.headers['x-device-id'],
                type: 'api_request',
                action: req.originalUrl,
                payload: data,
                status: 'completed',
                clientTimestamp: new Date()
              }).catch(err => console.error('Failed to log idempotency', err));
            }
            return originalSend.call(this, data);
          };
        }
      } catch (err) {
        console.error('Idempotency error', err);
      }
    }
  }
  next();
};
