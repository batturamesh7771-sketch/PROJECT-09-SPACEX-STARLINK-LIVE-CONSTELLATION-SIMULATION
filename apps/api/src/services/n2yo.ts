import axios from 'axios';
import { keyManager } from '../utils/keyManager.js';
import { logger } from '../utils/logger.js';

const BASE_URL = 'https://api.n2yo.com/rest/v1/satellite/';

export interface ObserverLocation {
  lat: number;
  lon: number;
  alt: number;
}

export interface SatellitePosition {
  lat: number;
  lon: number;
  alt: number;
  timestamp: number;
}

export interface PassPrediction {
  startAz: number;
  maxEl: number;
  endAz: number;
  duration: number;
}

const getReq = async (url: string) => {
  const apiKey = keyManager.getKey('n2yo');
  if (!apiKey) throw new Error('N2YO API key missing');

  if (!(await keyManager.canMakeRequest('n2yo'))) {
    throw new Error('N2YO rate limit exceeded');
  }

  const res = await axios.get(`${url}&apiKey=${apiKey}`);
  await keyManager.trackUsage('n2yo');
  return res.data;
};

export const getPositions = async (noradId: number, seconds: number): Promise<SatellitePosition[]> => {
  const data = await getReq(`${BASE_URL}positions/${noradId}/41.702/-76.014/0/${seconds}`);
  return data.positions || [];
};

export const getVisualPasses = async (noradId: number, observer: ObserverLocation, days: number): Promise<PassPrediction[]> => {
  const data = await getReq(`${BASE_URL}visualpasses/${noradId}/${observer.lat}/${observer.lon}/${observer.alt}/${days}/10`);
  return data.passes || [];
};

export const getRadioPasses = async (noradId: number, observer: ObserverLocation, days: number): Promise<PassPrediction[]> => {
  const data = await getReq(`${BASE_URL}radiopasses/${noradId}/${observer.lat}/${observer.lon}/${observer.alt}/${days}/10`);
  return data.passes || [];
};

export const getAbove = async (observer: ObserverLocation, searchRadius: number, categoryId: number): Promise<any[]> => {
  const data = await getReq(`${BASE_URL}above/${observer.lat}/${observer.lon}/${observer.alt}/${searchRadius}/${categoryId}`);
  return data.above || [];
};
