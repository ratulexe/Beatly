import express from 'express';
import { activityController } from '../controllers/activity.controller.js';
import { spotifyAuth as protect } from '../middlewares/spotifyAuth.js';

const router = express.Router();

router.use(protect);

router.get('/', activityController.getActivities);

export default router;
