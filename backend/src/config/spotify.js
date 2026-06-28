import { env } from './env.js';

export const SPOTIFY_CONFIG = {
  clientId: env.SPOTIFY_CLIENT_ID,
  clientSecret: env.SPOTIFY_CLIENT_SECRET,
  redirectUri: env.SPOTIFY_REDIRECT_URI,
  scopes: [
    'user-read-email',
    'user-read-private',
    'user-read-recently-played',
    'user-top-read'
  ].join(' '),
  authUrl: 'https://accounts.spotify.com/authorize',
  tokenUrl: 'https://accounts.spotify.com/api/token',
};
