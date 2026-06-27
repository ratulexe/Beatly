import { env } from '../config/env.js';
import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Validation Error Formatter (Mongoose Example)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
    stack: env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;
