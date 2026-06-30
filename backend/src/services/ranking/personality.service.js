import { AnalyticsSnapshot, User } from '../../database/index.js';

export const personalityService = {
  /**
   * Evaluates and assigns a Listening Personality to a user based on their overall analytics
   */
  evaluatePersonality: async (userId) => {
    const overallStats = await AnalyticsSnapshot.findOne({ userId, periodType: 'overall' }).lean();
    if (!overallStats) return null;

    let personality = 'Music Lover'; // Default fallback
    
    const { listening, topArtists, genres, timeInsights } = overallStats;
    const { periods } = timeInsights || {};

    // 1. Check Time Insights (Night Owl vs Early Bird vs Weekend Warrior)
    // Weekend Warrior logic: Check dayOfWeek. Sun=1, Sat=7
    if (timeInsights && timeInsights.dayOfWeek && timeInsights.dayOfWeek.length === 7) {
      const weekendMs = timeInsights.dayOfWeek[0].totalMs + timeInsights.dayOfWeek[6].totalMs; // Sun + Sat
      const totalWeekMs = timeInsights.dayOfWeek.reduce((acc, curr) => acc + curr.totalMs, 0);
      if (totalWeekMs > 0 && (weekendMs / totalWeekMs) > 0.5) {
        personality = 'Weekend Warrior';
      }
    }

    if (periods && personality === 'Music Lover') {
      const { morning, afternoon, evening, night } = periods;
      const maxPeriod = Object.entries({ morning, afternoon, evening, night })
        .reduce((max, [name, data]) => data.totalMs > max.totalMs ? { name, totalMs: data.totalMs } : max, { name: '', totalMs: -1 });
      
      if (maxPeriod.name === 'night' && maxPeriod.totalMs > (listening.totalMs * 0.4)) {
        personality = 'Night Owl';
      } else if (maxPeriod.name === 'morning' && maxPeriod.totalMs > (listening.totalMs * 0.4)) {
        personality = 'Early Bird';
      }
    }

    // 2. Check Genre Explorer
    if (genres && genres.length > 20 && personality === 'Music Lover') {
      personality = 'Genre Explorer';
    }

    // 3. Check Artist Loyalist
    if (topArtists && topArtists.length > 0 && personality === 'Music Lover') {
      const topArtistMs = topArtists[0].totalMs;
      if (topArtistMs > (listening.totalMs * 0.25)) { // 25% of all time on one artist
        personality = 'Artist Loyalist';
      }
    }

    // 4. Music Marathoner
    if (listening && listening.totalMs > (100 * 60 * 60 * 1000) && personality === 'Music Lover') {
      // 100 hours
      personality = 'Music Marathoner';
    }

    // Save to user
    await User.updateOne({ _id: userId }, { $set: { listeningPersonality: personality } });

    return personality;
  }
};
