import { CoachSettings } from '../../models/CoachSettings.model.js';
import { User } from '../../models/User.model.js'; // Assuming xp/coins could live on User or CoachSettings

export const rewardService = {
  async awardGoalCompletion(userId, xp, coins) {
    // For Phase 14, we will add XP and coins directly to User model (which might be tied to Leaderboards in Phase 11)
    // OR we add them to a new UserStats model. 
    // Assuming User model has xp and coins from Phase 11:
    const user = await User.findById(userId);
    if (!user) return null;
    
    // Add if fields exist, otherwise initialize them (they might not be explicitly schema defined if we're flexible)
    user.xp = (user.xp || 0) + xp;
    user.coins = (user.coins || 0) + coins;
    await user.save();

    // Check unlocks
    await this.checkUnlocks(userId, user.xp);
    return user;
  },

  async checkUnlocks(userId, currentXp) {
    const settings = await CoachSettings.findOne({ userId });
    if (!settings) return;

    let unlocked = false;
    if (currentXp >= 1000 && !settings.titles.includes('Dedicated Listener')) {
      settings.titles.push('Dedicated Listener');
      unlocked = true;
    }
    if (currentXp >= 5000 && !settings.titles.includes('Music Maestro')) {
      settings.titles.push('Music Maestro');
      unlocked = true;
    }

    if (unlocked) {
      await settings.save();
      // notificationService.notify(userId, 'Reward Unlocked', 'You unlocked a new title!');
    }
  }
};
