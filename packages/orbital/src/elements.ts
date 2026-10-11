import * as satellite from 'satellite.js';
import { TLE, OrbitalElements } from '@cosmos/types';

export function extractOrbitalElements(tle: TLE): OrbitalElements {
  const satrec = satellite.twoline2satrec(tle.line1, tle.line2);

  // Mean motion in revs per day
  const meanMotion = satrec.no * 1440 / (2 * Math.PI);
  
  // Earth radius in km
  const earthRadius = 6371.0;
  
  // Semi-major axis
  const a = Math.pow(86400 / (meanMotion * 2 * Math.PI), 2 / 3) * Math.pow(398600.4418, 1 / 3);
  
  const apogee = a * (1 + satrec.ecco) - earthRadius;
  const perigee = a * (1 - satrec.ecco) - earthRadius;
  
  const period = 1440 / meanMotion;

  // Extract year and day to reconstruct epoch
  const year = satrec.epochyr < 50 ? satrec.epochyr + 2000 : satrec.epochyr + 1900;
  const epoch = new Date(Date.UTC(year, 0, 1));
  epoch.setUTCMilliseconds((satrec.epochdays - 1) * 24 * 60 * 60 * 1000);

  return {
    inclination: satrec.inclo * 180 / Math.PI,
    raan: satrec.nodeo * 180 / Math.PI,
    eccentricity: satrec.ecco,
    argumentOfPerigee: satrec.argpo * 180 / Math.PI,
    meanAnomaly: satrec.mo * 180 / Math.PI,
    meanMotion: meanMotion,
    bstar: satrec.bstar,
    epoch: epoch,
    apogee: apogee,
    perigee: perigee,
    period: period,
    revolutionNumber: satrec.revnum
  };
}
