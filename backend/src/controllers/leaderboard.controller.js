import { leaderboardService } from '../services/ranking/leaderboard.service.js';
import logger from '../config/logger.js';
import { cacheService } from '../services/cache/CacheService.js';

export const leaderboardController = {
  /**
   * GET /api/leaderboards/global?type=weekly
   */
  getGlobalLeaderboard: async (req, res) => {
    try {
      const type = req.query.type || 'allTime';
      const cacheKey = `leaderboard:global:${type}`;
      
      const cached = await cacheService.get(cacheKey);
      if (cached) return res.json(cached);

      const leaderboard = await leaderboardService.getLeaderboard(type, 'global');
      if (!leaderboard) return res.json({ rankings: [] });
      
      await cacheService.set(cacheKey, leaderboard, 600); // cache for 10 minutes
      res.json(leaderboard);
    } catch (error) {
      logger.error('[LeaderboardController] Error fetching global leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch global leaderboard' });
    }
  },

  /**
   * GET /api/leaderboards/group/:groupId?type=weekly
   */
  getGroupLeaderboard: async (req, res) => {
    try {
      const { groupId } = req.params;
      const type = req.query.type || 'allTime';
      const cacheKey = `leaderboard:group:${groupId}:${type}`;
      
      const cached = await cacheService.get(cacheKey);
      if (cached) return res.json(cached);

      const leaderboard = await leaderboardService.getLeaderboard(type, 'group', { groupId });
      if (!leaderboard) return res.json({ rankings: [] });

      await cacheService.set(cacheKey, leaderboard, 600);
      res.json(leaderboard);
    } catch (error) {
      logger.error('[LeaderboardController] Error fetching group leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch group leaderboard' });
    }
  },

  /**
   * GET /api/leaderboards/season/:seasonId
   */
  getSeasonLeaderboard: async (req, res) => {
    try {
      const { seasonId } = req.params;
      const cacheKey = `leaderboard:season:${seasonId}`;
      
      const cached = await cacheService.get(cacheKey);
      if (cached) return res.json(cached);

      const leaderboard = await leaderboardService.getLeaderboard('allTime', 'season', { seasonId });
      if (!leaderboard) return res.json({ rankings: [] });

      await cacheService.set(cacheKey, leaderboard, 600);
      res.json(leaderboard);
    } catch (error) {
      logger.error('[LeaderboardController] Error fetching season leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch season leaderboard' });
    }
  },

  /**
   * POST /api/leaderboards/generate
   * ONLY FOR DEVELOPMENT/TESTING
   */
  generateLeaderboards: async (req, res) => {
    try {
      const now = new Date();
      // Generate daily, weekly, monthly, and allTime
      await leaderboardService.generateGlobalLeaderboard('daily', now);
      await leaderboardService.generateGlobalLeaderboard('weekly', now);
      await leaderboardService.generateGlobalLeaderboard('monthly', now);
      await leaderboardService.generateGlobalLeaderboard('allTime', now);
      
      // Also generate season for testing
      await leaderboardService.generateGlobalLeaderboard('allTime', now, 'summer-2027');

      // Clear caches
      await cacheService.delPattern('leaderboard:');

      res.json({ message: 'Leaderboards generated successfully' });
    } catch (error) {
      logger.error('[LeaderboardController] Error generating leaderboards:', error);
      res.status(500).json({ error: 'Failed to generate leaderboards' });
    }
  }
};
