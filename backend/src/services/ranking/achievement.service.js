import { Achievement, UserAchievement } from '../../database/index.js';
import { rankingService } from './ranking.service.js';
import { activityService } from './activity.service.js';

export const achievementService = {
  /**
   * Initializes basic achievements if they don't exist
   */
  seedAchievements: async () => {
    const count = await Achievement.countDocuments();
    if (count > 0) return;

    const achievements = [
      { title: 'Music Rookie', description: 'Listen to 100 songs', icon: '🎵', rarity: 'Common', xpReward: 100, unlockCondition: { type: 'total_songs', threshold: 100 }, category: 'Milestone' },
      { title: 'Daily Listener', description: 'Listen to 1,000 songs', icon: '🎧', rarity: 'Rare', xpReward: 500, unlockCondition: { type: 'total_songs', threshold: 1000 }, category: 'Milestone' },
      { title: '7 Day Streak', description: 'Listen to music 7 days in a row', icon: '🔥', rarity: 'Rare', xpReward: 200, unlockCondition: { type: 'streak', threshold: 7 }, category: 'Streak' },
      { title: '30 Day Streak', description: 'Listen to music 30 days in a row', icon: '🚀', rarity: 'Epic', xpReward: 1000, unlockCondition: { type: 'streak', threshold: 30 }, category: 'Streak' },
      { title: 'Night Owl', description: 'Your listening personality is Night Owl', icon: '🌙', rarity: 'Rare', xpReward: 300, unlockCondition: { type: 'personality', threshold: 'Night Owl' }, category: 'Discovery' },
      { title: 'Early Bird', description: 'Your listening personality is Early Bird', icon: '🌅', rarity: 'Rare', xpReward: 300, unlockCondition: { type: 'personality', threshold: 'Early Bird' }, category: 'Discovery' },
      { title: 'Platinum Listener', description: 'Listen for over 1,000 hours', icon: '💎', rarity: 'Legendary', xpReward: 5000, unlockCondition: { type: 'total_ms', threshold: 1000 * 60 * 60 * 1000 }, category: 'Time' },
      { title: 'Genre Explorer', description: 'Listen to 50 unique genres', icon: '🎼', rarity: 'Epic', xpReward: 800, unlockCondition: { type: 'total_genres', threshold: 50 }, category: 'Discovery' },
    ];

    await Achievement.insertMany(achievements);
  },

  /**
   * Evaluates and updates a user's achievements based on their current stats.
   * Only called in the background (cron) or after sync.
   */
  evaluateAchievements: async (userId, userStats) => {
    // userStats should contain: { totalSongs, streak, totalMs, totalGenres, personality }
    const achievements = await Achievement.find().lean();
    
    for (const ach of achievements) {
      let currentProgress = 0;
      let threshold = ach.unlockCondition.threshold;
      let completed = false;

      switch (ach.unlockCondition.type) {
        case 'total_songs':
          currentProgress = userStats.totalSongs || 0;
          completed = currentProgress >= threshold;
          break;
        case 'streak':
          currentProgress = userStats.streak || 0;
          completed = currentProgress >= threshold;
          break;
        case 'personality':
          currentProgress = userStats.personality === threshold ? 1 : 0;
          threshold = 1;
          completed = currentProgress >= threshold;
          break;
        case 'total_ms':
          currentProgress = userStats.totalMs || 0;
          completed = currentProgress >= threshold;
          break;
        case 'total_genres':
          currentProgress = userStats.totalGenres || 0;
          completed = currentProgress >= threshold;
          break;
      }

      // Check if user already has it
      let userAch = await UserAchievement.findOne({ user: userId, achievement: ach._id });
      
      if (!userAch) {
        userAch = new UserAchievement({
          user: userId,
          achievement: ach._id,
          progress: currentProgress,
          completed: false
        });
      } else if (userAch.completed) {
        continue; // Already unlocked
      }

      // Update progress
      if (!userAch.completed && currentProgress > userAch.progress) {
        userAch.progress = Math.min(currentProgress, Number(threshold));
        
        if (completed) {
          userAch.completed = true;
          userAch.unlockedAt = new Date();
          
          // Award XP
          await rankingService.addXP(userId, ach.xpReward, `Unlocked achievement: ${ach.title}`);
          
          // Log activity
          await activityService.logActivity({
            type: 'ACHIEVEMENT_UNLOCKED',
            actor: userId,
            target: ach._id,
            targetModel: 'Achievement',
            metadata: { title: ach.title, icon: ach.icon, rarity: ach.rarity, xp: ach.xpReward }
          });
        }
        
        await userAch.save();
      }
    }
  }
};
