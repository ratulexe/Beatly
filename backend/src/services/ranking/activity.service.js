import { Activity } from '../../database/index.js';
import logger from '../../config/logger.js';

export const activityService = {
  /**
   * Log an activity event to the Activity collection
   * @param {Object} data 
   * @param {String} data.type
   * @param {ObjectId} data.actor
   * @param {ObjectId} data.target (optional)
   * @param {String} data.targetModel (optional)
   * @param {Object} data.metadata (optional)
   * @param {String} data.scope (default 'global')
   * @param {ObjectId} data.groupId (optional)
   */
  logActivity: async (data) => {
    try {
      const activity = new Activity(data);
      await activity.save();
      return activity;
    } catch (error) {
      logger.error('[ActivityService] Failed to log activity:', error);
      // Fail silently to not disrupt the main flow
    }
  },

  /**
   * Get activities for a specific scope (global, group, or user)
   */
  getActivities: async ({ scope, groupId, actor, limit = 20, page = 1 }) => {
    const query = {};
    if (scope) query.scope = scope;
    if (groupId) query.groupId = groupId;
    if (actor) query.actor = actor;

    const skip = (page - 1) * limit;

    const items = await Activity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('actor', 'displayName profileImage')
      .populate('target')
      .lean();

    return items;
  }
};
