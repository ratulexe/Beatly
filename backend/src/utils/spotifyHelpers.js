import { SPOTIFY_CONFIG } from '../config/spotify.config.js';
import { 
  SpotifyApiError, 
  SpotifyAuthenticationError, 
  SpotifyRateLimitError, 
  SpotifyServerError 
} from './spotifyErrors.js';

/**
 * Extracts a Spotify ID from a full URI (e.g., spotify:track:1234 -> 1234)
 */
export const extractSpotifyId = (uri) => {
  if (!uri) return null;
  const parts = uri.split(':');
  return parts[parts.length - 1];
};

/**
 * Formats milliseconds into a readable duration string (MM:SS)
 */
export const formatDuration = (ms) => {
  if (!ms) return '0:00';
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

/**
 * Builds a query string from an object, removing undefined values
 */
export const buildQueryString = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
  );
  return new URLSearchParams(cleanParams).toString();
};

/**
 * Builds a full Spotify API URL
 */
export const buildSpotifyUrl = (endpoint, params = {}) => {
  const query = buildQueryString(params);
  const baseUrl = `${SPOTIFY_CONFIG.baseUrl}${endpoint}`;
  return query ? `${baseUrl}?${query}` : baseUrl;
};

/**
 * Validates that a Spotify response contains the expected data
 */
export const validateSpotifyResponse = (response, requiredKeys = []) => {
  if (!response) {
    throw new SpotifyApiError('Empty response from Spotify API', 500);
  }
  
  for (const key of requiredKeys) {
    if (response[key] === undefined) {
      throw new SpotifyApiError(`Invalid response format. Missing key: ${key}`, 500);
    }
  }
  
  return true;
};

/**
 * Sanitizes a Spotify error into our custom error classes.
 * We don't expose raw internal errors directly to the client.
 */
export const sanitizeSpotifyError = (error, customErrorClass = SpotifyApiError) => {
  // If it's already one of our custom errors, return it
  if (error instanceof SpotifyApiError) return error;

  const status = error.response?.status || 500;
  const message = error.response?.data?.error?.message || error.message || 'Unknown Spotify API Error';
  const retryAfter = error.response?.headers && error.response?.headers['retry-after'];

  if (status === 401) {
    return new SpotifyAuthenticationError(message, status);
  }
  if (status === 429) {
    return new SpotifyRateLimitError(message, parseInt(retryAfter, 10) || 1);
  }
  if (status >= 500) {
    return new SpotifyServerError(message, status);
  }
  if (status === 400 || status === 403 || status === 404) {
     return new customErrorClass(message, status);
  }

  return new SpotifyApiError(message, status);
};
