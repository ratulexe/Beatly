import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

import { env } from './config/env.js';
import logger from './config/logger.js';
import routes from './routes/index.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://i.scdn.co", "https://*.scdn.co"],
      connectSrc: ["'self'", env.FRONTEND_URL, "https://api.spotify.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.disable('x-powered-by');

// CORS Configuration
app.use(cors({
  origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 600, // Increased to 600 to prevent Socket.IO polling from triggering it during dev restarts
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50, // 50 requests per minute for auth routes
  message: { success: false, message: 'Too many auth requests, please try again later.' }
});

const syncLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many sync requests, please try again later.' }
});

const leaderboardLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many leaderboard requests, please try again later.' }
});

// Apply rate limiters to specific routes
app.use('/api/auth', authLimiter);
app.use('/api/tracks/sync', syncLimiter);
app.use('/api/leaderboards', leaderboardLimiter);
app.use('/api/', generalLimiter);

import { cloneRequestData } from './middlewares/cloneRequest.middleware.js';

// Parse bodies & prevent HTTP Parameter Pollution
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cloneRequestData); // Fix for Node.js v24 read-only req.query
app.use(mongoSanitize());
app.use(xss());
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(cookieParser());

import { sessionMiddleware } from './config/session.js';
import { idempotencyMiddleware } from './middlewares/idempotency.middleware.js';

// Session
app.use(sessionMiddleware);

// Idempotency for offline sync queue
app.use(idempotencyMiddleware);

// Compression
app.use(compression());

// Logger
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Routes
app.use('/', routes);

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;
