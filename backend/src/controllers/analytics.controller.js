import { analyticsRepository } from '../services/database/analyticsRepository.js';
import * as analyticsService from '../services/analytics/analyticsService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logger from '../config/logger.js';
import { cacheService } from '../services/cache/CacheService.js';

export const generateAnalytics = async (req, res) => {
  try {
    await analyticsService.generateAllAnalytics(req.user._id);
    
    // Invalidate analytics cache for this user
    await cacheService.delPattern(`analytics:${req.user._id}`);
    
    return res.status(200).json(successResponse(null, 'Analytics generation completed.'));
  } catch (error) {
    logger.error('[AnalyticsController] Error generating analytics:', error);
    return res.status(500).json(errorResponse('Failed to generate analytics.'));
  }
};

const getCachedSnapshot = async (userId, type, fallbackFn) => {
  const cacheKey = `analytics:${userId}:${type}`;
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  const data = await fallbackFn();
  if (data) {
    await cacheService.set(cacheKey, data, 3600); // cache for 1 hour
  }
  return data;
};

export const getOverview = async (req, res) => {
  try {
    const data = await getCachedSnapshot(req.user._id, 'overview', async () => {
      const snapshot = await analyticsRepository.getLatestSnapshot(req.user._id, 'overall');
      if (!snapshot) return null;
      return { listening: snapshot.listening, generatedAt: snapshot.generatedAt };
    });

    if (!data) return res.status(200).json(successResponse(null, 'No analytics available yet. Sync your tracks first.'));
    return res.status(200).json(successResponse(data));
  } catch (error) {
    logger.error('[AnalyticsController] Error in getOverview:', error);
    return res.status(500).json(errorResponse('Failed to retrieve overview.'));
  }
};

export const getDailyStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const cacheKey = `analytics:${req.user._id}:daily:${days}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.status(200).json(successResponse(cached));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const snapshots = await analyticsRepository.getSnapshots(req.user._id, 'daily', startDate);
    await cacheService.set(cacheKey, snapshots, 3600);
    
    return res.status(200).json(successResponse(snapshots));
  } catch (error) {
    logger.error('[AnalyticsController] Error in getDailyStats:', error);
    return res.status(500).json(errorResponse('Failed to retrieve daily stats.'));
  }
};

export const getTopArtists = async (req, res) => {
  try {
    const data = await getCachedSnapshot(req.user._id, 'topArtists', async () => {
      const snapshot = await analyticsRepository.getLatestSnapshot(req.user._id, 'overall');
      return snapshot ? snapshot.topArtists : null;
    });

    return res.status(200).json(successResponse(data || [], data ? 'Success' : 'No analytics available yet.'));
  } catch (error) {
    logger.error('[AnalyticsController] Error in getTopArtists:', error);
    return res.status(500).json(errorResponse('Failed to retrieve top artists.'));
  }
};

export const getTopTracks = async (req, res) => {
  try {
    const data = await getCachedSnapshot(req.user._id, 'topTracks', async () => {
      const snapshot = await analyticsRepository.getLatestSnapshot(req.user._id, 'overall');
      return snapshot ? snapshot.topTracks : null;
    });

    return res.status(200).json(successResponse(data || [], data ? 'Success' : 'No analytics available yet.'));
  } catch (error) {
    logger.error('[AnalyticsController] Error in getTopTracks:', error);
    return res.status(500).json(errorResponse('Failed to retrieve top tracks.'));
  }
};

export const getTopAlbums = async (req, res) => {
  try {
    const data = await getCachedSnapshot(req.user._id, 'topAlbums', async () => {
      const snapshot = await analyticsRepository.getLatestSnapshot(req.user._id, 'overall');
      return snapshot ? snapshot.topAlbums : null;
    });

    return res.status(200).json(successResponse(data || [], data ? 'Success' : 'No analytics available yet.'));
  } catch (error) {
    logger.error('[AnalyticsController] Error in getTopAlbums:', error);
    return res.status(500).json(errorResponse('Failed to retrieve top albums.'));
  }
};

export const getGenres = async (req, res) => {
  try {
    const data = await getCachedSnapshot(req.user._id, 'genres', async () => {
      const snapshot = await analyticsRepository.getLatestSnapshot(req.user._id, 'overall');
      return snapshot ? snapshot.genres : null;
    });

    return res.status(200).json(successResponse(data || [], data ? 'Success' : 'No analytics available yet.'));
  } catch (error) {
    logger.error('[AnalyticsController] Error in getGenres:', error);
    return res.status(500).json(errorResponse('Failed to retrieve genre stats.'));
  }
};

export const getTimeInsights = async (req, res) => {
  try {
    const data = await getCachedSnapshot(req.user._id, 'timeInsights', async () => {
      const snapshot = await analyticsRepository.getLatestSnapshot(req.user._id, 'overall');
      return snapshot ? snapshot.timeInsights : null;
    });

    return res.status(200).json(successResponse(data || null, data ? 'Success' : 'No analytics available yet.'));
  } catch (error) {
    logger.error('[AnalyticsController] Error in getTimeInsights:', error);
    return res.status(500).json(errorResponse('Failed to retrieve time insights.'));
  }
};
