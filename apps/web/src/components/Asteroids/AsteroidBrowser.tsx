"use client";
import { useState, useEffect } from 'react';
import { lookupSmallBody } from '@/lib/api';

export interface SentryRiskItem {
  designation: string;
  fullName: string;
  ipCumulative: number;
  psCumulative: number;
  psMax: number;
  tsMax: number;
  impactCount: number;
  yearRange: string;
  vImpactKms: number;
  diameterKm: number;
  hMag: number;
  lastObserved: string;
}

interface AsteroidBrowserProps {
  sentryRisks: SentryRiskItem[];
  initialQuery?: string;
}

export default function AsteroidBrowser({ sentryRisks, initialQuery }: AsteroidBrowserProps) {
  const [query, setQuery] = useState(initialQuery || 'Apophis');
  const [bodyDetail, setBodyDetail] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleLookup = async (searchName: string) => {
    if (!searchName.trim()) return;
    setSearching(true);
    try {
      const res = await lookupSmallBody(searchName);
      if (res?.data) {
        setBodyDetail(res.data);
      }
    } catch (e) {
      console.warn('SBDB lookup warning:', e);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleLookup(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="space-y-3">
      {/* JPL Small-Body Database (SBDB) Interactive Inspector */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2.5">
        <div className="text-xs uppercase tracking-wider text-gray-400">
          JPL Small-Body Database (SBDB) Inspector
        </div>

        <div className="flex gap-1.5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup(query)}
            placeholder="e.g. Apophis, Bennu, Eros, 1950 DA..."
            className="flex-1 bg-black border border-gray-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleLookup(query)}
            disabled={searching}
            className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded text-xs font-medium"
          >
            {searching ? '...' : 'Lookup'}
          </button>
        </div>

        {/* Quick Preset Chips */}
        <div className="flex flex-wrap gap-1">
          {['Apophis', 'Bennu', 'Ryugu', 'Didymos', '1950 DA'].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setQuery(preset);
                handleLookup(preset);
              }}
              className="text-[10px] px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono"
            >
              {preset}
            </button>
          ))}
        </div>

        {bodyDetail && (
          <div className="bg-black/60 border border-gray-800 rounded p-2.5 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300">{bodyDetail.fullName}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
                {bodyDetail.orbitClass}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
              <div>
                <span className="text-gray-500 block text-[9px]">Diameter</span>
                <span className="text-gray-200">
                  {bodyDetail.diameterKm ? `${bodyDetail.diameterKm} km` : 'Est. H=' + bodyDetail.hMag}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px]">Period</span>
                <span className="text-gray-200">
                  {bodyDetail.orbitalElements?.periodYears} yr
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px]">Earth MOID</span>
                <span className="text-amber-300">
                  {bodyDetail.orbitalElements?.moidAu ?? 'N/A'} AU
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px]">Semi-Major (a)</span>
                <span className="text-gray-300">
                  {bodyDetail.orbitalElements?.semiMajorAxisAu?.toFixed(3)} AU
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px]">Eccentricity</span>
                <span className="text-gray-300">
                  {bodyDetail.orbitalElements?.eccentricity?.toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px]">Inclination</span>
                <span className="text-gray-300">
                  {bodyDetail.orbitalElements?.inclinationDeg?.toFixed(2)}°
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* JPL CNEOS Sentry Earth Impact Risk Table */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-gray-400">
            JPL CNEOS Sentry Impact Risk Table
          </span>
          <span className="text-[10px] font-mono text-amber-400">Palermo / Torino</span>
        </div>

        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {sentryRisks.slice(0, 12).map((item) => (
            <div
              key={item.designation}
              onClick={() => {
                setQuery(item.designation);
                handleLookup(item.designation);
              }}
              className="bg-black/50 hover:bg-gray-800/70 border border-gray-800 rounded p-2 text-xs cursor-pointer transition-colors flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-gray-200">{item.fullName}</div>
                <div className="text-[10px] text-gray-500 font-mono">
                  Window: {item.yearRange} • {item.impactCount} solutions • Ø {item.diameterKm} km
                </div>
              </div>
              <div className="text-right font-mono">
                <div
                  className={`text-[11px] font-bold ${
                    item.psCumulative > -2 ? 'text-amber-400' : 'text-gray-300'
                  }`}
                >
                  PS: {item.psCumulative.toFixed(2)}
                </div>
                <div className="text-[10px] text-gray-500">
                  Ip: {item.ipCumulative.toExponential(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
