import { Artist, Album, Track, ListeningHistory } from '../../database/index.js';

export const trackRepository = {
  /**
   * Bulk upsert Artists
   * @param {Array} artists - Array of Spotify artist objects
   * @returns {Object} map of spotifyArtistId to internal _id
   */
  upsertArtists: async (artists) => {
    if (!artists || artists.length === 0) return { idMap: {}, createdCount: 0 };

    // Deduplicate incoming array by spotifyId
    const uniqueArtists = Array.from(new Map(artists.map(a => [a.id, a])).values());

    const bulkOps = uniqueArtists.map(artist => {
      const imageUrl = artist.images?.[0]?.url;
      const setFields = {
        spotifyArtistId: artist.id,
        name: artist.name,
        genres: artist.genres || [],
        followers: artist.followers?.total || 0,
        popularity: artist.popularity || 0,
        spotifyUrl: artist.external_urls?.spotify
      };
      // Only overwrite image when we actually have one — prevents
      // simplified artist objects from blanking out existing images.
      if (imageUrl) {
        setFields.image = imageUrl;
      }
      return {
        updateOne: {
          filter: { spotifyArtistId: artist.id },
          update: { $set: setFields },
          upsert: true
        }
      };
    });

    const result = await Artist.bulkWrite(bulkOps, { ordered: false });
    
    // Fetch all back to return their internal ObjectIds mapped to Spotify IDs
    const spotifyIds = uniqueArtists.map(a => a.id);
    const dbArtists = await Artist.find({ spotifyArtistId: { $in: spotifyIds } }).select('_id spotifyArtistId').lean();
    
    const idMap = dbArtists.reduce((acc, dbArtist) => {
      acc[dbArtist.spotifyArtistId] = dbArtist._id;
      return acc;
    }, {});

    return { 
      idMap, 
      createdCount: result.upsertedCount || 0 
    };
  },

  /**
   * Bulk upsert Albums
   * @param {Array} albums - Array of Spotify album objects
   * @param {Object} artistIdMap - Map of spotifyArtistId to internal _id
   */
  upsertAlbums: async (albums, artistIdMap) => {
    if (!albums || albums.length === 0) return { idMap: {}, createdCount: 0 };

    const uniqueAlbums = Array.from(new Map(albums.map(a => [a.id, a])).values());

    const bulkOps = uniqueAlbums.map(album => {
      const dbArtistIds = album.artists
        ?.map(a => artistIdMap[a.id])
        ?.filter(id => id); // Filter out any undefined

      return {
        updateOne: {
          filter: { spotifyAlbumId: album.id },
          update: {
            $set: {
              spotifyAlbumId: album.id,
              name: album.name,
              releaseDate: album.release_date ? new Date(album.release_date) : null,
              totalTracks: album.total_tracks,
              albumType: album.album_type,
              image: album.images?.[0]?.url || null,
              spotifyUrl: album.external_urls?.spotify,
              artistIds: dbArtistIds
            }
          },
          upsert: true
        }
      };
    });

    const result = await Album.bulkWrite(bulkOps, { ordered: false });

    const spotifyIds = uniqueAlbums.map(a => a.id);
    const dbAlbums = await Album.find({ spotifyAlbumId: { $in: spotifyIds } }).select('_id spotifyAlbumId').lean();
    
    const idMap = dbAlbums.reduce((acc, dbAlbum) => {
      acc[dbAlbum.spotifyAlbumId] = dbAlbum._id;
      return acc;
    }, {});

    return { 
      idMap, 
      createdCount: result.upsertedCount || 0 
    };
  },

  /**
   * Bulk upsert Tracks
   * @param {Array} tracks - Array of Spotify track objects
   * @param {Object} artistIdMap 
   * @param {Object} albumIdMap 
   */
  upsertTracks: async (tracks, artistIdMap, albumIdMap) => {
    if (!tracks || tracks.length === 0) return { idMap: {}, createdCount: 0 };

    const uniqueTracks = Array.from(new Map(tracks.map(t => [t.id, t])).values());

    const bulkOps = uniqueTracks.map(track => {
      const dbArtistIds = track.artists
        ?.map(a => artistIdMap[a.id])
        ?.filter(id => id);

      const dbAlbumId = track.album ? albumIdMap[track.album.id] : null;

      return {
        updateOne: {
          filter: { spotifyTrackId: track.id },
          update: {
            $set: {
              spotifyTrackId: track.id,
              name: track.name,
              durationMs: track.duration_ms,
              explicit: track.explicit,
              popularity: track.popularity || 0,
              previewUrl: track.preview_url,
              spotifyUrl: track.external_urls?.spotify,
              albumId: dbAlbumId,
              artistIds: dbArtistIds
            }
          },
          upsert: true
        }
      };
    });

    const result = await Track.bulkWrite(bulkOps, { ordered: false });

    const spotifyIds = uniqueTracks.map(t => t.id);
    const dbTracks = await Track.find({ spotifyTrackId: { $in: spotifyIds } }).select('_id spotifyTrackId').lean();
    
    const idMap = dbTracks.reduce((acc, dbTrack) => {
      acc[dbTrack.spotifyTrackId] = dbTrack._id;
      return acc;
    }, {});

    return { 
      idMap, 
      createdCount: result.upsertedCount || 0 
    };
  },

  /**
   * Bulk insert ListeningHistory if not exists (compound check)
   */
  insertListeningHistory: async (userId, playHistoryItems, trackIdMap) => {
    if (!playHistoryItems || playHistoryItems.length === 0) return { newTracks: 0, duplicates: 0 };

    const bulkOps = playHistoryItems.map(item => {
      const track = item.track;
      const dbTrackId = trackIdMap[track.id];
      const playedAt = new Date(item.played_at);
      
      // Deduplication check uses userId + trackId + playedAt
      return {
        updateOne: {
          filter: {
            userId: userId,
            trackId: dbTrackId,
            playedAt: playedAt
          },
          update: {
            $setOnInsert: {
              userId: userId,
              trackId: dbTrackId,
              playedAt: playedAt,
              device: item.context || null
            }
          },
          upsert: true
        }
      };
    });

    const result = await ListeningHistory.bulkWrite(bulkOps, { ordered: false });
    
    const newTracks = result.upsertedCount || 0;
    const duplicates = playHistoryItems.length - newTracks;

    return {
      newTracks,
      duplicates
    };
  },

  getRecentTracks: async (userId, limit = 20, page = 1) => {
    const skip = (page - 1) * limit;

    const history = await ListeningHistory.find({ userId })
      .sort({ playedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'trackId',
        populate: [
          { path: 'albumId' },
          { path: 'artistIds' }
        ]
      })
      .lean();

    const total = await ListeningHistory.countDocuments({ userId });

    return {
      items: history,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
};
