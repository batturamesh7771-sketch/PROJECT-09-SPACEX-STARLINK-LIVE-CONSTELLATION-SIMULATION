"use client";
import { CosmicRayStationReading, DsnAntennaLink } from '@cosmos/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSatelliteStore } from '@/stores/satelliteStore';
import { RadioTower, Zap, MapPin, Eye, EyeOff } from 'lucide-react';

interface Props {
  dsnLinks: DsnAntennaLink[];
  cosmicStations: CosmicRayStationReading[];
}

export default function DSNMonitor({ dsnLinks, cosmicStations }: Props) {
  const {
    showDsnComplexes,
    showCosmicRayStations,
    toggleDsnComplexes,
    toggleCosmicRayStations,
    flyToLocation,
  } = useSatelliteStore();

  return (
    <div className="space-y-4">
      {/* NASA Deep Space Network (DSN Now) */}
      <Card className="p-4 border-gray-800 bg-gray-900/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RadioTower className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
              NASA Deep Space Network (DSN Live)
            </h3>
          </div>
          <button
            onClick={toggleDsnComplexes}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
              showDsnComplexes
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            {showDsnComplexes ? (
              <Eye className="w-3 h-3 mr-1" />
            ) : (
              <EyeOff className="w-3 h-3 mr-1" />
            )}
            <span>3D Dishes</span>
          </button>
        </div>

        <div className="space-y-2">
          {dsnLinks.map((link) => (
            <div
              key={link.dishName}
              className="p-2.5 rounded bg-gray-950/80 border border-gray-800/80 hover:border-purple-500/40 transition space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">
                    {link.dishName}
                  </span>
                  <span className="text-[10px] text-purple-400 font-semibold ml-2">
                    {link.complex} Complex
                  </span>
                </div>
                <button
                  onClick={() =>
                    flyToLocation({
                      lat: link.complexLat,
                      lon: link.complexLon,
                      altMeters: 350000,
                      label: `DSN ${link.complex} (${link.dishName})`,
                    })
                  }
                  className="flex items-center space-x-1 px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-semibold transition"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Fly to Dish</span>
                </button>
              </div>

              <div className="flex items-center justify-between bg-gray-900/90 px-2.5 py-1.5 rounded border border-gray-800 text-[11px]">
                <div>
                  <span className="text-gray-400">Spacecraft: </span>
                  <span className="font-mono font-bold text-cyan-300">
                    {link.targetSpacecraft}
                  </span>
                </div>
                <div className="font-mono text-emerald-400 font-semibold">
                  ↓ {link.downDataRateKbps} kbps ({link.downSignalFreqGhz} GHz)
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400 font-mono">
                <div>
                  Az/El: {link.azimuthDeg}° / {link.elevationDeg}°
                </div>
                <div>RTLT: {link.roundTripLightTimeHours} hrs</div>
                <div className="text-right">
                  Dist: {link.distanceMillionKm.toLocaleString()}M km
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* NMDB Cosmic Ray Neutron Monitor Network */}
      <Card className="p-4 border-gray-800 bg-gray-900/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
              NMDB Cosmic Ray Neutron Monitors
            </h3>
          </div>
          <button
            onClick={toggleCosmicRayStations}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
              showCosmicRayStations
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            {showCosmicRayStations ? (
              <Eye className="w-3 h-3 mr-1" />
            ) : (
              <EyeOff className="w-3 h-3 mr-1" />
            )}
            <span>3D Stations</span>
          </button>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {cosmicStations.map((st) => (
            <div
              key={st.stationCode}
              className="p-2 rounded bg-gray-950/75 border border-gray-800/80 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold font-mono text-white">
                    {st.stationCode}
                  </span>
                  <span className="text-xs text-gray-300">{st.stationName}</span>
                  <Badge
                    variant={
                      st.status === 'NOMINAL'
                        ? 'success'
                        : st.status === 'FORBUSH_DECREASE'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {st.anomalyPercent > 0 ? `+${st.anomalyPercent}%` : `${st.anomalyPercent}%`}
                  </Badge>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {st.country} • Alt: {st.altitudeMeters}m • Rigidity:{' '}
                  {st.cutoffRigidityGv} GV • {st.countRateCps} cps
                </div>
              </div>
              <button
                onClick={() =>
                  flyToLocation({
                    lat: st.lat,
                    lon: st.lon,
                    altMeters: 500000,
                    label: `NMDB ${st.stationName}`,
                  })
                }
                className="p-1.5 rounded bg-gray-800 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-300 transition"
                title="Fly to Neutron Monitor Station on 3D Globe"
              >
                <MapPin className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
