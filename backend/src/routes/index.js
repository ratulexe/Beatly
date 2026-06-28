import { Router } from 'express';
import healthRoutes from './health.routes.js';
import spotifyRoutes from './spotify.routes.js';
import userRoutes from './user.routes.js';
import trackRoutes from './track.routes.js';
import analyticsRoutes from './analytics.routes.js';
import groupRoutes from './group.routes.js';
import friendRoutes from './friend.routes.js';
import invitationRoutes from './invitation.routes.js';

const router = Router();

router.use('/', healthRoutes);
router.use('/api/auth', spotifyRoutes);
router.use('/api/user', userRoutes);
router.use('/api/tracks', trackRoutes);
router.use('/api/analytics', analyticsRoutes);
router.use('/api/groups', groupRoutes);
router.use('/api/friends', friendRoutes);
router.use('/api/invitations', invitationRoutes);

export default router;
