import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, 'backend');

// Ensure directories
const dirs = [
  'src/config',
  'src/controllers',
  'src/cron',
  'src/middlewares',
  'src/models',
  'src/routes',
  'src/services',
  'src/utils',
  'src/validators'
];

dirs.forEach(d => {
  fs.mkdirSync(path.join(root, d), { recursive: true });
});

// Update package.json to use ES modules
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.type = 'module';
pkg.scripts = {
  ...pkg.scripts,
  "start": "node server.js",
  "dev": "nodemon server.js"
};
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

const files = {
  '.env.example': "PORT=5000\nNODE_ENV=development\nMONGODB_URI=mongodb://localhost:27017/beatly\nSESSION_SECRET=your_super_secret_session_key\nCLIENT_URL=http://localhost:5173\n",
  'server.js': "import app from './src/app.js';\nimport connectDatabase from './src/config/database.js';\nimport logger from './src/config/logger.js';\nimport { env } from './src/config/env.js';\n\nconst startServer = async () => {\n  try {\n    await connectDatabase();\n    \n    app.listen(env.PORT, () => {\n      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);\n    });\n  } catch (error) {\n    logger.error('Failed to start server', error);\n    process.exit(1);\n  }\n};\n\nstartServer();\n",
  'src/app.js': "import express from 'express';\nimport helmet from 'helmet';\nimport cors from 'cors';\nimport morgan from 'morgan';\nimport compression from 'compression';\nimport cookieParser from 'cookie-parser';\nimport session from 'express-session';\nimport hpp from 'hpp';\nimport rateLimit from 'express-rate-limit';\n\nimport { env } from './config/env.js';\nimport logger from './config/logger.js';\nimport routes from './routes/index.js';\nimport notFound from './middlewares/notFound.js';\nimport errorHandler from './middlewares/errorHandler.js';\n\nconst app = express();\n\n// Security Middlewares\napp.use(helmet());\napp.disable('x-powered-by');\n\n// CORS Configuration\napp.use(cors({\n  origin: env.CLIENT_URL,\n  credentials: true\n}));\n\n// Rate Limiter\nconst limiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 minutes\n  max: 100, // Limit each IP to 100 requests per windowMs\n  message: {\n    success: false,\n    message: 'Too many requests from this IP, please try again after 15 minutes'\n  }\n});\napp.use(limiter);\n\n// Parse bodies & prevent HTTP Parameter Pollution\napp.use(express.json());\napp.use(express.urlencoded({ extended: true }));\napp.use(hpp());\napp.use(cookieParser());\n\n// Session\napp.use(session({\n  secret: env.SESSION_SECRET,\n  resave: false,\n  saveUninitialized: false,\n  cookie: {\n    secure: env.NODE_ENV === 'production',\n    httpOnly: true,\n    sameSite: 'strict'\n  }\n}));\n\n// Compression\napp.use(compression());\n\n// Logger\nif (env.NODE_ENV === 'development') {\n  app.use(morgan('dev', {\n    stream: { write: message => logger.info(message.trim()) }\n  }));\n}\n\n// Routes\napp.use('/', routes);\n\n// 404 Handler\napp.use(notFound);\n\n// Global Error Handler\napp.use(errorHandler);\n\nexport default app;\n",
  'src/config/env.js': "import dotenv from 'dotenv';\ndotenv.config();\n\nexport const env = {\n  PORT: process.env.PORT || 5000,\n  NODE_ENV: process.env.NODE_ENV || 'development',\n  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/beatly',\n  SESSION_SECRET: process.env.SESSION_SECRET || 'fallback_secret',\n  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',\n};\n",
  'src/config/logger.js': "const logger = {\n  info: (...args) => console.log(`[${new Date().toISOString()}] [INFO]`, ...args),\n  error: (...args) => console.error(`[${new Date().toISOString()}] [ERROR]`, ...args),\n  warn: (...args) => console.warn(`[${new Date().toISOString()}] [WARN]`, ...args)\n};\n\nexport default logger;\n",
  'src/config/database.js': "import mongoose from 'mongoose';\nimport { env } from './env.js';\nimport logger from './logger.js';\n\nmongoose.set('strictQuery', true);\n\nconst connectDatabase = async () => {\n  try {\n    const conn = await mongoose.connect(env.MONGODB_URI);\n    logger.info(`MongoDB connected: ${conn.connection.host}`);\n  } catch (error) {\n    logger.error('MongoDB connection error:', error.message);\n    process.exit(1);\n  }\n};\n\nexport default connectDatabase;\n",
  'src/middlewares/asyncHandler.js': "const asyncHandler = (fn) => (req, res, next) => {\n  Promise.resolve(fn(req, res, next)).catch(next);\n};\n\nexport default asyncHandler;\n",
  'src/middlewares/notFound.js': "const notFound = (req, res, next) => {\n  res.status(404).json({\n    success: false,\n    message: 'Route not found'\n  });\n};\n\nexport default notFound;\n",
  'src/middlewares/errorHandler.js': "import { env } from '../config/env.js';\nimport logger from '../config/logger.js';\n\nconst errorHandler = (err, req, res, next) => {\n  logger.error(err.stack);\n\n  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;\n  let message = err.message;\n\n  // Validation Error Formatter (Mongoose Example)\n  if (err.name === 'ValidationError') {\n    statusCode = 400;\n    message = Object.values(err.errors).map(val => val.message).join(', ');\n  }\n\n  res.status(statusCode).json({\n    success: false,\n    message: env.NODE_ENV === 'production' ? 'Internal Server Error' : message,\n    stack: env.NODE_ENV === 'production' ? null : err.stack,\n  });\n};\n\nexport default errorHandler;\n",
  'src/routes/index.js': "import { Router } from 'express';\nimport healthRoutes from './health.routes.js';\n\nconst router = Router();\n\nrouter.use('/', healthRoutes);\n\nexport default router;\n",
  'src/routes/health.routes.js': "import { Router } from 'express';\n\nconst router = Router();\n\nrouter.get('/', (req, res) => {\n  res.status(200).json({\n    service: 'Beatly API',\n    version: '1.0.0',\n    status: 'running'\n  });\n});\n\nrouter.get('/health', (req, res) => {\n  res.status(200).json({\n    success: true,\n    status: 'healthy',\n    database: 'connected',\n    uptime: process.uptime(),\n    timestamp: new Date().toISOString()\n  });\n});\n\nexport default router;\n"
};

for (const [filePath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(root, filePath), content);
}

console.log('Phase 2 Scaffold Complete');
