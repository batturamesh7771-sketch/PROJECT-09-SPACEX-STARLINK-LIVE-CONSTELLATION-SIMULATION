import axios from 'axios';
import { keyManager } from '../utils/keyManager.js';
import { logger } from '../utils/logger.js';

const BASE_URL = 'https://www.space-track.org';
let sessionCookie: string | null = null;

export const login = async (): Promise<string> => {
  const username = keyManager.getKey('spacetrack_user');
  const password = keyManager.getKey('spacetrack_pass');

  if (!username || !password) {
    throw new Error('Space-Track credentials not found');
  }

  try {
    const response = await axios.post(`${BASE_URL}/ajaxauth/login`, {
      identity: username,
      password: password
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const cookies = response.headers['set-cookie'];
    if (cookies && cookies.length > 0) {
      sessionCookie = cookies[0].split(';')[0];
      return sessionCookie;
    }
    throw new Error('No cookie received');
  } catch (error) {
    logger.error('Space-Track login failed', error);
    throw error;
  }
};

const ensureAuth = async () => {
  if (!sessionCookie) {
    await login();
  }
};

export const fetchGPData = async (options?: {constellation?: string, limit?: number}) => {
  await ensureAuth();
  if (!(await keyManager.canMakeRequest('spacetrack'))) {
    throw new Error('Space-Track rate limit exceeded');
  }

  // Implementation mock
  await keyManager.trackUsage('spacetrack');
  return [];
};

export const fetchSatCat = async (options?: {noradId?: number}) => {
  await ensureAuth();
  if (!(await keyManager.canMakeRequest('spacetrack'))) {
    throw new Error('Space-Track rate limit exceeded');
  }

  await keyManager.trackUsage('spacetrack');
  return [];
};

export const fetchDecayPredictions = async () => {
  await ensureAuth();
  if (!(await keyManager.canMakeRequest('spacetrack'))) {
    throw new Error('Space-Track rate limit exceeded');
  }

  await keyManager.trackUsage('spacetrack');
  return [];
};
