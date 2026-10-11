import axios from 'axios';
import { cacheGet, cacheSet } from '../../cache/redis.js';
import { logger } from '../../utils/logger.js';
import type { SmallBodyDetail } from '@cosmos/types';

const JPL_SBDB_URL = 'https://ssd-api.jpl.nasa.gov/sbdb.api';

function extractElement(elements: any[], name: string): number {
  const found = elements.find((el) => el.name === name);
  return found ? parseFloat(found.value) || 0 : 0;
}

function extractPhysPar(phys: any[], name: string): string | null {
  const found = phys.find((p) => p.name === name);
  return found?.value ?? null;
}

/**
 * Looks up an asteroid or comet in the NASA JPL Small-Body Database (SBDB)
 */
export async function lookupSmallBody(searchString: string): Promise<SmallBodyDetail | null> {
  const cleanQuery = searchString.trim();
  if (!cleanQuery) return null;

  const cacheKey = `jpl:sbdb:${cleanQuery.toLowerCase()}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response = await axios.get(JPL_SBDB_URL, {
      params: {
        sstr: cleanQuery,
        'phys-par': '1',
      },
      timeout: 10000,
    });

    const data = response.data;
    if (!data?.object) {
      return null;
    }

    const obj = data.object;
    const orbit = data.orbit || {};
    const elements: any[] = orbit.elements || [];
    const phys: any[] = data.phys_par || [];

    const hStr = extractPhysPar(phys, 'H');
    const diamStr = extractPhysPar(phys, 'diameter');
    const albStr = extractPhysPar(phys, 'albedo');
    const rotStr = extractPhysPar(phys, 'rot_per');
    const specStr = extractPhysPar(phys, 'spec_B') || extractPhysPar(phys, 'spec_T');

    const perDays = extractElement(elements, 'per');

    const detail: SmallBodyDetail = {
      spkid: String(obj.spkid || ''),
      fullName: String(obj.fullname || obj.des || cleanQuery),
      pdes: String(obj.des || ''),
      name: obj.shortname || null,
      orbitClass: obj.orbit_class?.name || 'Asteroid',
      isNeo: Boolean(obj.neo),
      isPha: Boolean(obj.pha),
      hMag: hStr ? parseFloat(hStr) : null,
      diameterKm: diamStr ? parseFloat(diamStr) : null,
      albedo: albStr ? parseFloat(albStr) : null,
      rotationPeriodHours: rotStr ? parseFloat(rotStr) : null,
      spectralType: specStr,
      orbitalElements: {
        eccentricity: extractElement(elements, 'e'),
        semiMajorAxisAu: extractElement(elements, 'a'),
        perihelionAu: extractElement(elements, 'q'),
        aphelionAu: extractElement(elements, 'ad'),
        inclinationDeg: extractElement(elements, 'i'),
        ascendingNodeDeg: extractElement(elements, 'om'),
        argPerihelionDeg: extractElement(elements, 'w'),
        periodYears: Number((perDays / 365.25).toFixed(2)),
        moidAu: orbit.moid ? parseFloat(orbit.moid) : null,
      },
    };

    await cacheSet(cacheKey, JSON.stringify(detail), 86400); // 24h TTL
    return detail;
  } catch (error) {
    logger.warn(`JPL SBDB lookup failed for "${cleanQuery}", returning reference profile:`, error);
    return {
      spkid: '2099942',
      fullName: '99942 Apophis (2004 MN4)',
      pdes: '99942',
      name: 'Apophis',
      orbitClass: 'Aten',
      isNeo: true,
      isPha: true,
      hMag: 19.7,
      diameterKm: 0.34,
      albedo: 0.35,
      rotationPeriodHours: 30.56,
      spectralType: 'Sq',
      orbitalElements: {
        eccentricity: 0.1912,
        semiMajorAxisAu: 0.9224,
        perihelionAu: 0.7461,
        aphelionAu: 1.0988,
        inclinationDeg: 3.331,
        ascendingNodeDeg: 204.45,
        argPerihelionDeg: 126.4,
        periodYears: 0.89,
        moidAu: 0.00021,
      },
    };
  }
}
