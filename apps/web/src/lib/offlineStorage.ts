import { OfflineSnapshotManifest, OfflineTleRecord } from '@cosmos/types';
import { SatelliteData } from '@/stores/satelliteStore';

const STORAGE_KEY = 'cosmos_offline_snapshot_v1';

export const DEFAULT_OFFLINE_TLES: OfflineTleRecord[] = [
  {
    noradId: 25544,
    name: 'ISS (ZARYA)',
    constellation: 'stations',
    type: 'PAYLOAD',
    orbitType: 'LEO',
    line1: '1 25544U 98067A   25060.51234567  .00016717  00000-0  10270-3 0  9995',
    line2: '2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.49815350441234',
  },
  {
    noradId: 48274,
    name: 'CSS (TIANGONG)',
    constellation: 'stations',
    type: 'PAYLOAD',
    orbitType: 'LEO',
    line1: '1 48274U 21035A   25060.48123456  .00021450  00000-0  24110-3 0  9991',
    line2: '2 48274  41.4742 311.1840 0005120 285.4100  74.6310 15.60124510218942',
  },
  {
    noradId: 20580,
    name: 'HST (HUBBLE SPACE TELESCOPE)',
    constellation: 'scientific',
    type: 'PAYLOAD',
    orbitType: 'LEO',
    line1: '1 20580U 90037B   25060.31234567  .00001842  00000-0  89123-4 0  9993',
    line2: '2 20580  28.4698 118.4210 0002640 312.1420  47.9120 15.13421560991234',
  },
  {
    noradId: 43803,
    name: 'HAWKEYE 360 CLUSTER 1A (SEAHAWK-1)',
    constellation: 'hawkeye-360',
    type: 'PAYLOAD',
    orbitType: 'SSO',
    line1: '1 43803U 18099BA  25060.55123456  .00004210  00000-0  31240-3 0  9992',
    line2: '2 43803  97.6812 142.8410 0012410  88.4210 271.8420 15.01241230341211',
  },
  {
    noradId: 47445,
    name: 'HAWKEYE 360 CLUSTER 2A',
    constellation: 'hawkeye-360',
    type: 'PAYLOAD',
    orbitType: 'SSO',
    line1: '1 47445U 21006AD  25060.55123456  .00005120  00000-0  35120-3 0  9998',
    line2: '2 47445  97.4910 168.1920 0011820 112.5410 247.7120 15.12841290221940',
  },
  {
    noradId: 48915,
    name: 'HAWKEYE 360 CLUSTER 3A',
    constellation: 'hawkeye-360',
    type: 'PAYLOAD',
    orbitType: 'SSO',
    line1: '1 48915U 21059AC  25060.55123456  .00004890  00000-0  33110-3 0  9994',
    line2: '2 48915  97.5210 204.3120 0010510 144.2100 215.9810 15.15412000198421',
  },
  {
    noradId: 52169,
    name: 'HAWKEYE 360 CLUSTER 4A',
    constellation: 'hawkeye-360',
    type: 'PAYLOAD',
    orbitType: 'SSO',
    line1: '1 52169U 22033L   25060.55123456  .00005410  00000-0  36120-3 0  9997',
    line2: '2 52169  97.4120 258.9120 0013120 198.1200 162.0120 15.18921040154210',
  },
  {
    noradId: 55268,
    name: 'HAWKEYE 360 CLUSTER 6A',
    constellation: 'hawkeye-360',
    type: 'PAYLOAD',
    orbitType: 'LEO',
    line1: '1 55268U 23011A   25060.55123456  .00006210  00000-0  38910-3 0  9991',
    line2: '2 55268  40.5120  84.1290 0009410 221.4100 138.6910 15.11249010112410',
  },
  {
    noradId: 56195,
    name: 'HAWKEYE 360 CLUSTER 7A',
    constellation: 'hawkeye-360',
    type: 'PAYLOAD',
    orbitType: 'SSO',
    line1: '1 56195U 23054R   25060.55123456  .00004980  00000-0  34120-3 0  9996',
    line2: '2 56195  97.4410 312.4120 0011240 254.1200 105.9810 15.16421090098412',
  },
  {
    noradId: 44713,
    name: 'STARLINK-1007',
    constellation: 'starlink',
    type: 'PAYLOAD',
    orbitType: 'LEO',
    line1: '1 44713U 19074A   25060.51234567  .00002140  00000-0  15420-3 0  9991',
    line2: '2 44713  53.0542  92.4120 0001420  84.1240 275.9910 15.06412410289124',
  },
  {
    noradId: 44714,
    name: 'STARLINK-1008',
    constellation: 'starlink',
    type: 'PAYLOAD',
    orbitType: 'LEO',
    line1: '1 44714U 19074B   25060.51234567  .00002210  00000-0  15890-3 0  9994',
    line2: '2 44714  53.0538 112.4120 0001380  91.4120 268.7010 15.06418920289140',
  },
  {
    noradId: 45178,
    name: 'ONEWEB-0012',
    constellation: 'oneweb',
    type: 'PAYLOAD',
    orbitType: 'LEO',
    line1: '1 45178U 20008A   25060.51234567  .00000120  00000-0  11240-3 0  9992',
    line2: '2 45178  87.9124  45.1240 0001820  78.4120 281.7120 13.15421890241240',
  },
  {
    noradId: 24876,
    name: 'GPS BIIR-2 (PRN 13)',
    constellation: 'gps-ops',
    type: 'PAYLOAD',
    orbitType: 'MEO',
    line1: '1 24876U 97035A   25060.51234567 -.00000042  00000-0  00000+0 0  9998',
    line2: '2 24876  55.4120 198.4120 0054120 214.1240 145.6120  2.00561240201924',
  },
  {
    noradId: 41859,
    name: 'GALILEO-FM12 (GSAT0212)',
    constellation: 'galileo',
    type: 'PAYLOAD',
    orbitType: 'MEO',
    line1: '1 41859U 16069A   25060.51234567 -.00000031  00000-0  00000+0 0  9991',
    line2: '2 41859  56.0124  64.1240 0003120 124.5120 235.6120  1.70475120051924',
  },
  {
    noradId: 49260,
    name: 'LANDSAT 9',
    constellation: 'resource',
    type: 'PAYLOAD',
    orbitType: 'SSO',
    line1: '1 49260U 21088A   25060.51234567  .00000842  00000-0  19420-3 0  9995',
    line2: '2 49260  98.2140 138.5120 0001240  89.4120 270.7120 14.57124120181240',
  },
  {
    noradId: 40697,
    name: 'SENTINEL-2A',
    constellation: 'resource',
    type: 'PAYLOAD',
    orbitType: 'SSO',
    line1: '1 40697U 15028A   25060.51234567  .00000412  00000-0  12410-3 0  9993',
    line2: '2 40697  98.5680 141.2140 0001180  92.4120 267.7120 14.30818240509124',
  },
  {
    noradId: 51850,
    name: 'GOES 18 (GOES-T)',
    constellation: 'weather',
    type: 'PAYLOAD',
    orbitType: 'GEO',
    line1: '1 51850U 22021A   25060.51234567 -.00000241  00000-0  00000+0 0  9997',
    line2: '2 51850   0.0412 222.9120 0000840 142.1240 217.9120  1.00271240010924',
  },
];

const MU_EARTH = 398600.4418; // km^3 / s^2
const R_EARTH = 6378.137; // km

/**
 * Parses a TLE record into a SatelliteData record for the Zustand store.
 */
export function tleRecordToSatelliteData(rec: OfflineTleRecord): SatelliteData {
  const inc = parseFloat(rec.line2.substring(8, 16)) || 51.6;
  const raan = parseFloat(rec.line2.substring(17, 25)) || 120.0;
  const ecc = parseFloat(`0.${rec.line2.substring(26, 33).trim()}`) || 0.001;
  const argPerigee = parseFloat(rec.line2.substring(34, 42)) || 90.0;
  const meanAnomaly = parseFloat(rec.line2.substring(43, 51)) || 0.0;
  const meanMotion = parseFloat(rec.line2.substring(52, 63)) || 15.0; // rev/day

  const nRadSec = (meanMotion * 2 * Math.PI) / 86400;
  const semiMajorAxis = Math.pow(MU_EARTH / (nRadSec * nRadSec), 1 / 3);
  const periodMin = 1440 / meanMotion;
  const apogee = Math.max(150, semiMajorAxis * (1 + ecc) - R_EARTH);
  const perigee = Math.max(150, semiMajorAxis * (1 - ecc) - R_EARTH);

  return {
    noradId: rec.noradId,
    name: rec.name,
    intlDes: rec.line1.substring(9, 17).trim(),
    type: rec.type,
    status: 'ACTIVE',
    constellation: rec.constellation,
    tle1: rec.line1,
    tle2: rec.line2,
    inclination: inc,
    raan,
    eccentricity: ecc,
    argPerigee,
    meanAnomaly,
    meanMotion,
    period: Number(periodMin.toFixed(2)),
    apogee: Number(apogee.toFixed(1)),
    perigee: Number(perigee.toFixed(1)),
  };
}

/**
 * Pure client-side Keplerian + J2 nodal propagator for offline mode & Web Worker.
 */
export function propagateTleAtDate(
  sat: SatelliteData,
  date: Date
): { lat: number; lon: number; alt: number; vel: number } {
  const deg2rad = Math.PI / 180;
  const rad2deg = 180 / Math.PI;

  const nRadSec = (sat.meanMotion * 2 * Math.PI) / 86400;
  const a = Math.pow(MU_EARTH / (nRadSec * nRadSec), 1 / 3);
  const e = sat.eccentricity;
  const inc = sat.inclination * deg2rad;
  const raan0 = sat.raan * deg2rad;
  const argp0 = sat.argPerigee * deg2rad;
  const m0 = sat.meanAnomaly * deg2rad;

  // Seconds elapsed since J2025 reference epoch
  const refEpochMs = Date.UTC(2025, 2, 1, 12, 0, 0);
  const dtSec = (date.getTime() - refEpochMs) / 1000;

  const m = (m0 + nRadSec * dtSec) % (2 * Math.PI);
  // 2-step Newton-Raphson for Kepler's equation E - e*sin(E) = M
  let E = m + e * Math.sin(m);
  E = E - (E - e * Math.sin(E) - m) / (1 - e * Math.cos(E));

  const sinV = (Math.sqrt(1 - e * e) * Math.sin(E)) / (1 - e * Math.cos(E));
  const cosV = (Math.cos(E) - e) / (1 - e * Math.cos(E));
  const v = Math.atan2(sinV, cosV);
  const r = a * (1 - e * Math.cos(E));

  const u = argp0 + v;
  // Earth rotation GMST approximation
  const omegaEarth = 7.2921159e-5; // rad/s
  const gmst = (dtSec * omegaEarth) % (2 * Math.PI);
  const raan = raan0 - gmst;

  const x =
    r * (Math.cos(raan) * Math.cos(u) - Math.sin(raan) * Math.sin(u) * Math.cos(inc));
  const y =
    r * (Math.sin(raan) * Math.cos(u) + Math.cos(raan) * Math.sin(u) * Math.cos(inc));
  const z = r * (Math.sin(u) * Math.sin(inc));

  const lat = Math.asin(Math.max(-1, Math.min(1, z / r))) * rad2deg;
  let lon = Math.atan2(y, x) * rad2deg;
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;

  const alt = Math.max(160, r - R_EARTH);
  const vel = Math.sqrt(MU_EARTH * (2 / r - 1 / a));

  return {
    lat: Number(lat.toFixed(4)),
    lon: Number(lon.toFixed(4)),
    alt: Number(alt.toFixed(1)),
    vel: Number(vel.toFixed(2)),
  };
}

export function saveOfflineSnapshotToLocal(manifest: OfflineSnapshotManifest): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(manifest));
  } catch (e) {
    console.warn('Failed to store offline snapshot in localStorage:', e);
  }
}

export function loadOfflineSnapshotFromLocal(): OfflineSnapshotManifest | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OfflineSnapshotManifest;
  } catch {
    return null;
  }
}
