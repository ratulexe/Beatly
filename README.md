# Beatly

Understand Your Music Like Never Before.

## Project Overview
Beatly is a premium Spotify analytics platform where every Spotify Premium Family member can voluntarily connect their own Spotify account to visualize their personal listening insights.

## Folder Structure
- `frontend/`: React 19 + Vite frontend
- `backend/`: Node.js + Express backend
- `docs/`: Documentation
- `database/`: Database scripts
- `.github/`: GitHub templates and workflows

## Installation
1. Clone the repository
2. Install frontend dependencies: `cd frontend && npm install`
3. Install backend dependencies: `cd backend && npm install`

## Development
- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && npm run dev`

## Scripts
- `npm run build` - Build for production
- `npm start` - Start production server

## Roadmap
- Phase 1: Project Initialization & Architecture
- Phase 2: Authentication & Spotify Integration
- Phase 3: Core Dashboard & Analytics

## License
MIT

## GitHub
[Repository Link]

## Contributing
Contributions are welcome.

## Backend Environment Variables
Create a \`.env\` file in the \`backend/\` directory with:
\`\`\`env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/beatly
SESSION_SECRET=your_super_secret_session_key
CLIENT_URL=http://localhost:5173
\`\`\`

## Backend Installation
\`\`\`bash
cd backend
npm install
\`\`\`

## Running the Backend
\`\`\`bash
cd backend
npm run dev
\`\`\`

## Spotify Developer Configuration
To enable authentication, you must configure a Spotify Application:
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
2. Create an App.
3. Add the following **Redirect URI** to your app settings: \`http://localhost:5000/api/auth/callback\`
3. Add the following **Redirect URI** to your app settings: `http://localhost:5000/api/auth/callback`
4. Copy your **Client ID** and **Client Secret**.
5. Add them to your `backend/.env` file:
```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/api/auth/callback
```

## Database Architecture (Phase 4)

Beatly uses a scalable MongoDB architecture via Mongoose with the following models:

### Collections
- **User**: Stores user profile, settings, and connection status.
- **SpotifyToken**: Securely stores OAuth access and refresh tokens.
- **Artist**: Caches Spotify artists with their genres and popularity.
- **Album**: Caches Spotify albums linked to artists.
- **Track**: Caches Spotify tracks, duration, and popularity, linked to albums and artists.
- **ListeningHistory**: Logs each stream (which user played which track, when, and on what device).

### Relationships
- `User` 1:1 `SpotifyToken`
- `User` 1:N `ListeningHistory`
- `ListeningHistory` N:1 `Track`
- `Track` N:1 `Album`
- `Album` N:M `Artist`
- `Track` N:M `Artist`

*(References are implemented using Mongoose `ObjectId` pointers).*

### Key Indexes
To ensure fast analytics aggregation, the following indexes are configured:
- `User`: `spotifyId` (unique), `email` (unique)
- `SpotifyToken`: `userId`, `expiresAt`
- `Artist`: `spotifyArtistId` (unique), `name`
- `Album`: `spotifyAlbumId` (unique)
- `Track`: `spotifyTrackId` (unique), `durationMs`
- `ListeningHistory`: `userId`, `trackId`, `playedAt`, and a **compound index** on `{ userId: 1, playedAt: -1 }` for fast chronological lookups.
