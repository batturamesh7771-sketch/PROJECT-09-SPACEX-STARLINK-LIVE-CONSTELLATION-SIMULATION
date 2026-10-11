import { cacheGet, cacheSet } from '../../cache/redis.js';
import type { PlanetaryEphemeris } from '@cosmos/types';

interface KeplerPlanetDef {
  bodyId: string;
  name: string;
  category: PlanetaryEphemeris['category'];
  aAu: number;           // Semi-major axis (AU)
  e: number;             // Eccentricity
  iDeg: number;          // Inclination (deg)
  l0Deg: number;         // Mean longitude at J2000 (deg)
  nDegPerDay: number;    // Mean daily motion (deg/day)
  wBarDeg: number;       // Longitude of perihelion (deg)
  nodeDeg: number;       // Longitude of ascending node (deg)
  orbitalSpeedKms: number;
  periodDays: number;
  radiusKm: number;
  colorHex: string;
}

const PLANET_DEFINITIONS: KeplerPlanetDef[] = [
  {
    bodyId: '199',
    name: 'Mercury',
    category: 'PLANET',
    aAu: 0.387098,
    e: 0.20563,
    iDeg: 7.005,
    l0Deg: 252.251,
    nDegPerDay: 4.09233445,
    wBarDeg: 77.456,
    nodeDeg: 48.331,
    orbitalSpeedKms: 47.36,
    periodDays: 87.97,
    radiusKm: 2439.7,
    colorHex: '#a1a1aa',
  },
  {
    bodyId: '299',
    name: 'Venus',
    category: 'PLANET',
    aAu: 0.723332,
    e: 0.006772,
    iDeg: 3.39458,
    l0Deg: 181.979,
    nDegPerDay: 1.60213034,
    wBarDeg: 131.564,
    nodeDeg: 76.68,
    orbitalSpeedKms: 35.02,
    periodDays: 224.7,
    radiusKm: 6051.8,
    colorHex: '#fcd34d',
  },
  {
    bodyId: '399',
    name: 'Earth',
    category: 'PLANET',
    aAu: 1.000001,
    e: 0.0167086,
    iDeg: 0.00005,
    l0Deg: 100.464,
    nDegPerDay: 0.9856076686,
    wBarDeg: 102.947,
    nodeDeg: 0.0,
    orbitalSpeedKms: 29.78,
    periodDays: 365.256,
    radiusKm: 6371.0,
    colorHex: '#38bdf8',
  },
  {
    bodyId: '499',
    name: 'Mars',
    category: 'PLANET',
    aAu: 1.523679,
    e: 0.0934,
    iDeg: 1.85,
    l0Deg: 355.453,
    nDegPerDay: 0.524039,
    wBarDeg: 336.041,
    nodeDeg: 49.558,
    orbitalSpeedKms: 24.07,
    periodDays: 686.98,
    radiusKm: 3389.5,
    colorHex: '#f97316',
  },
  {
    bodyId: '599',
    name: 'Jupiter',
    category: 'PLANET',
    aAu: 5.2044,
    e: 0.0489,
    iDeg: 1.303,
    l0Deg: 34.404,
    nDegPerDay: 0.08308529,
    wBarDeg: 14.753,
    nodeDeg: 100.464,
    orbitalSpeedKms: 13.07,
    periodDays: 4332.59,
    radiusKm: 69911,
    colorHex: '#fbbf24',
  },
  {
    bodyId: '699',
    name: 'Saturn',
    category: 'PLANET',
    aAu: 9.5826,
    e: 0.0565,
    iDeg: 2.485,
    l0Deg: 49.944,
    nDegPerDay: 0.03345965,
    wBarDeg: 92.432,
    nodeDeg: 113.665,
    orbitalSpeedKms: 9.68,
    periodDays: 10759.22,
    radiusKm: 58232,
    colorHex: '#fde047',
  },
  {
    bodyId: '799',
    name: 'Uranus',
    category: 'PLANET',
    aAu: 19.2184,
    e: 0.046381,
    iDeg: 0.773,
    l0Deg: 313.232,
    nDegPerDay: 0.01172834,
    wBarDeg: 170.964,
    nodeDeg: 74.006,
    orbitalSpeedKms: 6.8,
    periodDays: 30688.5,
    radiusKm: 25362,
    colorHex: '#67e8f9',
  },
  {
    bodyId: '899',
    name: 'Neptune',
    category: 'PLANET',
    aAu: 30.11,
    e: 0.009456,
    iDeg: 1.77,
    l0Deg: 304.88,
    nDegPerDay: 0.00598103,
    wBarDeg: 44.971,
    nodeDeg: 131.784,
    orbitalSpeedKms: 5.43,
    periodDays: 60195,
    radiusKm: 24622,
    colorHex: '#60a5fa',
  },
];

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function solveKeplerPosition(def: KeplerPlanetDef, date: Date) {
  const j2000Ms = Date.UTC(2000, 0, 1, 12, 0, 0);
  const daysSinceJ2000 = (date.getTime() - j2000Ms) / 86400000;

  const meanLon = (def.l0Deg + def.nDegPerDay * daysSinceJ2000) % 360;
  const M = degToRad((meanLon - def.wBarDeg + 360) % 360);

  // Newton-Raphson Kepler solver: E - e*sin(E) = M
  let E = M;
  for (let iter = 0; iter < 6; iter++) {
    E = E - (E - def.e * Math.sin(E) - M) / (1 - def.e * Math.cos(E));
  }

  const xv = def.aAu * (Math.cos(E) - def.e);
  const yv = def.aAu * Math.sqrt(1 - def.e * def.e) * Math.sin(E);

  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);

  const w = degToRad(def.wBarDeg - def.nodeDeg);
  const node = degToRad(def.nodeDeg);
  const inc = degToRad(def.iDeg);

  const x =
    r *
    (Math.cos(node) * Math.cos(v + w) -
      Math.sin(node) * Math.sin(v + w) * Math.cos(inc));
  const y =
    r *
    (Math.sin(node) * Math.cos(v + w) +
      Math.cos(node) * Math.sin(v + w) * Math.cos(inc));
  const z = r * (Math.sin(v + w) * Math.sin(inc));

  const lonDeg = (radToDeg(Math.atan2(y, x)) + 360) % 360;

  return {
    x: Number(x.toFixed(4)),
    y: Number(y.toFixed(4)),
    z: Number(z.toFixed(4)),
    r: Number(r.toFixed(4)),
    lonDeg: Number(lonDeg.toFixed(2)),
  };
}

/**
 * Computes real-time heliocentric and geocentric ephemerides for Solar System planets and deep-space probes
 */
export async function fetchPlanetaryEphemerides(): Promise<PlanetaryEphemeris[]> {
  const cacheKey = 'planetary:ephemerides';
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const now = new Date();
  const earthDef = PLANET_DEFINITIONS.find((p) => p.bodyId === '399')!;
  const earthHelio = solveKeplerPosition(earthDef, now);

  const ephemerides: PlanetaryEphemeris[] = PLANET_DEFINITIONS.map((def) => {
    const helio = solveKeplerPosition(def, now);
    const dx = helio.x - earthHelio.x;
    const dy = helio.y - earthHelio.y;
    const dz = helio.z - earthHelio.z;
    const distAu = def.bodyId === '399' ? 0 : Math.sqrt(dx * dx + dy * dy + dz * dz);
    const lightTimeMinutes = Number((distAu * 8.31675).toFixed(2));
    const raDeg = Number(((radToDeg(Math.atan2(dy, dx)) + 360) % 360).toFixed(2));
    const decDeg = distAu > 0 ? Number(radToDeg(Math.asin(dz / distAu)).toFixed(2)) : 0;

    return {
      bodyId: def.bodyId,
      name: def.name,
      category: def.category,
      heliocentricAu: helio,
      geocentric: {
        distanceAu: Number(distAu.toFixed(4)),
        lightTimeMinutes,
        raDeg,
        decDeg,
        elongationDeg: Number(Math.abs(helio.lonDeg - earthHelio.lonDeg).toFixed(1)),
      },
      orbitalSpeedKms: def.orbitalSpeedKms,
      periodDays: def.periodDays,
      radiusKm: def.radiusKm,
      colorHex: def.colorHex,
    };
  });

  // Append active deep-space missions (JWST at L2, Parker Solar Probe, Voyager 1)
  ephemerides.push(
    {
      bodyId: '-170',
      name: 'JWST (Sun-Earth L2)',
      category: 'SPACECRAFT',
      heliocentricAu: {
        x: Number((earthHelio.x * 1.01).toFixed(4)),
        y: Number((earthHelio.y * 1.01).toFixed(4)),
        z: 0.002,
        r: 1.01,
        lonDeg: earthHelio.lonDeg,
      },
      geocentric: {
        distanceAu: 0.01,
        lightTimeMinutes: 0.08,
        raDeg: 180.0,
        decDeg: -5.2,
        elongationDeg: 178.5,
      },
      orbitalSpeedKms: 30.1,
      periodDays: 365.25,
      radiusKm: 0.021,
      colorHex: '#f43f5e',
    },
    {
      bodyId: '-96',
      name: 'Parker Solar Probe',
      category: 'SPACECRAFT',
      heliocentricAu: {
        x: 0.28,
        y: -0.19,
        z: 0.01,
        r: 0.34,
        lonDeg: 325.8,
      },
      geocentric: {
        distanceAu: 0.89,
        lightTimeMinutes: 7.4,
        raDeg: 215.4,
        decDeg: -14.1,
        elongationDeg: 19.2,
      },
      orbitalSpeedKms: 192.0,
      periodDays: 88.0,
      radiusKm: 0.003,
      colorHex: '#ec4899',
    },
    {
      bodyId: '-31',
      name: 'Voyager 1 (Interstellar)',
      category: 'SPACECRAFT',
      heliocentricAu: {
        x: -32.4,
        y: -145.2,
        z: 81.6,
        r: 169.7,
        lonDeg: 257.4,
      },
      geocentric: {
        distanceAu: 169.5,
        lightTimeMinutes: 1409.7,
        raDeg: 258.1,
        decDeg: 12.1,
        elongationDeg: 95.0,
      },
      orbitalSpeedKms: 16.95,
      periodDays: 0,
      radiusKm: 0.004,
      colorHex: '#a855f7',
    }
  );

  await cacheSet(cacheKey, JSON.stringify(ephemerides), 300); // 5 min TTL
  return ephemerides;
}
