"use client";
import { useSatelliteStore } from '@/stores/satelliteStore';

export default function SatelliteInfoPanel() {
  const { selectedSatelliteId, satellites, positions } = useSatelliteStore();
  
  if (!selectedSatelliteId) return <div className="text-gray-500">No satellite selected.</div>;
  
  const sat = satellites.get(selectedSatelliteId);
  const pos = positions.get(selectedSatelliteId);
  
  if (!sat) return <div className="text-gray-500">Loading satellite data...</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gray-900 p-3 rounded border border-gray-700">
        <h2 className="text-xl font-bold text-satellite-cyan">{sat.name}</h2>
        <div className="text-xs text-gray-400">NORAD: {sat.noradId} | INTL: {sat.intlDes}</div>
      </div>
      
      {pos && (
        <div className="bg-gray-900 p-3 rounded border border-gray-700">
          <h3 className="font-bold mb-2">Live Position</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Lat: {pos.lat.toFixed(4)}°</div>
            <div>Lon: {pos.lon.toFixed(4)}°</div>
            <div>Alt: {pos.alt.toFixed(2)} km</div>
            <div>Vel: {pos.vel.toFixed(2)} km/s</div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 p-3 rounded border border-gray-700">
        <h3 className="font-bold mb-2">Orbital Elements</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Inc: {sat.inclination}°</div>
          <div>Period: {sat.period.toFixed(2)} min</div>
          <div>Apogee: {sat.apogee.toFixed(1)} km</div>
          <div>Perigee: {sat.perigee.toFixed(1)} km</div>
        </div>
      </div>
    </div>
  );
}
