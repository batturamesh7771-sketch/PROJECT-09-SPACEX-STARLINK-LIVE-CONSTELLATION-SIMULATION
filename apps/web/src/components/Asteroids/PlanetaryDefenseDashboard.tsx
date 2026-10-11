"use client";
import { useEffect, useState } from 'react';
import {
  fetchNeoCloseApproaches,
  fetchSentryRisks,
  fetchFireballEvents,
} from '@/lib/api';
import { useSatelliteStore } from '@/stores/satelliteStore';
import NEOTracker, { type NeoApproachItem } from './NEOTracker';
import AsteroidBrowser, { type SentryRiskItem } from './AsteroidBrowser';
import FireballMap, { type FireballItem } from './FireballMap';

export default function PlanetaryDefenseDashboard() {
  const [approaches, setApproaches] = useState<NeoApproachItem[]>([]);
  const [sentryRisks, setSentryRisks] = useState<SentryRiskItem[]>([]);
  const [fireballs, setFireballs] = useState<FireballItem[]>([]);
  const [selectedDesig, setSelectedDesig] = useState<string>('Apophis');
  const [loading, setLoading] = useState(true);

  const {
    setFireballMarkers,
    criticalConjunctionCount,
    setDefenseBadges,
  } = useSatelliteStore();

  useEffect(() => {
    let mounted = true;
    const loadDefenseData = async () => {
      try {
        const [cadRes, sentryRes, fbRes] = await Promise.all([
          fetchNeoCloseApproaches(15),
          fetchSentryRisks(),
          fetchFireballEvents(30),
        ]);

        if (!mounted) return;

        const cadList: NeoApproachItem[] = cadRes?.data || [];
        const sentryList: SentryRiskItem[] = sentryRes?.data || [];
        const fbList: FireballItem[] = fbRes?.data || [];

        setApproaches(cadList);
        setSentryRisks(sentryList);
        setFireballs(fbList);

        setFireballMarkers(
          fbList.map((f) => ({
            id: f.id,
            date: f.date,
            lat: f.lat,
            lon: f.lon,
            altKm: f.altKm,
            energyKt: f.impactEnergyKt,
          }))
        );

        setDefenseBadges(criticalConjunctionCount, cadList.length);
      } catch (e) {
        console.warn('Planetary defense fetch warning:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDefenseData();
  }, [setFireballMarkers, setDefenseBadges, criticalConjunctionCount]);

  if (loading && approaches.length === 0) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-44 bg-gray-900 rounded-lg border border-gray-800" />
        <div className="h-44 bg-gray-900 rounded-lg border border-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6">
      <NEOTracker
        approaches={approaches}
        onSelectDesignation={(des) => setSelectedDesig(des)}
      />

      <AsteroidBrowser
        sentryRisks={sentryRisks}
        initialQuery={selectedDesig}
      />

      <FireballMap fireballs={fireballs} />
    </div>
  );
}
