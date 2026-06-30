import express from 'express';
import { spotifyAuth as requireAuth } from '../middlewares/spotifyAuth.js';
import * as deviceService from '../services/sync/device.service.js';
import { forceLogoutDevice } from '../services/sync/sync.service.js';

const router = express.Router();

router.use(requireAuth);

const destroySessionById = (req, sessionId) => new Promise((resolve, reject) => {
  if (!sessionId || !req.sessionStore?.destroy) return resolve();
  req.sessionStore.destroy(sessionId, (error) => (error ? reject(error) : resolve()));
});

router.get('/devices', async (req, res) => {
  try {
    const devices = await deviceService.getDevices(req.user.id);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session devices' });
  }
});

router.post('/logout-device', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'Session ID required' });
    
    const device = await deviceService.logoutDevice(sessionId, req.user.id);
    if (!device) return res.status(404).json({ error: 'Device session not found' });

    forceLogoutDevice(device._id);
    await destroySessionById(req, sessionId);
    res.json({ success: true, message: 'Device logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout device' });
  }
});

export default router;
