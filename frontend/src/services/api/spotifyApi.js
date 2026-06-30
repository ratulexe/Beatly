import { api } from '../apiClient';

export const spotifyApi = {
  // Placeholders for future phases.
  // The frontend NEVER calls Spotify directly. It calls the Beatly backend.
  
  getRecentlyPlayed: async (limit = 20) => {
    // const response = await api.get('/api/spotify/recently-played', { params: { limit } });
    // return response.data;
    throw new Error('Not implemented yet in Phase 6');
  },

  getTopTracks: async (limit = 20, timeRange = 'medium_term') => {
    // const response = await api.get('/api/spotify/top-tracks', { params: { limit, timeRange } });
    // return response.data;
    throw new Error('Not implemented yet in Phase 6');
  },

  getTopArtists: async (limit = 20, timeRange = 'medium_term') => {
    // const response = await api.get('/api/spotify/top-artists', { params: { limit, timeRange } });
    // return response.data;
    throw new Error('Not implemented yet in Phase 6');
  }
};
