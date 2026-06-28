import spotifyClient from './spotifyClient.js';
import { SPOTIFY_ENDPOINTS } from '../../constants/spotifyEndpoints.js';

export const getTopArtists = async (user, limit = 20, timeRange = 'medium_term') => {
  // Placeholder for future phase
  return await spotifyClient.get(user, SPOTIFY_ENDPOINTS.TOP_ARTISTS, { params: { limit, time_range: timeRange } });
};
