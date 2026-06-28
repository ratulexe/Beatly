import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

/**
 * Pure MongoDB aggregation pipeline builders.
 * Each function returns a pipeline array — no side effects.
 * All pipelines start with $match on userId to leverage the compound index.
 */

/**
 * Overview: total listening time, total songs, unique tracks/artists/albums
 */
export const buildOverviewPipeline = (userId, startDate, endDate) => {
  const match = { userId: new ObjectId(userId) };
  if (startDate || endDate) {
    match.playedAt = {};
    if (startDate) match.playedAt.$gte = new Date(startDate);
    if (endDate) match.playedAt.$lte = new Date(endDate);
  }

  return [
    { $match: match },
    {
      $lookup: {
        from: 'tracks',
        localField: 'trackId',
        foreignField: '_id',
        as: 'track'
      }
    },
    { $unwind: '$track' },
    {
      $group: {
        _id: null,
        totalMs: { $sum: '$track.durationMs' },
        totalSongs: { $sum: 1 },
        uniqueTracks: { $addToSet: '$trackId' },
        uniquAlbums: { $addToSet: '$track.albumId' },
        uniqueArtistSets: { $addToSet: '$track.artistIds' }
      }
    },
    {
      $project: {
        _id: 0,
        totalMs: 1,
        totalSongs: 1,
        uniqueTracks: { $size: '$uniqueTracks' },
        uniqueAlbums: { $size: '$uniquAlbums' },
        // Flatten nested artist arrays and count distinct
        allArtists: {
          $reduce: {
            input: '$uniqueArtistSets',
            initialValue: [],
            in: { $setUnion: ['$$value', '$$this'] }
          }
        }
      }
    },
    {
      $addFields: {
        uniqueArtists: { $size: '$allArtists' }
      }
    },
    {
      $project: { allArtists: 0 }
    }
  ];
};

/**
 * Top Artists: grouped by artist, sorted by play count
 */
export const buildTopArtistsPipeline = (userId, startDate, endDate, limit = 20) => {
  const match = { userId: new ObjectId(userId) };
  if (startDate || endDate) {
    match.playedAt = {};
    if (startDate) match.playedAt.$gte = new Date(startDate);
    if (endDate) match.playedAt.$lte = new Date(endDate);
  }

  return [
    { $match: match },
    {
      $lookup: {
        from: 'tracks',
        localField: 'trackId',
        foreignField: '_id',
        as: 'track'
      }
    },
    { $unwind: '$track' },
    { $unwind: '$track.artistIds' },
    {
      $group: {
        _id: '$track.artistIds',
        playCount: { $sum: 1 },
        totalMs: { $sum: '$track.durationMs' }
      }
    },
    { $sort: { playCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'artists',
        localField: '_id',
        foreignField: '_id',
        as: 'artist'
      }
    },
    { $unwind: '$artist' },
    {
      $project: {
        _id: 0,
        artistId: '$_id',
        name: '$artist.name',
        image: '$artist.image',
        playCount: 1,
        totalMs: 1
      }
    }
  ];
};

/**
 * Top Tracks: grouped by track, sorted by play count
 */
export const buildTopTracksPipeline = (userId, startDate, endDate, limit = 20) => {
  const match = { userId: new ObjectId(userId) };
  if (startDate || endDate) {
    match.playedAt = {};
    if (startDate) match.playedAt.$gte = new Date(startDate);
    if (endDate) match.playedAt.$lte = new Date(endDate);
  }

  return [
    { $match: match },
    {
      $group: {
        _id: '$trackId',
        playCount: { $sum: 1 }
      }
    },
    { $sort: { playCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'tracks',
        localField: '_id',
        foreignField: '_id',
        as: 'track'
      }
    },
    { $unwind: '$track' },
    {
      $lookup: {
        from: 'albums',
        localField: 'track.albumId',
        foreignField: '_id',
        as: 'album'
      }
    },
    { $unwind: { path: '$album', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'artists',
        localField: 'track.artistIds',
        foreignField: '_id',
        as: 'artists'
      }
    },
    {
      $project: {
        _id: 0,
        trackId: '$_id',
        name: '$track.name',
        albumImage: '$album.image',
        artists: '$artists.name',
        playCount: 1,
        totalMs: { $multiply: ['$playCount', '$track.durationMs'] }
      }
    }
  ];
};

/**
 * Top Albums: grouped by album, sorted by play count
 */
export const buildTopAlbumsPipeline = (userId, startDate, endDate, limit = 10) => {
  const match = { userId: new ObjectId(userId) };
  if (startDate || endDate) {
    match.playedAt = {};
    if (startDate) match.playedAt.$gte = new Date(startDate);
    if (endDate) match.playedAt.$lte = new Date(endDate);
  }

  return [
    { $match: match },
    {
      $lookup: {
        from: 'tracks',
        localField: 'trackId',
        foreignField: '_id',
        as: 'track'
      }
    },
    { $unwind: '$track' },
    {
      $group: {
        _id: '$track.albumId',
        playCount: { $sum: 1 },
        totalMs: { $sum: '$track.durationMs' }
      }
    },
    { $sort: { playCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'albums',
        localField: '_id',
        foreignField: '_id',
        as: 'album'
      }
    },
    { $unwind: '$album' },
    {
      $lookup: {
        from: 'artists',
        localField: 'album.artistIds',
        foreignField: '_id',
        as: 'artists'
      }
    },
    {
      $project: {
        _id: 0,
        albumId: '$_id',
        name: '$album.name',
        image: '$album.image',
        artists: '$artists.name',
        playCount: 1,
        totalMs: 1
      }
    }
  ];
};

/**
 * Genre Distribution: via Track → Artist → genres
 */
export const buildGenrePipeline = (userId, startDate, endDate) => {
  const match = { userId: new ObjectId(userId) };
  if (startDate || endDate) {
    match.playedAt = {};
    if (startDate) match.playedAt.$gte = new Date(startDate);
    if (endDate) match.playedAt.$lte = new Date(endDate);
  }

  return [
    { $match: match },
    {
      $lookup: {
        from: 'tracks',
        localField: 'trackId',
        foreignField: '_id',
        as: 'track'
      }
    },
    { $unwind: '$track' },
    { $unwind: '$track.artistIds' },
    {
      $lookup: {
        from: 'artists',
        localField: 'track.artistIds',
        foreignField: '_id',
        as: 'artist'
      }
    },
    { $unwind: '$artist' },
    { $unwind: { path: '$artist.genres', preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: '$artist.genres',
        playCount: { $sum: 1 },
        totalMs: { $sum: '$track.durationMs' }
      }
    },
    { $sort: { playCount: -1 } },
    { $limit: 30 },
    {
      $group: {
        _id: null,
        genres: { $push: { genre: '$_id', playCount: '$playCount', totalMs: '$totalMs' } },
        totalPlays: { $sum: '$playCount' }
      }
    },
    { $unwind: '$genres' },
    {
      $project: {
        _id: 0,
        genre: '$genres.genre',
        playCount: '$genres.playCount',
        totalMs: '$genres.totalMs',
        percentage: {
          $round: [{ $multiply: [{ $divide: ['$genres.playCount', '$totalPlays'] }, 100] }, 1]
        }
      }
    },
    { $sort: { playCount: -1 } }
  ];
};

/**
 * Time Insights: hourly distribution (0-23) and day-of-week distribution (1-7)
 */
export const buildTimeInsightsPipeline = (userId, startDate, endDate) => {
  const match = { userId: new ObjectId(userId) };
  if (startDate || endDate) {
    match.playedAt = {};
    if (startDate) match.playedAt.$gte = new Date(startDate);
    if (endDate) match.playedAt.$lte = new Date(endDate);
  }

  return [
    { $match: match },
    {
      $lookup: {
        from: 'tracks',
        localField: 'trackId',
        foreignField: '_id',
        as: 'track'
      }
    },
    { $unwind: '$track' },
    {
      $facet: {
        hourly: [
          {
            $group: {
              _id: { $hour: '$playedAt' },
              playCount: { $sum: 1 },
              totalMs: { $sum: '$track.durationMs' }
            }
          },
          { $sort: { _id: 1 } }
        ],
        dayOfWeek: [
          {
            $group: {
              _id: { $dayOfWeek: '$playedAt' },
              playCount: { $sum: 1 },
              totalMs: { $sum: '$track.durationMs' }
            }
          },
          { $sort: { _id: 1 } }
        ]
      }
    }
  ];
};
