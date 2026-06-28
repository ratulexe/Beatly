import * as spotifyUserService from '../services/spotifyUser.service.js';
import { createSpotifyClient } from '../services/spotify/spotifyClient.js';

export const getMe = async (req, res) => {
  try {
    const client = createSpotifyClient(req.user);
    const response = await client.get('/me');
    
    return res.status(200).json({
      success: true,
      message: 'Spotify profile fetched successfully.',
      data: response.data
    });
  } catch (error) {
    console.error('Failed to fetch Spotify profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Spotify profile.'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully.',
      data: req.user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.'
    });
  }
};

export const syncProfile = async (req, res) => {
  try {
    const updatedUser = await spotifyUserService.updateUserProfile(req.user._id);
    
    return res.status(200).json({
      success: true,
      message: 'Profile synchronized successfully.',
      data: updatedUser
    });
  } catch (error) {
    console.error('Failed to sync profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to synchronize user profile.'
    });
  }
};
