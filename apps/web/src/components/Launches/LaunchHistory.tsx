"use client";
import { format } from 'date-fns';

export interface SpaceXStats {
  totalLaunches: number;
  successfulLaunches: number;
  totalLandings: number;
  reflighCount: number;
  activeStarlinkCount: number;
}

export interface SpaceNewsItem {
  id: number;
  title: string;
  url: string;
  imageUrl: string;
  newsSite: string;
  summary: string;
  publishedAt: string;
}

interface LaunchHistoryProps {
  spacexStats: SpaceXStats | null;
  news: SpaceNewsItem[];
}

export default function LaunchHistory({ spacexStats, news }: LaunchHistoryProps) {
  return (
    <div className="space-y-3">
      {/* Reusable Fleet & Booster Recovery Stats */}
      {spacexStats && (
        <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2">
          <div className="text-xs uppercase tracking-wider text-gray-400">
            Orbital Reusability & Fleet Telemetry
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-black/50 border border-gray-800 rounded p-2">
              <div className="text-[10px] text-gray-400">Total Missions</div>
              <div className="text-sm font-bold font-mono text-white">
                {spacexStats.totalLaunches}
              </div>
            </div>
            <div className="bg-black/50 border border-gray-800 rounded p-2">
              <div className="text-[10px] text-gray-400">Booster Landings</div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                {spacexStats.totalLandings}
              </div>
            </div>
            <div className="bg-black/50 border border-gray-800 rounded p-2">
              <div className="text-[10px] text-gray-400">Core Reflights</div>
              <div className="text-sm font-bold font-mono text-amber-400">
                {spacexStats.reflighCount}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Spaceflight News Feed (SNAPI v4) */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-gray-400">
            Spaceflight News Stream (SNAPI v4)
          </span>
          <span className="text-[10px] font-mono text-cyan-400">Live Feed</span>
        </div>

        {news.length === 0 ? (
          <div className="text-xs text-gray-500 py-2">Loading latest spaceflight dispatches...</div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {news.slice(0, 10).map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-black/50 hover:bg-gray-800/70 border border-gray-800 rounded p-2 transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono mb-0.5">
                  <span>{item.newsSite}</span>
                  <span className="text-gray-500">
                    {format(new Date(item.publishedAt), 'MMM d, HH:mm')}
                  </span>
                </div>
                <div className="text-xs font-medium text-gray-200 line-clamp-2">
                  {item.title}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
