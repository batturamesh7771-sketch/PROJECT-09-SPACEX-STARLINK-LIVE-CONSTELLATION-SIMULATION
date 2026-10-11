import * as satellite from 'satellite.js';
import { CartesianState, GeoPosition, ObserverLocation } from '@cosmos/types';

export function eciToEcef(eci: CartesianState, gmst: number): CartesianState {
  const positionEcf = satellite.eciToEcf(eci.position, gmst);
  const velocityEcf = satellite.eciToEcf(eci.velocity, gmst); // Simplified

  return {
    position: { x: positionEcf.x, y: positionEcf.y, z: positionEcf.z },
    velocity: { x: velocityEcf.x, y: velocityEcf.y, z: velocityEcf.z }
  };
}

export function ecefToGeodetic(ecef: { x: number; y: number; z: number }): GeoPosition {
  const gmst = 0; // Not actually used in eciToGeodetic if we consider ecef as eci with 0 gmst? Actually no, satellite.js doesn't have ecfToGeodetic directly.
  // Workaround: We can use eciToGeodetic with ecef and gmst=0.
  const positionGd = satellite.eciToGeodetic(ecef, 0);
  return {
    latitude: satellite.degreesLat(positionGd.latitude),
    longitude: satellite.degreesLong(positionGd.longitude),
    altitude: positionGd.height
  };
}

export function geodeticToEcef(geo: GeoPosition): { x: number; y: number; z: number } {
  // satellite.geodeticToEcf handles this
  const rad = {
    longitude: degreesToRadians(geo.longitude),
    latitude: degreesToRadians(geo.latitude),
    height: geo.altitude
  };
  return satellite.geodeticToEcf(rad);
}

export function degreesToRadians(deg: number): number {
  return deg * Math.PI / 180;
}

export function radiansToDegrees(rad: number): number {
  return rad * 180 / Math.PI;
}

export function lookAngle(
  observer: ObserverLocation,
  satelliteEci: { x: number; y: number; z: number },
  gmst: number
): { azimuth: number; elevation: number; range: number } {
  const obsGeodetic = {
    longitude: degreesToRadians(observer.longitude),
    latitude: degreesToRadians(observer.latitude),
    height: observer.altitude / 1000 // Convert meters to km
  };

  const positionEcf = satellite.eciToEcf(satelliteEci, gmst);
  const lookAngles = satellite.ecfToLookAngles(obsGeodetic, positionEcf);

  return {
    azimuth: radiansToDegrees(lookAngles.azimuth),
    elevation: radiansToDegrees(lookAngles.elevation),
    range: lookAngles.rangeSat
  };
}
