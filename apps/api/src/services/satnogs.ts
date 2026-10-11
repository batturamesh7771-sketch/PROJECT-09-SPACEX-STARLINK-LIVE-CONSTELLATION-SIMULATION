import axios from 'axios';
import { logger } from '../utils/logger.js';
import { cacheGet, cacheSet } from '../cache/redis.js';

const BASE_URL = 'https://db.satnogs.org/api/';

export const fetchTransmitters = async (noradId?: number): Promise<any[]> => {
  const cacheKey = `satnogs:transmitters:${noradId || 'all'}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const url = noradId ? `${BASE_URL}transmitters/?norad_cat_id=${noradId}&format=json` : `${BASE_URL}transmitters/?format=json`;
    const res = await axios.get(url);
    await cacheSet(cacheKey, JSON.stringify(res.data), 86400); // 24 hours
    return res.data;
  } catch (error) {
    logger.error('Failed to fetch SatNOGS transmitters', error);
    return [];
  }
};

export const fetchSatellites = async (): Promise<any[]> => {
  const cacheKey = `satnogs:satellites`;
  const cached = await cacheGet(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const res = await axios.get(`${BASE_URL}satellites/?format=json`);
    await cacheSet(cacheKey, JSON.stringify(res.data), 86400);
    return res.data;
  } catch (error) {
    logger.error('Failed to fetch SatNOGS satellites', error);
    return [];
  }
};
