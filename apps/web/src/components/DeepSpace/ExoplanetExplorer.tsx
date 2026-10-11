"use client";
import { useState } from 'react';
import { ExoplanetRecord } from '@cosmos/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Globe2, Thermometer, Ruler, Compass } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface Props {
  exoplanets: ExoplanetRecord[];
}

export default function ExoplanetExplorer({ exoplanets }: Props) {
  const [habitableOnly, setHabitableOnly] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<ExoplanetRecord | null>(
    exoplanets[0] || null
  );

  const filtered = habitableOnly
    ? exoplanets.filter((p) => p.isHabitableZone)
    : exoplanets;

  const chartData = filtered.slice(0, 8).map((p) => ({
    name: p.plName.replace('TRAPPIST-1 ', 'T-1'),
    fullName: p.plName,
    esi: Number((p.esiScore * 100).toFixed(1)),
    rade: p.radeEarth ?? 1.0,
    habitable: p.isHabitableZone,
  }));

  return (
    <Card className="p-4 border-gray-800 bg-gray-900/70 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Globe2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
            NASA Exoplanet Archive (TAP)
          </h3>
        </div>
        <button
          onClick={() => setHabitableOnly(!habitableOnly)}
          className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
            habitableOnly
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'
          }`}
        >
          {habitableOnly ? 'Habitable Zone Only' : 'All Worlds'}
        </button>
      </div>

      {/* ESI Comparison Bar Chart */}
      {chartData.length > 0 && (
        <div className="bg-gray-950/80 border border-gray-800/80 rounded p-2.5">
          <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1.5">
            <span>Earth Similarity Index (ESI %)</span>
            <span className="text-emerald-400 font-mono">Green = Habitable Zone</span>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#9ca3af', fontSize: 9 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#9ca3af', fontSize: 9 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1f2937',
                    fontSize: '11px',
                  }}
                  formatter={(value: any, name: any) => [
                    `${value}%`,
                    name === 'esi' ? 'Earth Similarity' : name,
                  ]}
                />
                <Bar dataKey="esi" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={entry.habitable ? '#10b981' : '#38bdf8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Selected Planet Detail Banner */}
      {selectedPlanet && (
        <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white">{selectedPlanet.plName}</span>
              <span className="text-[10px] text-gray-400 ml-2">
                Host: {selectedPlanet.hostname} ({selectedPlanet.discYear})
              </span>
            </div>
            <Badge variant={selectedPlanet.isHabitableZone ? 'success' : 'info'}>
              ESI {(selectedPlanet.esiScore * 100).toFixed(0)}%
            </Badge>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-[10px] pt-1">
            <div className="bg-gray-900/90 p-1.5 rounded border border-gray-800">
              <div className="text-gray-500 flex items-center gap-1">
                <Ruler className="w-2.5 h-2.5 text-cyan-400" /> Radius
              </div>
              <div className="font-mono font-semibold text-gray-200">
                {selectedPlanet.radeEarth ? `${selectedPlanet.radeEarth} R⊕` : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-900/90 p-1.5 rounded border border-gray-800">
              <div className="text-gray-500 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-purple-400" /> Mass
              </div>
              <div className="font-mono font-semibold text-gray-200">
                {selectedPlanet.bmasseEarth ? `${selectedPlanet.bmasseEarth} M⊕` : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-900/90 p-1.5 rounded border border-gray-800">
              <div className="text-gray-500 flex items-center gap-1">
                <Thermometer className="w-2.5 h-2.5 text-amber-400" /> Eq Temp
              </div>
              <div className="font-mono font-semibold text-gray-200">
                {selectedPlanet.eqTempK ? `${selectedPlanet.eqTempK} K` : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-900/90 p-1.5 rounded border border-gray-800">
              <div className="text-gray-500 flex items-center gap-1">
                <Compass className="w-2.5 h-2.5 text-emerald-400" /> Dist
              </div>
              <div className="font-mono font-semibold text-gray-200">
                {selectedPlanet.distanceLightYears
                  ? `${selectedPlanet.distanceLightYears} ly`
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exoplanet Catalog List */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {filtered.map((planet) => {
          const isSelected = selectedPlanet?.plName === planet.plName;
          return (
            <button
              key={planet.plName}
              onClick={() => setSelectedPlanet(planet)}
              className={`w-full text-left p-2 rounded border transition flex items-center justify-between ${
                isSelected
                  ? 'bg-gray-800/90 border-emerald-500/50'
                  : 'bg-gray-950/60 border-gray-800/70 hover:bg-gray-800/40'
              }`}
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-semibold text-gray-200">
                    {planet.plName}
                  </span>
                  {planet.isHabitableZone && (
                    <span className="px-1.5 py-0.2 text-[9px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      HZ
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-400">
                  {planet.discoveryMethod} • Period:{' '}
                  {planet.orbPerDays ? `${planet.orbPerDays.toFixed(1)}d` : '—'} •{' '}
                  {planet.distanceLightYears ? `${planet.distanceLightYears} ly` : '—'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-emerald-400">
                  ESI {(planet.esiScore * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] font-mono text-gray-400">
                  {planet.radeEarth ? `${planet.radeEarth} R⊕` : '—'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
