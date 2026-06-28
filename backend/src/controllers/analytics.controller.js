import { analyticsRepository } from '../services/database/analyticsRepository.js';
import * as analyticsService from '../services/analytics/analyticsService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const generateAnalytics = async (req, res) => {
  try {
    await analyticsService.generateAllAnalytics(req.user._id);
    return res.status(200).json(successResponse(null, 'Analytics generation completed.'));
  } catch (error) {
    console.error('[AnalyticsController] Error generating analytics:', error);
    return res.status(500).json(errorResponse('Failed to generate analytics.'));
  }
};

export const getOverview = async (req, res) => {
  try {
    const snapshot = await analyticsRepository.getLatestSnapshot(req.user._id, 'overall');
    if (!snapshot) {
      return res.status(200).json(successResponse(null, 'No analytics available yet. Sync your tracks first.'));
    }
    return res.status(200).json(successResponse({
      listening: snapshot.listening,
      generatedAt: snapshot.generatedAt
    }));
  } catch (error) {
    console.error('[AnalyticsController] Error in getOverview:', error);
    return res.status(500).json(errorResponse('Failed to retrieve overview.'));
  }
};

export const getDailyStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const snapshots = await analyticsRepository.getSnapshots(req.user._id, 'daily', startDate);
    return res.status(200).json(successResponse(snapshots));
  } catch (error) {
    console.error('[AnalyticsController] Error in getDailyStats:', error);
    return res.status(500).json(errorResponse('Failed to retrieve daily stats.'));
  }
};

export const getTopArtists = async (req, res) => {
  try {
    const snapshot = await analyticsRepository.getLatestSnapshot(req.user._id, 'overall');
    if (!snapshot) {
      return res.status(200).json(successResponse([], 'No analytics available yet.'));
    }
    return res.status(200).json(successResponse(snapshot.topArtists));
  } catch (error) {
    console.error('[AnalyticsController] Error in getTopArtists:', error);
    return res.status(500).json(errorResponse('Failed to retrieve top artists.'));
  }
};

export const getTopTracks = async (req, res) => {
  try {
    const snapshot = await analyticsRepository.getLatestSnapshot(req.user._id, 'overall');
    if (!snapshot) {
      return res.status(200).json(successResponse([], 'No analytics available yet.'));
    }
    return res.status(200).json(successResponse(snapshot.topTracks));
  } catch (error) {
    console.error('[AnalyticsController] Error in getTopTracks:', error);
    return res.status(500).json(errorResponse('Failed to retrieve top tracks.'));
  }
};

export const getTopAlbums = async (req, res) => {
  try {
    const snapshot = await analyticsRepository.getLatestSnapshot(req.user._id, 'overall');
    if (!snapshot) {
      return res.status(200).json(successResponse([], 'No analytics available yet.'));
    }
    return res.status(200).json(successResponse(snapshot.topAlbums));
  } catch (error) {
    console.error('[AnalyticsController] Error in getTopAlbums:', error);
    return res.status(500).json(errorResponse('Failed to retrieve top albums.'));
  }
};

export const getGenres = async (req, res) => {
  try {
    const snapshot = await analyticsRepository.getLatestSnapshot(req.user._id, 'overall');
    if (!snapshot) {
      return res.status(200).json(successResponse([], 'No analytics available yet.'));
    }
    return res.status(200).json(successResponse(snapshot.genres));
  } catch (error) {
    console.error('[AnalyticsController] Error in getGenres:', error);
    return res.status(500).json(errorResponse('Failed to retrieve genre stats.'));
  }
};

export const getTimeInsights = async (req, res) => {
  try {
    const snapshot = await analyticsRepository.getLatestSnapshot(req.user._id, 'overall');
    if (!snapshot) {
      return res.status(200).json(successResponse(null, 'No analytics available yet.'));
    }
    return res.status(200).json(successResponse(snapshot.timeInsights));
  } catch (error) {
    console.error('[AnalyticsController] Error in getTimeInsights:', error);
    return res.status(500).json(errorResponse('Failed to retrieve time insights.'));
  }
};
