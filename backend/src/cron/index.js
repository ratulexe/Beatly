import nodeCron from 'node-cron';
import { leaderboardService } from '../services/ranking/leaderboard.service.js';
import { User } from '../database/index.js';
import { personalityService } from '../services/ranking/personality.service.js';
import logger from '../config/logger.js';

export const initCronJobs = () => {
  // Generate Daily Leaderboard - Every day at 00:05
  nodeCron.schedule('5 0 * * *', async () => {
    logger.info('[CRON] Generating Daily Leaderboards...');
    try {
      await leaderboardService.generateGlobalLeaderboard('daily', new Date());
      logger.info('[CRON] Daily Leaderboards generated successfully.');
    } catch (err) {
      logger.error('[CRON] Error generating daily leaderboards:', err);
    }
  });

  // Generate Weekly Leaderboard - Every Monday at 00:10
  nodeCron.schedule('10 0 * * 1', async () => {
    logger.info('[CRON] Generating Weekly Leaderboards...');
    try {
      await leaderboardService.generateGlobalLeaderboard('weekly', new Date());
      logger.info('[CRON] Weekly Leaderboards generated successfully.');
    } catch (err) {
      logger.error('[CRON] Error generating weekly leaderboards:', err);
    }
  });

  // Generate Monthly Leaderboard - 1st of every month at 00:15
  nodeCron.schedule('15 0 1 * *', async () => {
    logger.info('[CRON] Generating Monthly Leaderboards...');
    try {
      await leaderboardService.generateGlobalLeaderboard('monthly', new Date());
      logger.info('[CRON] Monthly Leaderboards generated successfully.');
    } catch (err) {
      logger.error('[CRON] Error generating monthly leaderboards:', err);
    }
  });

  // Evaluate Personality & Achievements periodically - Every 6 hours
  nodeCron.schedule('0 */6 * * *', async () => {
    logger.info('[CRON] Evaluating Personalities & Background Achievements...');
    try {
      const activeUsers = await User.find({ isActive: true }).select('_id');
      for (const user of activeUsers) {
        await personalityService.evaluatePersonality(user._id);
        // Note: achievements are mostly evaluated during track sync (in sync service),
        // but any time-based ones could be evaluated here.
      }
      logger.info('[CRON] Personality evaluation complete.');
    } catch (err) {
      logger.error('[CRON] Error evaluating personalities:', err);
    }
  });

  // Process Sync Queue Retries - Every minute
  nodeCron.schedule('* * * * *', async () => {
    try {
      const { processQueue } = await import('../services/sync/syncQueue.service.js');
      await processQueue();
    } catch (err) {
      logger.error('[CRON] Error processing sync queue:', err);
    }
  });

  logger.info('[CRON] Scheduled jobs initialized.');
};
