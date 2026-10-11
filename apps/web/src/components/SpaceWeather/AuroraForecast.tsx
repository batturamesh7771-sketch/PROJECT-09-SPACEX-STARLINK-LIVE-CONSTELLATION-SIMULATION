"use client";
import { useSatelliteStore } from '@/stores/satelliteStore';

interface AuroraForecastProps {
  pointCount: number;
  forecastTime?: string;
}

export default function AuroraForecast({ pointCount, forecastTime }: AuroraForecastProps) {
  const { showAurora, toggleAurora, flyToLocation } = useSatelliteStore();

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400">
            OVATION Aurora Forecast
          </div>
          <div className="text-[11px] text-gray-500">
            Active Ionospheric Grid Cells: <span className="text-emerald-400 font-mono">{pointCount}</span>
          </div>
        </div>
        <button
          onClick={toggleAurora}
          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
            showAurora
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-gray-800 text-gray-400 border-gray-700'
          }`}
        >
          {showAurora ? '3D Oval: ON' : '3D Oval: OFF'}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => flyToLocation({ lat: 68, lon: -18, altMeters: 6500000, label: 'Aurora Borealis' })}
          className="flex-1 bg-black/50 hover:bg-gray-800 border border-gray-800 rounded py-1.5 text-xs text-emerald-400 transition-colors"
        >
          Fly to Aurora Borealis (North)
        </button>
        <button
          onClick={() => flyToLocation({ lat: -68, lon: 140, altMeters: 6500000, label: 'Aurora Australis' })}
          className="flex-1 bg-black/50 hover:bg-gray-800 border border-gray-800 rounded py-1.5 text-xs text-pink-400 transition-colors"
        >
          Fly to Aurora Australis (South)
        </button>
      </div>

      {forecastTime && (
        <div className="text-[10px] text-gray-500 font-mono">
          Forecast Valid: {new Date(forecastTime).toUTCString()}
        </div>
      )}
    </div>
  );
}
