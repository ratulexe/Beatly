import { AnalyticsSnapshot, Leaderboard, RankHistory, User } from '../../database/index.js';
import { rankingService } from './ranking.service.js';
import { activityService } from './activity.service.js';
import mongoose from 'mongoose';

export const leaderboardService = {
  /**
   * Generates a global leaderboard for a specific period
   * @param {String} type - 'daily', 'weekly', 'monthly', 'yearly', 'allTime'
   * @param {Date} periodStart 
   */
  generateGlobalLeaderboard: async (type, periodStart, seasonId = null) => {
    // 1. Fetch eligible users (Active, public/friends leaderboard setting)
    const eligibleUsers = await User.find({
      isActive: true,
      'privacySettings.leaderboardVisibility': { $ne: 'private' }
    }).select('_id xp currentStreak').lean();

    const userIds = eligibleUsers.map(u => u._id);

    // 2. Fetch corresponding analytics snapshots
    // Note: For types like 'weekly', we might either aggregate 7 daily snapshots OR expect a 'weekly' snapshot to exist.
    // For simplicity, assuming Analytics engine has already pre-calculated 'daily', 'weekly', 'monthly' etc., or we just use 'overall' for allTime.
    
    // In Beatly Phase 11, AnalyticsService might need to generate weekly/monthly. 
    // If they don't exist, we fallback to aggregating daily ones. Let's aggregate daily if not overall.
    let aggregationMatch = {};
    if (type === 'allTime') {
      aggregationMatch = { userId: { $in: userIds }, periodType: 'overall' };
    } else {
      let end = new Date(periodStart);
      if (type === 'daily') end.setDate(end.getDate() + 1);
      else if (type === 'weekly') end.setDate(end.getDate() + 7);
      else if (type === 'monthly') end.setMonth(end.getMonth() + 1);
      else if (type === 'yearly') end.setFullYear(end.getFullYear() + 1);

      aggregationMatch = {
        userId: { $in: userIds },
        periodType: 'daily',
        periodStart: { $gte: periodStart, $lt: end }
      };
    }

    const stats = await AnalyticsSnapshot.aggregate([
      { $match: aggregationMatch },
      {
        $group: {
          _id: '$userId',
          totalMs: { $sum: '$listening.totalMs' },
          totalSongs: { $sum: '$listening.totalSongs' }
        }
      }
    ]);

    const statsMap = new Map(stats.map(s => [s._id.toString(), s]));

    // 3. Build ranking array
    let rankings = eligibleUsers.map(user => {
      const stat = statsMap.get(user._id.toString()) || { totalMs: 0, totalSongs: 0 };
      const score = rankingService.calculateScore(stat.totalMs, stat.totalSongs, user.currentStreak);
      return {
        user: user._id,
        listeningTime: stat.totalMs,
        songs: stat.totalSongs,
        streak: user.currentStreak,
        xp: user.xp,
        score
      };
    });

    // 4. Sort and assign ranks
    rankings.sort((a, b) => b.score - a.score);
    rankings.forEach((r, i) => r.rank = i + 1);

    // Filter out users with 0 score to keep leaderboards clean
    rankings = rankings.filter(r => r.score > 0);

    // 5. Save Leaderboard
    const scope = seasonId ? 'season' : 'global';
    const leaderboard = await Leaderboard.findOneAndUpdate(
      { type, scope, periodStart, seasonId },
      {
        $set: {
          type, scope, periodStart, seasonId,
          generatedAt: new Date(),
          rankings
        }
      },
      { upsert: true, new: true }
    );

    // 6. Save Rank History & Activities for Top 3
    const historyOps = rankings.map(r => ({
      updateOne: {
        filter: { user: r.user, leaderboardType: type, scope, seasonId, date: periodStart },
        update: { $set: { rank: r.rank } },
        upsert: true
      }
    }));

    if (historyOps.length > 0) {
      await RankHistory.bulkWrite(historyOps, { ordered: false });
    }

    // Log activity for #1 if this is a major leaderboard (e.g. weekly)
    if (type === 'weekly' && rankings.length > 0) {
      await activityService.logActivity({
        type: 'RANK_UP',
        actor: rankings[0].user,
        scope,
        metadata: { message: 'became #1 this week!', rank: 1, type }
      });
    }

    return leaderboard;
  },

  /**
   * Retrieves a cached leaderboard
   */
  getLeaderboard: async (type, scope, options = {}) => {
    const { groupId, seasonId, periodStart } = options;
    const query = { type, scope };
    if (groupId) query.groupId = groupId;
    if (seasonId) query.seasonId = seasonId;
    if (periodStart) query.periodStart = periodStart;

    // Get the most recent one if periodStart isn't provided
    return await Leaderboard.findOne(query)
      .sort({ periodStart: -1 })
      .populate('rankings.user', 'displayName profileImage')
      .lean();
  }
};
