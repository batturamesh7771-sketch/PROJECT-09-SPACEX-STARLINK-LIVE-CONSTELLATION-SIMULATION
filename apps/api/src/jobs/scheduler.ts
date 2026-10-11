import cron from 'node-cron';
import { runTleSync } from './tleSyncJob.js';
import { runSpaceWeatherSync } from './spaceWeatherSyncJob.js';
import { runLaunchSync } from './launchSyncJob.js';
import { runDebrisAndNeoSync } from './debrisAndNeoSyncJob.js';
import { runEarthAndPlanetarySync } from './earthAndPlanetarySyncJob.js';
import { runDeepSpaceSync } from './deepSpaceSyncJob.js';
import { logger } from '../utils/logger.js';

let tleJob: cron.ScheduledTask | null = null;
let spaceWeatherJob: cron.ScheduledTask | null = null;
let launchJob: cron.ScheduledTask | null = null;
let debrisAndNeoJob: cron.ScheduledTask | null = null;
let earthAndPlanetaryJob: cron.ScheduledTask | null = null;
let deepSpaceJob: cron.ScheduledTask | null = null;

export const startScheduler = () => {
  logger.info('Starting scheduler...');

  // Run TLE sync every 3 hours
  tleJob = cron.schedule('0 */3 * * *', () => {
    runTleSync();
  });

  // Run Space Weather sync every 5 minutes
  spaceWeatherJob = cron.schedule('*/5 * * * *', () => {
    runSpaceWeatherSync();
  });

  // Run Launch & News sync every 30 minutes
  launchJob = cron.schedule('*/30 * * * *', () => {
    runLaunchSync();
  });

  // Run Space Debris & NEO Planetary Defense sync every hour
  debrisAndNeoJob = cron.schedule('0 * * * *', () => {
    runDebrisAndNeoSync();
  });

  // Run Earth Observation & Planetary Ephemeris sync every 15 minutes
  earthAndPlanetaryJob = cron.schedule('*/15 * * * *', () => {
    runEarthAndPlanetarySync();
  });

  // Run Deep Space, Exoplanet & Multi-Messenger Astrophysics sync every 6 hours
  deepSpaceJob = cron.schedule('0 */6 * * *', () => {
    runDeepSpaceSync();
  });

  logger.info(
    'Scheduler started (TLE: 3h, Space Weather: 5m, Launches: 30m, Debris/NEOs: 1h, Earth/Planetary: 15m, Deep Space: 6h).'
  );
};

export const stopScheduler = () => {
  logger.info('Stopping scheduler...');
  if (tleJob) tleJob.stop();
  if (spaceWeatherJob) spaceWeatherJob.stop();
  if (launchJob) launchJob.stop();
  if (debrisAndNeoJob) debrisAndNeoJob.stop();
  if (earthAndPlanetaryJob) earthAndPlanetaryJob.stop();
  if (deepSpaceJob) deepSpaceJob.stop();
};
