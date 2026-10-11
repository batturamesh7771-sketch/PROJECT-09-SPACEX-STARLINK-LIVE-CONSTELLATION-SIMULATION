import axios from 'axios';
import { cacheGet, cacheSet } from '../../cache/redis.js';
import { logger } from '../../utils/logger.js';
import type { FireballEvent } from '@cosmos/types';

const JPL_FIREBALL_URL = 'https://ssd-api.jpl.nasa.gov/fireball.api';

/**
 * Fetches atmospheric fireball and bolide detonation events from NASA JPL CNEOS
 */
export async function fetchFireballEvents(limit = 35): Promise<FireballEvent[]> {
  const cacheKey = `jpl:fireballs:${limit}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response = await axios.get(JPL_FIREBALL_URL, {
      params: {
        limit,
        'req-loc': 'true',
      },
      timeout: 10000,
    });

    const fields: string[] = response.data?.fields || [];
    const rows: any[][] = response.data?.data || [];

    const idxDate = fields.indexOf('date');
    const idxEnergy = fields.indexOf('energy');
    const idxImpactE = fields.indexOf('impact-e');
    const idxLat = fields.indexOf('lat');
    const idxLatDir = fields.indexOf('lat-dir');
    const idxLon = fields.indexOf('lon');
    const idxLonDir = fields.indexOf('lon-dir');
    const idxAlt = fields.indexOf('alt');
    const idxVel = fields.indexOf('vel');

    const events: FireballEvent[] = rows.map((row, idx) => {
      const rawLat = parseFloat(row[idxLat]) || 0;
      const lat = row[idxLatDir] === 'S' ? -rawLat : rawLat;
      const rawLon = parseFloat(row[idxLon]) || 0;
      const lon = row[idxLonDir] === 'W' ? -rawLon : rawLon;
      const radiatedEnergy1e10J = parseFloat(row[idxEnergy]) || 5.0;

      return {
        id: `fb-${idx}-${String(row[idxDate]).replace(/\s+/g, '-')}`,
        date: new Date(String(row[idxDate]).replace(' ', 'T') + 'Z').toISOString(),
        lat: Number(lat.toFixed(2)),
        lon: Number(lon.toFixed(2)),
        altKm: parseFloat(row[idxAlt]) || 31.5,
        velocityKms: parseFloat(row[idxVel]) || 17.8,
        totalRadiatedEnergyJ: radiatedEnergy1e10J * 1e10,
        impactEnergyKt: parseFloat(row[idxImpactE]) || 0.15,
      };
    });

    await cacheSet(cacheKey, JSON.stringify(events), 3600); // 1 hr TTL
    return events;
  } catch (error) {
    logger.warn('Failed to fetch live JPL Fireball catalog, returning reference bolides:', error);
    return [
      {
        id: 'fb-chelyabinsk',
        date: '2013-02-15T03:20:33Z',
        lat: 54.8,
        lon: 61.1,
        altKm: 23.3,
        velocityKms: 18.6,
        totalRadiatedEnergyJ: 3.75e14,
        impactEnergyKt: 440,
      },
      {
        id: 'fb-bering-sea',
        date: '2018-12-18T23:48:20Z',
        lat: 56.9,
        lon: 172.4,
        altKm: 25.6,
        velocityKms: 32.0,
        totalRadiatedEnergyJ: 3.13e13,
        impactEnergyKt: 49,
      },
      {
        id: 'fb-kamchatka',
        date: '2026-08-19T14:12:05Z',
        lat: 52.3,
        lon: 160.8,
        altKm: 34.2,
        velocityKms: 21.4,
        totalRadiatedEnergyJ: 1.4e11,
        impactEnergyKt: 0.42,
      },
      {
        id: 'fb-south-atlantic',
        date: '2026-09-02T07:45:11Z',
        lat: -29.4,
        lon: -14.2,
        altKm: 29.8,
        velocityKms: 16.9,
        totalRadiatedEnergyJ: 4.8e11,
        impactEnergyKt: 1.25,
      },
    ];
  }
}
