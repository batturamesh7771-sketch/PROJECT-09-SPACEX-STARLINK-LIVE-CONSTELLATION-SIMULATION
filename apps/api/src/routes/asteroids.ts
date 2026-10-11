import { Router, Request, Response } from 'express';
import { fetchNeoCloseApproaches } from '../services/asteroids/jplCad.js';
import { fetchSentryImpactRisks } from '../services/asteroids/jplSentry.js';
import { lookupSmallBody } from '../services/asteroids/jplSbdb.js';
import { fetchFireballEvents } from '../services/asteroids/jplFireball.js';
import { fetchNeocpCandidates } from '../services/asteroids/minorPlanetCenter.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/asteroids/close-approaches
 * Upcoming Near-Earth Object close approaches from NASA JPL CAD
 */
router.get('/close-approaches', async (req: Request, res: Response) => {
  try {
    const distMaxLd = Math.min(50, parseInt(String(req.query.distMaxLd || '15'), 10));
    const approaches = await fetchNeoCloseApproaches(distMaxLd);
    res.json({
      success: true,
      data: approaches,
      meta: { total: approaches.length, source: 'NASA JPL SSD CAD' },
    });
  } catch (error) {
    logger.error('Error fetching NEO close approaches:', error);
    res.status(500).json({
      success: false,
      error: { code: 'NEO_CAD_ERROR', message: 'Failed to fetch NEO close approaches' },
    });
  }
});

/**
 * GET /api/asteroids/sentry
 * NASA JPL CNEOS Sentry Earth Impact Risk table (Torino/Palermo scale)
 */
router.get('/sentry', async (_req: Request, res: Response) => {
  try {
    const risks = await fetchSentryImpactRisks();
    res.json({
      success: true,
      data: risks,
      meta: { total: risks.length, source: 'NASA JPL CNEOS Sentry' },
    });
  } catch (error) {
    logger.error('Error fetching Sentry impact risks:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SENTRY_ERROR', message: 'Failed to fetch Sentry impact risk catalog' },
    });
  }
});

/**
 * GET /api/asteroids/fireballs
 * Atmospheric fireball and bolide detonation events from NASA JPL Fireball API
 */
router.get('/fireballs', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(100, parseInt(String(req.query.limit || '35'), 10));
    const fireballs = await fetchFireballEvents(limit);
    res.json({
      success: true,
      data: fireballs,
      meta: { total: fireballs.length, source: 'NASA JPL Fireball API' },
    });
  } catch (error) {
    logger.error('Error fetching fireball events:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FIREBALL_ERROR', message: 'Failed to fetch fireball events' },
    });
  }
});

/**
 * GET /api/asteroids/neocp
 * Unconfirmed Near-Earth Object candidates from MPC NEOCP / JPL Scout
 */
router.get('/neocp', async (_req: Request, res: Response) => {
  try {
    const candidates = await fetchNeocpCandidates();
    res.json({
      success: true,
      data: candidates,
      meta: { total: candidates.length, source: 'MPC NEOCP / JPL Scout' },
    });
  } catch (error) {
    logger.error('Error fetching NEOCP candidates:', error);
    res.status(500).json({
      success: false,
      error: { code: 'NEOCP_ERROR', message: 'Failed to fetch NEOCP candidates' },
    });
  }
});

/**
 * GET /api/asteroids/lookup?sstr=Apophis
 * NASA JPL Small-Body Database (SBDB) lookup by name, designation, or SPK-ID
 */
router.get('/lookup', async (req: Request, res: Response) => {
  try {
    const sstr = String(req.query.sstr || 'Apophis');
    const body = await lookupSmallBody(sstr);
    if (!body) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `No small body found matching "${sstr}"` },
      });
    }
    res.json({ success: true, data: body });
  } catch (error) {
    logger.error('Error looking up small body in SBDB:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SBDB_ERROR', message: 'Failed to query Small-Body Database' },
    });
  }
});

export default router;
