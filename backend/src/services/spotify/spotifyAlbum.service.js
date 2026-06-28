import spotifyClient from './spotifyClient.js';
import { SPOTIFY_ENDPOINTS } from '../../constants/spotifyEndpoints.js';

export const getSavedAlbums = async (user, limit = 20) => {
  // Placeholder for future phase
  return await spotifyClient.get(user, SPOTIFY_ENDPOINTS.SAVED_ALBUMS, { params: { limit } });
};
