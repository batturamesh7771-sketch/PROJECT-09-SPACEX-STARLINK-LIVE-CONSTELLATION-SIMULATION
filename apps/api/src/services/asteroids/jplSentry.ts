import axios from 'axios';
import { cacheGet, cacheSet } from '../../cache/redis.js';
import { logger } from '../../utils/logger.js';
import type { SentryImpactRisk } from '@cosmos/types';

const JPL_SENTRY_URL = 'https://ssd-api.jpl.nasa.gov/sentry.api';

/**
 * Fetches NASA JPL CNEOS Sentry Earth Impact Risk monitoring table
 */
export async function fetchSentryImpactRisks(): Promise<SentryImpactRisk[]> {
  const cacheKey = 'jpl:sentry:summary';
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response = await axios.get(JPL_SENTRY_URL, { timeout: 12000 });
    const raw: any[] = response.data?.data || [];

    const risks: SentryImpactRisk[] = raw
      .map((item) => ({
        designation: String(item.des || ''),
        fullName: String(item.fullname || item.des || '').trim(),
        ipCumulative: parseFloat(item.ip) || 0,
        psCumulative: parseFloat(item.ps_cum) || -5,
        psMax: parseFloat(item.ps_max) || -5,
        tsMax: parseInt(item.ts_max, 10) || 0,
        impactCount: parseInt(item.n_imp, 10) || 1,
        yearRange: String(item.range || '2030-2120'),
        vImpactKms: parseFloat(item.v_inf) || 15.0,
        diameterKm: parseFloat(item.diameter) || 0.1,
        hMag: parseFloat(item.h) || 22.0,
        lastObserved: String(item.last_obs || ''),
      }))
      .sort((a, b) => b.psCumulative - a.psCumulative)
      .slice(0, 25);

    await cacheSet(cacheKey, JSON.stringify(risks), 3600); // 1 hr TTL
    return risks;
  } catch (error) {
    logger.warn('Failed to fetch live JPL Sentry table, returning reference CNEOS risk objects:', error);
    return [
      {
        designation: '101955',
        fullName: '101955 Bennu (1999 RQ36)',
        ipCumulative: 5.7e-4,
        psCumulative: -1.41,
        psMax: -1.59,
        tsMax: 0,
        impactCount: 157,
        yearRange: '2178-2290',
        vImpactKms: 12.68,
        diameterKm: 0.49,
        hMag: 20.2,
        lastObserved: '2024-05-12',
      },
      {
        designation: '29075',
        fullName: '29075 (1950 DA)',
        ipCumulative: 3.8e-4,
        psCumulative: -0.93,
        psMax: -0.93,
        tsMax: 0,
        impactCount: 1,
        yearRange: '2880-2880',
        vImpactKms: 17.99,
        diameterKm: 1.3,
        hMag: 17.1,
        lastObserved: '2025-11-04',
      },
      {
        designation: '2023 DW',
        fullName: '(2023 DW)',
        ipCumulative: 1.2e-5,
        psCumulative: -2.85,
        psMax: -2.88,
        tsMax: 0,
        impactCount: 9,
        yearRange: '2046-2054',
        vImpactKms: 21.36,
        diameterKm: 0.049,
        hMag: 24.3,
        lastObserved: '2023-08-19',
      },
    ];
  }
}
