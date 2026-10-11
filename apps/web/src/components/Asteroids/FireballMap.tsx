"use client";
import { format } from 'date-fns';
import { useSatelliteStore } from '@/stores/satelliteStore';

export interface FireballItem {
  id: string;
  date: string;
  lat: number;
  lon: number;
  altKm: number;
  velocityKms: number;
  totalRadiatedEnergyJ: number;
  impactEnergyKt: number;
}

interface FireballMapProps {
  fireballs: FireballItem[];
}

export default function FireballMap({ fireballs }: FireballMapProps) {
  const { showFireballs, toggleFireballs, flyToLocation } = useSatelliteStore();

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400">
            Atmospheric Bolides & Fireballs
          </div>
          <div className="text-[11px] text-gray-500">US Govt Sensor Detonations (JPL CNEOS)</div>
        </div>
        <button
          onClick={toggleFireballs}
          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
            showFireballs
              ? 'bg-red-500/20 text-red-300 border-red-500/50'
              : 'bg-gray-800 text-gray-400 border-gray-700'
          }`}
        >
          {showFireballs ? '3D Bolides: ON' : '3D Bolides: OFF'}
        </button>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {fireballs.slice(0, 15).map((fb) => (
          <div
            key={fb.id}
            onClick={() =>
              flyToLocation({
                lat: fb.lat,
                lon: fb.lon,
                altMeters: 1800000,
                label: `Bolide ${fb.impactEnergyKt} kt`,
              })
            }
            className="bg-black/50 hover:bg-gray-800/70 border border-gray-800 rounded p-2 text-xs cursor-pointer transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-mono text-gray-200 font-medium">
                {format(new Date(fb.date), 'yyyy-MM-dd HH:mm')} UTC
              </div>
              <div className="text-[10px] text-gray-500 font-mono">
                Lat: {fb.lat}°, Lon: {fb.lon}° • Alt: {fb.altKm} km • V: {fb.velocityKms} km/s
              </div>
            </div>
            <div className="text-right font-mono">
              <span
                className={`px-2 py-0.5 rounded font-bold text-[11px] border ${
                  fb.impactEnergyKt >= 10
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : fb.impactEnergyKt >= 1
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-gray-800 text-gray-300 border-gray-700'
                }`}
              >
                {fb.impactEnergyKt} kt TNT
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
