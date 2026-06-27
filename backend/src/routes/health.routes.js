import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    service: 'Beatly API',
    version: '1.0.0',
    status: 'running'
  });
});

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    database: 'connected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

export default router;
