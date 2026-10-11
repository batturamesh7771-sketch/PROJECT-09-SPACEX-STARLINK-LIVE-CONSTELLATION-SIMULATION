"use client";
import { useState } from 'react';
import { GravitationalWaveEvent } from '@cosmos/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Activity, ExternalLink, Radio } from 'lucide-react';

interface Props {
  events: GravitationalWaveEvent[];
}

export default function GravitationalWaves({ events }: Props) {
  const [filterType, setFilterType] = useState<'ALL' | 'BBH' | 'BNS' | 'NSBH'>('ALL');

  const filtered =
    filterType === 'ALL'
      ? events
      : events.filter((e) => e.mergerType === filterType);

  const getMergerBadge = (type: GravitationalWaveEvent['mergerType']) => {
    switch (type) {
      case 'BNS':
        return <Badge variant="warning">BNS Kilonova</Badge>;
      case 'NSBH':
        return <Badge variant="info">NS-Black Hole</Badge>;
      default:
        return <Badge variant="default">Binary Black Hole</Badge>;
    }
  };

  return (
    <Card className="p-4 border-gray-800 bg-gray-900/70 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
            LIGO / Virgo / KAGRA (GWOSC)
          </h3>
        </div>
        <div className="flex space-x-1">
          {(['ALL', 'BBH', 'BNS', 'NSBH'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                filterType === type
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {filtered.map((ev) => (
          <div
            key={ev.commonName}
            className="p-2.5 rounded bg-gray-950/75 border border-gray-800/80 hover:border-purple-500/40 transition space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-bold font-mono text-white">
                  {ev.commonName}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {ev.catalogName}
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                {getMergerBadge(ev.mergerType)}
                <a
                  href={ev.referenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition"
                  title="Open GWOSC Event Portal"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Merger Equation Bar */}
            <div className="flex items-center justify-between bg-gray-900/90 px-2.5 py-1.5 rounded border border-gray-800 text-[11px] font-mono">
              <div className="text-cyan-300">
                M₁: <span className="font-bold">{ev.mass1Solar} M☉</span>
              </div>
              <span className="text-gray-500">+</span>
              <div className="text-indigo-300">
                M₂: <span className="font-bold">{ev.mass2Solar} M☉</span>
              </div>
              <span className="text-purple-400">➔</span>
              <div className="text-purple-300">
                M_f:{' '}
                <span className="font-bold">
                  {ev.finalMassSolar ? `${ev.finalMassSolar} M☉` : 'Remnant'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400 pt-0.5">
              <div>
                Chirp Mass:{' '}
                <span className="text-gray-200 font-mono">{ev.chirpMassSolar} M☉</span>
              </div>
              <div>
                Distance:{' '}
                <span className="text-gray-200 font-mono">
                  {ev.luminosityDistanceMpc} Mpc
                </span>
              </div>
              <div className="text-right">
                Network SNR:{' '}
                <span className="text-emerald-400 font-mono font-bold">
                  {ev.networkSnr}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
