import { getAIProvider } from '../ai/aiFactory.js';
import spotifyClient from '../spotify/spotifyClient.js';
import { analyticsRepository } from '../database/analyticsRepository.js';
import logger from '../../config/logger.js';

export const artistDiscoveryService = {
  async discoverArtists(userId) {
    try {
      // 1. Get user's listening analytics (seed data)
      const snapshot = await analyticsRepository.getLatestSnapshot(userId, 'overall');
      if (!snapshot || !snapshot.topArtists || snapshot.topArtists.length === 0) {
        return [];
      }

      // 2. Generate AI Recommendations directly via Ollama
      const aiProvider = getAIProvider();
      
      const systemPrompt = `You are Beatly AI, an expert music curator. 
Your job is to recommend 3 NEW artists to the user based on their listening history, and explain WHY.
Output ONLY a JSON array of objects with fields: 
{ "artistName": "Khruangbin", "aiExplanation": "...", "confidenceScore": 95, "tags": ["Glass Animals", "Tame Impala"] }`;

      const userPrompt = `
User's Top Artists: ${snapshot.topArtists.slice(0,10).map(a => a.name).join(', ')}
User's Top Genres: ${snapshot.genres.slice(0,5).map(g => g.genre).join(', ')}

Recommend 3 highly relevant artists they haven't listened to much. 
Generate personalized, 1-2 sentence explanations.
Include 2-3 'tags' indicating specific user top artists that influenced this recommendation.
`;

      const aiExplanations = await aiProvider.generateJSON(systemPrompt, userPrompt);
      if (!aiExplanations || aiExplanations.length === 0) return [];

      // 3. Resolve these artists using Spotify Search API
      const enrichedArtists = [];
      for (const rec of aiExplanations) {
        try {
          const searchRes = await spotifyClient.get({ _id: userId }, `/search?q=${encodeURIComponent(rec.artistName)}&type=artist&limit=1`);
          const artist = searchRes.artists?.items?.[0];
          
          if (artist) {
            let previewUrl = null;
            try {
              const topTracksRes = await spotifyClient.get({ _id: userId }, `/artists/${artist.id}/top-tracks?market=US`);
              previewUrl = topTracksRes.tracks?.find(t => t.preview_url)?.preview_url;
            } catch(e) {} // ignore track error

            enrichedArtists.push({
              entityType: 'Artist',
              entityId: artist.id,
              entityName: artist.name,
              entityUri: artist.uri,
              entityImage: artist.images?.[0]?.url,
              previewUrl: previewUrl,
              category: 'New Artists',
              aiExplanation: rec.aiExplanation,
              confidenceScore: rec.confidenceScore || 85,
              tags: rec.tags || []
            });
          }
        } catch (searchError) {
          logger.warn(`Failed to search for artist ${rec.artistName}`, searchError.message);
        }
      }

      return enrichedArtists;

    } catch (error) {
      logger.error('Failed to discover artists:', error);
      return [];
    }
  },
  
  async getHiddenGems(userId) {
    // Similar implementation but optimized for low popularity tracks/artists
    return [];
  }
};
