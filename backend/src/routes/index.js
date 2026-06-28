import { Router } from 'express';
import healthRoutes from './health.routes.js';
import spotifyRoutes from './spotify.routes.js';
import userRoutes from './user.routes.js';
import trackRoutes from './track.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

router.use('/', healthRoutes);
router.use('/api/auth', spotifyRoutes);
router.use('/api/user', userRoutes);
router.use('/api/tracks', trackRoutes);
router.use('/api/analytics', analyticsRoutes);

export default router;
