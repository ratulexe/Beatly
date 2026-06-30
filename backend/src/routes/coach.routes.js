import express from 'express';
import { coachService } from '../services/coach/coach.service.js';
import { goalService } from '../services/coach/goal.service.js';
import { challengeService } from '../services/coach/challenge.service.js';
import { habitService } from '../services/coach/habit.service.js';
import { spotifyAuth } from '../middlewares/spotifyAuth.js';
import { broadcastSyncEvent } from '../services/sync/sync.service.js';
import mongoose from 'mongoose';

const router = express.Router();

router.use(spotifyAuth);

// Main dashboard aggregation
router.get('/', async (req, res) => {
  try {
    const dashboard = await coachService.getDashboard(req.user._id);
    res.json({ success: true, data: dashboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/goals', async (req, res) => {
  try {
    const goals = await goalService.getActiveGoals(req.user._id);
    res.json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/goals/complete', async (req, res) => {
  try {
    const { goalId, progressDelta } = req.body;
    const goal = await goalService.updateProgress(req.user._id, goalId, progressDelta);
    broadcastSyncEvent(req.user._id, 'goal_updated', { goalId, progressDelta });
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/challenges', async (req, res) => {
  try {
    const challenges = await challengeService.getActiveChallenges(req.user._id);
    res.json({ success: true, data: challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/challenges/:id/join', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid challenge id' });
    }

    const challenge = await challengeService.joinChallenge(req.user._id, req.params.id);
    broadcastSyncEvent(req.user._id, 'challenge_updated', { challengeId: req.params.id });
    res.json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/habits', async (req, res) => {
  try {
    const habits = await habitService.getHabits(req.user._id);
    res.json({ success: true, data: habits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mock calendar API for now
router.get('/calendar', async (req, res) => {
  try {
    const data = await coachService.getListeningCalendar(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
