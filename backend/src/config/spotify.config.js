import { env } from './env.js';

export const SPOTIFY_CONFIG = {
  baseUrl: 'https://api.spotify.com/v1',
  authUrl: 'https://accounts.spotify.com/authorize',
  tokenUrl: 'https://accounts.spotify.com/api/token',
  clientId: env.SPOTIFY_CLIENT_ID,
  clientSecret: env.SPOTIFY_CLIENT_SECRET,
  redirectUri: env.SPOTIFY_REDIRECT_URI,
  scopes: [
    'user-read-email',
    'user-read-private',
    'user-read-recently-played',
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-top-read',
    'user-library-read',
    'playlist-read-private',
    'playlist-read-collaborative'
  ].join(' '),
  timeout: 10000, // 10 seconds request timeout
  maxRetries: 3,
  defaultRetryDelay: 1000, // 1 second
  maxRetryDelay: 10000, // 10 seconds
  tokenRefreshTimeout: 15000 // 15 seconds to wait for a refresh lock
};
