import spotifyClient from './spotifyClient.js';
import { SPOTIFY_ENDPOINTS } from '../../constants/spotifyEndpoints.js';
import { trackRepository } from '../database/trackRepository.js';
import { Artist } from '../../database/index.js';
import { getMultipleArtists } from './spotifyArtist.service.js';

export const getRecentlyPlayed = async (user, limit = 50, after = null, before = null) => {
  const params = { limit };
  if (after) params.after = after;
  if (before) params.before = before;

  const data = await spotifyClient.get(user, SPOTIFY_ENDPOINTS.RECENTLY_PLAYED, { params });
  return data;
};

export const syncRecentlyPlayed = async (user, options = {}) => {
  const startTime = Date.now();
  const after = options.after ? new Date(options.after).getTime() : null;
  
  // 1. Fetch from Spotify
  const data = await getRecentlyPlayed(user, 50, Number.isFinite(after) ? after : null);
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

  // 2.5 Fetch full artist objects (for images) for missing artists
  const uniqueArtistIds = Array.from(new Set(rawArtists.map(a => a.id)));
  const existingArtistsWithImages = await Artist.find({ 
    spotifyArtistId: { $in: uniqueArtistIds },
    image: { $ne: null }
  }).select('spotifyArtistId').lean();
  
  const existingIdsWithImages = new Set(existingArtistsWithImages.map(a => a.spotifyArtistId));
  const missingIds = uniqueArtistIds.filter(id => !existingIdsWithImages.has(id));

  if (missingIds.length > 0) {
    const fullArtists = [];
    for (let i = 0; i < missingIds.length; i += 50) {
      const chunk = missingIds.slice(i, i + 50);
      const fetched = await getMultipleArtists(user, chunk);
      fullArtists.push(...fetched);
    }
    
    const fullArtistMap = new Map(fullArtists.map(a => [a.id, a]));
    for (let i = 0; i < rawArtists.length; i++) {
      const full = fullArtistMap.get(rawArtists[i].id);
      if (full) {
        rawArtists[i] = full;
      }
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

export const getCurrentlyPlaying = async (user) => {
  try {
    const data = await spotifyClient.get(user, SPOTIFY_ENDPOINTS.CURRENTLY_PLAYING);
    
    // Spotify returns 204 No Content when nothing is playing (spotifyClient returns undefined/null)
    if (!data || !data.item) {
      return null;
    }

    return {
      isPlaying: data.is_playing,
      track: {
        name: data.item.name,
        spotifyTrackId: data.item.id,
        durationMs: data.item.duration_ms,
        progressMs: data.progress_ms,
        explicit: data.item.explicit,
        spotifyUrl: data.item.external_urls?.spotify,
        previewUrl: data.item.preview_url,
        album: {
          name: data.item.album?.name,
          image: data.item.album?.images?.[0]?.url
        },
        artists: data.item.artists?.map(a => ({ name: a.name })) || []
      }
    };
  } catch (error) {
    // 204 or no content - nothing is playing
    if (error.status === 204 || error.message?.includes('204')) {
      return null;
    }
    throw error;
  }
};

export const getTopTracks = async (user, limit = 20, timeRange = 'medium_term') => {
  // Placeholder for future phase
  return await spotifyClient.get(user, SPOTIFY_ENDPOINTS.TOP_TRACKS, { params: { limit, time_range: timeRange } });
};
