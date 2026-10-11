"use client";
import { useState } from 'react';
import { format } from 'date-fns';
import type { LaunchItem } from './LaunchCountdown';

interface LaunchCalendarProps {
  upcoming: LaunchItem[];
  previous: LaunchItem[];
  selectedId: string | null;
  onSelect: (launch: LaunchItem) => void;
}

export default function LaunchCalendar({
  upcoming,
  previous,
  selectedId,
  onSelect,
}: LaunchCalendarProps) {
  const [mode, setMode] = useState<'upcoming' | 'previous'>('upcoming');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');

  const sourceList = mode === 'upcoming' ? upcoming : previous;
  const providers = Array.from(new Set(sourceList.map((l) => l.provider.name))).slice(0, 6);

  const filtered =
    providerFilter === 'ALL'
      ? sourceList
      : sourceList.filter((l) => l.provider.name === providerFilter);

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <button
            onClick={() => {
              setMode('upcoming');
              setProviderFilter('ALL');
            }}
            className={`px-2.5 py-1 rounded text-xs font-medium ${
              mode === 'upcoming'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            onClick={() => {
              setMode('previous');
              setProviderFilter('ALL');
            }}
            className={`px-2.5 py-1 rounded text-xs font-medium ${
              mode === 'previous'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Past ({previous.length})
          </button>
        </div>

        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="bg-black border border-gray-700 rounded px-2 py-1 text-[11px] text-gray-300"
        >
          <option value="ALL">All Providers</option>
          {providers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {filtered.map((launch) => {
          const isSelected = launch.id === selectedId;
          return (
            <div
              key={launch.id}
              onClick={() => onSelect(launch)}
              className={`p-2 rounded border cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500/60'
                  : 'bg-black/50 border-gray-800/80 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-100 truncate">
                  {launch.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 shrink-0">
                  {launch.mission?.orbitAbbrev || launch.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                <span className="truncate">{launch.provider.name}</span>
                <span className="font-mono text-[10px] text-gray-500 shrink-0">
                  {format(new Date(launch.net), 'MMM d, HH:mm')} UTC
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
