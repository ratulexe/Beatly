import express from 'express';
import { body, validationResult } from 'express-validator';
import { spotifyAuth as requireAuth } from '../middlewares/spotifyAuth.js';
import * as syncService from '../services/sync/sync.service.js';
import * as syncQueueService from '../services/sync/syncQueue.service.js';
import * as deviceService from '../services/sync/device.service.js';

const router = express.Router();

router.use(requireAuth);

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/status', async (req, res) => {
  const metrics = await syncQueueService.getSyncStatus(req.user);
  res.json({ status: 'online', message: 'Sync engine is running.', metrics });
});

router.post('/mutations', validate([
  body('mutations').isArray().withMessage('Mutations must be an array'),
  body('deviceId').isString().withMessage('Device ID is required'),
  body('mutations.*.mutationId').isString().notEmpty().withMessage('Mutation ID is required'),
  body('mutations.*.type').isString().notEmpty().withMessage('Mutation type is required'),
  body('mutations.*.action').isString().notEmpty().withMessage('Mutation action is required'),
  body('mutations.*.clientTimestamp').isISO8601().withMessage('Client timestamp is required')
]), async (req, res) => {
  const { mutations, deviceId } = req.body;
  if (!mutations || !Array.isArray(mutations)) {
    return res.status(400).json({ success: false, message: 'Invalid mutations payload' });
  }

  const device = await deviceService.getDeviceById(deviceId, req.user.id);
  if (!device) {
    return res.status(403).json({ success: false, message: 'Device does not belong to the authenticated user' });
  }

  // Enqueue all mutations idempotently
  const queued = await syncQueueService.enqueueMutations(mutations, req.user, deviceId);
  
  // Trigger immediate processing
  syncQueueService.processQueue().catch(err => console.error(err));

  res.json({ success: true, message: `Queued ${queued.length} new mutations.`, queued: queued.length });
});

router.post('/', (req, res) => {
  // Trigger incremental sync
  syncService.broadcastSyncEvent(req.user.id, 'incremental_sync', req.body);
  res.json({ success: true, message: 'Incremental sync triggered' });
});

router.post('/full', (req, res) => {
  // Trigger full sync
  syncService.broadcastSyncEvent(req.user.id, 'full_sync', req.body);
  res.json({ success: true, message: 'Full sync triggered' });
});

export default router;
