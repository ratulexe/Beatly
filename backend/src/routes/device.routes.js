import express from 'express';
import { spotifyAuth as requireAuth } from '../middlewares/spotifyAuth.js';
import * as deviceService from '../services/sync/device.service.js';
import { forceLogoutDevice, broadcastSyncEvent } from '../services/sync/sync.service.js';

import { body, validationResult } from 'express-validator';

const router = express.Router();

router.use(requireAuth);

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const destroySessionById = (req, sessionId) => new Promise((resolve, reject) => {
  if (!sessionId || !req.sessionStore?.destroy) return resolve();
  req.sessionStore.destroy(sessionId, (error) => (error ? reject(error) : resolve()));
});

router.get('/', async (req, res) => {
  try {
    const devices = await deviceService.getDevices(req.user.id);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

router.post('/register', validate([
  body('deviceName').trim().notEmpty().withMessage('Device name is required'),
  body('deviceType').isIn(['desktop', 'mobile', 'tablet', 'web']).withMessage('Invalid device type'),
  body('platform').trim().notEmpty().withMessage('Platform is required'),
]), async (req, res) => {
  try {
    const device = await deviceService.registerDevice(req.user.id, {
      ...req.body,
      sessionId: req.sessionID
    });
    res.json({ device, sessionId: device.sessionId });
  } catch (error) {
    console.error('Failed to register device:', error);
    res.status(500).json({ error: 'Failed to register device', details: error.message });
  }
});

router.patch('/:id', validate([
  body('deviceName').optional().trim().isLength({ min: 1, max: 120 }).withMessage('Device name must be 1-120 characters'),
  body('appVersion').optional().trim().isLength({ min: 1, max: 40 }).withMessage('App version must be 1-40 characters'),
  body().custom((value) => {
    const allowed = new Set(['deviceName', 'appVersion']);
    const invalid = Object.keys(value).filter((key) => !allowed.has(key));
    if (invalid.length > 0) {
      throw new Error(`Unsupported device fields: ${invalid.join(', ')}`);
    }
    return true;
  })
]), async (req, res) => {
  try {
    const device = await deviceService.updateDevice(req.params.id, req.user.id, req.body);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    broadcastSyncEvent(req.user.id, 'device_updated', { deviceId: device._id, updates: req.body });
    res.json(device);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update device' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const device = await deviceService.removeDevice(req.params.id, req.user.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    
    // Emit force_logout event to the targeted device
    forceLogoutDevice(req.params.id);
    await destroySessionById(req, device.sessionId);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove device' });
  }
});

export default router;
