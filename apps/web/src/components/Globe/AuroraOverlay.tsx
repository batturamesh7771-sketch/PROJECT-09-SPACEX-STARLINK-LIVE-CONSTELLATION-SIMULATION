"use client";
import { PointPrimitiveCollection, PointPrimitive } from 'resium';
import { Color, Cartesian3 } from 'cesium';
import { useSatelliteStore } from '@/stores/satelliteStore';

export default function AuroraOverlay() {
  const {
    showAurora,
    auroraCoordinates,
    showLaunchPads,
    launchPadMarkers,
  } = useSatelliteStore();

  return (
    <>
      {showAurora && auroraCoordinates.length > 0 && (
        <PointPrimitiveCollection>
          {auroraCoordinates.map((pt, idx) => {
            const alpha = Math.min(0.85, Math.max(0.18, pt.probability / 100));
            const color =
              pt.probability >= 60
                ? Color.fromCssColorString('#ec4899').withAlpha(alpha)
                : pt.probability >= 35
                ? Color.fromCssColorString('#10b981').withAlpha(alpha)
                : Color.fromCssColorString('#34d399').withAlpha(alpha * 0.75);

            return (
              <PointPrimitive
                key={`aurora-${idx}`}
                position={Cartesian3.fromDegrees(pt.lon, pt.lat, 110000)} // 110 km auroral ionosphere altitude
                color={color}
                pixelSize={pt.probability >= 50 ? 6 : 4}
              />
            );
          })}
        </PointPrimitiveCollection>
      )}

      {showLaunchPads && launchPadMarkers.length > 0 && (
        <PointPrimitiveCollection>
          {launchPadMarkers.map((pad) => (
            <PointPrimitive
              key={`pad-${pad.id}`}
              position={Cartesian3.fromDegrees(pad.lon, pad.lat, 1500)}
              color={Color.fromCssColorString('#f59e0b')}
              outlineColor={Color.fromCssColorString('#ffffff')}
              outlineWidth={2}
              pixelSize={9}
            />
          ))}
        </PointPrimitiveCollection>
      )}
    </>
  );
}
