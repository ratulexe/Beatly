import express from 'express';
import { env } from '../config/env.js';
import { runAutoSync } from '../services/sync/autoSync.service.js';

const router = express.Router();

const getBearerToken = (authorizationHeader = '') => {
  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
};

const requireAutoSyncSecret = (req, res, next) => {
  if (!env.AUTO_SYNC_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Auto sync is not configured.'
    });
  }

  const token = getBearerToken(req.get('Authorization'));
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authorization required.'
    });
  }

  if (token !== env.AUTO_SYNC_SECRET) {
    return res.status(403).json({
      success: false,
      message: 'Invalid authorization.'
    });
  }

  return next();
};

router.post('/sync/auto', requireAutoSyncSecret, async (req, res, next) => {
  try {
    const summary = await runAutoSync();
    return res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
