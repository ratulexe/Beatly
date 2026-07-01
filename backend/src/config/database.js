import mongoose from 'mongoose';
import { env } from './env.js';
import logger from './logger.js';

mongoose.set('strictQuery', true);

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error.message);
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDatabase;
