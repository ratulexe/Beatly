import axios from 'axios';
import { User } from '../../database/index.js';
import { refreshAccessToken } from '../spotifyAuth.service.js';

/**
 * Creates an Axios client for Spotify API requests, configured with automatic token refresh.
 *
 * @param {Object} user - The MongoDB User document containing spotify credentials.
 * @returns {import('axios').AxiosInstance}
 */
export const createSpotifyClient = (user) => {
  if (!user || !user.spotify || !user.spotify.accessToken) {
    throw new Error('User does not have valid Spotify credentials');
  }

  const client = axios.create({
    baseURL: 'https://api.spotify.com/v1',
    headers: {
      Authorization: `Bearer ${user.spotify.accessToken}`
    }
  });

  // Response interceptor for handling expired tokens (401 Unauthorized)
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If token expired and we haven't retried yet
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh the token using the refresh token stored in the user document
          const newTokens = await refreshAccessToken(user.spotify.refreshToken);

          // Update MongoDB with the new tokens
          user.spotify.accessToken = newTokens.accessToken;
          user.spotify.refreshToken = newTokens.refreshToken;
          user.spotify.expiresAt = newTokens.expiresAt;
          await user.save();

          // Update the authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          // If refresh fails (e.g., revoked access), throw error so caller handles it
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};
