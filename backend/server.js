import app from './src/app.js';
import connectDatabase from './src/config/database.js';
import logger from './src/config/logger.js';
import { env } from './src/config/env.js';
import { initCronJobs } from './src/cron/index.js';
import { achievementService } from './src/services/ranking/achievement.service.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initSyncService } from './src/services/sync/sync.service.js';

const startServer = async () => {
  try {
    await connectDatabase();
    
    // Seed achievements & init crons
    await achievementService.seedAchievements();
    initCronJobs();

    const httpServer = createServer(app);
    
    const io = new Server(httpServer, {
      cors: {
        origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'null'],
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    initSyncService(io);

    httpServer.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
