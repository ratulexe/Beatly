import axios from 'axios';
import crypto from 'crypto';
import { SPOTIFY_CONFIG } from '../config/spotify.js';

export const generateState = () => {
  return crypto.randomBytes(16).toString('hex');
};

export const getAuthorizeUrl = (state) => {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CONFIG.clientId,
    response_type: 'code',
    redirect_uri: SPOTIFY_CONFIG.redirectUri,
    state: state,
    scope: SPOTIFY_CONFIG.scopes,
    show_dialog: 'true'
  });
  return `${SPOTIFY_CONFIG.authUrl}?${params.toString()}`;
};

export const exchangeCodeForTokens = async (code) => {
  const authHeader = Buffer.from(`${SPOTIFY_CONFIG.clientId}:${SPOTIFY_CONFIG.clientSecret}`).toString('base64');
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: SPOTIFY_CONFIG.redirectUri
  });

  try {
    const response = await axios.post(SPOTIFY_CONFIG.tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      }
    });

    const { access_token, refresh_token, expires_in } = response.data;
    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000
    };
  } catch (error) {
    throw new Error('Failed to exchange code for tokens');
  }
};

export const refreshAccessToken = async (refreshToken) => {
  const authHeader = Buffer.from(`${SPOTIFY_CONFIG.clientId}:${SPOTIFY_CONFIG.clientSecret}`).toString('base64');
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  try {
    const response = await axios.post(SPOTIFY_CONFIG.tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      }
    });

    const { access_token, expires_in, refresh_token: new_refresh_token } = response.data;
    return {
      accessToken: access_token,
      refreshToken: new_refresh_token || refreshToken,
      expiresAt: Date.now() + expires_in * 1000
    };
  } catch (error) {
    throw new Error('Failed to refresh access token');
  }
};
