import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { logger } from './utils/logger.js';
import { initDatabase, query } from './db/client.js';
import { startScheduler } from './jobs/scheduler.js';
import { startWebSocketServer } from './websocket/positionBroadcaster.js';
import { runTleSync } from './jobs/tleSyncJob.js';
import { runSpaceWeatherSync } from './jobs/spaceWeatherSyncJob.js';
import { runLaunchSync } from './jobs/launchSyncJob.js';
import { runDebrisAndNeoSync } from './jobs/debrisAndNeoSyncJob.js';
import { runEarthAndPlanetarySync } from './jobs/earthAndPlanetarySyncJob.js';
import { runDeepSpaceSync } from './jobs/deepSpaceSyncJob.js';

// Routes
import healthRouter from './routes/health.js';
import satellitesRouter from './routes/satellites.js';
import tleRouter from './routes/tle.js';
import constellationsRouter from './routes/constellations.js';
import spaceWeatherRouter from './routes/spaceWeather.js';
import launchesRouter from './routes/launches.js';
import debrisRouter from './routes/debris.js';
import asteroidsRouter from './routes/asteroids.js';
import earthObsRouter from './routes/earthObs.js';
import planetaryRouter from './routes/planetary.js';
import deepSpaceRouter from './routes/deepSpace.js';
import systemRouter from './routes/system.js';

const app = express();
const PORT = process.env.PORT || 4000;
const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 4001;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

app.use('/api/health', healthRouter);
app.use('/api/satellites', satellitesRouter);
app.use('/api/tle', tleRouter);
app.use('/api/constellations', constellationsRouter);
app.use('/api/space-weather', spaceWeatherRouter);
app.use('/api/launches', launchesRouter);
app.use('/api/debris', debrisRouter);
app.use('/api/asteroids', asteroidsRouter);
app.use('/api/earth-obs', earthObsRouter);
app.use('/api/planetary', planetaryRouter);
app.use('/api/deep-space', deepSpaceRouter);
app.use('/api/system', systemRouter);

const startServer = async () => {
  try {
    await initDatabase();
    
    // Check if we need initial TLE sync
    const res = await query('SELECT COUNT(*) FROM tle_current');
    if (parseInt(res.rows[0].count) === 0) {
      logger.info('Database is empty, running initial TLE sync...');
      runTleSync(); // non-blocking
    }

    // Trigger non-blocking initial Phase 2, 3, 4 & 5 syncs
    runSpaceWeatherSync();
    runLaunchSync();
    runDebrisAndNeoSync();
    runEarthAndPlanetarySync();
    runDeepSpaceSync();
    
    startScheduler();
    startWebSocketServer(WS_PORT);
    
    app.listen(PORT, () => {
      logger.info(`API server listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
