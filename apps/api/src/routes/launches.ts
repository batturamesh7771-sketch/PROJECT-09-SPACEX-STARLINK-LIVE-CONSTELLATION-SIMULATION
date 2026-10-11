import { Router, Request, Response } from 'express';
import { fetchUpcomingLaunches, fetchPreviousLaunches } from '../services/launches/launchLibrary.js';
import { fetchSpaceXSummary } from '../services/launches/spacexApi.js';
import { fetchSpaceflightNews } from '../services/launches/spaceflightNews.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/launches/upcoming
 * Upcoming rocket launches from Launch Library 2
 */
router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(50, parseInt(String(req.query.limit || '15'), 10));
    const launches = await fetchUpcomingLaunches(limit);
    res.json({
      success: true,
      data: launches,
      meta: { total: launches.length, source: 'Launch Library 2' },
    });
  } catch (error) {
    logger.error('Error fetching upcoming launches:', error);
    res.status(500).json({
      success: false,
      error: { code: 'LAUNCHES_UPCOMING_ERROR', message: 'Failed to fetch upcoming launches' },
    });
  }
});

/**
 * GET /api/launches/previous
 * Recent historical launches from Launch Library 2
 */
router.get('/previous', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(50, parseInt(String(req.query.limit || '15'), 10));
    const launches = await fetchPreviousLaunches(limit);
    res.json({
      success: true,
      data: launches,
      meta: { total: launches.length, source: 'Launch Library 2' },
    });
  } catch (error) {
    logger.error('Error fetching previous launches:', error);
    res.status(500).json({
      success: false,
      error: { code: 'LAUNCHES_PREVIOUS_ERROR', message: 'Failed to fetch previous launches' },
    });
  }
});

/**
 * GET /api/launches/spacex
 * SpaceX fleet, booster recovery, and Starlink deployment metrics
 */
router.get('/spacex', async (_req: Request, res: Response) => {
  try {
    const stats = await fetchSpaceXSummary();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Error fetching SpaceX summary:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SPACEX_ERROR', message: 'Failed to fetch SpaceX telemetry' },
    });
  }
});

/**
 * GET /api/launches/news
 * Spaceflight News API v4 articles linked to launches and space missions
 */
router.get('/news', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(40, parseInt(String(req.query.limit || '15'), 10));
    const articles = await fetchSpaceflightNews(limit);
    res.json({
      success: true,
      data: articles,
      meta: { total: articles.length, source: 'SNAPI v4' },
    });
  } catch (error) {
    logger.error('Error fetching spaceflight news:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SPACE_NEWS_ERROR', message: 'Failed to fetch spaceflight news' },
    });
  }
});

export default router;
