"use client";
import { useEffect, useState } from 'react';
import {
  fetchPlanetaryEphemerides,
  fetchMarsRoverPhotos,
  fetchPlanetaryDatasets,
  fetchPlanetaryMaps,
} from '@/lib/api';
import SolarSystemView, { type PlanetaryBodyItem } from './SolarSystemView';
import MarsRoverGallery, {
  type MarsPhotoItem,
  type PdsDatasetItem,
  type PlanetaryMapLayerItem,
} from './MarsRoverGallery';

export default function PlanetaryDashboard() {
  const [bodies, setBodies] = useState<PlanetaryBodyItem[]>([]);
  const [photos, setPhotos] = useState<MarsPhotoItem[]>([]);
  const [datasets, setDatasets] = useState<PdsDatasetItem[]>([]);
  const [maps, setMaps] = useState<PlanetaryMapLayerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadPlanetaryData = async () => {
      try {
        const [ephemRes, roverRes, pdsRes, mapsRes] = await Promise.all([
          fetchPlanetaryEphemerides(),
          fetchMarsRoverPhotos('curiosity'),
          fetchPlanetaryDatasets(),
          fetchPlanetaryMaps(),
        ]);

        if (!mounted) return;

        setBodies(ephemRes?.data || []);
        setPhotos(roverRes?.data || []);
        setDatasets(pdsRes?.data || []);
        setMaps(mapsRes?.data || []);
      } catch (e) {
        console.warn('Planetary dashboard fetch warning:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPlanetaryData();
  }, []);

  if (loading && bodies.length === 0) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-56 bg-gray-900 rounded-lg border border-gray-800" />
        <div className="h-44 bg-gray-900 rounded-lg border border-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6">
      <SolarSystemView bodies={bodies} />
      <MarsRoverGallery
        initialPhotos={photos}
        datasets={datasets}
        maps={maps}
      />
    </div>
  );
}
