import { AnalyticsSnapshot, User } from '../../database/index.js';
import { rankingService } from './ranking.service.js';

export const comparisonService = {
  /**
   * Compares two or more users based on their overall analytics
   * @param {Array<String>} userIds - Array of ObjectIds
   */
  compareUsers: async (userIds) => {
    const users = await User.find({ _id: { $in: userIds } })
      .select('displayName profileImage xp currentStreak longestStreak listeningPersonality')
      .lean();

    const snapshots = await AnalyticsSnapshot.find({
      userId: { $in: userIds },
      periodType: 'overall'
    }).lean();

    const snapshotMap = new Map(snapshots.map(s => [s.userId.toString(), s]));

    const comparisonData = users.map(user => {
      const stats = snapshotMap.get(user._id.toString());
      
      const level = rankingService.calculateLevel(user.xp);
      const listeningTimeMs = stats?.listening?.totalMs || 0;
      const songs = stats?.listening?.totalSongs || 0;
      
      // Calculate average daily listening (rough estimate based on total days since first play, 
      // but we'll use a simpler proxy for now: totalMs / (totalSongs / 20) -> just an arbitrary metric if we don't track first play date)
      // Better approach: use streak or active days if available. 
      // Let's just return raw values for the frontend to format.

      return {
        _id: user._id,
        displayName: user.displayName,
        profileImage: user.profileImage,
        level,
        xp: user.xp,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        listeningPersonality: user.listeningPersonality || 'Music Lover',
        metrics: {
          totalListeningTimeMs: listeningTimeMs,
          totalSongs: songs,
          uniqueArtists: stats?.listening?.uniqueArtists || 0,
          uniqueAlbums: stats?.listening?.uniqueAlbums || 0,
          topArtist: stats?.topArtists?.[0] || null,
          topGenre: stats?.genres?.[0] || null
        }
      };
    });

    return comparisonData;
  }
};
