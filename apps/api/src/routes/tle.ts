import { Router, Request, Response } from 'express';
import { query } from '../db/client.js';
import { fetchTLEsByGroup } from '../services/celestrak.js';

const router = Router();

router.get('/:noradId', async (req: Request, res: Response) => {
  try {
    const noradId = parseInt(req.params.noradId, 10);
    const result = await query('SELECT * FROM tle_current WHERE norad_id = $1', [noradId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'TLE not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:noradId/history', async (req: Request, res: Response) => {
  try {
    const noradId = parseInt(req.params.noradId, 10);
    const days = parseInt(req.query.days as string) || 90;
    
    const result = await query(`
      SELECT * FROM tle_history 
      WHERE norad_id = $1 AND epoch > NOW() - INTERVAL '${days} days'
      ORDER BY epoch DESC
    `, [noradId]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/group/:group', async (req: Request, res: Response) => {
  try {
    const tles = await fetchTLEsByGroup(req.params.group);
    res.json(tles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch group TLEs' });
  }
});

export default router;
