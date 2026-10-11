import { Router, Request, Response } from 'express';
import { query } from '../db/client.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 100;
  const offset = (page - 1) * limit;
  const status = req.query.status as string;
  const constellation = req.query.constellation as string;
  const search = req.query.search as string;

  let sql = 'SELECT * FROM satellites WHERE 1=1';
  const params: any[] = [];
  let paramIdx = 1;

  if (status) {
    sql += ` AND status = $${paramIdx++}`;
    params.push(status);
  }
  if (constellation) {
    sql += ` AND constellation = $${paramIdx++}`;
    params.push(constellation);
  }
  if (search) {
    sql += ` AND name ILIKE $${paramIdx++}`;
    params.push(`%${search}%`);
  }

  sql += ` ORDER BY norad_id LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
  params.push(limit, offset);

  try {
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:noradId', async (req: Request, res: Response) => {
  try {
    const noradId = parseInt(req.params.noradId, 10);
    const satResult = await query('SELECT * FROM satellites WHERE norad_id = $1', [noradId]);
    const tleResult = await query('SELECT * FROM tle_current WHERE norad_id = $1', [noradId]);
    
    if (satResult.rows.length === 0) {
      return res.status(404).json({ error: 'Satellite not found' });
    }
    
    res.json({
      ...satResult.rows[0],
      tle: tleResult.rows[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:noradId/positions', async (req: Request, res: Response) => {
  // Mock position route
  res.json([]);
});

router.get('/:noradId/passes', async (req: Request, res: Response) => {
  // Mock passes route
  res.json([]);
});

export default router;
