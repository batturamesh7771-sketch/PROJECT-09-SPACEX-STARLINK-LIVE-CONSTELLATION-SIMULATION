"use client";
import { format } from 'date-fns';

export interface CMEItem {
  activityID: string;
  startTime: string;
  sourceLocation: string;
  activeRegionNum: number | null;
  note: string;
  speed: number | null;
  halfAngle: number | null;
  cmeType: string | null;
  isEarthDirected: boolean;
  estimatedArrivalTime: string | null;
}

interface CMETrackerProps {
  cmes: CMEItem[];
}

export default function CMETracker({ cmes }: CMETrackerProps) {
  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-gray-400">
          Coronal Mass Ejections (DONKI)
        </span>
        <span className="text-[10px] font-mono text-gray-500">{cmes.length} Tracked (7d)</span>
      </div>

      {cmes.length === 0 ? (
        <div className="text-xs text-gray-500 py-2">No CMEs detected in the past 7 days.</div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {cmes.slice(0, 6).map((cme) => (
            <div
              key={cme.activityID}
              className="bg-black/50 border border-gray-800/90 rounded p-2 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-gray-200">
                  {format(new Date(cme.startTime), 'MMM d, HH:mm')} UTC
                </span>
                {cme.isEarthDirected ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                    EARTH DIRECTED
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                    Off-Axis
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono">
                <span>Speed: {cme.speed ? `${cme.speed} km/s` : 'N/A'}</span>
                <span>Half-Angle: {cme.halfAngle ? `${cme.halfAngle}°` : 'N/A'}</span>
                <span>Loc: {cme.sourceLocation}</span>
              </div>

              {cme.estimatedArrivalTime && (
                <div className="text-[11px] text-amber-400 font-mono">
                  Est. Shock Arrival: {format(new Date(cme.estimatedArrivalTime), 'MMM d, HH:mm')} UTC
                </div>
              )}

              <p className="text-[11px] text-gray-500 line-clamp-2">{cme.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
