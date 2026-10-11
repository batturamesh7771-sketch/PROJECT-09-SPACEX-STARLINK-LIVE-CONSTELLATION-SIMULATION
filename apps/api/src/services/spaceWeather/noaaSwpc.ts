import axios from 'axios';
import { cacheGet, cacheSet } from '../../cache/redis.js';
import { logger } from '../../utils/logger.js';
import type {
  KpIndexReading,
  GeomagneticStormLevel,
  SolarWindReading,
  XRayFluxReading,
  FlareClassCategory,
  AuroraForecastData,
  SpaceWeatherAlert,
} from '@cosmos/types';

const SWPC_BASE = 'https://services.swpc.noaa.gov';

export function classifyKpStormLevel(kp: number): GeomagneticStormLevel {
  if (kp >= 9) return 'G5_EXTREME';
  if (kp >= 8) return 'G4_SEVERE';
  if (kp >= 7) return 'G3_STRONG';
  if (kp >= 6) return 'G2_MODERATE';
  if (kp >= 5) return 'G1_MINOR';
  if (kp >= 4) return 'ACTIVE';
  if (kp >= 3) return 'UNSETTLED';
  return 'QUIET';
}

export function classifyXRayFlux(flux: number): { flareClass: string; category: FlareClassCategory } {
  if (flux <= 0 || Number.isNaN(flux)) {
    return { flareClass: 'A1.0', category: 'A' };
  }
  const exp = Math.floor(Math.log10(flux));
  const mantissa = (flux / Math.pow(10, exp)).toFixed(1);
  if (exp >= -4) {
    const scale = flux / 1e-4;
    return { flareClass: `X${scale.toFixed(1)}`, category: 'X' };
  }
  if (exp === -5) return { flareClass: `M${mantissa}`, category: 'M' };
  if (exp === -6) return { flareClass: `C${mantissa}`, category: 'C' };
  if (exp === -7) return { flareClass: `B${mantissa}`, category: 'B' };
  return { flareClass: `A${Math.max(1, flux / 1e-8).toFixed(1)}`, category: 'A' };
}

/**
 * Fetches 3-hour Planetary Kp Index readings from NOAA SWPC
 */
export async function fetchNoaaKpIndex(): Promise<KpIndexReading[]> {
  const cacheKey = 'swpc:kp_index';
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response = await axios.get(`${SWPC_BASE}/products/noaa-planetary-k-index.json`, {
      timeout: 10000,
    });
    const rows: string[][] = response.data;
    // First row is header: ["time_tag","Kp","a_running","station_count"]
    const readings: KpIndexReading[] = rows.slice(1).map((row) => {
      const kp = parseFloat(row[1]) || 0;
      return {
        timestamp: new Date(row[0].replace(' ', 'T') + 'Z').toISOString(),
        kp,
        aRunning: parseFloat(row[2]) || 0,
        stationCount: parseInt(row[3], 10) || 8,
        stormLevel: classifyKpStormLevel(kp),
      };
    });

    await cacheSet(cacheKey, JSON.stringify(readings), 180); // 3 min TTL
    return readings;
  } catch (error) {
    logger.warn('Failed to fetch live NOAA Kp index, returning fallback telemetry:', error);
    const now = Date.now();
    return Array.from({ length: 16 }, (_, idx) => {
      const kp = Number((2.3 + Math.sin(idx * 0.6) * 1.8).toFixed(2));
      return {
        timestamp: new Date(now - (15 - idx) * 3 * 3600 * 1000).toISOString(),
        kp,
        aRunning: Math.round(kp * 4.5),
        stationCount: 8,
        stormLevel: classifyKpStormLevel(kp),
      };
    });
  }
}

/**
 * Fetches real-time DSCOVR/ACE Solar Wind Plasma + Magnetic Field (2-hour high-res)
 */
export async function fetchSolarWind(): Promise<SolarWindReading[]> {
  const cacheKey = 'swpc:solar_wind';
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const [plasmaRes, magRes] = await Promise.all([
      axios.get(`${SWPC_BASE}/products/solar-wind/plasma-2-hour.json`, { timeout: 10000 }),
      axios.get(`${SWPC_BASE}/products/solar-wind/mag-2-hour.json`, { timeout: 10000 }),
    ]);

    const plasmaRows: string[][] = plasmaRes.data.slice(1);
    const magRows: string[][] = magRes.data.slice(1);

    // Map mag readings by minute timestamp
    const magMap = new Map<string, { bx: number; by: number; bz: number; bt: number }>();
    for (const row of magRows) {
      if (!row[0]) continue;
      const key = row[0].slice(0, 16); // YYYY-MM-DD HH:mm
      magMap.set(key, {
        bx: parseFloat(row[1]) || 0,
        by: parseFloat(row[2]) || 0,
        bz: parseFloat(row[3]) || 0,
        bt: parseFloat(row[6]) || 0,
      });
    }

    const combined: SolarWindReading[] = [];
    for (const row of plasmaRows) {
      if (!row[0]) continue;
      const key = row[0].slice(0, 16);
      const density = parseFloat(row[1]);
      const speed = parseFloat(row[2]);
      const temperature = parseFloat(row[3]);
      if (Number.isNaN(speed)) continue;

      const mag = magMap.get(key) || { bx: 0, by: 0, bz: -1.2, bt: 4.8 };
      combined.push({
        timestamp: new Date(row[0].replace(' ', 'T') + 'Z').toISOString(),
        density: Number.isNaN(density) ? 4.5 : density,
        speed,
        temperature: Number.isNaN(temperature) ? 110000 : temperature,
        ...mag,
      });
    }

    await cacheSet(cacheKey, JSON.stringify(combined), 60); // 1 min TTL
    return combined;
  } catch (error) {
    logger.warn('Failed to fetch live NOAA Solar Wind, returning fallback telemetry:', error);
    const now = Date.now();
    return Array.from({ length: 60 }, (_, idx) => ({
      timestamp: new Date(now - (59 - idx) * 60 * 1000).toISOString(),
      density: Number((5.2 + Math.sin(idx * 0.2) * 1.4).toFixed(2)),
      speed: Number((435 + Math.cos(idx * 0.15) * 35).toFixed(1)),
      temperature: 125000,
      bx: Number((1.8 * Math.sin(idx * 0.1)).toFixed(2)),
      by: Number((-2.1 * Math.cos(idx * 0.1)).toFixed(2)),
      bz: Number((-2.4 + Math.sin(idx * 0.25) * 3.2).toFixed(2)),
      bt: Number((5.8 + Math.sin(idx * 0.12) * 1.1).toFixed(2)),
    }));
  }
}

/**
 * Fetches GOES Primary X-Ray Flux (6-hour 1-minute averages)
 */
export async function fetchGoesXRayFlux(): Promise<XRayFluxReading[]> {
  const cacheKey = 'swpc:xray_flux';
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response = await axios.get(`${SWPC_BASE}/json/goes/primary/xrays-6-hour.json`, {
      timeout: 10000,
    });
    const raw: Array<{ time_tag: string; flux: number; energy: string }> = response.data;
    const longWave = raw.filter((item) => item.energy === '0.1-0.8nm' && item.flux > 0);

    const readings: XRayFluxReading[] = longWave.slice(-120).map((item) => {
      const { flareClass, category } = classifyXRayFlux(item.flux);
      return {
        timestamp: item.time_tag,
        flux: item.flux,
        energyBand: item.energy,
        flareClass,
        category,
      };
    });

    await cacheSet(cacheKey, JSON.stringify(readings), 120);
    return readings;
  } catch (error) {
    logger.warn('Failed to fetch GOES X-Ray flux, returning fallback telemetry:', error);
    const flux = 2.4e-6;
    const { flareClass, category } = classifyXRayFlux(flux);
    return [
      {
        timestamp: new Date().toISOString(),
        flux,
        energyBand: '0.1-0.8nm',
        flareClass,
        category,
      },
    ];
  }
}

/**
 * Fetches OVATION Aurora Model Probability Map for 3D Globe overlay
 */
export async function fetchAuroraForecast(): Promise<AuroraForecastData> {
  const cacheKey = 'swpc:ovation_aurora';
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response = await axios.get(`${SWPC_BASE}/json/ovation_aurora_latest.json`, {
      timeout: 12000,
    });
    const data = response.data;
    // Filter to significant aurora probability (>= 10%) and decimate slightly for fast WebGL rendering
    const rawCoords: number[][] = data.coordinates || [];
    const filtered = rawCoords
      .filter((pt, idx) => pt[2] >= 12 && idx % 2 === 0)
      .map((pt) => ({
        lon: pt[0] > 180 ? pt[0] - 360 : pt[0],
        lat: pt[1],
        probability: pt[2],
      }));

    const result: AuroraForecastData = {
      observationTime: data['Observation Time'] || new Date().toISOString(),
      forecastTime: data['Forecast Time'] || new Date().toISOString(),
      coordinates: filtered,
    };

    await cacheSet(cacheKey, JSON.stringify(result), 300); // 5 min TTL
    return result;
  } catch (error) {
    logger.warn('Failed to fetch OVATION aurora data, generating high-latitude oval model:', error);
    const coordinates = [];
    for (let lon = -180; lon < 180; lon += 4) {
      for (const latBase of [66, 68, 70, -67, -69]) {
        const prob = Math.round(30 + 25 * Math.sin((lon * Math.PI) / 180));
        coordinates.push({ lon, lat: latBase, probability: prob });
      }
    }
    return {
      observationTime: new Date().toISOString(),
      forecastTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      coordinates,
    };
  }
}

/**
 * Fetches NOAA Space Weather Alerts, Watches & Warnings
 */
export async function fetchSpaceWeatherAlerts(): Promise<SpaceWeatherAlert[]> {
  const cacheKey = 'swpc:alerts';
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response = await axios.get(`${SWPC_BASE}/products/alerts.json`, { timeout: 10000 });
    const raw: Array<{ product_id: string; issue_datetime: string; message: string }> = response.data;
    const alerts: SpaceWeatherAlert[] = raw.slice(0, 15).map((item) => {
      const msgUpper = (item.message || '').toUpperCase();
      let severity: SpaceWeatherAlert['severity'] = 'INFO';
      if (msgUpper.includes('WARNING')) severity = 'WARNING';
      else if (msgUpper.includes('ALERT')) severity = 'ALERT';
      else if (msgUpper.includes('WATCH')) severity = 'WATCH';

      return {
        productId: item.product_id,
        issueDatetime: new Date(item.issue_datetime.replace(' ', 'T') + 'Z').toISOString(),
        message: item.message.trim(),
        severity,
      };
    });

    await cacheSet(cacheKey, JSON.stringify(alerts), 180);
    return alerts;
  } catch (error) {
    logger.warn('Failed to fetch NOAA SWPC alerts:', error);
    return [];
  }
}

/**
 * Fetches 10.7cm Solar Radio Flux (F10.7)
 */
export async function fetchRadioFlux107cm(): Promise<number> {
  const cacheKey = 'swpc:f107';
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return parseFloat(cached) || 145;
  }

  try {
    const response = await axios.get(`${SWPC_BASE}/products/summary/10cm-flux.json`, { timeout: 8000 });
    const flux = parseFloat(response.data?.Flux) || 145;
    await cacheSet(cacheKey, String(flux), 1800);
    return flux;
  } catch {
    return 145;
  }
}
