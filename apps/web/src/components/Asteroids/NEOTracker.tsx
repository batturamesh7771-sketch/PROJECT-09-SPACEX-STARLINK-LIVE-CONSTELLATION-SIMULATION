"use client";

export interface NeoApproachItem {
  designation: string;
  fullName: string;
  orbitId: string;
  closeApproachDate: string;
  distAu: number;
  distLunar: number;
  distKm: number;
  vRelKms: number;
  vInfKms: number;
  hMag: number;
  estimatedDiameterMeters: {
    min: number;
    max: number;
  };
  isPotentiallyHazardous: boolean;
}

interface NEOTrackerProps {
  approaches: NeoApproachItem[];
  onSelectDesignation?: (des: string) => void;
}

export default function NEOTracker({ approaches, onSelectDesignation }: NEOTrackerProps) {
  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400">
            Near-Earth Object Flybys (JPL CAD)
          </div>
          <div className="text-[11px] text-gray-500">
            Close Approaches Within 15 Lunar Distances (LD)
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          {approaches.length} Tracked
        </span>
      </div>

      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {approaches.map((neo, idx) => (
          <div
            key={`${neo.designation}-${idx}`}
            onClick={() => onSelectDesignation?.(neo.designation)}
            className="bg-black/60 hover:bg-gray-800/70 border border-gray-800/90 rounded p-2 text-xs cursor-pointer transition-colors space-y-1"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-gray-100 truncate">{neo.fullName}</span>
              {neo.isPotentiallyHazardous ? (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 shrink-0">
                  PHA
                </span>
              ) : (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 shrink-0">
                  {neo.distLunar} LD
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-gray-400">
              <div>
                Dist: <span className="text-cyan-300">{neo.distLunar} LD</span>
              </div>
              <div>
                Vrel: <span className="text-amber-300">{neo.vRelKms} km/s</span>
              </div>
              <div>
                Size: {neo.estimatedDiameterMeters.min}–{neo.estimatedDiameterMeters.max}m
              </div>
            </div>

            <div className="text-[10px] text-gray-500 font-mono">
              Approach: {neo.closeApproachDate} UTC • H={neo.hMag}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
