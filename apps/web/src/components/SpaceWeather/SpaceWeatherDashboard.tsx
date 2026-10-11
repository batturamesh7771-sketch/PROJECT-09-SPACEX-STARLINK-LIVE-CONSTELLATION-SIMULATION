"use client";
import { useEffect, useState } from 'react';
import { fetchSpaceWeatherSummary, fetchAuroraForecast } from '@/lib/api';
import { useSatelliteStore } from '@/stores/satelliteStore';
import KpIndexGauge from './KpIndexGauge';
import SolarWindPanel from './SolarWindPanel';
import AuroraForecast from './AuroraForecast';
import SolarFlareTimeline from './SolarFlareTimeline';
import CMETracker from './CMETracker';

export default function SpaceWeatherDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [auroraTime, setAuroraTime] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const {
    auroraCoordinates,
    setAuroraCoordinates,
    setSpaceWeatherBadge,
  } = useSatelliteStore();

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [summaryRes, auroraRes] = await Promise.all([
          fetchSpaceWeatherSummary(),
          fetchAuroraForecast(),
        ]);

        if (!mounted) return;
        if (summaryRes?.data) {
          setSummary(summaryRes.data);
          if (summaryRes.data.currentKp) {
            setSpaceWeatherBadge(
              summaryRes.data.currentKp.kp,
              summaryRes.data.currentKp.stormLevel
            );
          }
        }
        if (auroraRes?.data?.coordinates) {
          setAuroraCoordinates(auroraRes.data.coordinates);
          setAuroraTime(auroraRes.data.forecastTime);
        }
      } catch (e) {
        console.warn('Space weather fetch warning:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [setAuroraCoordinates, setSpaceWeatherBadge]);

  if (loading && !summary) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-32 bg-gray-900 rounded-lg border border-gray-800" />
        <div className="h-36 bg-gray-900 rounded-lg border border-gray-800" />
        <div className="h-28 bg-gray-900 rounded-lg border border-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6">
      <KpIndexGauge
        current={summary?.currentKp || null}
        history={summary?.kpHistory || []}
        radioFlux107cm={summary?.radioFlux107cm}
      />

      <AuroraForecast
        pointCount={auroraCoordinates.length}
        forecastTime={auroraTime}
      />

      <SolarWindPanel
        current={summary?.currentSolarWind || null}
        history={summary?.solarWindHistory || []}
      />

      <SolarFlareTimeline
        currentXRay={summary?.currentXRay || null}
        flares={summary?.recentFlares || []}
      />

      <CMETracker cmes={summary?.recentCMEs || []} />
    </div>
  );
}
