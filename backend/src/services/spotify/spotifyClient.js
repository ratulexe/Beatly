import axios from 'axios';
import crypto from 'crypto';
import { SPOTIFY_CONFIG } from '../../config/spotify.config.js';
import { getAccessToken } from './tokenManager.js';
import { sanitizeSpotifyError } from '../../utils/spotifyHelpers.js';
import logger from '../../config/logger.js';

// Internal reusable Axios instance
const axiosInstance = axios.create({
  baseURL: SPOTIFY_CONFIG.baseUrl,
  timeout: SPOTIFY_CONFIG.timeout
});

/**
 * Utility to pause execution
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Core request handler with retry and rate-limit logic
 */
const executeRequest = async (user, method, endpoint, data = null, customConfig = {}) => {
  const reqId = crypto.randomBytes(4).toString('hex');
  let attempts = 0;
  
  while (attempts <= SPOTIFY_CONFIG.maxRetries) {
    try {
      attempts++;
      
      // Get a valid access token (refreshes automatically if expired)
      const token = await getAccessToken(user);
      
      const config = {
        method,
        url: endpoint,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(customConfig.headers || {})
        },
        data,
        ...customConfig
      };

      const startTime = Date.now();
      const response = await axiosInstance.request(config);
      const duration = Date.now() - startTime;

      logger.info(`[SpotifyClient] [${reqId}] ${method.toUpperCase()} ${endpoint} - ${response.status} (${duration}ms)`);
      
      return response.data;
      
    } catch (error) {
      const status = error.response?.status;
      
      // Handle Rate Limiting (429)
      if (status === 429 && attempts <= SPOTIFY_CONFIG.maxRetries) {
        const retryAfterSeconds = parseInt(error.response.headers['retry-after'], 10) || 1;
        let delayMs = retryAfterSeconds * 1000;
        
        // Add exponential backoff jitter if retry-after is missing or to avoid thundering herd
        const jitter = Math.floor(Math.random() * 500);
        delayMs = Math.min(delayMs + (attempts * 500) + jitter, SPOTIFY_CONFIG.maxRetryDelay);

        console.warn(`[SpotifyClient] [${reqId}] 429 Rate Limit hit. Retrying in ${delayMs}ms (Attempt ${attempts}/${SPOTIFY_CONFIG.maxRetries})`);
        
        await sleep(delayMs);
        continue;
      }
      
      // Handle Server Errors (5xx) with basic exponential backoff
      if (status >= 500 && attempts <= SPOTIFY_CONFIG.maxRetries) {
        const delayMs = Math.min(SPOTIFY_CONFIG.defaultRetryDelay * Math.pow(2, attempts - 1), SPOTIFY_CONFIG.maxRetryDelay);
        console.warn(`[SpotifyClient] [${reqId}] ${status} Server Error. Retrying in ${delayMs}ms (Attempt ${attempts}/${SPOTIFY_CONFIG.maxRetries})`);
        await sleep(delayMs);
        continue;
      }
      
      // For 401 Unauthorized, tokenManager should have refreshed it prior. 
      // If we still get a 401, it means the token was revoked or refresh failed.
      if (status === 401) {
        logger.error(`[SpotifyClient] [${reqId}] 401 Unauthorized even after token generation.`);
      }

      logger.error(`[SpotifyClient] [${reqId}] ${method.toUpperCase()} ${endpoint} failed after ${attempts} attempts`);
      
      // Sanitize and throw the error
      throw sanitizeSpotifyError(error);
    }
  }
};

const spotifyClient = {
  get: (user, endpoint, config = {}) => executeRequest(user, 'get', endpoint, null, config),
  post: (user, endpoint, data, config = {}) => executeRequest(user, 'post', endpoint, data, config),
  put: (user, endpoint, data, config = {}) => executeRequest(user, 'put', endpoint, data, config),
  delete: (user, endpoint, config = {}) => executeRequest(user, 'delete', endpoint, null, config),
};

export default spotifyClient;
