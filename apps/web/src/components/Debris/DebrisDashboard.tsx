"use client";
import { useEffect, useState } from 'react';
import {
  fetchConjunctionAlerts,
  fetchDebrisDensity,
  fetchDiscosData,
  fetchReentries,
} from '@/lib/api';
import { useSatelliteStore } from '@/stores/satelliteStore';
import ConjunctionAlerts, { type ConjunctionItem } from './ConjunctionAlerts';
import DebrisMap, {
  type DensityShellItem,
  type FragmentationItem,
  type ReentryItem,
} from './DebrisMap';

export default function DebrisDashboard() {
  const [alerts, setAlerts] = useState<ConjunctionItem[]>([]);
  const [shells, setShells] = useState<DensityShellItem[]>([]);
  const [fragmentations, setFragmentations] = useState<FragmentationItem[]>([]);
  const [reentries, setReentries] = useState<ReentryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    setReentryMarkers,
    upcomingNeoCount,
    setDefenseBadges,
  } = useSatelliteStore();

  useEffect(() => {
    let mounted = true;
    const loadDebrisData = async () => {
      try {
        const [cdmRes, densityRes, discosRes, reentryRes] = await Promise.all([
          fetchConjunctionAlerts(),
          fetchDebrisDensity(),
          fetchDiscosData(10),
          fetchReentries(),
        ]);

        if (!mounted) return;

        const cdmList: ConjunctionItem[] = cdmRes?.data || [];
        const reentryList: ReentryItem[] = reentryRes?.data || [];

        setAlerts(cdmList);
        setShells(densityRes?.data || []);
        setFragmentations(discosRes?.data?.fragmentations || []);
        setReentries(reentryList);

        setReentryMarkers(
          reentryList.map((r) => ({
            noradId: r.noradId,
            name: r.name,
            lat: r.lat,
            lon: r.lon,
            perigeeKm: r.perigeeKm,
            status: r.status,
          }))
        );

        const highRiskCount = cdmList.filter(
          (c) => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH'
        ).length;
        setDefenseBadges(highRiskCount, upcomingNeoCount);
      } catch (e) {
        console.warn('Debris dashboard fetch warning:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDebrisData();
  }, [setReentryMarkers, setDefenseBadges, upcomingNeoCount]);

  if (loading && alerts.length === 0) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-44 bg-gray-900 rounded-lg border border-gray-800" />
        <div className="h-40 bg-gray-900 rounded-lg border border-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6">
      <ConjunctionAlerts alerts={alerts} />
      <DebrisMap
        shells={shells}
        fragmentations={fragmentations}
        reentries={reentries}
      />
    </div>
  );
}
