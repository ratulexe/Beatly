import * as spotifyUserService from '../services/spotify/spotifyUser.service.js';
import spotifyClient from '../services/spotify/spotifyClient.js';
import { SPOTIFY_ENDPOINTS } from '../constants/spotifyEndpoints.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getMe = async (req, res) => {
  try {
    const response = await spotifyClient.get(req.user, SPOTIFY_ENDPOINTS.CURRENT_USER);
    
    return res.status(200).json(successResponse(response, 'Spotify profile fetched successfully.'));
  } catch (error) {
    console.error('[UserController] Failed to fetch Spotify profile:', error);
    return res.status(error.status || 500).json(errorResponse(error.message || 'Failed to fetch Spotify profile.'));
  }
};

export const getProfile = async (req, res) => {
  try {
    return res.status(200).json(successResponse(req.user, 'Profile retrieved successfully.'));
  } catch (error) {
    return res.status(500).json(errorResponse('Failed to retrieve profile.'));
  }
};

export const syncProfile = async (req, res) => {
  try {
    const updatedUser = await spotifyUserService.updateUserProfile(req.user._id);
    
    return res.status(200).json(successResponse(updatedUser, 'Profile synchronized successfully.'));
  } catch (error) {
    console.error('[UserController] Failed to sync profile:', error);
    return res.status(error.status || 500).json(errorResponse(error.message || 'Unable to synchronize user profile.'));
  }
};
