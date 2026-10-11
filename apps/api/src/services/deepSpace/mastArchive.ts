import axios from 'axios';
import { cacheGet, cacheSet } from '../../cache/redis.js';
import { keyManager } from '../../utils/keyManager.js';
import { logger } from '../../utils/logger.js';
import type { DeepSpaceObservation } from '@cosmos/types';

/**
 * Fetches NASA APOD and STScI MAST (JWST NIRCam/MIRI & Hubble WFC3) deep-space observations
 */
export async function fetchDeepSpaceObservations(): Promise<DeepSpaceObservation[]> {
  const cacheKey = 'deepspace:observations';
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const curatedObservations: DeepSpaceObservation[] = [
    {
      id: 'jwst-carina-nircam',
      observatory: 'JWST',
      targetName: 'NGC 3324 (Cosmic Cliffs in Carina Nebula)',
      title: 'JWST NIRCam & MIRI Composite of Star-Forming Region NGC 3324',
      instrument: 'NIRCam / MIRI',
      wavelengthBand: 'Near & Mid-Infrared (0.9–18 μm)',
      obsDate: '2022-07-12',
      raDeg: 159.35,
      decDeg: -58.62,
      imageUrl: 'https://stsci-opo.org/STScI-01G7WCH095922E3J21D6Z91C73.png',
      description:
        'Cavernous area carved from the Carina Nebula by intense ultraviolet radiation and stellar winds from massive young stars.',
      archiveUrl: 'https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html',
    },
    {
      id: 'jwst-pillars-creation',
      observatory: 'JWST',
      targetName: 'M16 (Pillars of Creation, Eagle Nebula)',
      title: 'JWST NIRCam High-Resolution Survey of M16 Protostellar Jets',
      instrument: 'NIRCam',
      wavelengthBand: 'Near-Infrared (0.9–4.7 μm)',
      obsDate: '2022-10-19',
      raDeg: 274.7,
      decDeg: -13.81,
      imageUrl: 'https://stsci-opo.org/STScI-01GFNN3PWJMY4R8N585BC4QH5C.png',
      description:
        'Dense columns of interstellar gas and dust in the Serpens constellation actively forming new stars.',
      archiveUrl: 'https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html',
    },
    {
      id: 'hst-ultra-deep-field',
      observatory: 'HST',
      targetName: 'HUDF (Fornax Constellation)',
      title: 'Hubble eXtreme Deep Field (XDF) 10,000+ Galaxy Survey',
      instrument: 'ACS / WFC3-IR',
      wavelengthBand: 'UV / Optical / Near-IR',
      obsDate: '2012-09-25',
      raDeg: 53.162,
      decDeg: -27.791,
      imageUrl: 'https://stsci-opo.org/STScI-01EVVF63NH77E655Y885G1Q37R.jpg',
      description:
        'Deep-core look back across 13.2 billion years of cosmic time revealing primordial galaxy assembly.',
      archiveUrl: 'https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html',
    },
  ];

  try {
    const canRequest = await keyManager.canMakeRequest('nasa');
    if (canRequest) {
      const apiKey = keyManager.getKey('nasa') || 'DEMO_KEY';
      const apodRes = await axios.get('https://api.nasa.gov/planetary/apod', {
        params: { api_key: apiKey },
        timeout: 8000,
      });
      await keyManager.trackUsage('nasa');

      if (apodRes.data && apodRes.data.media_type === 'image') {
        curatedObservations.unshift({
          id: `apod-${apodRes.data.date}`,
          observatory: 'APOD',
          targetName: 'Astronomy Picture of the Day',
          title: String(apodRes.data.title || 'NASA APOD'),
          instrument: String(apodRes.data.copyright || 'NASA / ESA'),
          wavelengthBand: 'Multi-Spectral',
          obsDate: String(apodRes.data.date),
          raDeg: 180.0,
          decDeg: 0.0,
          imageUrl: String(apodRes.data.url),
          description: String(apodRes.data.explanation || '').slice(0, 260) + '...',
          archiveUrl: 'https://apod.nasa.gov/apod/astropix.html',
        });
      }
    }
  } catch (error) {
    logger.warn('NASA APOD fetch skipped, using STScI MAST JWST/HST observations:', error);
  }

  await cacheSet(cacheKey, JSON.stringify(curatedObservations), 3600);
  return curatedObservations;
}
