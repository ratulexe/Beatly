import axios from 'axios';
import { SPOTIFY_CONFIG } from '../../config/spotify.config.js';
import logger from '../../config/logger.js';

// In-memory lock to prevent multiple concurrent token refreshes for the same user
const refreshLocks = new Map();

/**
 * Checks if a user's token is expired or about to expire (within 1 minute)
 */
export const isTokenExpired = (user) => {
  if (!user?.spotify?.expiresAt) return true;
  // Buffer of 60 seconds to avoid race conditions
  return Date.now() >= (user.spotify.expiresAt.getTime() - 60000);
};

/**
 * Calculates the exact expiry date based on expires_in seconds
 */
export const calculateExpiry = (expiresInSeconds) => {
  return new Date(Date.now() + expiresInSeconds * 1000);
};

/**
 * Saves updated tokens to the user document
 */
export const saveTokens = async (user, accessToken, refreshToken, expiresIn) => {
  user.spotify.accessToken = accessToken;
  if (refreshToken) {
    user.spotify.refreshToken = refreshToken;
  }
  user.spotify.expiresAt = calculateExpiry(expiresIn);
  await user.save();
};

/**
 * Refreshes the access token, utilizing a lock to prevent concurrent refresh spam.
 */
export const refreshAccessToken = async (user) => {
  const userId = user._id.toString();

  // If a refresh is already in progress for this user, wait for it
  if (refreshLocks.has(userId)) {
    return refreshLocks.get(userId);
  }

  const refreshPromise = (async () => {
    try {
      const authHeader = Buffer.from(`${SPOTIFY_CONFIG.clientId}:${SPOTIFY_CONFIG.clientSecret}`).toString('base64');
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: user.spotify.refreshToken
      });

      const response = await axios.post(SPOTIFY_CONFIG.tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authHeader}`
        },
        timeout: SPOTIFY_CONFIG.timeout
      });

      const { access_token, expires_in, refresh_token: new_refresh_token } = response.data;
      
      await saveTokens(user, access_token, new_refresh_token, expires_in);
      
      return access_token;
    } catch (error) {
      logger.error(`[TokenManager] Failed to refresh token for user ${userId}:`, error.message);
      throw error;
    } finally {
      // Always remove the lock when done
      refreshLocks.delete(userId);
    }
  })();

  refreshLocks.set(userId, refreshPromise);
  return refreshPromise;
};

/**
 * Gets a valid access token. If expired, it triggers a refresh.
 */
export const getAccessToken = async (user) => {
  if (!user || !user.spotify || !user.spotify.accessToken) {
    throw new Error('User does not have connected Spotify credentials');
  }

  if (isTokenExpired(user)) {
    return refreshAccessToken(user);
  }

  return user.spotify.accessToken;
};
