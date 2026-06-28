import spotifyClient from './spotifyClient.js';
import { SPOTIFY_ENDPOINTS } from '../../constants/spotifyEndpoints.js';

export const getTopArtists = async (user, limit = 20, timeRange = 'medium_term') => {
  // Placeholder for future phase
  return await spotifyClient.get(user, SPOTIFY_ENDPOINTS.TOP_ARTISTS, { params: { limit, time_range: timeRange } });
};

export const getMultipleArtists = async (user, ids) => {
  if (!ids || ids.length === 0) return [];
  
  // Spotify deprecated the bulk /artists?ids= endpoint, it now returns 403 Forbidden.
  // We must fetch them individually. We'll do it in parallel batches of 5 to avoid 429s.
  const results = [];
  
  for (let i = 0; i < ids.length; i += 5) {
    const batch = ids.slice(i, i + 5);
    const promises = batch.map(id => 
      spotifyClient.get(user, SPOTIFY_ENDPOINTS.ARTIST(id)).catch(err => {
        console.warn(`Failed to fetch artist ${id}:`, err.message);
        return null;
      })
    );
    
    const fetched = await Promise.all(promises);
    results.push(...fetched.filter(a => a !== null));
    
    // Tiny delay between batches to be nice to the API
    if (i + 5 < ids.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  
  return results;
};
