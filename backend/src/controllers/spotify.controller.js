import { env } from '../config/env.js';
import * as spotifyAuthService from '../services/spotifyAuth.service.js';

export const login = (req, res) => {
  const state = spotifyAuthService.generateState();
  req.session.spotifyState = state;
  const authorizeUrl = spotifyAuthService.getAuthorizeUrl(state);
  res.redirect(authorizeUrl);
};

export const callback = async (req, res, next) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.session ? req.session.spotifyState : null;

  if (state === null || state !== storedState) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=state_mismatch`);
  }

  delete req.session.spotifyState; // Clear state after use

  try {
    const tokens = await spotifyAuthService.exchangeCodeForTokens(code);
    req.session.spotify = tokens;
    res.redirect(`${env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=invalid_token`);
  }
};

export const refresh = async (req, res, next) => {
  if (!req.session || !req.session.spotify || !req.session.spotify.refreshToken) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const tokens = await spotifyAuthService.refreshAccessToken(req.session.spotify.refreshToken);
    req.session.spotify = tokens;
    res.status(200).json({ success: true, message: 'Token refreshed' });
  } catch (error) {
    req.session.destroy();
    res.status(401).json({ success: false, message: 'Refresh failed, session destroyed' });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Could not log out' });
    }
    res.clearCookie('connect.sid'); // Assuming default session cookie name
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
};

export const status = (req, res) => {
  if (req.session && req.session.spotify) {
    // Optionally check if token is expired here and refresh, but for now just report status
    res.status(200).json({ success: true, authenticated: true });
  } else {
    res.status(200).json({ success: true, authenticated: false });
  }
};
