import { env } from '../config/env.js';
import * as spotifyAuthService from '../services/spotify/spotifyAuth.service.js';
import { syncUser } from '../services/spotify/spotifyUser.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const login = (req, res) => {
  const state = spotifyAuthService.generateState();
  req.session.spotifyState = state;
  const authorizeUrl = spotifyAuthService.getAuthorizeUrl(state);
  console.log('Redirecting to:', authorizeUrl);
  res.redirect(authorizeUrl);
};

export const callback = async (req, res, next) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.session ? req.session.spotifyState : null;

  if (state === null || state !== storedState) {
    return res.redirect(`${env.CLIENT_URL}/login?error=state_mismatch`);
  }

  delete req.session.spotifyState; // Clear state after use

  try {
    const tokens = await spotifyAuthService.exchangeCodeForTokens(code);
    
    // Sync user into MongoDB
    const user = await syncUser(tokens);
    
    // Store only userId in session
    req.session.userId = user._id;
    
    res.redirect(`${env.CLIENT_URL}/profile`);
  } catch (error) {
    console.error('Spotify callback error:', error);
    return res.redirect(`${env.CLIENT_URL}/login?error=invalid_token`);
  }
};

export const refresh = async (req, res, next) => {
  // Now handled automatically by spotifyClient, this route can just be a no-op or trigger a manual sync
  return res.status(200).json(successResponse(null, 'Refresh is handled automatically by the Spotify Client.'));
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json(errorResponse('Could not log out'));
    }
    res.clearCookie('connect.sid'); 
    res.status(200).json(successResponse(null, 'Logged out successfully'));
  });
};

export const status = (req, res) => {
  if (req.session && req.session.userId) {
    res.status(200).json({ success: true, authenticated: true });
  } else {
    res.status(200).json({ success: true, authenticated: false });
  }
};
