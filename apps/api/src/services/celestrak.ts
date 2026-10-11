import axios from 'axios';
import { cacheGet, cacheSet } from '../cache/redis.js';
import { logger } from '../utils/logger.js';

export interface TLE {
  name: string;
  line1: string;
  line2: string;
}

const CELESTRAK_BASE = 'https://celestrak.org/NORAD/elements/gp.php';

export const parseTLEText = (text: string): TLE[] => {
  const lines = text.trim().split('\n').map(l => l.trim());
  const tles: TLE[] = [];
  for (let i = 0; i < lines.length; i += 3) {
    if (lines[i] && lines[i+1] && lines[i+2]) {
      tles.push({
        name: lines[i],
        line1: lines[i+1],
        line2: lines[i+2]
      });
    }
  }
  return tles;
};

export const fetchTLEsByGroup = async (group: string): Promise<TLE[]> => {
  const cacheKey = `tle:group:${group}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    logger.info(`Fetching CelesTrak group: ${group}`);
    const response = await axios.get(`${CELESTRAK_BASE}?GROUP=${group}&FORMAT=tle`);
    const tles = parseTLEText(response.data);
    await cacheSet(cacheKey, JSON.stringify(tles), 7200); // 2 hours
    return tles;
  } catch (error) {
    logger.error(`Failed to fetch CelesTrak group ${group}:`, error);
    throw error;
  }
};

export const fetchAllActive = async (): Promise<TLE[]> => {
  return fetchTLEsByGroup('active');
};

export const fetchByNoradId = async (id: number): Promise<TLE | null> => {
  const cacheKey = `tle:norad:${id}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response = await axios.get(`${CELESTRAK_BASE}?CATNR=${id}&FORMAT=tle`);
    const tles = parseTLEText(response.data);
    if (tles.length > 0) {
      await cacheSet(cacheKey, JSON.stringify(tles[0]), 7200);
      return tles[0];
    }
    return null;
  } catch (error) {
    logger.error(`Failed to fetch CelesTrak NORAD ${id}:`, error);
    return null;
  }
};
