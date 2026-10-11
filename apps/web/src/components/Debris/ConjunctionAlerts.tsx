"use client";
import { format } from 'date-fns';
import { useSatelliteStore } from '@/stores/satelliteStore';

export interface ConjunctionItem {
  cdmId: string;
  createdAt: string;
  tca: string;
  minRangeKm: number;
  radialMissKm: number;
  inTrackMissKm: number;
  crossTrackMissKm: number;
  relativeSpeedKms: number;
  collisionProbability: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  sat1: {
    noradId: number;
    name: string;
    objectType: string;
    operator: string;
    altitudeKm: number;
  };
  sat2: {
    noradId: number;
    name: string;
    objectType: string;
    operator: string;
    altitudeKm: number;
  };
}

interface ConjunctionAlertsProps {
  alerts: ConjunctionItem[];
}

function getRiskStyle(level: ConjunctionItem['riskLevel']): string {
  switch (level) {
    case 'CRITICAL':
      return 'bg-red-500/20 text-red-400 border-red-500/50';
    case 'HIGH':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    case 'MODERATE':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
    default:
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
  }
}

export default function ConjunctionAlerts({ alerts }: ConjunctionAlertsProps) {
  const { setSelectedSatellite } = useSatelliteStore();

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400">
            Conjunction Data Messages (CDM)
          </div>
          <div className="text-[11px] text-gray-500">18th SDS / SOCRATES Close-Approach Screening</div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
          {alerts.length} Active
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {alerts.map((cdm) => (
          <div
            key={cdm.cdmId}
            className="bg-black/60 border border-gray-800/90 rounded p-2.5 text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-gray-400">{cdm.cdmId}</span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getRiskStyle(
                  cdm.riskLevel
                )}`}
              >
                {cdm.riskLevel} (Pc: {cdm.collisionProbability.toExponential(1)})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 bg-gray-900/80 rounded p-1.5">
              <div
                onClick={() => setSelectedSatellite(cdm.sat1.noradId)}
                className="cursor-pointer hover:text-cyan-300 transition-colors"
              >
                <div className="font-semibold text-gray-100 truncate">{cdm.sat1.name}</div>
                <div className="text-[10px] text-gray-500 font-mono">
                  #{cdm.sat1.noradId} • {cdm.sat1.altitudeKm} km
                </div>
              </div>
              <div
                onClick={() => setSelectedSatellite(cdm.sat2.noradId)}
                className="cursor-pointer hover:text-orange-300 transition-colors border-l border-gray-800 pl-2"
              >
                <div className="font-semibold text-gray-200 truncate">{cdm.sat2.name}</div>
                <div className="text-[10px] text-gray-500 font-mono">
                  #{cdm.sat2.noradId} • {cdm.sat2.objectType}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-0.5">
              <span>
                Miss: <strong className="text-white">{(cdm.minRangeKm * 1000).toFixed(0)} m</strong>
              </span>
              <span>
                Vrel: <strong className="text-amber-400">{cdm.relativeSpeedKms} km/s</strong>
              </span>
              <span>TCA: {format(new Date(cdm.tca), 'MMM d, HH:mm')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
