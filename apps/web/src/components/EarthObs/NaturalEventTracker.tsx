"use client";
import { useState } from 'react';
import { format } from 'date-fns';
import { useSatelliteStore } from '@/stores/satelliteStore';

export interface EonetEventItem {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  categoryTitle: string;
  date: string;
  lat: number;
  lon: number;
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
  sourceUrl: string | null;
}

interface NaturalEventTrackerProps {
  events: EonetEventItem[];
}

function getCategoryBadge(catId: string): string {
  switch (catId) {
    case 'wildfires':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    case 'volcanoes':
      return 'bg-red-500/20 text-red-300 border-red-500/40';
    case 'severeStorms':
      return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    case 'seaLakeIce':
      return 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40';
    default:
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
  }
}

export default function NaturalEventTracker({ events }: NaturalEventTrackerProps) {
  const [filter, setFilter] = useState<string>('ALL');
  const { showNaturalEvents, toggleNaturalEvents, flyToLocation } = useSatelliteStore();

  const filtered =
    filter === 'ALL' ? events : events.filter((e) => e.categoryId === filter);

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400">
            NASA EONET Natural Hazards
          </div>
          <div className="text-[11px] text-gray-500">
            Active Wildfires, Volcanoes, Cyclones & Sea Ice
          </div>
        </div>
        <button
          onClick={toggleNaturalEvents}
          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
            showNaturalEvents
              ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
              : 'bg-gray-800 text-gray-400 border-gray-700'
          }`}
        >
          {showNaturalEvents ? '3D Pins: ON' : '3D Pins: OFF'}
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1">
        {[
          { id: 'ALL', label: `All (${events.length})` },
          { id: 'wildfires', label: 'Wildfires' },
          { id: 'volcanoes', label: 'Volcanoes' },
          { id: 'severeStorms', label: 'Storms' },
          { id: 'seaLakeIce', label: 'Icebergs' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              filter === cat.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {filtered.map((ev) => (
          <div
            key={ev.id}
            onClick={() =>
              flyToLocation({
                lat: ev.lat,
                lon: ev.lon,
                altMeters: 600000,
                label: ev.title,
              })
            }
            className="bg-black/60 hover:bg-gray-800/70 border border-gray-800 rounded p-2 text-xs cursor-pointer transition-colors space-y-1"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-gray-100 truncate">{ev.title}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${getCategoryBadge(
                  ev.categoryId
                )}`}
              >
                {ev.categoryTitle}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span>
                Coords: {ev.lat}°, {ev.lon}°
                {ev.magnitudeValue ? ` • ${ev.magnitudeValue} ${ev.magnitudeUnit || ''}` : ''}
              </span>
              <span className="text-gray-500">{format(new Date(ev.date), 'MMM d, HH:mm')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
