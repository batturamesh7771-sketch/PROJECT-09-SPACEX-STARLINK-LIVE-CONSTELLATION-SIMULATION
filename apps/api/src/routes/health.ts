import { Router, Request, Response } from 'express';
import { query } from '../db/client.js';
import { redis } from '../cache/redis.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  let dbStatus = 'ok';
  let redisStatus = 'ok';
  
  try {
    await query('SELECT 1');
  } catch (e) {
    dbStatus = 'error';
  }
  
  try {
    await redis.ping();
  } catch (e) {
    redisStatus = 'error';
  }

  res.json({
    status: dbStatus === 'ok' && redisStatus === 'ok' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus
    }
  });
});

export default router;
