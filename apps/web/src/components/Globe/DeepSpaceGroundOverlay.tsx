"use client";
import { PointPrimitiveCollection, PointPrimitive } from 'resium';
import { Color, Cartesian3 } from 'cesium';
import { useSatelliteStore } from '@/stores/satelliteStore';

function getCosmicRayColor(status: string): string {
  switch (status) {
    case 'GLE_ELEVATED':
      return '#f43f5e'; // Rose-500
    case 'FORBUSH_DECREASE':
      return '#f59e0b'; // Amber-500
    default:
      return '#10b981'; // Emerald-500
  }
}

export default function DeepSpaceGroundOverlay() {
  const {
    showDsnComplexes,
    showCosmicRayStations,
    dsnComplexMarkers,
    cosmicRayMarkers,
  } = useSatelliteStore();

  return (
    <>
      {showDsnComplexes && dsnComplexMarkers.length > 0 && (
        <PointPrimitiveCollection>
          {dsnComplexMarkers.map((dsn, idx) => (
            <PointPrimitive
              key={`dsn-${dsn.dishName}-${idx}`}
              position={Cartesian3.fromDegrees(dsn.lon, dsn.lat, 12000)}
              color={Color.fromCssColorString('#a855f7')}
              outlineColor={Color.fromCssColorString('#ffffff')}
              outlineWidth={2.5}
              pixelSize={12}
            />
          ))}
        </PointPrimitiveCollection>
      )}

      {showCosmicRayStations && cosmicRayMarkers.length > 0 && (
        <PointPrimitiveCollection>
          {cosmicRayMarkers.map((station) => (
            <PointPrimitive
              key={`nmdb-${station.stationCode}`}
              position={Cartesian3.fromDegrees(station.lon, station.lat, 8000)}
              color={Color.fromCssColorString(getCosmicRayColor(station.status))}
              outlineColor={Color.fromCssColorString('#0f172a')}
              outlineWidth={2}
              pixelSize={9}
            />
          ))}
        </PointPrimitiveCollection>
      )}
    </>
  );
}
