import axios from 'axios';
import { cacheGet, cacheSet } from '../../cache/redis.js';
import { logger } from '../../utils/logger.js';
import type { ExoplanetRecord } from '@cosmos/types';

const EXOPLANET_TAP_URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';
const PC_TO_LY = 3.26156;

/**
 * Computes the Earth Similarity Index (ESI) from radius (R_earth) and equilibrium temp (K)
 */
function calculateEsi(rade: number | null, eqTempK: number | null): number {
  const r = rade && rade > 0 ? rade : 1.15;
  const t = eqTempK && eqTempK > 0 ? eqTempK : 265;
  const rTerm = Math.pow(1 - Math.abs((r - 1.0) / (r + 1.0)), 0.57);
  const tTerm = Math.pow(1 - Math.abs((t - 288) / (t + 288)), 5.58);
  return Number(Math.max(0.1, Math.min(0.99, Math.sqrt(rTerm * tTerm))).toFixed(2));
}

/**
 * Queries the NASA Exoplanet Archive TAP service for confirmed worlds & habitable zone candidates
 */
export async function fetchExoplanets(): Promise<ExoplanetRecord[]> {
  const cacheKey = 'deepspace:exoplanets';
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const adql =
      'select top 35 pl_name,hostname,disc_year,discoverymethod,pl_orbper,pl_rade,pl_bmasse,pl_eqt,sy_dist,st_teff,st_rad from pscomppars where pl_eqt between 175 and 335 and pl_rade < 2.5 order by sy_dist asc';
    const response = await axios.get(EXOPLANET_TAP_URL, {
      params: {
        query: adql,
        format: 'json',
      },
      timeout: 12000,
    });

    const rows: any[] = Array.isArray(response.data) ? response.data : [];
    if (rows.length > 0) {
      const records: ExoplanetRecord[] = rows.map((row) => {
        const rade = row.pl_rade ? Number(Number(row.pl_rade).toFixed(2)) : null;
        const eqTemp = row.pl_eqt ? Math.round(Number(row.pl_eqt)) : null;
        const distPc = row.sy_dist ? Number(Number(row.sy_dist).toFixed(2)) : null;
        const isHz =
          (eqTemp !== null && eqTemp >= 185 && eqTemp <= 310) &&
          (rade === null || (rade >= 0.5 && rade <= 2.1));

        return {
          plName: String(row.pl_name),
          hostname: String(row.hostname),
          discYear: Number(row.disc_year) || 2020,
          discoveryMethod: String(row.discoverymethod || 'Transit'),
          orbPerDays: row.pl_orbper ? Number(Number(row.pl_orbper).toFixed(2)) : null,
          radeEarth: rade,
          bmasseEarth: row.pl_bmasse ? Number(Number(row.pl_bmasse).toFixed(2)) : null,
          eqTempK: eqTemp,
          syDistPc: distPc,
          distanceLightYears: distPc ? Number((distPc * PC_TO_LY).toFixed(1)) : null,
          stTeffK: row.st_teff ? Math.round(Number(row.st_teff)) : null,
          stRadSolar: row.st_rad ? Number(Number(row.st_rad).toFixed(2)) : null,
          isHabitableZone: isHz,
          esiScore: calculateEsi(rade, eqTemp),
        };
      });

      await cacheSet(cacheKey, JSON.stringify(records), 86400); // 24h TTL
      return records;
    }
  } catch (error) {
    logger.warn('Failed to query live NASA Exoplanet Archive TAP, returning reference Habitable Zone catalog:', error);
  }

  return [
    {
      plName: 'Proxima Cen b',
      hostname: 'Proxima Centauri',
      discYear: 2016,
      discoveryMethod: 'Radial Velocity',
      orbPerDays: 11.186,
      radeEarth: 1.03,
      bmasseEarth: 1.07,
      eqTempK: 234,
      syDistPc: 1.3,
      distanceLightYears: 4.2,
      stTeffK: 3050,
      stRadSolar: 0.14,
      isHabitableZone: true,
      esiScore: 0.87,
    },
    {
      plName: 'TRAPPIST-1 e',
      hostname: 'TRAPPIST-1',
      discYear: 2017,
      discoveryMethod: 'Transit',
      orbPerDays: 6.1,
      radeEarth: 0.92,
      bmasseEarth: 0.69,
      eqTempK: 251,
      syDistPc: 12.43,
      distanceLightYears: 40.5,
      stTeffK: 2566,
      stRadSolar: 0.12,
      isHabitableZone: true,
      esiScore: 0.85,
    },
    {
      plName: 'TRAPPIST-1 d',
      hostname: 'TRAPPIST-1',
      discYear: 2016,
      discoveryMethod: 'Transit',
      orbPerDays: 4.05,
      radeEarth: 0.79,
      bmasseEarth: 0.39,
      eqTempK: 288,
      syDistPc: 12.43,
      distanceLightYears: 40.5,
      stTeffK: 2566,
      stRadSolar: 0.12,
      isHabitableZone: true,
      esiScore: 0.91,
    },
    {
      plName: 'TOI-700 d',
      hostname: 'TOI-700',
      discYear: 2020,
      discoveryMethod: 'Transit',
      orbPerDays: 37.42,
      radeEarth: 1.07,
      bmasseEarth: 1.25,
      eqTempK: 269,
      syDistPc: 31.13,
      distanceLightYears: 101.5,
      stTeffK: 3480,
      stRadSolar: 0.42,
      isHabitableZone: true,
      esiScore: 0.93,
    },
    {
      plName: 'K2-18 b',
      hostname: 'K2-18',
      discYear: 2015,
      discoveryMethod: 'Transit',
      orbPerDays: 32.94,
      radeEarth: 2.61,
      bmasseEarth: 8.63,
      eqTempK: 284,
      syDistPc: 38.07,
      distanceLightYears: 124.2,
      stTeffK: 3457,
      stRadSolar: 0.41,
      isHabitableZone: true,
      esiScore: 0.73,
    },
    {
      plName: 'Kepler-186 f',
      hostname: 'Kepler-186',
      discYear: 2014,
      discoveryMethod: 'Transit',
      orbPerDays: 129.94,
      radeEarth: 1.17,
      bmasseEarth: 1.71,
      eqTempK: 188,
      syDistPc: 177.5,
      distanceLightYears: 578.9,
      stTeffK: 3755,
      stRadSolar: 0.52,
      isHabitableZone: true,
      esiScore: 0.61,
    },
    {
      plName: 'LHS 1140 b',
      hostname: 'LHS 1140',
      discYear: 2017,
      discoveryMethod: 'Transit',
      orbPerDays: 24.74,
      radeEarth: 1.73,
      bmasseEarth: 5.6,
      eqTempK: 226,
      syDistPc: 14.99,
      distanceLightYears: 48.9,
      stTeffK: 3096,
      stRadSolar: 0.21,
      isHabitableZone: true,
      esiScore: 0.78,
    },
  ];
}
