import app from './src/app.js';
import connectDatabase from './src/config/database.js';
import logger from './src/config/logger.js';
import { env } from './src/config/env.js';

const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
