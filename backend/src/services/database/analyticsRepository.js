import { AnalyticsSnapshot } from '../../database/index.js';

export const analyticsRepository = {
  /**
   * Upsert a snapshot document (one per user per periodType per periodStart)
   */
  saveSnapshot: async (userId, periodType, periodStart, periodEnd, data) => {
    return AnalyticsSnapshot.findOneAndUpdate(
      { userId, periodType, periodStart },
      {
        $set: {
          userId,
          periodType,
          periodStart,
          periodEnd,
          ...data,
          generatedAt: new Date()
        }
      },
      { upsert: true, new: true, lean: true }
    );
  },

  /**
   * Get a specific snapshot
   */
  getSnapshot: async (userId, periodType, periodStart) => {
    return AnalyticsSnapshot.findOne({ userId, periodType, periodStart }).lean();
  },

  /**
   * Get the most recent snapshot of a given type
   */
  getLatestSnapshot: async (userId, periodType) => {
    return AnalyticsSnapshot.findOne({ userId, periodType })
      .sort({ periodStart: -1 })
      .lean();
  },

  /**
   * Get multiple snapshots within a date range
   */
  getSnapshots: async (userId, periodType, startDate, endDate) => {
    const query = { userId, periodType };
    if (startDate || endDate) {
      query.periodStart = {};
      if (startDate) query.periodStart.$gte = new Date(startDate);
      if (endDate) query.periodStart.$lte = new Date(endDate);
    }
    return AnalyticsSnapshot.find(query)
      .sort({ periodStart: -1 })
      .lean();
  },

  /**
   * Delete all snapshots for a user of a given type
   */
  deleteSnapshots: async (userId, periodType) => {
    return AnalyticsSnapshot.deleteMany({ userId, periodType });
  }
};
