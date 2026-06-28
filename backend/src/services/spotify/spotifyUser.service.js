import { User } from '../../database/index.js';
import spotifyClient from './spotifyClient.js';
import { SPOTIFY_ENDPOINTS } from '../../constants/spotifyEndpoints.js';
import axios from 'axios';

/**
 * Syncs the Spotify user profile into MongoDB during login
 * @param {Object} tokens - Contains accessToken, refreshToken, expiresAt
 */
export const syncUser = async (tokens) => {
  // 1. Fetch raw profile from Spotify using the raw access token
  // We use axios directly here because this is during initial login and the user 
  // document doesn't exist yet to pass to spotifyClient.
  const response = await axios.get(`https://api.spotify.com/v1${SPOTIFY_ENDPOINTS.CURRENT_USER}`, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` }
  });
  
  const profile = response.data;

  // 2. Map Spotify fields to our User model
  const userData = {
    spotifyId: profile.id,
    displayName: profile.display_name,
    email: profile.email,
    country: profile.country,
    product: profile.product,
    followers: profile.followers?.total || 0,
    profileImage: profile.images && profile.images.length > 0 ? profile.images[0].url : null,
    spotifyProfileUrl: profile.external_urls?.spotify,
    explicitContent: profile.explicit_content?.filter_enabled || false,
    isActive: true,
    lastLogin: Date.now(),
    spotify: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope || '',
      tokenType: tokens.tokenType || 'Bearer'
    }
  };

  // 3. Upsert into MongoDB
  const user = await User.findOneAndUpdate(
    { spotifyId: profile.id },
    { $set: userData },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  );

  return user;
};

/**
 * Returns the Beatly profile stored in MongoDB
 * @param {String} userId - MongoDB Object ID
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found in database');
  return user;
};

/**
 * Forces a fresh fetch from Spotify and updates the MongoDB record
 * @param {String} userId - MongoDB Object ID
 */
export const updateUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found in database');

  // Use our intelligent client which handles token refresh & rate limiting automatically
  const profile = await spotifyClient.get(user, SPOTIFY_ENDPOINTS.CURRENT_USER);

  user.displayName = profile.display_name;
  user.email = profile.email;
  user.country = profile.country;
  user.product = profile.product;
  user.followers = profile.followers?.total || 0;
  user.profileImage = profile.images && profile.images.length > 0 ? profile.images[0].url : null;
  user.spotifyProfileUrl = profile.external_urls?.spotify;
  user.explicitContent = profile.explicit_content?.filter_enabled || false;
  user.lastLogin = Date.now();

  await user.save();
  return user;
};

export const findUserBySpotifyId = async (spotifyId) => {
  return await User.findOne({ spotifyId });
};
