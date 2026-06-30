import { getAIProvider } from '../ai/aiFactory.js';
import spotifyClient from '../spotify/spotifyClient.js';
import { analyticsRepository } from '../database/analyticsRepository.js';
import logger from '../../config/logger.js';

export const trackDiscoveryService = {
  async discoverTracks(userId) {
    try {
      const snapshot = await analyticsRepository.getLatestSnapshot(userId, 'overall');
      if (!snapshot || !snapshot.topTracks || snapshot.topTracks.length === 0) {
        return [];
      }

      const aiProvider = getAIProvider();
      
      const systemPrompt = `You are Beatly AI. 
Recommend 3 MUST-LISTEN TRACKS based on the user's listening history.
Output ONLY a JSON array of objects: 
{ "trackName": "Let It Happen", "artistName": "Tame Impala", "aiExplanation": "...", "confidenceScore": 88, "tags": ["Electronic", "Dance"] }`;

      const userPrompt = `
User's Top Tracks: ${snapshot.topTracks.slice(0,10).map(t => t.name).join(', ')}
Recommend 3 amazing individual tracks similar to their favorites.
`;

      const aiExplanations = await aiProvider.generateJSON(systemPrompt, userPrompt);
      if (!aiExplanations || aiExplanations.length === 0) return [];

      const enrichedTracks = [];
      for (const rec of aiExplanations) {
        try {
          const query = `track:${rec.trackName} artist:${rec.artistName}`;
          const searchRes = await spotifyClient.get({ _id: userId }, `/search?q=${encodeURIComponent(query)}&type=track&limit=1`);
          const track = searchRes.tracks?.items?.[0];
          
          if (track) {
            enrichedTracks.push({
              entityType: 'Track',
              entityId: track.id,
              entityName: track.name,
              entityUri: track.uri,
              entityImage: track.album?.images?.[0]?.url,
              previewUrl: track.preview_url,
              category: 'Songs You May Like',
              aiExplanation: rec.aiExplanation,
              confidenceScore: rec.confidenceScore || 85,
              tags: rec.tags || [rec.artistName]
            });
          }
        } catch (searchError) {
          logger.warn(`Failed to search for track ${rec.trackName}`, searchError.message);
        }
      }
      return enrichedTracks;
    } catch (error) {
      logger.error('Failed to discover tracks:', error);
      return [];
    }
  },
  async getSmartCollections(userId) {
    return [];
  }
};
