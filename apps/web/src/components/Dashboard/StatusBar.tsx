"use client";
import { useSatelliteStore } from '@/stores/satelliteStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  fetchSpaceWeatherSummary,
  fetchUpcomingLaunches,
  fetchConjunctionAlerts,
  fetchNeoCloseApproaches,
  fetchEonetEvents,
  fetchDsnLinks,
  fetchKeyVaultStats,
} from '@/lib/api';

export default function StatusBar() {
  const { connected } = useWebSocket();
  const {
    satellites,
    activeConstellation,
    currentKp,
    nextLaunchName,
    criticalConjunctionCount,
    upcomingNeoCount,
    activeEonetCount,
    activeDsnLinkCount,
    totalApiKeysInPool,
    offlineMode,
    activeGibsLayer,
    setSpaceWeatherBadge,
    setNextLaunchBadge,
    setDefenseBadges,
    setActiveEonetCount,
    setActiveDsnLinkCount,
    setTotalApiKeysInPool,
  } = useSatelliteStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const preloadBadges = async () => {
      try {
        const [weatherRes, launchRes, cdmRes, neoRes, eonetRes, dsnRes, vaultRes] =
          await Promise.all([
            fetchSpaceWeatherSummary(),
            fetchUpcomingLaunches(1),
            fetchConjunctionAlerts(),
            fetchNeoCloseApproaches(15),
            fetchEonetEvents(35),
            fetchDsnLinks(),
            fetchKeyVaultStats(),
          ]);
        if (weatherRes?.data?.currentKp) {
          setSpaceWeatherBadge(
            weatherRes.data.currentKp.kp,
            weatherRes.data.currentKp.stormLevel
          );
        }
        if (launchRes?.data?.length > 0) {
          setNextLaunchBadge(launchRes.data[0].name, launchRes.data[0].net);
        }
        const cdmList = cdmRes?.data || [];
        const highRiskCdms = cdmList.filter(
          (c: any) => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH'
        ).length;
        const neoList = neoRes?.data || [];
        setDefenseBadges(highRiskCdms, neoList.length);
        if (eonetRes?.data) {
          setActiveEonetCount(eonetRes.data.length);
        }
        if (dsnRes?.data) {
          setActiveDsnLinkCount(dsnRes.data.length);
        }
        if (vaultRes?.data?.totalKeysInRotation) {
          setTotalApiKeysInPool(vaultRes.data.totalKeysInRotation);
        }
      } catch {
        // Ignore initial badge fetch errors when backend is offline
      }
    };
    preloadBadges();
  }, [
    setSpaceWeatherBadge,
    setNextLaunchBadge,
    setDefenseBadges,
    setActiveEonetCount,
    setActiveDsnLinkCount,
    setTotalApiKeysInPool,
  ]);

  return (
    <div className="h-8 bg-black border-b border-gray-800 flex items-center px-4 text-xs justify-between">
      <div className="flex items-center gap-3 text-gray-400 overflow-x-auto">
        <div className="font-bold text-satellite-cyan tracking-widest">COSMOS</div>
        <div>Satellites: {satellites.size}</div>
        {activeConstellation && (
          <div className="text-cyan-400">Filter: {activeConstellation}</div>
        )}
        {activeGibsLayer && (
          <div className="text-emerald-400 font-mono">
            GIBS: {activeGibsLayer.wmtsLayerName.slice(0, 18)}
          </div>
        )}
        {currentKp !== null && (
          <div className="hidden md:flex items-center gap-1 border-l border-gray-800 pl-3">
            <span className="text-gray-500">Kp:</span>
            <span
              className={`font-mono font-bold ${
                currentKp >= 5 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {currentKp.toFixed(1)}
            </span>
          </div>
        )}
        {criticalConjunctionCount > 0 && (
          <div className="hidden lg:flex items-center gap-1 border-l border-gray-800 pl-3">
            <span className="text-red-400 font-mono font-bold">
              CDM Alerts: {criticalConjunctionCount}
            </span>
          </div>
        )}
        {upcomingNeoCount > 0 && (
          <div className="hidden xl:flex items-center gap-1 border-l border-gray-800 pl-3">
            <span className="text-cyan-300 font-mono">NEOs: {upcomingNeoCount}</span>
          </div>
        )}
        {activeEonetCount > 0 && (
          <div className="hidden xl:flex items-center gap-1 border-l border-gray-800 pl-3">
            <span className="text-orange-300 font-mono">EONET: {activeEonetCount}</span>
          </div>
        )}
        {activeDsnLinkCount > 0 && (
          <div className="hidden xl:flex items-center gap-1 border-l border-gray-800 pl-3">
            <span className="text-purple-400 font-mono">DSN Links: {activeDsnLinkCount}</span>
          </div>
        )}
        <div className="hidden xl:flex items-center gap-1 border-l border-gray-800 pl-3">
          <span className="text-emerald-400 font-mono">
            API Keys: {totalApiKeysInPool.toLocaleString()}
          </span>
        </div>
        {nextLaunchName && (
          <div className="hidden 2xl:flex items-center gap-1.5 border-l border-gray-800 pl-3 max-w-xs truncate">
            <span className="text-amber-400 font-semibold">Next Launch:</span>
            <span className="text-gray-300 truncate">{nextLaunchName}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-gray-400 shrink-0">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connected
                ? 'bg-green-500'
                : offlineMode
                ? 'bg-amber-400'
                : 'bg-cyan-400'
            }`}
          />
          {connected ? 'WS Live' : offlineMode ? 'Offline SGP4' : 'Local SGP4'}
        </div>
        <div className="font-mono">{format(time, "HH:mm:ss 'UTC'")}</div>
      </div>
    </div>
  );
}
