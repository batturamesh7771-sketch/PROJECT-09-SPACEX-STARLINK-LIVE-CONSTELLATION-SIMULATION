import axios from 'axios';
import { cacheGet, cacheSet } from '../../cache/redis.js';
import { logger } from '../../utils/logger.js';
import { classifyKpStormLevel } from './noaaSwpc.js';
import type { KpIndexReading } from '@cosmos/types';

const GFZ_BASE = 'https://kp.gfz-potsdam.de/app/json/';

/**
 * Fetches definitive and nowcast geomagnetic Kp indices from GFZ Potsdam
 */
export async function fetchGfzHistoricalKp(daysBack = 7): Promise<KpIndexReading[]> {
  const cacheKey = `gfz:kp:${daysBack}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const end = new Date();
    const start = new Date(end.getTime() - daysBack * 24 * 3600 * 1000);
    const startStr = start.toISOString().slice(0, 19) + 'Z';
    const endStr = end.toISOString().slice(0, 19) + 'Z';

    const response = await axios.get(GFZ_BASE, {
      params: {
        start: startStr,
        end: endStr,
        index: 'Kp',
      },
      timeout: 10000,
    });

    const datetimes: string[] = response.data?.datetime || [];
    const kpValues: number[] = response.data?.Kp || [];

    const readings: KpIndexReading[] = datetimes.map((dt, idx) => {
      const kp = Number(kpValues[idx]) || 0;
      return {
        timestamp: dt,
        kp,
        aRunning: Math.round(kp * 4.5),
        stationCount: 13,
        stormLevel: classifyKpStormLevel(kp),
      };
    });

    await cacheSet(cacheKey, JSON.stringify(readings), 1800); // 30 min TTL
    return readings;
  } catch (error) {
    logger.warn('Failed to fetch GFZ Potsdam Kp index:', error);
    return [];
  }
}
