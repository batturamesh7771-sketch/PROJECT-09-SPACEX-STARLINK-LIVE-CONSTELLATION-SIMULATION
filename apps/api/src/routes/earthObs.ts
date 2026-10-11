import { Router, Request, Response } from 'express';
import { fetchEonetNaturalEvents } from '../services/earthObs/nasaEonet.js';
import { getGibsImageryLayers } from '../services/earthObs/nasaGibs.js';
import { fetchSentinelScenes } from '../services/earthObs/copernicus.js';
import { fetchLandsatScenes } from '../services/earthObs/usgsLandsat.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/earth-obs/eonet
 * Active natural hazards and environmental events from NASA EONET v3
 */
router.get('/eonet', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(100, parseInt(String(req.query.limit || '35'), 10));
    const events = await fetchEonetNaturalEvents(limit);
    res.json({
      success: true,
      data: events,
      meta: { total: events.length, source: 'NASA EONET v3' },
    });
  } catch (error) {
    logger.error('Error fetching EONET natural events:', error);
    res.status(500).json({
      success: false,
      error: { code: 'EONET_ERROR', message: 'Failed to fetch EONET natural events' },
    });
  }
});

/**
 * GET /api/earth-obs/gibs-layers
 * Curated NASA GIBS WMTS satellite imagery layers for 3D globe tile rendering
 */
router.get('/gibs-layers', (_req: Request, res: Response) => {
  const layers = getGibsImageryLayers();
  res.json({
    success: true,
    data: layers,
    meta: { total: layers.length, source: 'NASA GIBS WMTS' },
  });
});

/**
 * GET /api/earth-obs/scenes
 * Recent Copernicus Sentinel-2/1 and USGS Landsat-9 scenes via STAC
 */
router.get('/scenes', async (_req: Request, res: Response) => {
  try {
    const [sentinel, landsat] = await Promise.all([
      fetchSentinelScenes(10),
      fetchLandsatScenes(6),
    ]);
    const combined = [...sentinel, ...landsat];
    res.json({
      success: true,
      data: combined,
      meta: { total: combined.length, source: 'Copernicus CDSE & USGS Landsat STAC' },
    });
  } catch (error) {
    logger.error('Error fetching Earth observation scenes:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SCENES_ERROR', message: 'Failed to fetch satellite imagery scenes' },
    });
  }
});

export default router;
