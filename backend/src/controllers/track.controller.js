import * as spotifyTrackService from '../services/spotify/spotifyTrack.service.js';
import { trackRepository } from '../services/database/trackRepository.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const syncTracks = async (req, res) => {
  try {
    const result = await spotifyTrackService.syncRecentlyPlayed(req.user);
    
    return res.status(200).json(successResponse(result, 'Synchronization completed.'));
  } catch (error) {
    console.error('[TrackController] Error in syncTracks:', error);
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
    console.error('[TrackController] Error in getRecentTracks:', error);
    return res.status(500).json(errorResponse('Failed to retrieve recent tracks.'));
  }
};
