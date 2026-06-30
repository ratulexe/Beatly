import { User } from '../database/index.js';
import { errorResponse } from '../utils/apiResponse.js';
import logger from '../config/logger.js';

export const spotifyAuth = async (req, res, next) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized. Please log in.', { code: 'NO_SESSION' }));
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json(errorResponse('User not found. Please log in again.', { code: 'USER_NOT_FOUND' }));
    }

    if (!user.spotify || !user.spotify.accessToken) {
      return res.status(403).json(errorResponse('Spotify account not connected.', { code: 'SPOTIFY_NOT_CONNECTED' }));
    }

    // Attach user object for downstream services to use with spotifyClient
    req.user = user;
    next();
  } catch (error) {
    logger.error('[Middleware] spotifyAuth error:', error);
    res.status(500).json(errorResponse('Internal server error during authentication.'));
  }
};
