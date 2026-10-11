"use client";
import { useEffect, useState } from 'react';
import {
  ExoplanetRecord,
  GravitationalWaveEvent,
  DeepSpaceObservation,
  StellarAndTransientObject,
  CosmicRayStationReading,
  DsnAntennaLink,
} from '@cosmos/types';
import {
  fetchExoplanets,
  fetchGravitationalWaves,
  fetchDeepSpaceObservations,
  fetchStellarTransients,
  fetchCosmicRayStations,
  fetchDsnLinks,
} from '@/lib/api';
import { useSatelliteStore } from '@/stores/satelliteStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import ExoplanetExplorer from './ExoplanetExplorer';
import GravitationalWaves from './GravitationalWaves';
import AstronomyGallery from './AstronomyGallery';
import DSNMonitor from './DSNMonitor';
import { RefreshCw } from 'lucide-react';

export default function DeepSpaceDashboard() {
  const [exoplanets, setExoplanets] = useState<ExoplanetRecord[]>([]);
  const [gwEvents, setGwEvents] = useState<GravitationalWaveEvent[]>([]);
  const [observations, setObservations] = useState<DeepSpaceObservation[]>([]);
  const [transients, setTransients] = useState<StellarAndTransientObject[]>([]);
  const [cosmicStations, setCosmicStations] = useState<CosmicRayStationReading[]>([]);
  const [dsnLinks, setDsnLinks] = useState<DsnAntennaLink[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    setDsnComplexMarkers,
    setCosmicRayMarkers,
    setActiveDsnLinkCount,
  } = useSatelliteStore();

  const loadAll = async () => {
    setLoading(true);
    try {
      const [exoRes, gwRes, obsRes, transRes, crRes, dsnRes] = await Promise.all([
        fetchExoplanets(false).catch(() => ({ data: [] })),
        fetchGravitationalWaves('ALL').catch(() => ({ data: [] })),
        fetchDeepSpaceObservations('ALL').catch(() => ({ data: [] })),
        fetchStellarTransients('ALL').catch(() => ({ data: [] })),
        fetchCosmicRayStations().catch(() => ({ data: [] })),
        fetchDsnLinks().catch(() => ({ data: [] })),
      ]);

      const exoList: ExoplanetRecord[] = exoRes?.data || [];
      const gwList: GravitationalWaveEvent[] = gwRes?.data || [];
      const obsList: DeepSpaceObservation[] = obsRes?.data || [];
      const transList: StellarAndTransientObject[] = transRes?.data || [];
      const crList: CosmicRayStationReading[] = crRes?.data || [];
      const dsnList: DsnAntennaLink[] = dsnRes?.data || [];

      setExoplanets(exoList);
      setGwEvents(gwList);
      setObservations(obsList);
      setTransients(transList);
      setCosmicStations(crList);
      setDsnLinks(dsnList);

      // Populate 3D Globe markers
      setDsnComplexMarkers(
        dsnList.map((d) => ({
          dishName: d.dishName,
          complex: d.complex,
          lat: d.complexLat,
          lon: d.complexLon,
          targetSpacecraft: d.targetSpacecraft,
          downDataRateKbps: d.downDataRateKbps,
        }))
      );
      setCosmicRayMarkers(
        crList.map((c) => ({
          stationCode: c.stationCode,
          stationName: c.stationName,
          lat: c.lat,
          lon: c.lon,
          countRateCps: c.countRateCps,
          anomalyPercent: c.anomalyPercent,
          status: c.status,
        }))
      );
      setActiveDsnLinkCount(dsnList.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-gray-400">
          Syncing NASA Exoplanet Archive, GWOSC, STScI MAST & DSN Telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white">
            Deep Space & Multi-Messenger Astrophysics
          </h2>
          <p className="text-[11px] text-gray-400">
            Exoplanets • LIGO/Virgo GWOSC • JWST/HST MAST • NASA DSN & NMDB
          </p>
        </div>
        <button
          onClick={loadAll}
          className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
          title="Refresh Deep Space Telemetry"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded bg-gray-900/90 border border-gray-800">
          <div className="text-sm font-mono font-bold text-emerald-400">
            {exoplanets.filter((p) => p.isHabitableZone).length}/{exoplanets.length}
          </div>
          <div className="text-[9px] uppercase text-gray-400">HZ Exoplanets</div>
        </div>
        <div className="p-2 rounded bg-gray-900/90 border border-gray-800">
          <div className="text-sm font-mono font-bold text-purple-400">
            {gwEvents.length}
          </div>
          <div className="text-[9px] uppercase text-gray-400">GW Mergers</div>
        </div>
        <div className="p-2 rounded bg-gray-900/90 border border-gray-800">
          <div className="text-sm font-mono font-bold text-amber-400">
            {observations.length + transients.length}
          </div>
          <div className="text-[9px] uppercase text-gray-400">MAST / Gaia</div>
        </div>
        <div className="p-2 rounded bg-gray-900/90 border border-gray-800">
          <div className="text-sm font-mono font-bold text-cyan-400">
            {dsnLinks.length}
          </div>
          <div className="text-[9px] uppercase text-gray-400">DSN Active</div>
        </div>
      </div>

      <ExoplanetExplorer exoplanets={exoplanets} />
      <GravitationalWaves events={gwEvents} />
      <AstronomyGallery observations={observations} transients={transients} />
      <DSNMonitor dsnLinks={dsnLinks} cosmicStations={cosmicStations} />
    </div>
  );
}
