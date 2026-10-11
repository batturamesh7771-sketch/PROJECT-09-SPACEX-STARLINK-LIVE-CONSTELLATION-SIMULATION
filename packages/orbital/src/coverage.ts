import { GeoPosition } from '@cosmos/types';

export function calculateFootprint(
  position: GeoPosition,
  minElevation: number
): { center: GeoPosition; radiusKm: number } {
  const R = 6371; // Earth radius in km
  const h = position.altitude;
  
  // Min elevation in radians
  const el = minElevation * Math.PI / 180;
  
  // Slant range to the horizon at min elevation
  const maxRange = R * (Math.sqrt(Math.pow((R + h)/R, 2) - Math.pow(Math.cos(el), 2)) - Math.sin(el));
  
  // Earth central angle
  const centralAngle = Math.acos((Math.pow(R, 2) + Math.pow(R + h, 2) - Math.pow(maxRange, 2)) / (2 * R * (R + h)));
  
  // Footprint radius along the Earth's surface
  const radiusKm = R * centralAngle;

  return {
    center: position,
    radiusKm
  };
}
