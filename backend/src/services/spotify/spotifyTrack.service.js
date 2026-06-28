import spotifyClient from './spotifyClient.js';
import { SPOTIFY_ENDPOINTS } from '../../constants/spotifyEndpoints.js';
import { trackRepository } from '../database/trackRepository.js';

export const getRecentlyPlayed = async (user, limit = 50, after = null, before = null) => {
  const params = { limit };
  if (after) params.after = after;
  if (before) params.before = before;

  const response = await spotifyClient.get(user, SPOTIFY_ENDPOINTS.RECENTLY_PLAYED, { params });
  return response.data;
};

export const syncRecentlyPlayed = async (user) => {
  const startTime = Date.now();
  
  // 1. Fetch from Spotify
  const data = await getRecentlyPlayed(user, 50);
  const items = data.items || [];
  
  if (items.length === 0) {
    return {
      newTracks: 0,
      duplicates: 0,
      artistsCreated: 0,
      albumsCreated: 0,
      durationMs: Date.now() - startTime
    };
  }

  // 2. Extract unique Artists, Albums, and Tracks
  const rawArtists = [];
  const rawAlbums = [];
  const rawTracks = [];

  for (const item of items) {
    const track = item.track;
    if (!track) continue;

    rawTracks.push(track);
    
    if (track.album) {
      rawAlbums.push(track.album);
      if (track.album.artists) {
        rawArtists.push(...track.album.artists);
      }
    }
    
    if (track.artists) {
      rawArtists.push(...track.artists);
    }
  }

  // 3. Upsert Artists
  const { idMap: artistIdMap, createdCount: artistsCreated } = await trackRepository.upsertArtists(rawArtists);

  // 4. Upsert Albums
  const { idMap: albumIdMap, createdCount: albumsCreated } = await trackRepository.upsertAlbums(rawAlbums, artistIdMap);

  // 5. Upsert Tracks
  const { idMap: trackIdMap } = await trackRepository.upsertTracks(rawTracks, artistIdMap, albumIdMap);

  // 6. Insert Listening History
  const { newTracks, duplicates } = await trackRepository.insertListeningHistory(user._id, items, trackIdMap);

  return {
    newTracks,
    duplicates,
    artistsCreated,
    albumsCreated,
    durationMs: Date.now() - startTime
  };
};

export const getTopTracks = async (user, limit = 20, timeRange = 'medium_term') => {
  // Placeholder for future phase
  return await spotifyClient.get(user, SPOTIFY_ENDPOINTS.TOP_TRACKS, { params: { limit, time_range: timeRange } });
};
