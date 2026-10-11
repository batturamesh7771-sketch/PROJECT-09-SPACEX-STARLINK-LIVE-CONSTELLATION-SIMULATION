"use client";
import { useState } from 'react';

export interface PlanetaryBodyItem {
  bodyId: string;
  name: string;
  category: 'PLANET' | 'DWARF_PLANET' | 'MOON' | 'SPACECRAFT';
  heliocentricAu: {
    x: number;
    y: number;
    z: number;
    r: number;
    lonDeg: number;
  };
  geocentric: {
    distanceAu: number;
    lightTimeMinutes: number;
    raDeg: number;
    decDeg: number;
    elongationDeg: number;
  };
  orbitalSpeedKms: number;
  periodDays: number;
  radiusKm: number;
  colorHex: string;
}

interface SolarSystemViewProps {
  bodies: PlanetaryBodyItem[];
}

export default function SolarSystemView({ bodies }: SolarSystemViewProps) {
  const [selected, setSelected] = useState<PlanetaryBodyItem | null>(
    bodies.find((b) => b.name === 'Mars') || bodies[0] || null
  );

  const planets = bodies.filter((b) => b.category === 'PLANET');
  const spacecraft = bodies.filter((b) => b.category === 'SPACECRAFT');

  return (
    <div className="space-y-3">
      {/* Heliocentric 2D Interactive Orrery Map */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-gray-400">
            Heliocentric Solar System Orrery (J2000)
          </span>
          <span className="text-[10px] font-mono text-amber-400">Live Ephemeris</span>
        </div>

        <div className="relative bg-black/80 border border-gray-800 rounded-lg h-56 flex items-center justify-center overflow-hidden">
          <svg viewBox="-130 -130 260 260" className="w-full h-full">
            {/* Sun at Center */}
            <circle cx={0} cy={0} r={6} fill="#fbbf24" />
            <circle cx={0} cy={0} r={11} fill="#fbbf24" fillOpacity={0.2} />

            {/* Logarithmic / Scaled Orbit Rings & Planet Positions */}
            {planets.map((planet, idx) => {
              const orbitRadiusPx = 18 + idx * 13;
              const angleRad = (planet.heliocentricAu.lonDeg * Math.PI) / 180;
              const px = orbitRadiusPx * Math.cos(angleRad);
              const py = -orbitRadiusPx * Math.sin(angleRad);
              const isSel = selected?.bodyId === planet.bodyId;

              return (
                <g
                  key={planet.bodyId}
                  onClick={() => setSelected(planet)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={0}
                    cy={0}
                    r={orbitRadiusPx}
                    fill="none"
                    stroke={isSel ? '#38bdf8' : '#1f2937'}
                    strokeWidth={isSel ? 1.2 : 0.7}
                    strokeDasharray={idx > 3 ? '2 2' : undefined}
                  />
                  <circle
                    cx={px}
                    cy={py}
                    r={isSel ? 5 : 3.5}
                    fill={planet.colorHex}
                    stroke="#ffffff"
                    strokeWidth={isSel ? 1.5 : 0.5}
                  />
                  <text
                    x={px + 5}
                    y={py + 3}
                    fill="#d1d5db"
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    {planet.name.slice(0, 3)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Planet Telemetry Card */}
        {selected && (
          <div className="bg-black/60 border border-gray-800 rounded p-2.5 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: selected.colorHex }}
                />
                <span className="font-bold text-white text-sm">{selected.name}</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">
                Heliocentric Lon: {selected.heliocentricAu.lonDeg}°
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
              <div>
                <span className="text-gray-500 block text-[9px]">Sun Dist (r)</span>
                <span className="text-amber-300">{selected.heliocentricAu.r} AU</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px]">Earth Dist</span>
                <span className="text-cyan-300">{selected.geocentric.distanceAu} AU</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px]">One-Way Light</span>
                <span className="text-emerald-300">{selected.geocentric.lightTimeMinutes} min</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px]">Orbital Speed</span>
                <span className="text-gray-200">{selected.orbitalSpeedKms} km/s</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px]">RA / Dec</span>
                <span className="text-gray-300">
                  {selected.geocentric.raDeg}° / {selected.geocentric.decDeg}°
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px]">Mean Radius</span>
                <span className="text-gray-300">{selected.radiusKm.toLocaleString()} km</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deep Space Probes & Interplanetary Missions */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2">
        <div className="text-xs uppercase tracking-wider text-gray-400">
          Deep-Space Spacecraft Telemetry (JPL Horizons)
        </div>
        <div className="space-y-1.5">
          {spacecraft.map((sc) => (
            <div
              key={sc.bodyId}
              onClick={() => setSelected(sc)}
              className="bg-black/50 hover:bg-gray-800/70 border border-gray-800 rounded p-2 text-xs cursor-pointer transition-colors flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-gray-200">{sc.name}</div>
                <div className="text-[10px] text-gray-500 font-mono">
                  Speed: {sc.orbitalSpeedKms} km/s • Light-Time: {sc.geocentric.lightTimeMinutes} min
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-cyan-400 font-bold">{sc.heliocentricAu.r} AU</div>
                <div className="text-[10px] text-gray-500">from Sun</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
