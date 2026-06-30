# Architecture

Beatly is built as a highly scalable modern web application leveraging a decoupled client-server architecture. 

## High-Level Architecture

### Frontend (Client)
- **Framework**: React 18 (Vite)
- **Routing**: React Router
- **State Management**: React Query (Data Fetching), Zustand (Global State)
- **Styling**: Tailwind CSS + Framer Motion
- **Hosting**: Designed for CDN deployment (Vercel/Netlify or Nginx Docker container)

### Backend (API Server)
- **Framework**: Node.js + Express (ES Modules)
- **Database**: MongoDB (Mongoose ORM)
- **Cache**: Memory cache via `node-cache` (Ready for Redis extension)
- **Logging**: Winston with daily log rotation
- **Security**: Helmet, express-mongo-sanitize, rate limiters

## Core Services & Domains

### 1. Spotify Integration Service
- Handles OAuth2 flow with Spotify.
- Manages token refreshing and secure storage.
- Synchronizes user's listening history into the database asynchronously.

### 2. Analytics Engine
- Uses advanced MongoDB Aggregation Pipelines to process raw track plays.
- Generates insights: Total Listening Time, Top Tracks, Top Artists, Genre distributions.
- Caches results to prevent redundant heavy aggregations.

### 3. Gamification & Leaderboards
- Tracks user XP, level, and listening streaks.
- Computes global, group, and seasonal leaderboards dynamically.

## Database Design

- **User**: Stores profiles, preferences, and Spotify credentials.
- **Track, Artist, Album**: Normalized catalog data mirrored from Spotify to reduce API calls.
- **ListeningHistory**: Append-only collection recording every track play event.
- **AnalyticsSnapshot**: Stores daily and overall generated insights to avoid recalculation.
