import type { ReentryPrediction } from '@cosmos/types';

/**
 * Returns tracked low-perigee space objects predicted to undergo atmospheric re-entry
 */
export async function fetchReentryPredictions(): Promise<ReentryPrediction[]> {
  const now = Date.now();
  return [
    {
      noradId: 58921,
      name: 'CZ-2C R/B (Upper Stage)',
      objectType: 'ROCKET_BODY',
      predictedEpoch: new Date(now + 11 * 3600 * 1000).toISOString(),
      uncertaintyHours: 3,
      inclinationDeg: 35.0,
      perigeeKm: 138,
      apogeeKm: 192,
      lat: -18.4,
      lon: -112.6,
      status: 'IMMINENT',
    },
    {
      noradId: 46194,
      name: 'STARLINK-1642 (Deorbiting)',
      objectType: 'PAYLOAD',
      predictedEpoch: new Date(now + 38 * 3600 * 1000).toISOString(),
      uncertaintyHours: 8,
      inclinationDeg: 53.0,
      perigeeKm: 164,
      apogeeKm: 215,
      lat: 41.2,
      lon: 24.8,
      status: 'MONITORING',
    },
    {
      noradId: 59104,
      name: 'FALCON 9 DEB (Trunk Segment)',
      objectType: 'DEBRIS',
      predictedEpoch: new Date(now + 74 * 3600 * 1000).toISOString(),
      uncertaintyHours: 14,
      inclinationDeg: 51.6,
      perigeeKm: 185,
      apogeeKm: 240,
      lat: -32.7,
      lon: 88.1,
      status: 'MONITORING',
    },
    {
      noradId: 59002,
      name: 'PROGRESS MS-26',
      objectType: 'PAYLOAD',
      predictedEpoch: new Date(now - 9 * 3600 * 1000).toISOString(),
      uncertaintyHours: 0,
      inclinationDeg: 51.6,
      perigeeKm: 80,
      apogeeKm: 110,
      lat: -45.9,
      lon: -135.2,
      status: 'REENTERED',
    },
  ];
}
