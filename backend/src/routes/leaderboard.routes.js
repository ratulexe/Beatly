import express from 'express';
import { leaderboardController } from '../controllers/leaderboard.controller.js';
import { spotifyAuth as protect } from '../middlewares/spotifyAuth.js';

const router = express.Router();

router.use(protect);

router.get('/global', leaderboardController.getGlobalLeaderboard);
router.get('/group/:groupId', leaderboardController.getGroupLeaderboard);
router.get('/season/:seasonId', leaderboardController.getSeasonLeaderboard);

// Development endpoint
router.post('/generate', leaderboardController.generateLeaderboards);

export default router;
