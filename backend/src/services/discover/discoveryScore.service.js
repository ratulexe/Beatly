import { Discovery } from '../../models/Discovery.model.js';

export const discoveryScoreService = {
  async calculateScore(userId) {
    let discovery = await Discovery.findOne({ userId });
    if (!discovery) {
      discovery = new Discovery({ userId });
      await discovery.save();
    }
    // Score is auto-calculated on save via pre-save hook
    return discovery.score;
  },
  
  async updateStats(userId, updates) {
    const discovery = await Discovery.findOne({ userId });
    if (!discovery) return;
    
    // updates e.g., { artistsDiscovered: 1 }
    Object.keys(updates).forEach(key => {
      if (discovery.stats[key] !== undefined) {
        discovery.stats[key] += updates[key];
      }
    });
    
    await discovery.save();
    return discovery;
  }
};
