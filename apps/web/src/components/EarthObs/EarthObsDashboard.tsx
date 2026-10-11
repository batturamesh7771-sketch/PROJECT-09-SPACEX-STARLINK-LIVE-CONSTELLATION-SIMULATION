"use client";
import { useEffect, useState } from 'react';
import {
  fetchEonetEvents,
  fetchGibsLayers,
  fetchEarthObsScenes,
} from '@/lib/api';
import { useSatelliteStore } from '@/stores/satelliteStore';
import EarthImageryOverlay, {
  type GibsLayerItem,
  type EarthSceneItem,
} from './EarthImageryOverlay';
import NaturalEventTracker, { type EonetEventItem } from './NaturalEventTracker';

export default function EarthObsDashboard() {
  const [events, setEvents] = useState<EonetEventItem[]>([]);
  const [gibsLayers, setGibsLayers] = useState<GibsLayerItem[]>([]);
  const [scenes, setScenes] = useState<EarthSceneItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { setNaturalEventMarkers, setActiveEonetCount } = useSatelliteStore();

  useEffect(() => {
    let mounted = true;
    const loadEarthObs = async () => {
      try {
        const [eonetRes, gibsRes, scenesRes] = await Promise.all([
          fetchEonetEvents(35),
          fetchGibsLayers(),
          fetchEarthObsScenes(),
        ]);

        if (!mounted) return;

        const evList: EonetEventItem[] = eonetRes?.data || [];
        setEvents(evList);
        setGibsLayers(gibsRes?.data || []);
        setScenes(scenesRes?.data || []);

        setNaturalEventMarkers(
          evList.map((e) => ({
            id: e.id,
            title: e.title,
            categoryId: e.categoryId,
            categoryTitle: e.categoryTitle,
            lat: e.lat,
            lon: e.lon,
          }))
        );
        setActiveEonetCount(evList.length);
      } catch (e) {
        console.warn('Earth observation fetch warning:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadEarthObs();
  }, [setNaturalEventMarkers, setActiveEonetCount]);

  if (loading && events.length === 0) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-44 bg-gray-900 rounded-lg border border-gray-800" />
        <div className="h-44 bg-gray-900 rounded-lg border border-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6">
      <NaturalEventTracker events={events} />
      <EarthImageryOverlay gibsLayers={gibsLayers} scenes={scenes} />
    </div>
  );
}
