import axios from 'axios';
import { cacheGet, cacheSet } from '../../cache/redis.js';
import { keyManager } from '../../utils/keyManager.js';
import { logger } from '../../utils/logger.js';
import type {
  DiscosObjectCharacteristic,
  FragmentationEventSummary,
} from '@cosmos/types';

const DISCOS_BASE = 'https://discosweb.esoc.esa.int/api';

/**
 * Fetches physical object characteristics from ESA DISCOSweb API
 */
export async function fetchDiscosObjects(limit = 15): Promise<DiscosObjectCharacteristic[]> {
  const cacheKey = `debris:discos_objects:${limit}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const token = keyManager.getKey('esa_discos');
  if (token && (await keyManager.canMakeRequest('esa_discos'))) {
    try {
      const response = await axios.get(`${DISCOS_BASE}/objects`, {
        params: { 'page[size]': limit, sort: '-reentry.epoch' },
        headers: {
          Authorization: `Bearer ${token}`,
          'DiscosWeb-Api-Version': '2',
        },
        timeout: 10000,
      });
      await keyManager.trackUsage('esa_discos');

      const data: any[] = response.data?.data || [];
      if (data.length > 0) {
        const objects: DiscosObjectCharacteristic[] = data.map((item) => {
          const attr = item.attributes || {};
          return {
            noradId: attr.satno || 0,
            name: attr.name || 'Space Object',
            objectClass: attr.objectClass || 'Rocket Body',
            massKg: attr.mass ?? null,
            crossSectionSqm: attr.xSectAvg ?? null,
            shape: attr.shape ?? null,
            widthMeters: attr.width ?? null,
            heightMeters: attr.height ?? null,
            depthMeters: attr.depth ?? null,
            fragmentationOrigin: null,
          };
        });
        await cacheSet(cacheKey, JSON.stringify(objects), 3600);
        return objects;
      }
    } catch (error) {
      logger.warn('ESA DISCOSweb API request failed, returning reference DISCOS catalog:', error);
    }
  }

  return [
    {
      noradId: 27386,
      name: 'ENVISAT (Defunct Earth Observation)',
      objectClass: 'Payload',
      massKg: 8211,
      crossSectionSqm: 78.4,
      shape: 'Box + Solar Array',
      widthMeters: 26.0,
      heightMeters: 10.0,
      depthMeters: 5.0,
    },
    {
      noradId: 22285,
      name: 'ZENIT-2 R/B (SL-16 Upper Stage)',
      objectClass: 'Rocket Body',
      massKg: 8900,
      crossSectionSqm: 28.5,
      shape: 'Cylinder',
      widthMeters: 3.9,
      heightMeters: 10.4,
      depthMeters: 3.9,
    },
    {
      noradId: 25730,
      name: 'FENGYUN 1C',
      objectClass: 'Fragmented Payload',
      massKg: 958,
      crossSectionSqm: 8.2,
      shape: 'Hexagonal Prism + Panels',
      widthMeters: 1.4,
      heightMeters: 1.8,
      depthMeters: 1.4,
      fragmentationOrigin: '2007 Direct-Ascent ASAT Test',
    },
    {
      noradId: 13552,
      name: 'COSMOS 1408',
      objectClass: 'Fragmented Payload',
      massKg: 1750,
      crossSectionSqm: 14.1,
      shape: 'Cylinder + Paddles',
      widthMeters: 2.1,
      heightMeters: 5.2,
      depthMeters: 2.1,
      fragmentationOrigin: '2021 Kinetic ASAT Test',
    },
  ];
}

/**
 * Returns major historical orbital fragmentation events contributing to LEO debris clouds
 */
export async function fetchMajorFragmentationEvents(): Promise<FragmentationEventSummary[]> {
  return [
    {
      id: 'FRAG-FY1C-2007',
      parentName: 'FENGYUN 1C',
      parentNoradId: 25730,
      eventDate: '2007-01-11',
      cause: 'ASAT_TEST',
      altitudeKm: 865,
      catalogedDebrisTotal: 3549,
      remainingInOrbit: 2680,
    },
    {
      id: 'FRAG-COS2251-2009',
      parentName: 'COSMOS 2251 / IRIDIUM 33',
      parentNoradId: 22675,
      eventDate: '2009-02-10',
      cause: 'COLLISION',
      altitudeKm: 789,
      catalogedDebrisTotal: 2370,
      remainingInOrbit: 1490,
    },
    {
      id: 'FRAG-COS1408-2021',
      parentName: 'COSMOS 1408',
      parentNoradId: 13552,
      eventDate: '2021-11-15',
      cause: 'ASAT_TEST',
      altitudeKm: 485,
      catalogedDebrisTotal: 1789,
      remainingInOrbit: 340,
    },
    {
      id: 'FRAG-CZ6A-2024',
      parentName: 'CZ-6A R/B (Qianfan Upper Stage)',
      parentNoradId: 60703,
      eventDate: '2024-08-06',
      cause: 'PROPULSION',
      altitudeKm: 810,
      catalogedDebrisTotal: 950,
      remainingInOrbit: 925,
    },
  ];
}
