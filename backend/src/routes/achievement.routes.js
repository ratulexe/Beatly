import express from 'express';
import { achievementController } from '../controllers/achievement.controller.js';
import { spotifyAuth as protect } from '../middlewares/spotifyAuth.js';

const router = express.Router();

router.use(protect);

router.get('/', achievementController.getAllAchievements);
router.get('/progress', achievementController.getUserProgress);

export default router;
