import { Router, Request, Response } from 'express';
import { fetchPlanetaryEphemerides } from '../services/planetary/jplHorizons.js';
import { fetchMarsRoverPhotos } from '../services/planetary/marsRover.js';
import { fetchPlanetaryMissionDatasets } from '../services/planetary/nasaPds.js';
import { getPlanetarySurfaceLayers } from '../services/planetary/usgsPlanetaryMaps.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/planetary/ephemerides
 * Real-time heliocentric and geocentric state vectors of Solar System planets & deep-space probes
 */
router.get('/ephemerides', async (_req: Request, res: Response) => {
  try {
    const ephemerides = await fetchPlanetaryEphemerides();
    res.json({
      success: true,
      data: ephemerides,
      meta: { total: ephemerides.length, source: 'NASA JPL Horizons / J2000 Ephemeris Solver' },
    });
  } catch (error) {
    logger.error('Error computing planetary ephemerides:', error);
    res.status(500).json({
      success: false,
      error: { code: 'EPHEMERIS_ERROR', message: 'Failed to compute planetary ephemerides' },
    });
  }
});

/**
 * GET /api/planetary/mars-rover?rover=curiosity
 * Latest surface imagery from NASA's Curiosity and Perseverance Mars rovers
 */
router.get('/mars-rover', async (req: Request, res: Response) => {
  try {
    const rover = String(req.query.rover || 'curiosity');
    const photos = await fetchMarsRoverPhotos(rover);
    res.json({
      success: true,
      data: photos,
      meta: { total: photos.length, source: `NASA Mars Rover Photos (${rover})` },
    });
  } catch (error) {
    logger.error('Error fetching Mars Rover photos:', error);
    res.status(500).json({
      success: false,
      error: { code: 'MARS_ROVER_ERROR', message: 'Failed to fetch Mars Rover imagery' },
    });
  }
});

/**
 * GET /api/planetary/pds?target=Mars
 * NASA Planetary Data System (PDS4) and ESA PSA science datasets
 */
router.get('/pds', async (req: Request, res: Response) => {
  try {
    const target = req.query.target ? String(req.query.target) : undefined;
    const datasets = await fetchPlanetaryMissionDatasets(target);
    res.json({
      success: true,
      data: datasets,
      meta: { total: datasets.length, source: 'NASA PDS4 & ESA PSA' },
    });
  } catch (error) {
    logger.error('Error fetching PDS datasets:', error);
    res.status(500).json({
      success: false,
      error: { code: 'PDS_ERROR', message: 'Failed to fetch planetary mission datasets' },
    });
  }
});

/**
 * GET /api/planetary/maps
 * USGS Astrogeology Planetary Cartography WMS layers for Moon, Mars, and Mercury
 */
router.get('/maps', (_req: Request, res: Response) => {
  const layers = getPlanetarySurfaceLayers();
  res.json({
    success: true,
    data: layers,
    meta: { total: layers.length, source: 'USGS Astrogeology Science Center' },
  });
});

export default router;
