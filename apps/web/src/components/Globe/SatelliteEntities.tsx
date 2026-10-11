"use client";
import { PointPrimitiveCollection, PointPrimitive } from 'resium';
import { Color, Cartesian3 } from 'cesium';
import { useSatelliteStore } from '@/stores/satelliteStore';
import { SATELLITE_COLORS } from '@/lib/constants';

const SatelliteEntities = () => {
  const { positions, satellites, selectedSatelliteId, setSelectedSatellite, activeConstellation, showDebris } = useSatelliteStore();

  const points: any[] = [];
  
  positions.forEach((pos, id) => {
    const sat = satellites.get(id);
    if (!sat) return;

    if (activeConstellation && sat.constellation !== activeConstellation) return;
    if (!showDebris && sat.type === 'DEBRIS') return;

    let colorStr = SATELLITE_COLORS.payload;
    if (sat.type === 'DEBRIS') colorStr = SATELLITE_COLORS.debris;
    if (sat.type === 'ROCKET BODY') colorStr = SATELLITE_COLORS.rocketBody;
    if (id === selectedSatelliteId) colorStr = SATELLITE_COLORS.selected;

    points.push({
      id,
      position: Cartesian3.fromDegrees(pos.lon, pos.lat, pos.alt * 1000),
      color: Color.fromCssColorString(colorStr),
      pixelSize: id === selectedSatelliteId ? 8 : 4,
    });
  });

  return (
    <PointPrimitiveCollection>
      {points.map(p => (
        <PointPrimitive
          key={p.id}
          position={p.position}
          color={p.color}
          pixelSize={p.pixelSize}
          id={p.id}
          // Note: In a real app we'd need to handle clicks securely
        />
      ))}
    </PointPrimitiveCollection>
  );
};

export default SatelliteEntities;
