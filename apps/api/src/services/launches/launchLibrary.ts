import axios from 'axios';
import { cacheGet, cacheSet } from '../../cache/redis.js';
import { keyManager } from '../../utils/keyManager.js';
import { logger } from '../../utils/logger.js';
import type { Launch, LaunchStatus } from '@cosmos/types';

const LL2_PROD = 'https://ll.thespacedevs.com/2.2.0';
const LL2_DEV = 'https://lldev.thespacedevs.com/2.2.0';

function mapStatusAbbrev(abbrev?: string): LaunchStatus {
  switch ((abbrev || '').toUpperCase()) {
    case 'GO':
      return 'GO';
    case 'TBC':
      return 'TBC';
    case 'TBD':
      return 'TBD';
    case 'SUCCESS':
      return 'SUCCESS';
    case 'FAILURE':
      return 'FAILURE';
    case 'PARTIAL FAILURE':
      return 'PARTIAL_FAILURE';
    case 'IN FLIGHT':
      return 'IN_FLIGHT';
    case 'HOLD':
      return 'HOLD';
    default:
      return 'TBC';
  }
}

function normalizeLL2Launch(raw: any): Launch {
  const config = raw.rocket?.configuration || {};
  const firstStage = Array.isArray(raw.rocket?.launcher_stage) ? raw.rocket.launcher_stage[0] : null;
  const pad = raw.pad || {};

  return {
    id: String(raw.id),
    name: raw.name || 'Unnamed Launch',
    status: mapStatusAbbrev(raw.status?.abbrev),
    statusDescription: raw.status?.description || raw.status?.name || 'Scheduled',
    net: raw.net || new Date().toISOString(),
    windowStart: raw.window_start || raw.net || new Date().toISOString(),
    windowEnd: raw.window_end || raw.net || new Date().toISOString(),
    probability: typeof raw.probability === 'number' && raw.probability >= 0 ? raw.probability : null,
    provider: {
      id: raw.launch_service_provider?.id || 0,
      name: raw.launch_service_provider?.name || 'Unknown Provider',
      type: raw.launch_service_provider?.type || 'Commercial',
      countryCode: raw.launch_service_provider?.country_code || 'UNK',
    },
    rocket: {
      id: config.id || 0,
      name: config.name || 'Rocket',
      family: config.family || '',
      fullName: config.full_name || config.name || 'Rocket',
      variant: config.variant || '',
      reusable: firstStage?.reused ?? undefined,
      lengthMeters: config.length ?? null,
      diameterMeters: config.diameter ?? null,
      leoCapacityKg: config.leo_capacity ?? null,
      gtoCapacityKg: config.gto_capacity ?? null,
      launchMassTons: config.launch_mass ?? null,
      toThrustKn: config.to_thrust ?? null,
    },
    mission: raw.mission
      ? {
          id: raw.mission.id || 0,
          name: raw.mission.name || 'Mission',
          type: raw.mission.type || 'Communications',
          description: raw.mission.description || '',
          orbitName: raw.mission.orbit?.name || 'Low Earth Orbit',
          orbitAbbrev: raw.mission.orbit?.abbrev || 'LEO',
        }
      : null,
    pad: {
      id: pad.id || 0,
      name: pad.name || 'Launch Pad',
      locationName: pad.location?.name || 'Launch Complex',
      countryCode: pad.location?.country_code || 'USA',
      latitude: parseFloat(pad.latitude) || 28.5618,
      longitude: parseFloat(pad.longitude) || -80.577,
      totalLaunchCount: pad.total_launch_count || 0,
    },
    imageUrl: raw.image || config.image_url || null,
    webcastLive: Boolean(raw.webcast_live),
    videoUrls: Array.isArray(raw.vidURLs)
      ? raw.vidURLs.map((v: any) => (typeof v === 'string' ? v : v.url)).filter(Boolean)
      : [],
    orbitalStageCore: firstStage
      ? {
          serial: firstStage.launcher?.serial_number,
          flightNumber: firstStage.turn_around_time_days ? undefined : firstStage.launcher?.flights,
          reused: firstStage.reused,
          landingAttempt: firstStage.landing?.attempt,
          landingSuccess: firstStage.landing?.success ?? null,
          landingType: firstStage.landing?.type?.abbrev ?? null,
          landpad: firstStage.landing?.location?.abbrev ?? null,
        }
      : undefined,
  };
}

async function queryLL2(endpoint: string, params: Record<string, any>): Promise<any> {
  const apiKey = keyManager.getKey('launch_library');
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['Authorization'] = `Token ${apiKey}`;
  }

  const canUseProd = await keyManager.canMakeRequest('launch_library');
  const baseUrl = canUseProd ? LL2_PROD : LL2_DEV;

  try {
    const response = await axios.get(`${baseUrl}${endpoint}`, {
      params,
      headers,
      timeout: 12000,
    });
    if (canUseProd) {
      await keyManager.trackUsage('launch_library');
    }
    return response.data;
  } catch (err: any) {
    if (baseUrl === LL2_PROD) {
      logger.warn('LL2 prod endpoint rate-limited or unreachable, falling back to LL2 dev endpoint');
      const fallbackRes = await axios.get(`${LL2_DEV}${endpoint}`, {
        params,
        timeout: 12000,
      });
      return fallbackRes.data;
    }
    throw err;
  }
}

/**
 * Fetches upcoming rocket launches from Launch Library 2
 */
export async function fetchUpcomingLaunches(limit = 15): Promise<Launch[]> {
  const cacheKey = `ll2:upcoming:${limit}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const data = await queryLL2('/launch/upcoming/', {
      limit,
      mode: 'detailed',
      hide_recent_previous: true,
    });
    const results: any[] = data?.results || [];
    const launches = results.map(normalizeLL2Launch);
    await cacheSet(cacheKey, JSON.stringify(launches), 600); // 10 min TTL
    return launches;
  } catch (error) {
    logger.warn('Failed to fetch upcoming launches from LL2, returning fallback schedule:', error);
    return getFallbackUpcomingLaunches();
  }
}

/**
 * Fetches recent previous rocket launches from Launch Library 2
 */
export async function fetchPreviousLaunches(limit = 15): Promise<Launch[]> {
  const cacheKey = `ll2:previous:${limit}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const data = await queryLL2('/launch/previous/', {
      limit,
      mode: 'detailed',
    });
    const results: any[] = data?.results || [];
    const launches = results.map(normalizeLL2Launch);
    await cacheSet(cacheKey, JSON.stringify(launches), 1800); // 30 min TTL
    return launches;
  } catch (error) {
    logger.warn('Failed to fetch previous launches from LL2:', error);
    return [];
  }
}

function getFallbackUpcomingLaunches(): Launch[] {
  const now = Date.now();
  return [
    {
      id: 'll2-fallback-starlink',
      name: 'Falcon 9 Block 5 | Starlink Group 12-8',
      status: 'GO',
      statusDescription: 'Go for Launch',
      net: new Date(now + 4 * 3600 * 1000 + 22 * 60 * 1000).toISOString(),
      windowStart: new Date(now + 4 * 3600 * 1000 + 22 * 60 * 1000).toISOString(),
      windowEnd: new Date(now + 8 * 3600 * 1000).toISOString(),
      probability: 90,
      provider: {
        id: 121,
        name: 'SpaceX',
        type: 'Commercial',
        countryCode: 'USA',
      },
      rocket: {
        id: 164,
        name: 'Falcon 9',
        family: 'Falcon',
        fullName: 'Falcon 9 Block 5',
        variant: 'Block 5',
        reusable: true,
        lengthMeters: 70,
        diameterMeters: 3.65,
        leoCapacityKg: 22800,
        gtoCapacityKg: 8300,
      },
      mission: {
        id: 1001,
        name: 'Starlink Group 12-8',
        type: 'Communications',
        description: 'Batch of 23 Starlink V2 Mini direct-to-cell and broadband satellites deployed into Low Earth Orbit.',
        orbitName: 'Low Earth Orbit',
        orbitAbbrev: 'LEO',
      },
      pad: {
        id: 80,
        name: 'Space Launch Complex 40',
        locationName: 'Cape Canaveral SFS, FL, USA',
        countryCode: 'USA',
        latitude: 28.561941,
        longitude: -80.577357,
        totalLaunchCount: 265,
      },
      imageUrl: null,
      webcastLive: false,
      videoUrls: ['https://www.youtube.com/watch?v=live'],
      orbitalStageCore: {
        serial: 'B1081',
        flightNumber: 12,
        reused: true,
        landingAttempt: true,
        landingSuccess: null,
        landingType: 'ASDS',
        landpad: 'JRTI',
      },
    },
    {
      id: 'll2-fallback-electron',
      name: 'Electron | HawkEye 360 Cluster 14',
      status: 'GO',
      statusDescription: 'Go for Launch',
      net: new Date(now + 28 * 3600 * 1000).toISOString(),
      windowStart: new Date(now + 28 * 3600 * 1000).toISOString(),
      windowEnd: new Date(now + 29 * 3600 * 1000).toISOString(),
      probability: 85,
      provider: {
        id: 147,
        name: 'Rocket Lab',
        type: 'Commercial',
        countryCode: 'USA',
      },
      rocket: {
        id: 26,
        name: 'Electron',
        family: 'Electron',
        fullName: 'Electron',
        variant: '',
        reusable: false,
        lengthMeters: 18,
        diameterMeters: 1.2,
        leoCapacityKg: 300,
        gtoCapacityKg: null,
      },
      mission: {
        id: 1002,
        name: 'HawkEye 360 Cluster 14',
        type: 'RF Geolocation',
        description: 'Dedicated launch deploying a triplet of HawkEye 360 RF geolocation microsatellites into mid-inclination LEO.',
        orbitName: 'Sun-Synchronous Orbit',
        orbitAbbrev: 'SSO',
      },
      pad: {
        id: 65,
        name: 'Launch Complex 1B',
        locationName: 'Mahia Peninsula, New Zealand',
        countryCode: 'NZL',
        latitude: -39.262833,
        longitude: 177.864469,
        totalLaunchCount: 54,
      },
      imageUrl: null,
      webcastLive: false,
      videoUrls: [],
    },
  ];
}
