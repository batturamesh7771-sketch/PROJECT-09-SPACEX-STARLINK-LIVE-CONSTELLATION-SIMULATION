"use client";
import { PointPrimitiveCollection, PointPrimitive } from 'resium';
import { Color, Cartesian3 } from 'cesium';
import { useSatelliteStore } from '@/stores/satelliteStore';

export default function PlanetaryDefenseOverlay() {
  const {
    showFireballs,
    fireballMarkers,
    showReentries,
    reentryMarkers,
  } = useSatelliteStore();

  return (
    <>
      {showFireballs && fireballMarkers.length > 0 && (
        <PointPrimitiveCollection>
          {fireballMarkers.map((fb) => {
            const size = Math.min(18, Math.max(7, 6 + Math.log10(Math.max(0.1, fb.energyKt) * 10) * 3.5));
            return (
              <PointPrimitive
                key={`fb-${fb.id}`}
                position={Cartesian3.fromDegrees(fb.lon, fb.lat, (fb.altKm || 30) * 1000)}
                color={Color.fromCssColorString('#ef4444').withAlpha(0.88)}
                outlineColor={Color.fromCssColorString('#fde047')}
                outlineWidth={2}
                pixelSize={size}
              />
            );
          })}
        </PointPrimitiveCollection>
      )}

      {showReentries && reentryMarkers.length > 0 && (
        <PointPrimitiveCollection>
          {reentryMarkers.map((re) => (
            <PointPrimitive
              key={`reentry-${re.noradId}`}
              position={Cartesian3.fromDegrees(re.lon, re.lat, (re.perigeeKm || 140) * 1000)}
              color={
                re.status === 'IMMINENT'
                  ? Color.fromCssColorString('#f97316')
                  : Color.fromCssColorString('#a855f7')
              }
              outlineColor={Color.fromCssColorString('#ffffff')}
              outlineWidth={1.5}
              pixelSize={9}
            />
          ))}
        </PointPrimitiveCollection>
      )}
    </>
  );
}
