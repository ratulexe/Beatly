import express from 'express';
import mongoose from 'mongoose';
import os from 'os';

const router = express.Router();

/**
 * GET /api/health
 * Simple health check for load balancers
 */
router.get('/', (req, res) => {
  res.status(200).send('OK');
});

/**
 * GET /api/health/status
 * Detailed status of dependencies
 */
router.get('/status', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: dbStatus === 'connected' ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    dependencies: {
      mongodb: dbStatus
    }
  });
});

/**
 * GET /api/health/metrics
 * Hardware and application metrics
 */
router.get('/metrics', (req, res) => {
  const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
  
  const memoryData = process.memoryUsage();
  
  const metrics = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      rss: formatMemoryUsage(memoryData.rss),
      heapTotal: formatMemoryUsage(memoryData.heapTotal),
      heapUsed: formatMemoryUsage(memoryData.heapUsed),
      external: formatMemoryUsage(memoryData.external),
    },
    system: {
      cpuCount: os.cpus().length,
      freeMemory: formatMemoryUsage(os.freemem()),
      totalMemory: formatMemoryUsage(os.totalmem()),
      loadAverage: os.loadavg()
    }
  };

  res.status(200).json(metrics);
});

export default router;
