import { Router } from 'express';
import * as spotifyController from '../controllers/spotify.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const router = Router();

router.get('/login', spotifyController.login);
router.get('/callback', asyncHandler(spotifyController.callback));
router.post('/refresh', asyncHandler(spotifyController.refresh));
router.post('/logout', spotifyController.logout);
router.get('/status', spotifyController.status);

export default router;
