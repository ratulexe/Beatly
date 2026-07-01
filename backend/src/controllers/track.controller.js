import * as spotifyTrackService from '../services/spotify/spotifyTrack.service.js';
import { trackRepository } from '../services/database/trackRepository.js';
import * as analyticsService from '../services/analytics/analyticsService.js';
import { rankingService } from '../services/ranking/ranking.service.js';
import { achievementService } from '../services/ranking/achievement.service.js';
import { AnalyticsSnapshot, User } from '../database/index.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logger from '../config/logger.js';

export const syncTracks = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      {
        $set: {
          autoSyncInProgress: true,
          autoSyncStartedAt: new Date(),
          'sync.lastSyncAt': new Date()
        }
      }
    );

    const result = await spotifyTrackService.syncRecentlyPlayed(req.user);
    await User.updateOne(
      { _id: req.user._id },
      {
        $set: {
          autoSyncInProgress: false,
          autoSyncStartedAt: null,
          'sync.lastSuccessfulSyncAt': new Date(),
          'sync.lastSyncError': null,
          'sync.tracksAdded': result.newTracks || 0,
          'sync.tracksSkipped': result.duplicates || 0
        }
      }
    );
    
    // Auto-trigger background jobs (fire and forget)
    (async () => {
      try {
        await analyticsService.generateAllAnalytics(req.user._id);

        if (result.newTracks > 0) {
          // Award XP (e.g. 10 XP per new track)
          await rankingService.addXP(req.user._id, result.newTracks * 10, 'Listened to new tracks');
        }

        // We can pass empty stats for now, in a real app we'd query their actual totalMs/etc.
        // For now, let evaluateAchievements query what it needs if we extend it, or we can fetch a quick summary:
        const userStats = await AnalyticsSnapshot.findOne({ userId: req.user._id, periodType: 'overall' }).lean();
        const user = await User.findById(req.user._id).select('currentStreak listeningPersonality').lean();
        
        await achievementService.evaluateAchievements(req.user._id, {
          totalSongs: userStats?.listening?.totalSongs || 0,
          streak: user?.currentStreak || 0,
          totalMs: userStats?.listening?.totalMs || 0,
          totalGenres: userStats?.genres?.length || 0,
          personality: user?.listeningPersonality || 'Music Lover'
        });

      } catch (err) {
        logger.error('[TrackController] Background evaluation failed:', err);
      }
    })();
    
    return res.status(200).json(successResponse(result, 'Synchronization completed.'));
  } catch (error) {
    await User.updateOne(
      { _id: req.user._id },
      {
        $set: {
          autoSyncInProgress: false,
          autoSyncStartedAt: null,
          'sync.lastFailedSyncAt': new Date(),
          'sync.lastSyncError': error.message || 'Failed to sync tracks.'
        }
      }
    );
    logger.error('[TrackController] Error in syncTracks:', error);
    return res.status(error.status || 500).json(errorResponse(error.message || 'Failed to sync tracks.'));
  }
};

export const getRecentTracks = async (req, res) => {
  try {
    let limit = parseInt(req.query.limit, 10) || 20;
    const page = parseInt(req.query.page, 10) || 1;

    // Enforce max limit of 50
    if (limit > 50) limit = 50;
    if (limit < 1) limit = 20;
    if (page < 1) page = 1;

    const result = await trackRepository.getRecentTracks(req.user._id, limit, page);
    
    return res.status(200).json(successResponse(result, 'Recently played tracks retrieved.'));
  } catch (error) {
    logger.error('[TrackController] Error in getRecentTracks:', error);
    return res.status(500).json(errorResponse('Failed to retrieve recent tracks.'));
  }
};

export const getNowPlaying = async (req, res) => {
  try {
    const result = await spotifyTrackService.getCurrentlyPlaying(req.user);
    
    return res.status(200).json(successResponse(result, result ? 'Currently playing track retrieved.' : 'Nothing is currently playing.'));
  } catch (error) {
    logger.error('[TrackController] Error in getNowPlaying:', error);
    return res.status(error.status || 500).json(errorResponse(error.message || 'Failed to get currently playing.'));
  }
};
