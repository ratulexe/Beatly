import express from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { spotifyAuth } from '../middlewares/spotifyAuth.js';

const router = express.Router();

// All analytics routes require a valid session and Spotify connection
router.use(spotifyAuth);

router.post('/generate', analyticsController.generateAnalytics);
router.get('/overview', analyticsController.getOverview);
router.get('/daily', analyticsController.getDailyStats);
router.get('/top-artists', analyticsController.getTopArtists);
router.get('/top-tracks', analyticsController.getTopTracks);
router.get('/top-albums', analyticsController.getTopAlbums);
router.get('/genres', analyticsController.getGenres);
router.get('/time-insights', analyticsController.getTimeInsights);

export default router;
