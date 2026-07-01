import { Router } from 'express';
import healthRoutes from './health.routes.js';
import spotifyRoutes from './spotify.routes.js';
import userRoutes from './user.routes.js';
import trackRoutes from './track.routes.js';
import analyticsRoutes from './analytics.routes.js';
import groupRoutes from './group.routes.js';
import friendRoutes from './friend.routes.js';
import invitationRoutes from './invitation.routes.js';
import coachRoutes from './coach.routes.js';

// Phase 11 Routes
import leaderboardRoutes from './leaderboard.routes.js';
import comparisonRoutes from './comparison.routes.js';
import achievementRoutes from './achievement.routes.js';
import activityRoutes from './activity.routes.js';
import aiRoutes from './ai.routes.js';
import wrappedRoutes from './wrapped.routes.js';

// Phase 17 Routes
import deviceRoutes from './device.routes.js';
import syncRoutes from './sync.routes.js';
import sessionRoutes from './session.routes.js';
import internalRoutes from './internal.routes.js';

const router = Router();

// Base route for quick pings
router.get('/', (req, res) => res.status(200).send('Beatly API is running'));

// Standard health endpoints
router.use('/api/health', healthRoutes);
router.use('/api/auth', spotifyRoutes);
router.use('/api/user', userRoutes);
router.use('/api/tracks', trackRoutes);
router.use('/api/analytics', analyticsRoutes);
router.use('/api/groups', groupRoutes);
router.use('/api/friends', friendRoutes);
router.use('/api/invitations', invitationRoutes);
router.use('/api/ai', aiRoutes);

import discoverRoutes from './discover.routes.js';

// Phase 11
router.use('/api/leaderboards', leaderboardRoutes);
router.use('/api/compare', comparisonRoutes);
router.use('/api/achievements', achievementRoutes);
router.use('/api/activity', activityRoutes);
router.use('/api/coach', coachRoutes);
router.use('/api/wrapped', wrappedRoutes);

// Phase 15
router.use('/api/discover', discoverRoutes);

// Phase 17
router.use('/api/devices', deviceRoutes);
router.use('/api/sync', syncRoutes);
router.use('/api/session', sessionRoutes);
router.use('/api/internal', internalRoutes);

export default router;
