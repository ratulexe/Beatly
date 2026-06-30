import express from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { spotifyAuth } from '../middlewares/spotifyAuth.js';

const router = express.Router();

// All AI routes require authentication
router.use(spotifyAuth);

router.get('/insights', aiController.getInsights);
router.get('/recommendations', aiController.getRecommendations);
router.get('/personality', aiController.getPersonality);
router.get('/predictions', aiController.getPredictions);
router.get('/reports/:timeframe', aiController.getReport);
router.get('/compare/:friendId', aiController.compareFriend);
router.post('/chat', aiController.chat);

export default router;
