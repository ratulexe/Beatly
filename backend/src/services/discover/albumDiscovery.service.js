import { getAIProvider } from '../ai/aiFactory.js';
import spotifyClient from '../spotify/spotifyClient.js';
import { analyticsRepository } from '../database/analyticsRepository.js';
import logger from '../../config/logger.js';

export const albumDiscoveryService = {
  async discoverAlbums(userId) {
    try {
      const snapshot = await analyticsRepository.getLatestSnapshot(userId, 'overall');
      if (!snapshot || !snapshot.topArtists || snapshot.topArtists.length === 0) {
        return [];
      }

      const aiProvider = getAIProvider();
      
      const systemPrompt = `You are Beatly AI. 
Recommend 3 MUST-LISTEN ALBUMS based on the user's listening history.
Output ONLY a JSON array of objects: 
{ "albumName": "Currents", "artistName": "Tame Impala", "aiExplanation": "...", "confidenceScore": 92, "tags": ["Psychedelic Pop"] }`;

      const userPrompt = `
User's Top Artists: ${snapshot.topArtists.slice(0,10).map(a => a.name).join(', ')}
Recommend 3 amazing albums from artists similar to their favorites (but not their exact top 3).
`;

      const aiExplanations = await aiProvider.generateJSON(systemPrompt, userPrompt);
      if (!aiExplanations || aiExplanations.length === 0) return [];

      const enrichedAlbums = [];
      for (const rec of aiExplanations) {
        try {
          const query = `album:${rec.albumName} artist:${rec.artistName}`;
          const searchRes = await spotifyClient.get({ _id: userId }, `/search?q=${encodeURIComponent(query)}&type=album&limit=1`);
          const album = searchRes.albums?.items?.[0];
          
          if (album) {
            enrichedAlbums.push({
              entityType: 'Album',
              entityId: album.id,
              entityName: album.name,
              entityUri: album.uri,
              entityImage: album.images?.[0]?.url,
              category: 'Albums You\'ll Love',
              aiExplanation: rec.aiExplanation,
              confidenceScore: rec.confidenceScore || 85,
              tags: rec.tags || [rec.artistName]
            });
          }
        } catch (searchError) {
          logger.warn(`Failed to search for album ${rec.albumName}`, searchError.message);
        }
      }
      return enrichedAlbums;
    } catch (error) {
      logger.error('Failed to discover albums:', error);
      return [];
    }
  },
  async getNewReleases(userId) {
    return [];
  }
};
