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
