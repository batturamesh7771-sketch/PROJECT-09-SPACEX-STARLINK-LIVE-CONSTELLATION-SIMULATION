import { Router, Request, Response } from 'express';
import {
  fetchNoaaKpIndex,
  fetchSolarWind,
  fetchGoesXRayFlux,
  fetchAuroraForecast,
  fetchSpaceWeatherAlerts,
  fetchRadioFlux107cm,
  classifyKpStormLevel,
  classifyXRayFlux,
} from '../services/spaceWeather/noaaSwpc.js';
import {
  fetchDonkiSolarFlares,
  fetchDonkiCMEs,
  fetchDonkiGeomagneticStorms,
} from '../services/spaceWeather/nasaDonki.js';
import { fetchGfzHistoricalKp } from '../services/spaceWeather/gfzKp.js';
import { logger } from '../utils/logger.js';
import type { SpaceWeatherSummary } from '@cosmos/types';

const router = Router();

/**
 * GET /api/space-weather/summary
 * Unified dashboard snapshot of Kp, Solar Wind, X-Ray Flux, F10.7, Alerts, Flares, and CMEs
 */
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const [kpHistory, solarWindHistory, xrayHistory, f107, activeAlerts, recentFlares, recentCMEs] =
      await Promise.all([
        fetchNoaaKpIndex(),
        fetchSolarWind(),
        fetchGoesXRayFlux(),
        fetchRadioFlux107cm(),
        fetchSpaceWeatherAlerts(),
        fetchDonkiSolarFlares(7),
        fetchDonkiCMEs(7),
      ]);

    const currentKp =
      kpHistory[kpHistory.length - 1] || {
        timestamp: new Date().toISOString(),
        kp: 2.33,
        aRunning: 9,
        stationCount: 8,
        stormLevel: classifyKpStormLevel(2.33),
      };

    const currentSolarWind =
      solarWindHistory[solarWindHistory.length - 1] || {
        timestamp: new Date().toISOString(),
        density: 5.1,
        speed: 425,
        temperature: 115000,
        bx: 1.2,
        by: -2.0,
        bz: -1.8,
        bt: 5.4,
      };

    const currentXRay =
      xrayHistory[xrayHistory.length - 1] || {
        timestamp: new Date().toISOString(),
        flux: 1.8e-6,
        energyBand: '0.1-0.8nm',
        ...classifyXRayFlux(1.8e-6),
      };

    const summary: SpaceWeatherSummary = {
      currentKp,
      kpHistory: kpHistory.slice(-24),
      currentSolarWind,
      solarWindHistory: solarWindHistory.slice(-60),
      currentXRay,
      radioFlux107cm: f107,
      activeAlerts,
      recentFlares,
      recentCMEs,
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    logger.error('Error building space weather summary:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SPACE_WEATHER_ERROR', message: 'Failed to retrieve space weather summary' },
    });
  }
});

/**
 * GET /api/space-weather/kp
 * Current & historical Kp index from NOAA SWPC + GFZ Potsdam
 */
router.get('/kp', async (req: Request, res: Response) => {
  try {
    const days = parseInt(String(req.query.days || '7'), 10);
    const [noaaKp, gfzKp] = await Promise.all([
      fetchNoaaKpIndex(),
      fetchGfzHistoricalKp(days),
    ]);
    res.json({
      success: true,
      data: {
        current: noaaKp[noaaKp.length - 1] || null,
        noaaHistory: noaaKp,
        gfzHistory: gfzKp,
      },
    });
  } catch (error) {
    logger.error('Error fetching Kp index:', error);
    res.status(500).json({
      success: false,
      error: { code: 'KP_FETCH_ERROR', message: 'Failed to fetch Kp index data' },
    });
  }
});

/**
 * GET /api/space-weather/solar-wind
 * Real-time DSCOVR/ACE solar wind plasma and interplanetary magnetic field
 */
router.get('/solar-wind', async (_req: Request, res: Response) => {
  try {
    const readings = await fetchSolarWind();
    res.json({
      success: true,
      data: {
        current: readings[readings.length - 1] || null,
        history: readings,
      },
    });
  } catch (error) {
    logger.error('Error fetching solar wind:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SOLAR_WIND_ERROR', message: 'Failed to fetch solar wind telemetry' },
    });
  }
});

/**
 * GET /api/space-weather/aurora
 * OVATION Aurora probability coordinates for 3D globe visualization
 */
router.get('/aurora', async (_req: Request, res: Response) => {
  try {
    const aurora = await fetchAuroraForecast();
    res.json({ success: true, data: aurora });
  } catch (error) {
    logger.error('Error fetching aurora forecast:', error);
    res.status(500).json({
      success: false,
      error: { code: 'AURORA_ERROR', message: 'Failed to fetch aurora forecast' },
    });
  }
});

/**
 * GET /api/space-weather/flares
 * GOES X-ray flux + NASA DONKI solar flare catalog
 */
router.get('/flares', async (req: Request, res: Response) => {
  try {
    const days = parseInt(String(req.query.days || '7'), 10);
    const [xrayFlux, flares] = await Promise.all([
      fetchGoesXRayFlux(),
      fetchDonkiSolarFlares(days),
    ]);
    res.json({
      success: true,
      data: {
        currentXRay: xrayFlux[xrayFlux.length - 1] || null,
        xrayHistory: xrayFlux,
        flares,
      },
    });
  } catch (error) {
    logger.error('Error fetching solar flares:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FLARES_ERROR', message: 'Failed to fetch solar flare data' },
    });
  }
});

/**
 * GET /api/space-weather/cmes
 * NASA DONKI Coronal Mass Ejections & Geomagnetic Storms
 */
router.get('/cmes', async (req: Request, res: Response) => {
  try {
    const days = parseInt(String(req.query.days || '7'), 10);
    const [cmes, storms] = await Promise.all([
      fetchDonkiCMEs(days),
      fetchDonkiGeomagneticStorms(30),
    ]);
    res.json({
      success: true,
      data: {
        cmes,
        storms,
      },
    });
  } catch (error) {
    logger.error('Error fetching CMEs:', error);
    res.status(500).json({
      success: false,
      error: { code: 'CME_ERROR', message: 'Failed to fetch CME data' },
    });
  }
});

/**
 * GET /api/space-weather/alerts
 * Active NOAA Space Weather alerts, watches, and warnings
 */
router.get('/alerts', async (_req: Request, res: Response) => {
  try {
    const alerts = await fetchSpaceWeatherAlerts();
    res.json({ success: true, data: alerts });
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ALERTS_ERROR', message: 'Failed to fetch space weather alerts' },
    });
  }
});

export default router;
