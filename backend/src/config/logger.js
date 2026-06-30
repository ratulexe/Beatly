import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom format to redact sensitive information
const redactTokens = winston.format((info) => {
  const sensitiveKeys = ['accessToken', 'refreshToken', 'password', 'secret', 'token'];
  
  const redact = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const newObj = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        newObj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        newObj[key] = redact(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  };

  info = redact(info);
  return info;
});

const logFormat = winston.format.combine(
  redactTokens(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const createRotateTransport = (filename, level = 'info') => {
  return new winston.transports.DailyRotateFile({
    filename: path.join(logDir, `${filename}-%DATE%.log`),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level
  });
};

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'beatly-api' },
  transports: [
    createRotateTransport('error', 'error'),
    createRotateTransport('application')
  ]
});

// Specific loggers for different domains
logger.auth = winston.createLogger({
  format: logFormat,
  transports: [createRotateTransport('auth')]
});

logger.spotify = winston.createLogger({
  format: logFormat,
  transports: [createRotateTransport('spotify')]
});

logger.cron = winston.createLogger({
  format: logFormat,
  transports: [createRotateTransport('cron')]
});

logger.audit = winston.createLogger({
  format: logFormat,
  transports: [createRotateTransport('audit')]
});

// If we're not in production, log to the console as well with pretty colors
if (process.env.NODE_ENV !== 'production') {
  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} ${level}: ${message} ${stack ? `\n${stack}` : ''}`;
    })
  );

  logger.add(new winston.transports.Console({ format: consoleFormat }));
  logger.auth.add(new winston.transports.Console({ format: consoleFormat }));
  logger.spotify.add(new winston.transports.Console({ format: consoleFormat }));
  logger.cron.add(new winston.transports.Console({ format: consoleFormat }));
  logger.audit.add(new winston.transports.Console({ format: consoleFormat }));
}

export default logger;
