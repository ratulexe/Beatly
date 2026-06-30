import express from 'express';
import { discoverService } from '../services/discover/discover.service.js';
import { spotifyAuth } from '../middlewares/spotifyAuth.js';
import logger from '../config/logger.js';
import { broadcastSyncEvent } from '../services/sync/sync.service.js';

const router = express.Router();

router.use(spotifyAuth);

// Main dashboard payload
router.get('/', async (req, res) => {
  try {
    const dashboardData = await discoverService.getDashboardData(req.user._id);
    res.json({ success: true, data: dashboardData });
  } catch (error) {
    logger.error('Error fetching discover dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch discover dashboard' });
  }
});

// Feedback endpoint
router.post('/feedback', async (req, res) => {
  try {
    const { recommendationId, status } = req.body;
    const result = await discoverService.handleFeedback(req.user._id, recommendationId, status);
    broadcastSyncEvent(req.user._id, 'discover_updated', { recommendationId, status });
    res.json(result);
  } catch (error) {
    logger.error('Error handling feedback:', error);
    res.status(500).json({ success: false, message: 'Failed to handle feedback' });
  }
});

export default router;
