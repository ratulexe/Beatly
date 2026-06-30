import { comparisonService } from '../services/ranking/comparison.service.js';
import logger from '../config/logger.js';

export const comparisonController = {
  /**
   * POST /api/compare
   * Body: { userIds: [ 'userId1', 'userId2' ] }
   */
  compareUsers: async (req, res) => {
    try {
      const { userIds } = req.body;
      if (!userIds || !Array.isArray(userIds) || userIds.length < 2) {
        return res.status(400).json({ error: 'Must provide an array of at least 2 userIds' });
      }

      const comparison = await comparisonService.compareUsers(userIds);
      res.json(comparison);
    } catch (error) {
      logger.error('[ComparisonController] Error comparing users:', error);
      res.status(500).json({ error: 'Failed to compare users' });
    }
  }
};
