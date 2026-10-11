import { Router } from 'express';
import { fetchExoplanets } from '../services/deepSpace/exoplanetArchive.js';
import { fetchGravitationalWaveEvents } from '../services/deepSpace/gwosc.js';
import { fetchDeepSpaceObservations } from '../services/deepSpace/mastArchive.js';
import { fetchStellarAndTransients } from '../services/deepSpace/gaiaTap.js';
import { fetchCosmicRayStations, fetchDsnTelemetryLinks } from '../services/deepSpace/cosmicRay.js';
import { logger } from '../utils/logger.js';

const router = Router();

// GET /api/deep-space/exoplanets?habitable=false
router.get('/exoplanets', async (req, res) => {
  try {
    const habitableOnly = req.query.habitable === 'true';
    const all = await fetchExoplanets();
    const data = habitableOnly ? all.filter((p) => p.isHabitableZone) : all;
    res.json({
      success: true,
      data,
      meta: { total: data.length, source: 'NASA Exoplanet Archive TAP' },
    });
  } catch (error) {
    logger.error('Error in GET /api/deep-space/exoplanets:', error);
    res.status(500).json({
      success: false,
      error: { code: 'EXOPLANET_FETCH_ERROR', message: 'Failed to fetch exoplanets' },
    });
  }
});

// GET /api/deep-space/gravitational-waves?type=ALL
router.get('/gravitational-waves', async (req, res) => {
  try {
    const sourceType = (req.query.type as string) || 'ALL';
    const all = await fetchGravitationalWaveEvents();
    const data =
      sourceType === 'ALL' ? all : all.filter((gw) => gw.mergerType === sourceType);
    res.json({
      success: true,
      data,
      meta: { total: data.length, source: 'LIGO/Virgo/KAGRA GWOSC' },
    });
  } catch (error) {
    logger.error('Error in GET /api/deep-space/gravitational-waves:', error);
    res.status(500).json({
      success: false,
      error: { code: 'GWOSC_FETCH_ERROR', message: 'Failed to fetch gravitational wave events' },
    });
  }
});

// GET /api/deep-space/observations?telescope=ALL
router.get('/observations', async (req, res) => {
  try {
    const telescope = (req.query.telescope as string) || 'ALL';
    const all = await fetchDeepSpaceObservations();
    const data =
      telescope === 'ALL' ? all : all.filter((obs) => obs.observatory === telescope);
    res.json({
      success: true,
      data,
      meta: { total: data.length, source: 'STScI MAST + NASA APOD' },
    });
  } catch (error) {
    logger.error('Error in GET /api/deep-space/observations:', error);
    res.status(500).json({
      success: false,
      error: { code: 'MAST_FETCH_ERROR', message: 'Failed to fetch deep space observations' },
    });
  }
});

// GET /api/deep-space/transients?type=ALL
router.get('/transients', async (req, res) => {
  try {
    const objectType = (req.query.type as string) || 'ALL';
    const all = await fetchStellarAndTransients();
    const data =
      objectType === 'ALL' ? all : all.filter((obj) => obj.category === objectType);
    res.json({
      success: true,
      data,
      meta: { total: data.length, source: 'ESA Gaia DR3 + IAU TNS' },
    });
  } catch (error) {
    logger.error('Error in GET /api/deep-space/transients:', error);
    res.status(500).json({
      success: false,
      error: { code: 'GAIA_TNS_FETCH_ERROR', message: 'Failed to fetch stellar & transient objects' },
    });
  }
});

// GET /api/deep-space/cosmic-rays
router.get('/cosmic-rays', async (_req, res) => {
  try {
    const data = await fetchCosmicRayStations();
    res.json({
      success: true,
      data,
      meta: { total: data.length, source: 'NMDB Neutron Monitor Database' },
    });
  } catch (error) {
    logger.error('Error in GET /api/deep-space/cosmic-rays:', error);
    res.status(500).json({
      success: false,
      error: { code: 'NMDB_FETCH_ERROR', message: 'Failed to fetch cosmic ray station readings' },
    });
  }
});

// GET /api/deep-space/dsn
router.get('/dsn', async (_req, res) => {
  try {
    const data = await fetchDsnTelemetryLinks();
    res.json({
      success: true,
      data,
      meta: { total: data.length, source: 'NASA Deep Space Network (DSN Now)' },
    });
  } catch (error) {
    logger.error('Error in GET /api/deep-space/dsn:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DSN_FETCH_ERROR', message: 'Failed to fetch DSN antenna links' },
    });
  }
});

export default router;
