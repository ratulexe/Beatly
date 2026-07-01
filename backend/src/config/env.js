import dotenv from 'dotenv';
import { validateEnv } from './validateEnv.js';

dotenv.config();

// Ensure CACHE_DRIVER has a default for local dev to avoid instant crashing if missing from an old .env
if (!process.env.CACHE_DRIVER) {
  process.env.CACHE_DRIVER = 'memory';
}

if (!process.env.CORS_ORIGIN && process.env.FRONTEND_URL) {
  process.env.CORS_ORIGIN = process.env.FRONTEND_URL;
}

validateEnv();

const parseOrigins = (value) => String(value || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const localDevOrigins = process.env.NODE_ENV === 'production'
  ? []
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const corsOrigins = Array.from(new Set([
  ...parseOrigins(process.env.CORS_ORIGIN),
  process.env.FRONTEND_URL,
  ...localDevOrigins,
  'null'
].filter(Boolean)));

export const env = {
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5000/api/auth/spotify/callback',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
  CORS_ORIGINS: corsOrigins,
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/beatly',
  SESSION_SECRET: process.env.SESSION_SECRET || 'fallback_secret',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  CACHE_DRIVER: process.env.CACHE_DRIVER || 'memory',
  
  // AI Configuration
  AI_PROVIDER: process.env.AI_PROVIDER || 'ollama',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'qwen2.5:3b',
};
