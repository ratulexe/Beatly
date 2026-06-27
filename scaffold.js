const fs = require('fs');
const path = require('path');

const root = 'd:/Beatly';

const dirs = [
  'docs',
  '.github',
  '.github/ISSUE_TEMPLATE',
  '.github/workflows',
  'database',
  
  'frontend/src/assets',
  'frontend/src/assets/images',
  'frontend/src/assets/icons',
  'frontend/src/assets/fonts',
  'frontend/src/components',
  'frontend/src/components/common',
  'frontend/src/components/layout',
  'frontend/src/components/dashboard',
  'frontend/src/components/charts',
  'frontend/src/components/ui',
  'frontend/src/pages',
  'frontend/src/pages/Home',
  'frontend/src/pages/Dashboard',
  'frontend/src/pages/Login',
  'frontend/src/pages/Profile',
  'frontend/src/pages/Settings',
  'frontend/src/pages/NotFound',
  'frontend/src/layouts',
  'frontend/src/hooks',
  'frontend/src/context',
  'frontend/src/services',
  'frontend/src/routes',
  'frontend/src/styles',
  'frontend/src/constants',
  'frontend/src/utils',

  'backend/src',
  'backend/src/config',
  'backend/src/controllers',
  'backend/src/middlewares',
  'backend/src/models',
  'backend/src/routes',
  'backend/src/services',
  'backend/src/validators',
  'backend/src/utils',
  'backend/src/cron'
];

dirs.forEach(d => {
  fs.mkdirSync(path.join(root, d), { recursive: true });
});

const files = {
  '.gitignore': `node_modules\n.env\ndist\ncoverage\nlogs\n.DS_Store\n`,
  'README.md': `# Beatly

Understand Your Music Like Never Before.

## Project Overview
Beatly is a premium Spotify analytics platform where every Spotify Premium Family member can voluntarily connect their own Spotify account to visualize their personal listening insights.

## Folder Structure
- \`frontend/\`: React 19 + Vite frontend
- \`backend/\`: Node.js + Express backend
- \`docs/\`: Documentation
- \`database/\`: Database scripts
- \`.github/\`: GitHub templates and workflows

## Installation
1. Clone the repository
2. Install frontend dependencies: \`cd frontend && npm install\`
3. Install backend dependencies: \`cd backend && npm install\`

## Development
- Frontend: \`cd frontend && npm run dev\`
- Backend: \`cd backend && npm run dev\`

## Scripts
- \`npm run build\` - Build for production
- \`npm start\` - Start production server

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
`,
  'LICENSE': `MIT License\n`,
  '.github/PULL_REQUEST_TEMPLATE.md': `## Description\n\n## Type of change\n- [ ] Bug fix\n- [ ] New feature\n- [ ] Breaking change\n`,
  '.github/workflows/ci.yml': `name: CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - name: Setup Node.js\n        uses: actions/setup-node@v3\n        with:\n          node-version: '20'\n      - name: Install Dependencies\n        run: echo "Run install checks here later"\n`,
  
  // Frontend env
  'frontend/.env.example': `VITE_API_URL=http://localhost:5000\n`,
  
  // Backend env
  'backend/.env.example': `PORT=5000\nMONGO_URI=mongodb://localhost:27017/beatly\nSESSION_SECRET=your_secret\n`,
  
  // Database placeholder
  'database/placeholder.md': `# Database Files\nPlace schema migrations or seeders here.\n`,
  
  // Backend server files
  'backend/server.js': `const app = require('./src/app');
const connectDB = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
`,
  'backend/src/app.js': `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));

app.get('/', (req, res) => {
  res.json({ message: 'Beatly API Running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

module.exports = app;
`,
  'backend/src/config/database.js': `const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/beatly';
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
`,

  // Frontend files
  'frontend/index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <title>Beatly - Understand Your Music</title>
  </head>
  <body class="bg-beatly-bg text-white font-manrope">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
  'frontend/src/main.jsx': `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
  'frontend/src/App.jsx': `import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
`,
  'frontend/src/routes/AppRoutes.jsx': `import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Dashboard from '../pages/Dashboard/Dashboard';
import Login from '../pages/Login/Login';
import Profile from '../pages/Profile/Profile';
import Settings from '../pages/Settings/Settings';
import NotFound from '../pages/NotFound/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
`,

  'frontend/src/styles/index.css': `@import "tailwindcss";

@theme {
  --color-beatly-bg: #090909;
  --color-beatly-surface: #111111;
  --color-beatly-card: #181818;
  --color-beatly-primary: #1ED760;
  --color-beatly-text-sec: #B3B3B3;
  --color-beatly-error: #EF4444;
  --color-beatly-success: #22C55E;
  --color-beatly-warning: #FACC15;

  --font-manrope: "Manrope", sans-serif;
}

@layer base {
  body {
    @apply bg-beatly-bg text-white font-manrope antialiased;
  }
}
`,

  // Placeholder components
  'frontend/src/components/layout/Navbar.jsx': `export const Navbar = () => <nav className="p-4 bg-beatly-surface">Navbar</nav>;\n`,
  'frontend/src/components/layout/Sidebar.jsx': `export const Sidebar = () => <aside className="w-64 bg-beatly-surface h-full">Sidebar</aside>;\n`,
  'frontend/src/components/layout/Footer.jsx': `export const Footer = () => <footer className="p-4 text-beatly-text-sec text-center">Footer</footer>;\n`,
  'frontend/src/components/ui/Button.jsx': `export const Button = ({ children }) => <button className="bg-beatly-primary text-beatly-bg px-4 py-2 rounded-full font-bold">{children}</button>;\n`,
  'frontend/src/components/ui/Input.jsx': `export const Input = () => <input className="bg-beatly-card border border-gray-700 rounded p-2 text-white w-full" />;\n`,
  'frontend/src/components/ui/Modal.jsx': `export const Modal = ({ children }) => <div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="bg-beatly-surface p-6 rounded-lg">{children}</div></div>;\n`,
  'frontend/src/components/ui/Card.jsx': `export const Card = ({ children }) => <div className="bg-beatly-card p-4 rounded-xl shadow-lg">{children}</div>;\n`,
  'frontend/src/components/dashboard/StatCard.jsx': `export const StatCard = ({ title, value }) => <div className="bg-beatly-card p-4 rounded-xl"><h3 className="text-beatly-text-sec text-sm">{title}</h3><p className="text-2xl font-bold">{value}</p></div>;\n`,
  'frontend/src/components/charts/ChartCard.jsx': `export const ChartCard = () => <div className="bg-beatly-card p-4 rounded-xl h-64 flex items-center justify-center">Chart Placeholder</div>;\n`,
  'frontend/src/components/ui/Loader.jsx': `export const Loader = () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beatly-primary"></div>;\n`,
  'frontend/src/components/ui/Avatar.jsx': `export const Avatar = () => <div className="h-10 w-10 rounded-full bg-gray-600"></div>;\n`,
  'frontend/src/components/ui/Badge.jsx': `export const Badge = ({ text }) => <span className="bg-beatly-primary/20 text-beatly-primary text-xs px-2 py-1 rounded-full">{text}</span>;\n`,
  'frontend/src/components/ui/Breadcrumb.jsx': `export const Breadcrumb = () => <div className="text-sm text-beatly-text-sec">Home / Dashboard</div>;\n`,
  'frontend/src/components/ui/EmptyState.jsx': `export const EmptyState = ({ message }) => <div className="flex flex-col items-center justify-center py-12 text-beatly-text-sec"><p>{message}</p></div>;\n`,
  'frontend/src/components/layout/PageContainer.jsx': `export const PageContainer = ({ children }) => <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>;\n`,
  'frontend/src/components/ui/ThemeProvider.jsx': `export const ThemeProvider = ({ children }) => <>{children}</>;\n`,

  // Pages
  'frontend/src/pages/Home/Home.jsx': `import { PageContainer } from '../../components/layout/PageContainer';\nimport { Button } from '../../components/ui/Button';\nexport default function Home() { return <PageContainer><h1 className="text-4xl font-extrabold mb-4">Beatly</h1><p className="text-beatly-text-sec mb-8">Understand Your Music Like Never Before.</p><Button>Get Started</Button></PageContainer>; }\n`,
  'frontend/src/pages/Dashboard/Dashboard.jsx': `import { PageContainer } from '../../components/layout/PageContainer';\nimport { StatCard } from '../../components/dashboard/StatCard';\nexport default function Dashboard() { return <PageContainer><h1 className="text-3xl font-bold mb-6">Dashboard</h1><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><StatCard title="Total Plays" value="1,234" /><StatCard title="Top Artist" value="The Weeknd" /><StatCard title="Listening Time" value="45h" /></div></PageContainer>; }\n`,
  'frontend/src/pages/Login/Login.jsx': `import { PageContainer } from '../../components/layout/PageContainer';\nimport { Button } from '../../components/ui/Button';\nexport default function Login() { return <PageContainer><div className="max-w-md mx-auto bg-beatly-surface p-8 rounded-2xl text-center"><h1 className="text-2xl font-bold mb-6">Login</h1><Button>Connect with Spotify</Button></div></PageContainer>; }\n`,
  'frontend/src/pages/Profile/Profile.jsx': `import { PageContainer } from '../../components/layout/PageContainer';\nimport { Avatar } from '../../components/ui/Avatar';\nexport default function Profile() { return <PageContainer><h1 className="text-3xl font-bold mb-6">Profile</h1><div className="flex items-center gap-4 mb-6"><Avatar /><div><h2 className="text-xl font-semibold">User Name</h2><p className="text-beatly-text-sec">user@example.com</p></div></div></PageContainer>; }\n`,
  'frontend/src/pages/Settings/Settings.jsx': `import { PageContainer } from '../../components/layout/PageContainer';\nexport default function Settings() { return <PageContainer><h1 className="text-3xl font-bold mb-6">Settings</h1><p className="text-beatly-text-sec">Preferences and account management.</p></PageContainer>; }\n`,
  'frontend/src/pages/NotFound/NotFound.jsx': `import { PageContainer } from '../../components/layout/PageContainer';\nexport default function NotFound() { return <PageContainer><h1 className="text-3xl font-bold mb-4 text-beatly-error">404 - Not Found</h1><p className="text-beatly-text-sec">The page you are looking for doesn't exist.</p></PageContainer>; }\n`
};

for (const [filePath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(root, filePath), content);
}

console.log('Scaffolding complete!');
