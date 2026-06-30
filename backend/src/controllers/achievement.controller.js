import { UserAchievement, Achievement } from '../database/index.js';
import logger from '../config/logger.js';

export const achievementController = {
  /**
   * GET /api/achievements
   */
  getAllAchievements: async (req, res) => {
    try {
      const achievements = await Achievement.find().lean();
      res.json(achievements);
    } catch (error) {
      logger.error('[AchievementController] Error fetching achievements:', error);
      res.status(500).json({ error: 'Failed to fetch achievements' });
    }
  },

  /**
   * GET /api/achievements/progress
   */
  getUserProgress: async (req, res) => {
    try {
      const progress = await UserAchievement.find({ user: req.user._id })
        .populate('achievement')
        .lean();
      res.json(progress);
    } catch (error) {
      logger.error('[AchievementController] Error fetching user progress:', error);
      res.status(500).json({ error: 'Failed to fetch user progress' });
    }
  }
};
