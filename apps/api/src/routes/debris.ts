import { Router, Request, Response } from 'express';
import { fetchConjunctionAlerts, fetchDebrisDensityShells } from '../services/debris/conjunctionData.js';
import { fetchDiscosObjects, fetchMajorFragmentationEvents } from '../services/debris/esaDiscos.js';
import { fetchReentryPredictions } from '../services/debris/reentryPredictor.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/debris/conjunctions
 * Active close-approach Conjunction Data Messages (CDM) and risk assessment
 */
router.get('/conjunctions', async (_req: Request, res: Response) => {
  try {
    const alerts = await fetchConjunctionAlerts();
    res.json({
      success: true,
      data: alerts,
      meta: { total: alerts.length, source: '18th SDS / SOCRATES Screening' },
    });
  } catch (error) {
    logger.error('Error fetching conjunction alerts:', error);
    res.status(500).json({
      success: false,
      error: { code: 'CONJUNCTION_ERROR', message: 'Failed to fetch conjunction alerts' },
    });
  }
});

/**
 * GET /api/debris/density
 * Orbital spatial density shells across LEO, MEO, and GEO
 */
router.get('/density', async (_req: Request, res: Response) => {
  try {
    const shells = await fetchDebrisDensityShells();
    res.json({ success: true, data: shells });
  } catch (error) {
    logger.error('Error fetching debris density shells:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DEBRIS_DENSITY_ERROR', message: 'Failed to fetch orbital debris density' },
    });
  }
});

/**
 * GET /api/debris/discos
 * ESA DISCOS physical object characteristics and major historical fragmentation clouds
 */
router.get('/discos', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(50, parseInt(String(req.query.limit || '15'), 10));
    const [objects, fragmentations] = await Promise.all([
      fetchDiscosObjects(limit),
      fetchMajorFragmentationEvents(),
    ]);
    res.json({
      success: true,
      data: {
        objects,
        fragmentations,
      },
    });
  } catch (error) {
    logger.error('Error fetching ESA DISCOS data:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DISCOS_ERROR', message: 'Failed to fetch DISCOS debris characterization' },
    });
  }
});

/**
 * GET /api/debris/reentries
 * Atmospheric decay and re-entry window forecasts
 */
router.get('/reentries', async (_req: Request, res: Response) => {
  try {
    const reentries = await fetchReentryPredictions();
    res.json({ success: true, data: reentries });
  } catch (error) {
    logger.error('Error fetching reentry predictions:', error);
    res.status(500).json({
      success: false,
      error: { code: 'REENTRY_ERROR', message: 'Failed to fetch re-entry predictions' },
    });
  }
});

export default router;
