import session from 'express-session';
import MongoStore from 'connect-mongo';
import { env } from './env.js';

const isTestRun = env.NODE_ENV === 'test' || process.env.BEATLY_TEST === 'true' || process.execArgv.includes('--test');

export const sessionMiddleware = session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: isTestRun ? undefined : MongoStore.create({
    mongoUrl: env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});
