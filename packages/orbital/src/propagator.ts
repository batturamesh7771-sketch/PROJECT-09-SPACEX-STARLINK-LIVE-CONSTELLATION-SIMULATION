import * as satellite from 'satellite.js';
import { TLE, CartesianState, GeoPosition } from '@cosmos/types';

export function propagate(tle: TLE, date: Date): CartesianState {
  const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
  const positionAndVelocity = satellite.propagate(satrec, date);

  if (typeof positionAndVelocity.position === 'boolean' || typeof positionAndVelocity.velocity === 'boolean') {
    throw new Error(`Failed to propagate TLE for NORAD ID ${tle.noradId}`);
  }

  const positionEci = positionAndVelocity.position as satellite.EciVec3<number>;
  const velocityEci = positionAndVelocity.velocity as satellite.EciVec3<number>;

  return {
    position: { x: positionEci.x, y: positionEci.y, z: positionEci.z },
    velocity: { x: velocityEci.x, y: velocityEci.y, z: velocityEci.z }
  };
}

export function propagateMany(tles: TLE[], date: Date): Map<number, CartesianState> {
  const results = new Map<number, CartesianState>();
  for (const tle of tles) {
    try {
      results.set(tle.noradId, propagate(tle, date));
    } catch (e) {
      // Skip failed propagations
    }
  }
  return results;
}

export function getPosition(tle: TLE, date: Date): GeoPosition {
  const state = propagate(tle, date);
  const gmst = satellite.gstime(date);
  
  const positionEci = state.position;
  const positionGd = satellite.eciToGeodetic(positionEci, gmst);

  return {
    latitude: satellite.degreesLat(positionGd.latitude),
    longitude: satellite.degreesLong(positionGd.longitude),
    altitude: positionGd.height
  };
}

export function getPositionSeries(tle: TLE, start: Date, end: Date, stepMs: number): GeoPosition[] {
  const series: GeoPosition[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += stepMs) {
    try {
      series.push(getPosition(tle, new Date(t)));
    } catch (e) {
      // Ignore intermediate propagation errors
    }
  }
  return series;
}
