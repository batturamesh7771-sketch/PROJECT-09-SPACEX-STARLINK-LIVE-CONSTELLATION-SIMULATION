"use client";
import { format } from 'date-fns';

export interface SolarFlareItem {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime: string | null;
  classType: string;
  sourceLocation: string;
  activeRegionNum: number | null;
  link: string;
}

interface SolarFlareTimelineProps {
  currentXRay?: {
    flareClass: string;
    category: string;
    flux: number;
  } | null;
  flares: SolarFlareItem[];
}

function getFlareBadgeStyle(classType: string): string {
  const first = (classType || 'C')[0].toUpperCase();
  if (first === 'X') return 'bg-red-500/20 text-red-400 border-red-500/40';
  if (first === 'M') return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
  if (first === 'C') return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
  return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
}

export default function SolarFlareTimeline({ currentXRay, flares }: SolarFlareTimelineProps) {
  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-gray-400">
          GOES X-Ray & Solar Flares
        </span>
        {currentXRay && (
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getFlareBadgeStyle(
              currentXRay.flareClass
            )}`}
          >
            Now: {currentXRay.flareClass}
          </span>
        )}
      </div>

      {flares.length === 0 ? (
        <div className="text-xs text-gray-500 py-2">No major solar flares recorded in the past 7 days.</div>
      ) : (
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {flares.slice(0, 8).map((flr) => (
            <div
              key={flr.flrID}
              className="flex items-center justify-between bg-black/50 border border-gray-800/80 rounded px-2.5 py-1.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono font-bold px-1.5 py-0.5 rounded border text-[11px] ${getFlareBadgeStyle(
                    flr.classType
                  )}`}
                >
                  {flr.classType}
                </span>
                <div>
                  <div className="text-gray-200 font-medium">
                    Region {flr.activeRegionNum ? `AR${flr.activeRegionNum}` : flr.sourceLocation}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    Loc: {flr.sourceLocation}
                  </div>
                </div>
              </div>
              <div className="text-right font-mono text-[10px] text-gray-400">
                <div>Peak: {format(new Date(flr.peakTime), 'MMM d, HH:mm')}</div>
                <div className="text-gray-500">UTC</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
