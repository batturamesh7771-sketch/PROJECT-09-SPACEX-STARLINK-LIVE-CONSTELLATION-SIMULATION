import { Router, Request, Response } from 'express';
import { query } from '../db/client.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM constellations');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const constResult = await query('SELECT * FROM constellations WHERE id = $1', [id]);
    
    if (constResult.rows.length === 0) {
      return res.status(404).json({ error: 'Constellation not found' });
    }
    
    const membersResult = await query(`
      SELECT s.* FROM satellites s
      JOIN constellation_members cm ON s.norad_id = cm.norad_id
      WHERE cm.constellation_id = $1
    `, [id]);
    
    res.json({
      ...constResult.rows[0],
      satellites: membersResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:id/positions', async (req: Request, res: Response) => {
  // Mock
  res.json([]);
});

export default router;
