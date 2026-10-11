"use client";
import { useSatelliteStore } from '@/stores/satelliteStore';
import type { LaunchItem } from './LaunchCountdown';

interface LaunchDetailProps {
  launch: LaunchItem | null;
  onClose?: () => void;
}

export default function LaunchDetail({ launch, onClose }: LaunchDetailProps) {
  const { flyToLocation } = useSatelliteStore();

  if (!launch) return null;

  return (
    <div className="bg-gray-900/95 border border-cyan-500/40 rounded-lg p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-cyan-400">
            Mission & Vehicle Telemetry
          </div>
          <div className="text-sm font-bold text-white">{launch.name}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white px-1.5 py-0.5 rounded bg-gray-800"
          >
            ✕
          </button>
        )}
      </div>

      {/* Vehicle & Orbit Specs */}
      <div className="grid grid-cols-2 gap-1.5 text-xs bg-black/50 border border-gray-800 rounded p-2">
        <div>
          <span className="text-gray-500 block text-[10px]">Launch Vehicle</span>
          <span className="text-gray-200 font-medium">{launch.rocket.fullName}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-[10px]">Target Orbit</span>
          <span className="text-cyan-300 font-mono">
            {launch.mission?.orbitName || 'Low Earth Orbit'} ({launch.mission?.orbitAbbrev || 'LEO'})
          </span>
        </div>
        <div>
          <span className="text-gray-500 block text-[10px]">LEO / GTO Payload</span>
          <span className="text-gray-300 font-mono">
            {launch.rocket.leoCapacityKg ? `${launch.rocket.leoCapacityKg} kg` : 'N/A'} /{' '}
            {launch.rocket.gtoCapacityKg ? `${launch.rocket.gtoCapacityKg} kg` : 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block text-[10px]">Pad Coordinates</span>
          <span className="text-gray-300 font-mono">
            {launch.pad.latitude.toFixed(2)}°, {launch.pad.longitude.toFixed(2)}°
          </span>
        </div>
      </div>

      {launch.orbitalStageCore?.serial && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded px-2.5 py-1.5 text-xs flex items-center justify-between">
          <span className="text-amber-300">
            Booster Core: <strong className="font-mono">{launch.orbitalStageCore.serial}</strong>
          </span>
          <span className="text-[11px] font-mono text-gray-300">
            {launch.orbitalStageCore.landingType || 'Expendable'}{' '}
            {launch.orbitalStageCore.landpad ? `(${launch.orbitalStageCore.landpad})` : ''}
          </span>
        </div>
      )}

      {launch.mission?.description && (
        <p className="text-xs text-gray-400 leading-relaxed">{launch.mission.description}</p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() =>
            flyToLocation({
              lat: launch.pad.latitude,
              lon: launch.pad.longitude,
              altMeters: 250000,
              label: launch.pad.name,
            })
          }
          className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded py-1.5 text-xs font-medium"
        >
          Inspect Launch Complex on Globe
        </button>
        {launch.videoUrls.length > 0 && (
          <a
            href={launch.videoUrls[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded text-xs font-medium"
          >
            Webcast
          </a>
        )}
      </div>
    </div>
  );
}
