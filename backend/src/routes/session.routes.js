import express from 'express';
import { spotifyAuth as requireAuth } from '../middlewares/spotifyAuth.js';
import * as deviceService from '../services/sync/device.service.js';
import { forceLogoutDevice } from '../services/sync/sync.service.js';

const router = express.Router();

router.use(requireAuth);

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
    res.json({ success: true, message: 'Device logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout device' });
  }
});

export default router;
