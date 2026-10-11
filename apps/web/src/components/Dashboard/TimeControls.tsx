"use client";
import { useSatelliteStore } from '@/stores/satelliteStore';
import { format } from 'date-fns';

export default function TimeControls() {
  const { simulationTime, isPlaying, togglePlaying, timeMultiplier, setTimeMultiplier } = useSatelliteStore();

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur border border-gray-700 rounded-full px-6 py-2 flex items-center gap-4 text-sm z-10">
      <button onClick={togglePlaying} className="text-white hover:text-satellite-cyan">
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <div className="text-gray-300 font-mono">
        {format(simulationTime, "yyyy-MM-dd HH:mm:ss 'UTC'")}
      </div>
      <div className="flex gap-2">
        {[1, 10, 60, 3600].map(mult => (
          <button 
            key={mult}
            onClick={() => setTimeMultiplier(mult)}
            className={`px-2 py-1 rounded text-xs ${timeMultiplier === mult ? 'bg-satellite-cyan text-black' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            {mult}x
          </button>
        ))}
      </div>
    </div>
  );
}
