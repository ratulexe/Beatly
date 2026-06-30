import { Recommendation } from '../../models/Recommendation.model.js';
import { artistDiscoveryService } from './artistDiscovery.service.js';
import { albumDiscoveryService } from './albumDiscovery.service.js';
import { trackDiscoveryService } from './trackDiscovery.service.js';
import { discoveryMetricsService } from './discoveryMetrics.service.js';

export const discoverService = {
  async getDashboardData(userId) {
    // 1. Fetch or Generate Recommendations
    const activeRecs = await Recommendation.find({ 
      userId, 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (activeRecs.length < 5) {
      const newArtists = await artistDiscoveryService.discoverArtists(userId);
      const newAlbums = await albumDiscoveryService.discoverAlbums(userId);
      const newTracks = await trackDiscoveryService.discoverTracks(userId);
      
      const allNew = [...newArtists, ...newAlbums, ...newTracks].map(rec => ({
        userId,
        ...rec,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }));

      if (allNew.length > 0) {
        await Recommendation.insertMany(allNew);
        activeRecs.push(...allNew);
      }
    }

    // 2. Fetch Metrics and Generated Components in parallel for speed
    const [scoreData, streakData, timelineData, smartCollectionsData, genreMapData] = await Promise.all([
      discoveryMetricsService.calculateScore(userId),
      discoveryMetricsService.calculateStreak(userId),
      discoveryMetricsService.getTimeline(userId),
      discoveryMetricsService.generateSmartCollections(userId),
      discoveryMetricsService.generateGenrePath(userId)
    ]);

    // 3. Map recommendations by category
    const dashboard = {
      forYou: [],
      trending: [],
      hiddenGems: [],
      recentlyReleased: [],
      basedOnTaste: [],
      aiPickOfTheDay: null,
      score: scoreData,
      streak: streakData,
      timeline: timelineData,
      smartCollections: smartCollectionsData,
      genreMap: genreMapData
    };

    let highestConfidence = 0;

    activeRecs.forEach(rec => {
      if (rec.confidenceScore > highestConfidence) {
        highestConfidence = rec.confidenceScore;
        dashboard.aiPickOfTheDay = rec;
      }

      if (rec.category === 'New Artists' || rec.category === 'Songs You May Like') dashboard.forYou.push(rec);
      if (rec.category === 'Trending Artists') dashboard.trending.push(rec);
      if (rec.category === 'Hidden Gems') dashboard.hiddenGems.push(rec);
      if (rec.category === 'New Releases') dashboard.recentlyReleased.push(rec);
      if (rec.category === 'Similar Artists' || rec.category === 'Albums You\'ll Love') dashboard.basedOnTaste.push(rec);
    });

    if (!dashboard.aiPickOfTheDay && activeRecs.length > 0) {
      dashboard.aiPickOfTheDay = activeRecs[0];
    }

    return dashboard;
  },

  async handleFeedback(userId, recommendationId, status) {
    const rec = await Recommendation.findOneAndUpdate(
      { _id: recommendationId, userId },
      { status },
      { new: true }
    );
    return { success: true, recommendation: rec };
  }
};
