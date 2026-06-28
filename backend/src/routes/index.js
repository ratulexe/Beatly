import { Router } from 'express';
import healthRoutes from './health.routes.js';
import spotifyRoutes from './spotify.routes.js';

const router = Router();

router.use('/', healthRoutes);
router.use('/api/auth', spotifyRoutes);

export default router;
