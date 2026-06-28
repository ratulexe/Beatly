import spotifyClient from './spotifyClient.js';
import { SPOTIFY_ENDPOINTS } from '../../constants/spotifyEndpoints.js';

export const getRecentlyPlayed = async (user, limit = 20) => {
  // Placeholder for future phase
  return await spotifyClient.get(user, SPOTIFY_ENDPOINTS.RECENTLY_PLAYED, { params: { limit } });
};

export const getTopTracks = async (user, limit = 20, timeRange = 'medium_term') => {
  // Placeholder for future phase
  return await spotifyClient.get(user, SPOTIFY_ENDPOINTS.TOP_TRACKS, { params: { limit, time_range: timeRange } });
};
