import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', // Explicitly use 127.0.0.1 to avoid CORS and cookie issues
  withCredentials: true // Extremely important to send the connect.sid session cookie
});

export const spotifyApi = {
  // Placeholders for future phases.
  // The frontend NEVER calls Spotify directly. It calls the Beatly backend.
  
  getRecentlyPlayed: async (limit = 20) => {
    // const response = await api.get('/spotify/recently-played', { params: { limit } });
    // return response.data;
    throw new Error('Not implemented yet in Phase 6');
  },

  getTopTracks: async (limit = 20, timeRange = 'medium_term') => {
    // const response = await api.get('/spotify/top-tracks', { params: { limit, timeRange } });
    // return response.data;
    throw new Error('Not implemented yet in Phase 6');
  },

  getTopArtists: async (limit = 20, timeRange = 'medium_term') => {
    // const response = await api.get('/spotify/top-artists', { params: { limit, timeRange } });
    // return response.data;
    throw new Error('Not implemented yet in Phase 6');
  }
};
