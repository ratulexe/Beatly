import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, 'backend');
const frontendRoot = path.join(__dirname, 'frontend');

// Ensure new backend directories
const dirs = [
  'src/config',
  'src/controllers',
  'src/services',
  'src/routes'
];
dirs.forEach(d => {
  fs.mkdirSync(path.join(backendRoot, d), { recursive: true });
});

// Update backend/src/config/env.js
const envPath = path.join(backendRoot, 'src/config/env.js');
let envContent = fs.readFileSync(envPath, 'utf8');
envContent = envContent.replace(
  `export const env = {`,
  `export const env = {\n  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,\n  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,\n  SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5000/api/auth/callback',\n  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',`
);
fs.writeFileSync(envPath, envContent);

// Update backend/.env.example
const envExPath = path.join(backendRoot, '.env.example');
fs.appendFileSync(envExPath, `SPOTIFY_CLIENT_ID=your_client_id_here\nSPOTIFY_CLIENT_SECRET=your_client_secret_here\nSPOTIFY_REDIRECT_URI=http://localhost:5000/api/auth/callback\nFRONTEND_URL=http://localhost:5173\n`);

// Update backend/src/routes/index.js
const routesIndexPath = path.join(backendRoot, 'src/routes/index.js');
let routesIndexContent = fs.readFileSync(routesIndexPath, 'utf8');
routesIndexContent = routesIndexContent.replace(
  `import healthRoutes from './health.routes.js';`,
  `import healthRoutes from './health.routes.js';\nimport spotifyRoutes from './spotify.routes.js';`
);
routesIndexContent = routesIndexContent.replace(
  `router.use('/', healthRoutes);`,
  `router.use('/', healthRoutes);\nrouter.use('/api/auth', spotifyRoutes);`
);
fs.writeFileSync(routesIndexPath, routesIndexContent);

// Write config/spotify.js
fs.writeFileSync(path.join(backendRoot, 'src/config/spotify.js'), `import { env } from './env.js';

export const SPOTIFY_CONFIG = {
  clientId: env.SPOTIFY_CLIENT_ID,
  clientSecret: env.SPOTIFY_CLIENT_SECRET,
  redirectUri: env.SPOTIFY_REDIRECT_URI,
  scopes: [
    'user-read-email',
    'user-read-private',
    'user-read-recently-played',
    'user-top-read'
  ].join(' '),
  authUrl: 'https://accounts.spotify.com/authorize',
  tokenUrl: 'https://accounts.spotify.com/api/token',
};
`);

// Write services/spotifyAuth.service.js
fs.writeFileSync(path.join(backendRoot, 'src/services/spotifyAuth.service.js'), `import axios from 'axios';
import crypto from 'crypto';
import { SPOTIFY_CONFIG } from '../config/spotify.js';

export const generateState = () => {
  return crypto.randomBytes(16).toString('hex');
};

export const getAuthorizeUrl = (state) => {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CONFIG.clientId,
    response_type: 'code',
    redirect_uri: SPOTIFY_CONFIG.redirectUri,
    state: state,
    scope: SPOTIFY_CONFIG.scopes,
    show_dialog: 'true'
  });
  return \`\${SPOTIFY_CONFIG.authUrl}?\${params.toString()}\`;
};

export const exchangeCodeForTokens = async (code) => {
  const authHeader = Buffer.from(\`\${SPOTIFY_CONFIG.clientId}:\${SPOTIFY_CONFIG.clientSecret}\`).toString('base64');
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: SPOTIFY_CONFIG.redirectUri
  });

  try {
    const response = await axios.post(SPOTIFY_CONFIG.tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': \`Basic \${authHeader}\`
      }
    });

    const { access_token, refresh_token, expires_in } = response.data;
    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000
    };
  } catch (error) {
    throw new Error('Failed to exchange code for tokens');
  }
};

export const refreshAccessToken = async (refreshToken) => {
  const authHeader = Buffer.from(\`\${SPOTIFY_CONFIG.clientId}:\${SPOTIFY_CONFIG.clientSecret}\`).toString('base64');
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  try {
    const response = await axios.post(SPOTIFY_CONFIG.tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': \`Basic \${authHeader}\`
      }
    });

    const { access_token, expires_in, refresh_token: new_refresh_token } = response.data;
    return {
      accessToken: access_token,
      refreshToken: new_refresh_token || refreshToken,
      expiresAt: Date.now() + expires_in * 1000
    };
  } catch (error) {
    throw new Error('Failed to refresh access token');
  }
};
`);

// Write controllers/spotify.controller.js
fs.writeFileSync(path.join(backendRoot, 'src/controllers/spotify.controller.js'), `import { env } from '../config/env.js';
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
    return res.redirect(\`\${env.FRONTEND_URL}/login?error=state_mismatch\`);
  }

  delete req.session.spotifyState; // Clear state after use

  try {
    const tokens = await spotifyAuthService.exchangeCodeForTokens(code);
    req.session.spotify = tokens;
    res.redirect(\`\${env.FRONTEND_URL}/dashboard\`);
  } catch (error) {
    return res.redirect(\`\${env.FRONTEND_URL}/login?error=invalid_token\`);
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
`);

// Write routes/spotify.routes.js
fs.writeFileSync(path.join(backendRoot, 'src/routes/spotify.routes.js'), `import { Router } from 'express';
import * as spotifyController from '../controllers/spotify.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const router = Router();

router.get('/login', spotifyController.login);
router.get('/callback', asyncHandler(spotifyController.callback));
router.post('/refresh', asyncHandler(spotifyController.refresh));
router.post('/logout', spotifyController.logout);
router.get('/status', spotifyController.status);

export default router;
`);

// Frontend: Update Login page
const loginPagePath = path.join(frontendRoot, 'src/pages/Login/Login.jsx');
const loginPageCode = `import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';

export default function Login() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      if (err === 'state_mismatch') setError('Authentication failed due to state mismatch. Please try again.');
      else if (err === 'invalid_token') setError('Failed to exchange code for token. Please try again.');
      else setError('An error occurred during authentication.');
    }
  }, [searchParams]);

  const handleLogin = () => {
    setLoading(true);
    window.location.href = 'http://localhost:5000/api/auth/login';
  };

  return (
    <PageContainer>
      <div className="max-w-md mx-auto bg-beatly-surface p-8 rounded-2xl text-center">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        
        {error && (
          <div className="mb-6 p-3 bg-beatly-error/20 text-beatly-error rounded-md text-sm">
            {error}
          </div>
        )}

        <Button onClick={handleLogin} disabled={loading}>
          {loading ? 'Connecting...' : 'Continue with Spotify'}
        </Button>
      </div>
    </PageContainer>
  );
}
`;
fs.writeFileSync(loginPagePath, loginPageCode);

console.log('Phase 3 Script Complete');
