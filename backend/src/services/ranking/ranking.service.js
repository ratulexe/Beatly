import { User } from '../../database/index.js';
import { activityService } from './activity.service.js';

/**
 * Constants for Level calculation
 */
const LEVEL_FACTOR = 0.1; // Level = floor(0.1 * sqrt(xp)) + 1
const BASE_LEVEL = 1;

export const rankingService = {
  /**
   * Calculate Level dynamically from XP
   */
  calculateLevel: (xp) => {
    return Math.floor(LEVEL_FACTOR * Math.sqrt(xp || 0)) + BASE_LEVEL;
  },

  /**
   * Calculate how much XP is needed for the NEXT level
   */
  xpForNextLevel: (currentLevel) => {
    // Inverse formula: XP = ((Level - 1) / LEVEL_FACTOR)^2
    return Math.pow((currentLevel) / LEVEL_FACTOR, 2);
  },

  /**
   * Add XP to a user and check for level up
   */
  addXP: async (userId, amount, reason, meta = {}) => {
    if (amount <= 0) return { levelUp: false };

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const oldLevel = rankingService.calculateLevel(user.xp);
    user.xp = (user.xp || 0) + amount;
    
    await user.save();

    const newLevel = rankingService.calculateLevel(user.xp);
    const leveledUp = newLevel > oldLevel;

    if (leveledUp) {
      await activityService.logActivity({
        type: 'LEVEL_UP',
        actor: userId,
        metadata: { oldLevel, newLevel, reason, ...meta }
      });
    }

    return { xp: user.xp, oldLevel, newLevel, levelUp: leveledUp };
  },

  /**
   * Calculate a normalized Score for leaderboard ranking
   * e.g., mix of listeningTime, unique songs, and current streak
   */
  calculateScore: (listeningTimeMs, songsCount, streak) => {
    const hours = listeningTimeMs / (1000 * 60 * 60);
    // 10 pts per hour + 1 pt per song + 50 pts per streak day
    return Math.floor((hours * 10) + songsCount + (streak * 50));
  }
};
