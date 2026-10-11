"use client";
import { useSatelliteStore } from '@/stores/satelliteStore';
import { useState } from 'react';

export default function SearchPanel() {
  const { searchQuery, setSearchQuery, satellites, setSelectedSatellite } = useSatelliteStore();
  
  const results = Array.from(satellites.values()).filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.noradId.toString().includes(searchQuery)
  ).slice(0, 50);

  return (
    <div className="flex flex-col gap-4">
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search NORAD ID or Name..."
        className="bg-gray-900 border border-gray-700 p-2 rounded text-white"
      />
      <div className="flex flex-col gap-2">
        {results.map(sat => (
          <div 
            key={sat.noradId} 
            onClick={() => setSelectedSatellite(sat.noradId)}
            className="p-2 bg-gray-900 border border-gray-800 rounded cursor-pointer hover:border-satellite-cyan"
          >
            <div className="font-bold">{sat.name}</div>
            <div className="text-xs text-gray-400">ID: {sat.noradId}</div>
          </div>
        ))}
        {results.length === 0 && <div className="text-gray-500 text-center">No results found.</div>}
      </div>
    </div>
  );
}
