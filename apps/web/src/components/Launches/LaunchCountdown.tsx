"use client";
import { useEffect, useState } from 'react';
import { useSatelliteStore } from '@/stores/satelliteStore';

export interface LaunchItem {
  id: string;
  name: string;
  status: string;
  statusDescription: string;
  net: string;
  windowStart: string;
  windowEnd: string;
  probability: number | null;
  provider: {
    id: number;
    name: string;
    type: string;
    countryCode: string;
  };
  rocket: {
    id: number;
    name: string;
    family: string;
    fullName: string;
    variant: string;
    reusable?: boolean;
    lengthMeters?: number | null;
    diameterMeters?: number | null;
    leoCapacityKg?: number | null;
    gtoCapacityKg?: number | null;
  };
  mission: {
    id: number;
    name: string;
    type: string;
    description: string;
    orbitName: string;
    orbitAbbrev: string;
  } | null;
  pad: {
    id: number;
    name: string;
    locationName: string;
    countryCode: string;
    latitude: number;
    longitude: number;
    totalLaunchCount: number;
  };
  imageUrl: string | null;
  webcastLive: boolean;
  videoUrls: string[];
  orbitalStageCore?: {
    serial?: string;
    flightNumber?: number;
    reused?: boolean;
    landingAttempt?: boolean;
    landingSuccess?: boolean | null;
    landingType?: string | null;
    landpad?: string | null;
  };
}

interface LaunchCountdownProps {
  launch: LaunchItem | null;
  onSelectLaunch?: (launch: LaunchItem) => void;
}

export default function LaunchCountdown({ launch, onSelectLaunch }: LaunchCountdownProps) {
  const [now, setNow] = useState(Date.now());
  const { flyToLocation } = useSatelliteStore();

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!launch) {
    return (
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 text-xs text-gray-500">
        No upcoming launch scheduled.
      </div>
    );
  }

  const netMs = new Date(launch.net).getTime();
  const diffSec = Math.max(0, Math.floor((netMs - now) / 1000));
  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  const padNumber = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-amber-950/30 border border-amber-500/30 rounded-lg p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">
          Next Orbital Launch
        </span>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            launch.status === 'GO'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}
        >
          {launch.status}
        </span>
      </div>

      <div>
        <div
          onClick={() => onSelectLaunch?.(launch)}
          className="text-sm font-bold text-white hover:text-amber-300 cursor-pointer transition-colors"
        >
          {launch.name}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {launch.provider.name} • {launch.pad.name}
        </div>
      </div>

      {/* Live T-Minus Countdown Grid */}
      <div className="grid grid-cols-4 gap-1.5 text-center font-mono bg-black/60 border border-gray-800 rounded p-2">
        <div>
          <div className="text-lg font-bold text-amber-400">{padNumber(days)}</div>
          <div className="text-[9px] text-gray-500 uppercase">Days</div>
        </div>
        <div>
          <div className="text-lg font-bold text-amber-400">{padNumber(hours)}</div>
          <div className="text-[9px] text-gray-500 uppercase">Hrs</div>
        </div>
        <div>
          <div className="text-lg font-bold text-amber-400">{padNumber(minutes)}</div>
          <div className="text-[9px] text-gray-500 uppercase">Min</div>
        </div>
        <div>
          <div className="text-lg font-bold text-amber-400">{padNumber(seconds)}</div>
          <div className="text-[9px] text-gray-500 uppercase">Sec</div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <button
          onClick={() =>
            flyToLocation({
              lat: launch.pad.latitude,
              lon: launch.pad.longitude,
              altMeters: 350000,
              label: launch.pad.name,
            })
          }
          className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded py-1.5 text-xs font-medium transition-colors"
        >
          Fly to Pad ({launch.pad.countryCode})
        </button>
        {onSelectLaunch && (
          <button
            onClick={() => onSelectLaunch(launch)}
            className="px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded py-1.5 text-xs transition-colors"
          >
            Specs
          </button>
        )}
      </div>
    </div>
  );
}
