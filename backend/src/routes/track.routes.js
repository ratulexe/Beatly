import express from 'express';
import { spotifyAuth } from '../middlewares/spotifyAuth.js';
import * as trackController from '../controllers/track.controller.js';

const router = express.Router();

// All track routes require authentication and Spotify connection
router.use(spotifyAuth);

router.patch('/sync', trackController.syncTracks);
router.get('/recent', trackController.getRecentTracks);
router.get('/now-playing', trackController.getNowPlaying);

export default router;
