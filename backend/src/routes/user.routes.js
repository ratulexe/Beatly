import express from 'express';
import { spotifyAuth } from '../middlewares/spotifyAuth.js';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

// All user routes require authentication and Spotify connection
router.use(spotifyAuth);

router.get('/me', userController.getMe);
router.get('/profile', userController.getProfile);
router.patch('/sync', userController.syncProfile);

export default router;
