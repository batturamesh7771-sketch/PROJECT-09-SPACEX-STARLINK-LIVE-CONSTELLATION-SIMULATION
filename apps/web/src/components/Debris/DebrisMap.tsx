"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { useSatelliteStore } from '@/stores/satelliteStore';

export interface DensityShellItem {
  altitudeKm: number;
  shellLabel: string;
  payloadCount: number;
  rocketBodyCount: number;
  debrisCount: number;
  spatialDensityPerMillionKm3: number;
}

export interface FragmentationItem {
  id: string;
  parentName: string;
  parentNoradId: number;
  eventDate: string;
  cause: string;
  altitudeKm: number;
  catalogedDebrisTotal: number;
  remainingInOrbit: number;
}

export interface ReentryItem {
  noradId: number;
  name: string;
  objectType: string;
  predictedEpoch: string;
  uncertaintyHours: number;
  inclinationDeg: number;
  perigeeKm: number;
  apogeeKm: number;
  lat: number;
  lon: number;
  status: 'MONITORING' | 'IMMINENT' | 'REENTERED';
}

interface DebrisMapProps {
  shells: DensityShellItem[];
  fragmentations: FragmentationItem[];
  reentries: ReentryItem[];
}

export default function DebrisMap({ shells, fragmentations, reentries }: DebrisMapProps) {
  const {
    showDebris,
    toggleDebris,
    showReentries,
    toggleReentries,
    flyToLocation,
  } = useSatelliteStore();

  const chartData = shells.map((s) => ({
    alt: `${s.altitudeKm}km`,
    Payloads: s.payloadCount,
    Debris: s.debrisCount,
    RocketBodies: s.rocketBodyCount,
  }));

  return (
    <div className="space-y-3">
      {/* Globe Layer Controls */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-2.5 flex items-center justify-between gap-2">
        <button
          onClick={toggleDebris}
          className={`flex-1 py-1.5 px-2 rounded text-xs font-medium border transition-colors ${
            showDebris
              ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
              : 'bg-gray-800 text-gray-400 border-gray-700'
          }`}
        >
          {showDebris ? '3D Debris Cloud: ON' : '3D Debris Cloud: OFF'}
        </button>
        <button
          onClick={toggleReentries}
          className={`flex-1 py-1.5 px-2 rounded text-xs font-medium border transition-colors ${
            showReentries
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
              : 'bg-gray-800 text-gray-400 border-gray-700'
          }`}
        >
          {showReentries ? 'Re-Entry Markers: ON' : 'Re-Entry Markers: OFF'}
        </button>
      </div>

      {/* Spatial Density by Altitude Shell Chart */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2">
        <div className="text-xs uppercase tracking-wider text-gray-400">
          Cataloged Objects by Orbital Altitude Shell
        </div>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <XAxis dataKey="alt" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="Payloads" stackId="a" fill="#00d4ff" />
              <Bar dataKey="Debris" stackId="a" fill="#ef4444" />
              <Bar dataKey="RocketBodies" stackId="a" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Major Orbital Fragmentation Events (ESA DISCOS) */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-gray-400">
            Major Breakup Events (ESA DISCOS)
          </span>
          <span className="text-[10px] font-mono text-gray-500">Top Debris Sources</span>
        </div>
        <div className="space-y-1.5">
          {fragmentations.map((frag) => (
            <div
              key={frag.id}
              className="bg-black/50 border border-gray-800 rounded px-2.5 py-1.5 text-xs flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-gray-200">{frag.parentName}</div>
                <div className="text-[10px] text-gray-500 font-mono">
                  {frag.eventDate} • {frag.cause.replace('_', ' ')} @ {frag.altitudeKm} km
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-red-400 font-bold">{frag.remainingInOrbit} in orbit</div>
                <div className="text-[10px] text-gray-500">of {frag.catalogedDebrisTotal} cat.</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Atmospheric Re-Entry Monitor */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2">
        <div className="text-xs uppercase tracking-wider text-gray-400">
          Atmospheric Re-Entry & Decay Monitor
        </div>
        <div className="space-y-1.5">
          {reentries.map((re) => (
            <div
              key={re.noradId}
              onClick={() =>
                flyToLocation({
                  lat: re.lat,
                  lon: re.lon,
                  altMeters: 1500000,
                  label: re.name,
                })
              }
              className="bg-black/50 hover:bg-gray-800/70 border border-gray-800 rounded p-2 text-xs cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-200">{re.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    re.status === 'IMMINENT'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      : re.status === 'REENTERED'
                      ? 'bg-gray-800 text-gray-400'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  }`}
                >
                  {re.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mt-1">
                <span>
                  Perigee: {re.perigeeKm} km • Inc: {re.inclinationDeg}°
                </span>
                <span>
                  Window: {format(new Date(re.predictedEpoch), 'MMM d, HH:mm')} ±{re.uncertaintyHours}h
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
