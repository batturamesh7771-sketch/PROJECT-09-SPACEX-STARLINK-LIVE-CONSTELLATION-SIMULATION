"use client";
import { useSatelliteStore } from '@/stores/satelliteStore';

const CONSTELLATIONS = ['STARLINK', 'ONEWEB', 'GPS', 'GALILEO', 'BEIDOU', 'GLONASS'];

export default function ConstellationPanel() {
  const { activeConstellation, setActiveConstellation } = useSatelliteStore();

  return (
    <div className="flex flex-col gap-2">
      <button 
        onClick={() => setActiveConstellation(null)}
        className={`p-2 rounded text-left ${activeConstellation === null ? 'bg-satellite-cyan/20 border-satellite-cyan border' : 'bg-gray-900 border border-gray-800 hover:border-gray-600'}`}
      >
        All Satellites
      </button>
      {CONSTELLATIONS.map(c => (
        <button 
          key={c}
          onClick={() => setActiveConstellation(c)}
          className={`p-2 rounded text-left ${activeConstellation === c ? 'bg-satellite-cyan/20 border-satellite-cyan border' : 'bg-gray-900 border border-gray-800 hover:border-gray-600'}`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
