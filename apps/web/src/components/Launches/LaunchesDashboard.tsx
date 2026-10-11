"use client";
import { useEffect, useState } from 'react';
import {
  fetchUpcomingLaunches,
  fetchPreviousLaunches,
  fetchSpaceXStats,
  fetchSpaceNews,
} from '@/lib/api';
import { useSatelliteStore } from '@/stores/satelliteStore';
import LaunchCountdown, { type LaunchItem } from './LaunchCountdown';
import LaunchCalendar from './LaunchCalendar';
import LaunchDetail from './LaunchDetail';
import LaunchHistory, { type SpaceXStats, type SpaceNewsItem } from './LaunchHistory';

export default function LaunchesDashboard() {
  const [upcoming, setUpcoming] = useState<LaunchItem[]>([]);
  const [previous, setPrevious] = useState<LaunchItem[]>([]);
  const [selectedLaunch, setSelectedLaunch] = useState<LaunchItem | null>(null);
  const [spacexStats, setSpacexStats] = useState<SpaceXStats | null>(null);
  const [news, setNews] = useState<SpaceNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    showLaunchPads,
    toggleLaunchPads,
    setLaunchPadMarkers,
    setNextLaunchBadge,
  } = useSatelliteStore();

  useEffect(() => {
    let mounted = true;
    const loadLaunches = async () => {
      try {
        const [upRes, prevRes, sxRes, newsRes] = await Promise.all([
          fetchUpcomingLaunches(15),
          fetchPreviousLaunches(10),
          fetchSpaceXStats(),
          fetchSpaceNews(12),
        ]);

        if (!mounted) return;

        const upList: LaunchItem[] = upRes?.data || [];
        const prevList: LaunchItem[] = prevRes?.data || [];

        setUpcoming(upList);
        setPrevious(prevList);
        setSpacexStats(sxRes?.data || null);
        setNews(newsRes?.data || []);

        if (upList.length > 0) {
          setNextLaunchBadge(upList[0].name, upList[0].net);
          setLaunchPadMarkers(
            upList.map((l) => ({
              id: l.id,
              name: l.name,
              padName: l.pad.name,
              lat: l.pad.latitude,
              lon: l.pad.longitude,
              net: l.net,
              provider: l.provider.name,
            }))
          );
        }
      } catch (e) {
        console.warn('Launch telemetry fetch warning:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLaunches();
    const timer = setInterval(loadLaunches, 120 * 1000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [setLaunchPadMarkers, setNextLaunchBadge]);

  if (loading && upcoming.length === 0) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-36 bg-gray-900 rounded-lg border border-gray-800" />
        <div className="h-48 bg-gray-900 rounded-lg border border-gray-800" />
        <div className="h-32 bg-gray-900 rounded-lg border border-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6">
      <div className="flex items-center justify-between bg-gray-900/70 border border-gray-800 rounded px-3 py-1.5">
        <span className="text-xs text-gray-300">3D Globe Launch Pad Markers</span>
        <button
          onClick={toggleLaunchPads}
          className={`px-2 py-0.5 rounded text-xs font-medium border ${
            showLaunchPads
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-gray-800 text-gray-400 border-gray-700'
          }`}
        >
          {showLaunchPads ? 'Pads: ON' : 'Pads: OFF'}
        </button>
      </div>

      <LaunchCountdown
        launch={upcoming[0] || null}
        onSelectLaunch={(l) => setSelectedLaunch(l)}
      />

      {selectedLaunch && (
        <LaunchDetail
          launch={selectedLaunch}
          onClose={() => setSelectedLaunch(null)}
        />
      )}

      <LaunchCalendar
        upcoming={upcoming}
        previous={previous}
        selectedId={selectedLaunch?.id || null}
        onSelect={(l) => setSelectedLaunch(l)}
      />

      <LaunchHistory spacexStats={spacexStats} news={news} />
    </div>
  );
}
