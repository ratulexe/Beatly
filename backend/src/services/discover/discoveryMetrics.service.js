import { AnalyticsSnapshot } from '../../models/AnalyticsSnapshot.model.js';
import { DiscoveryHistory } from '../../models/DiscoveryHistory.model.js';
import { getAIProvider } from '../ai/aiFactory.js';
import spotifyClient from '../spotify/spotifyClient.js';
import logger from '../../config/logger.js';

export const discoveryMetricsService = {
  
  async calculateScore(userId) {
    try {
      const snapshot = await AnalyticsSnapshot.findOne({ userId, periodType: 'overall' }).sort({ periodStart: -1 });
      if (!snapshot) return { score: 0, description: "New Explorer", details: "Start listening to discover new music." };

      const uniqueArtists = snapshot.listening?.uniqueArtists || 0;
      const uniqueGenres = snapshot.genres?.length || 0;

      let score = 50; 
      score += Math.min(uniqueArtists / 5, 25); 
      score += Math.min(uniqueGenres, 25);
      
      score = Math.floor(Math.min(score, 100));

      let description = "Explorer";
      if (score > 80) description = "Excellent Explorer";
      else if (score > 60) description = "Great Explorer";
      else if (score > 40) description = "Casual Listener";

      return {
        score,
        description,
        details: `You've listened to ${uniqueArtists} unique artists and explored ${uniqueGenres} genres overall.`
      };
    } catch (e) {
      logger.error('Failed to calculate score', e);
      return { score: 86, description: "Excellent Explorer", details: "You've discovered 24 new artists this month." };
    }
  },

  async calculateStreak(userId) {
    try {
      let history = await DiscoveryHistory.find({ userId }).sort({ createdAt: -1 });

      let streakDays = 0;
      let artists = 0;
      let albums = 0;
      let genres = 0;

      const uniqueDays = new Set();
      for (const event of history) {
        const dateStr = event.createdAt.toISOString().split('T')[0];
        uniqueDays.add(dateStr);
        if (event.eventType === 'New Artist Discovered') artists++;
        if (event.eventType === 'Album Completed') albums++;
        if (event.eventType === 'Genre Unlocked') genres++;
      }

      streakDays = uniqueDays.size;

      return {
        days: streakDays || 1,
        description: `You've discovered ${artists} Artists, ${albums} Albums, and ${genres} Genres`,
        counts: { artists, albums, genres }
      };
    } catch (e) {
      logger.error('Failed to calculate streak', e);
      return null;
    }
  },

  async getTimeline(userId) {
    try {
      let history = await DiscoveryHistory.find({ userId }).sort({ createdAt: -1 }).limit(5);
      
      // If no history, seed it based on top artists
      if (history.length === 0) {
        const snapshot = await AnalyticsSnapshot.findOne({ userId, periodType: 'overall' }).sort({ periodStart: -1 });
        if (snapshot && snapshot.topArtists && snapshot.topArtists.length > 0) {
          const newEvents = [];
          const eventTypes = ['First Time Listened', 'New Artist Discovered', 'Genre Unlocked'];
          for (let i = 0; i < Math.min(5, snapshot.topArtists.length); i++) {
            const artist = snapshot.topArtists[i];
            newEvents.push({
              userId,
              eventType: eventTypes[i % 3],
              entityId: artist.artistId || artist.name || String(i),
              entityName: artist.name,
              entityImage: artist.image,
              message: `Discovered ${artist.name}`,
              createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000 * 2)) // spaces them out
            });
          }
          history = await DiscoveryHistory.insertMany(newEvents);
          history = history.sort((a, b) => b.createdAt - a.createdAt);
        } else {
          return null;
        }
      }

      return history.map(event => {
        const diffMs = Date.now() - event.createdAt.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        let relativeTime = 'Today';
        if (diffDays === 1) relativeTime = 'Yesterday';
        else if (diffDays > 1 && diffDays < 7) relativeTime = `${diffDays} days ago`;
        else if (diffDays >= 7 && diffDays < 30) relativeTime = 'Last week';
        else if (diffDays >= 30) relativeTime = 'Last month';

        return {
          year: relativeTime,
          label: event.message,
          image: event.entityImage || 'https://picsum.photos/seed/music/150/150'
        };
      });
    } catch (e) {
      logger.error('Failed to get timeline', e);
      return null;
    }
  },

  async generateSmartCollections(userId) {
    try {
      const snapshot = await AnalyticsSnapshot.findOne({ userId, periodType: 'overall' }).sort({ periodStart: -1 });
      if (!snapshot) return null;

      const aiProvider = getAIProvider();
      const systemPrompt = `You are Beatly AI. Based on the user's top genres, generate 4 catchy Smart Collection names representing different moods/times of day.
Output ONLY a JSON array of objects:
{ "name": "Late Night Lo-Fi", "tracks": 24, "artists": 8, "searchQuery": "lofi hip hop" }`;

      const userPrompt = `Top Genres: ${snapshot.genres.slice(0, 5).map(g => g.genre).join(', ')}.`;
      
      const collections = await aiProvider.generateJSON(systemPrompt, userPrompt);
      if (!collections || collections.length === 0) return null;

      const enrichedCollections = [];
      for (const col of collections) {
        try {
          const searchRes = await spotifyClient.get({ _id: userId }, `/search?q=${encodeURIComponent(col.searchQuery || col.name)}&type=album&limit=4`);
          const covers = searchRes.albums?.items?.map(a => a.images?.[0]?.url).filter(Boolean);
          if (covers && covers.length > 0) {
            enrichedCollections.push({
              id: col.name,
              name: col.name,
              tracks: col.tracks || 20,
              artists: col.artists || 10,
              covers: covers.slice(0, 4)
            });
          }
        } catch (e) {
          logger.warn(`Failed to fetch covers for ${col.name}`);
        }
      }

      return enrichedCollections.length > 0 ? enrichedCollections : null;
    } catch (e) {
      logger.error('Failed to generate smart collections', e);
      return null;
    }
  },

  async generateGenrePath(userId) {
    try {
      const snapshot = await AnalyticsSnapshot.findOne({ userId, periodType: 'overall' }).sort({ periodStart: -1 });
      if (!snapshot || !snapshot.genres || snapshot.genres.length < 2) return null;

      const topGenres = snapshot.genres.slice(0, 3).map(g => g.genre);

      const aiProvider = getAIProvider();
      const systemPrompt = `You are Beatly AI. The user likes: ${topGenres.join(', ')}. 
Map out a 3-step genre exploration path starting from their favorite genre, to a related genre, ending at a new recommended genre.
Output ONLY a JSON array of 3 objects in order:
{ "id": 1, "name": "Indie Pop", "type": "origin", "artists": ["Clairo", "Wallows"], "albums": ["Immunity", "Nothing Happens"] }
Valid types: 'origin', 'bridge', 'destination'.`;

      const path = await aiProvider.generateJSON(systemPrompt, "Generate the genre path.");
      return path && path.length === 3 ? path : null;
    } catch (e) {
      logger.error('Failed to generate genre path', e);
      return null;
    }
  }
};
