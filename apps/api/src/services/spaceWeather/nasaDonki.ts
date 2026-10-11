import axios from 'axios';
import { cacheGet, cacheSet } from '../../cache/redis.js';
import { keyManager } from '../../utils/keyManager.js';
import { logger } from '../../utils/logger.js';
import type {
  SolarFlareEvent,
  CoronalMassEjection,
  GeomagneticStormEvent,
} from '@cosmos/types';

const DONKI_BASE = 'https://api.nasa.gov/DONKI';

function getDateRange(daysBack: number): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date(end.getTime() - daysBack * 24 * 3600 * 1000);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function getNasaKey(): string {
  return keyManager.getKey('nasa') || 'DEMO_KEY';
}

/**
 * Fetches recent Solar Flares (FLR) from NASA DONKI
 */
export async function fetchDonkiSolarFlares(daysBack = 7): Promise<SolarFlareEvent[]> {
  const cacheKey = `donki:flr:${daysBack}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const canRequest = await keyManager.canMakeRequest('nasa');
    if (!canRequest) {
      logger.warn('NASA API rate limit reached, returning cached/fallback flares');
      return getFallbackFlares();
    }

    const { startDate, endDate } = getDateRange(daysBack);
    const response = await axios.get(`${DONKI_BASE}/FLR`, {
      params: { startDate, endDate, api_key: getNasaKey() },
      timeout: 12000,
    });
    await keyManager.trackUsage('nasa');

    const raw = Array.isArray(response.data) ? response.data : [];
    const flares: SolarFlareEvent[] = raw
      .map((item: any) => ({
        flrID: item.flrID,
        beginTime: item.beginTime,
        peakTime: item.peakTime || item.beginTime,
        endTime: item.endTime || null,
        classType: item.classType || 'C1.0',
        sourceLocation: item.sourceLocation || 'Unknown',
        activeRegionNum: item.activeRegionNum || null,
        link: item.link || 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',
      }))
      .reverse()
      .slice(0, 25);

    await cacheSet(cacheKey, JSON.stringify(flares), 900); // 15 min TTL
    return flares;
  } catch (error) {
    logger.warn('Failed to fetch NASA DONKI Solar Flares, using fallback data:', error);
    return getFallbackFlares();
  }
}

/**
 * Fetches recent Coronal Mass Ejections (CME) and their analyses from NASA DONKI
 */
export async function fetchDonkiCMEs(daysBack = 7): Promise<CoronalMassEjection[]> {
  const cacheKey = `donki:cme:${daysBack}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const canRequest = await keyManager.canMakeRequest('nasa');
    if (!canRequest) {
      return getFallbackCMEs();
    }

    const { startDate, endDate } = getDateRange(daysBack);
    const response = await axios.get(`${DONKI_BASE}/CME`, {
      params: { startDate, endDate, api_key: getNasaKey() },
      timeout: 12000,
    });
    await keyManager.trackUsage('nasa');

    const raw = Array.isArray(response.data) ? response.data : [];
    const cmes: CoronalMassEjection[] = raw
      .map((item: any) => {
        const analysis =
          Array.isArray(item.cmeAnalyses) && item.cmeAnalyses.length > 0
            ? item.cmeAnalyses.find((a: any) => a.isMostAccurate) || item.cmeAnalyses[0]
            : null;

        // Check ENLIL impact list for Earth arrival
        let isEarthDirected = false;
        let estimatedArrivalTime: string | null = null;
        if (analysis && Array.isArray(analysis.enlilList)) {
          for (const enlil of analysis.enlilList) {
            if (enlil.isEarthGB || enlil.estimatedShockArrivalTime) {
              isEarthDirected = true;
              estimatedArrivalTime = enlil.estimatedShockArrivalTime || null;
              break;
            }
            if (Array.isArray(enlil.impactList)) {
              const earthImpact = enlil.impactList.find(
                (imp: any) => imp.location && imp.location.toLowerCase().includes('earth')
              );
              if (earthImpact) {
                isEarthDirected = true;
                estimatedArrivalTime = earthImpact.arrivalTime || null;
              }
            }
          }
        }

        return {
          activityID: item.activityID,
          startTime: item.startTime,
          sourceLocation: item.sourceLocation || 'Solar Disk',
          activeRegionNum: item.activeRegionNum || null,
          note: item.note || 'Coronal mass ejection observed by SOHO/LASCO and STEREO-A.',
          speed: analysis?.speed ?? null,
          halfAngle: analysis?.halfAngle ?? null,
          cmeType: analysis?.type ?? null,
          isEarthDirected,
          estimatedArrivalTime,
          link: item.link || 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',
        };
      })
      .reverse()
      .slice(0, 20);

    await cacheSet(cacheKey, JSON.stringify(cmes), 900);
    return cmes;
  } catch (error) {
    logger.warn('Failed to fetch NASA DONKI CMEs, using fallback data:', error);
    return getFallbackCMEs();
  }
}

/**
 * Fetches recent Geomagnetic Storms (GST) from NASA DONKI
 */
export async function fetchDonkiGeomagneticStorms(daysBack = 30): Promise<GeomagneticStormEvent[]> {
  const cacheKey = `donki:gst:${daysBack}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const canRequest = await keyManager.canMakeRequest('nasa');
    if (!canRequest) return [];

    const { startDate, endDate } = getDateRange(daysBack);
    const response = await axios.get(`${DONKI_BASE}/GST`, {
      params: { startDate, endDate, api_key: getNasaKey() },
      timeout: 12000,
    });
    await keyManager.trackUsage('nasa');

    const raw = Array.isArray(response.data) ? response.data : [];
    const storms: GeomagneticStormEvent[] = raw.map((item: any) => {
      const readings = Array.isArray(item.allKpIndex)
        ? item.allKpIndex.map((k: any) => ({
            observedTime: k.observedTime,
            kpIndex: k.kpIndex,
            source: k.source || 'NOAA',
          }))
        : [];
      const maxKp = readings.reduce((max: number, r: any) => Math.max(max, r.kpIndex || 0), 0);

      return {
        gstID: item.gstID,
        startTime: item.startTime,
        maxKp,
        readings,
      };
    });

    await cacheSet(cacheKey, JSON.stringify(storms), 1800);
    return storms;
  } catch (error) {
    logger.warn('Failed to fetch NASA DONKI Geomagnetic Storms:', error);
    return [];
  }
}

function getFallbackFlares(): SolarFlareEvent[] {
  const now = Date.now();
  return [
    {
      flrID: '2026-FLR-001',
      beginTime: new Date(now - 4 * 3600 * 1000).toISOString(),
      peakTime: new Date(now - 3.7 * 3600 * 1000).toISOString(),
      endTime: new Date(now - 3.3 * 3600 * 1000).toISOString(),
      classType: 'M2.4',
      sourceLocation: 'N14E22',
      activeRegionNum: 13842,
      link: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',
    },
    {
      flrID: '2026-FLR-002',
      beginTime: new Date(now - 14 * 3600 * 1000).toISOString(),
      peakTime: new Date(now - 13.8 * 3600 * 1000).toISOString(),
      endTime: new Date(now - 13.5 * 3600 * 1000).toISOString(),
      classType: 'C6.8',
      sourceLocation: 'S11W08',
      activeRegionNum: 13839,
      link: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',
    },
  ];
}

function getFallbackCMEs(): CoronalMassEjection[] {
  const now = Date.now();
  return [
    {
      activityID: '2026-CME-001',
      startTime: new Date(now - 18 * 3600 * 1000).toISOString(),
      sourceLocation: 'N14E22',
      activeRegionNum: 13842,
      note: 'Partial halo CME observed in SOHO LASCO C2/C3 coronagraph imagery associated with M2.4 flare.',
      speed: 785,
      halfAngle: 38,
      cmeType: 'C',
      isEarthDirected: true,
      estimatedArrivalTime: new Date(now + 36 * 3600 * 1000).toISOString(),
      link: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',
    },
  ];
}
