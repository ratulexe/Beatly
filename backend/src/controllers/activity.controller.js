import { activityService } from '../services/ranking/activity.service.js';
import logger from '../config/logger.js';

export const activityController = {
  /**
   * GET /api/activity
   */
  getActivities: async (req, res) => {
    try {
      const { scope, groupId, limit, page } = req.query;
      
      const activities = await activityService.getActivities({
        scope: scope || 'global',
        groupId,
        limit: limit ? parseInt(limit, 10) : 20,
        page: page ? parseInt(page, 10) : 1
      });

      res.json(activities);
    } catch (error) {
      logger.error('[ActivityController] Error fetching activities:', error);
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  }
};
