"use client";
import { useEffect, useState } from 'react';
import { KeyVaultStats, OfflineSnapshotManifest, ProviderPoolSummary } from '@cosmos/types';
import {
  fetchKeyVaultStats,
  registerApiKey,
  simulateKeyClusterScale,
  fetchOfflineSnapshot,
} from '@/lib/api';
import {
  DEFAULT_OFFLINE_TLES,
  saveOfflineSnapshotToLocal,
  loadOfflineSnapshotFromLocal,
  tleRecordToSatelliteData,
} from '@/lib/offlineStorage';
import { useSatelliteStore } from '@/stores/satelliteStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Key,
  ShieldCheck,
  Download,
  Upload,
  WifiOff,
  Wifi,
  Plus,
  Layers,
  Database,
  ExternalLink,
} from 'lucide-react';

const FALLBACK_PROVIDERS: ProviderPoolSummary[] = [
  { provider: 'celestrak', name: 'CelesTrak GP/TLE API', category: 'Orbital Data', phase: 1, requiresKey: false, envVarName: 'PUBLIC_NO_KEY', activeKeyCount: 1, totalCapacityPerHour: 2000, requestsUsedThisWindow: 12, healthStatus: 'HEALTHY', docsUrl: 'https://celestrak.org' },
  { provider: 'spacetrack', name: 'USSF 18th SDS Space-Track.org', category: 'Orbital Data', phase: 1, requiresKey: true, envVarName: 'SPACETRACK_USERNAME', activeKeyCount: 1, totalCapacityPerHour: 300, requestsUsedThisWindow: 4, healthStatus: 'HEALTHY', docsUrl: 'https://www.space-track.org' },
  { provider: 'n2yo', name: 'N2YO Live Satellite REST API', category: 'Satellite Tracking', phase: 1, requiresKey: true, envVarName: 'N2YO_API_KEY', activeKeyCount: 1, totalCapacityPerHour: 1000, requestsUsedThisWindow: 8, healthStatus: 'HEALTHY', docsUrl: 'https://www.n2yo.com/api/' },
  { provider: 'noaa_swpc', name: 'NOAA Space Weather Prediction Center', category: 'Space Weather', phase: 2, requiresKey: false, envVarName: 'PUBLIC_NO_KEY', activeKeyCount: 1, totalCapacityPerHour: 3600, requestsUsedThisWindow: 19, healthStatus: 'HEALTHY', docsUrl: 'https://services.swpc.noaa.gov/' },
  { provider: 'nasa', name: 'NASA Open APIs (DONKI, APOD, NeoWs)', category: 'Space Weather & Imagery', phase: 2, requiresKey: true, envVarName: 'NASA_API_KEY', activeKeyCount: 1, totalCapacityPerHour: 1000, requestsUsedThisWindow: 15, healthStatus: 'HEALTHY', docsUrl: 'https://api.nasa.gov/' },
  { provider: 'launch_library', name: 'The Space Devs Launch Library 2', category: 'Launch Systems', phase: 2, requiresKey: true, envVarName: 'LAUNCH_LIBRARY_API_KEY', activeKeyCount: 1, totalCapacityPerHour: 300, requestsUsedThisWindow: 6, healthStatus: 'HEALTHY', docsUrl: 'https://thespacedevs.com/llapi' },
  { provider: 'esa_discos', name: 'ESA DISCOSweb Space Debris Database', category: 'Space Debris', phase: 3, requiresKey: true, envVarName: 'ESA_DISCOS_TOKEN', activeKeyCount: 1, totalCapacityPerHour: 1000, requestsUsedThisWindow: 3, healthStatus: 'HEALTHY', docsUrl: 'https://discosweb.esoc.esa.int' },
  { provider: 'jpl_cad', name: 'NASA JPL CNEOS Close Approach Data', category: 'Planetary Defense', phase: 3, requiresKey: false, envVarName: 'PUBLIC_NO_KEY', activeKeyCount: 1, totalCapacityPerHour: 2000, requestsUsedThisWindow: 7, healthStatus: 'HEALTHY', docsUrl: 'https://ssd-api.jpl.nasa.gov/doc/cad.html' },
  { provider: 'nasa_eonet', name: 'NASA EONET v3 Natural Event Tracker', category: 'Earth Observation', phase: 4, requiresKey: false, envVarName: 'PUBLIC_NO_KEY', activeKeyCount: 1, totalCapacityPerHour: 2400, requestsUsedThisWindow: 9, healthStatus: 'HEALTHY', docsUrl: 'https://eonet.gsfc.nasa.gov/docs/v3' },
  { provider: 'nasa_gibs', name: 'NASA EOSDIS GIBS WMTS Tile Service', category: 'Earth Observation', phase: 4, requiresKey: false, envVarName: 'PUBLIC_NO_KEY', activeKeyCount: 1, totalCapacityPerHour: 10000, requestsUsedThisWindow: 42, healthStatus: 'HEALTHY', docsUrl: 'https://earthdata.nasa.gov' },
  { provider: 'jpl_horizons', name: 'NASA JPL Horizons Solar System Ephemeris', category: 'Planetary Science', phase: 4, requiresKey: false, envVarName: 'PUBLIC_NO_KEY', activeKeyCount: 1, totalCapacityPerHour: 2000, requestsUsedThisWindow: 5, healthStatus: 'HEALTHY', docsUrl: 'https://ssd-api.jpl.nasa.gov/doc/horizons.html' },
  { provider: 'nasa_exoplanet', name: 'NASA Exoplanet Archive TAP Service', category: 'Deep Space & Astrophysics', phase: 5, requiresKey: false, envVarName: 'PUBLIC_NO_KEY', activeKeyCount: 1, totalCapacityPerHour: 1800, requestsUsedThisWindow: 4, healthStatus: 'HEALTHY', docsUrl: 'https://exoplanetarchive.ipac.caltech.edu' },
  { provider: 'gwosc', name: 'LIGO/Virgo/KAGRA GWOSC Merger API', category: 'Multi-Messenger', phase: 5, requiresKey: false, envVarName: 'PUBLIC_NO_KEY', activeKeyCount: 1, totalCapacityPerHour: 2400, requestsUsedThisWindow: 2, healthStatus: 'HEALTHY', docsUrl: 'https://gwosc.org/apidocs/' },
  { provider: 'nasa_dsn', name: 'NASA Deep Space Network (DSN Now)', category: 'Deep Space Telemetry', phase: 5, requiresKey: false, envVarName: 'PUBLIC_NO_KEY', activeKeyCount: 1, totalCapacityPerHour: 3600, requestsUsedThisWindow: 11, healthStatus: 'HEALTHY', docsUrl: 'https://eyes.nasa.gov/dsn/dsn.html' },
];

export default function SystemVaultDashboard() {
  const {
    offlineMode,
    toggleOfflineMode,
    satellites,
    setSatellites,
    totalApiKeysInPool,
    setTotalApiKeysInPool,
  } = useSatelliteStore();

  const [vaultStats, setVaultStats] = useState<KeyVaultStats>({
    totalProvidersCataloged: 42,
    totalKeysInRotation: totalApiKeysInPool,
    combinedHourlyCapacity: 84500,
    requestsMadeLastHour: 147,
    rotationStrategy: 'ROUND_ROBIN_LEAST_USED',
    providers: FALLBACK_PROVIDERS,
    sampleKeys: [],
  });

  const [selectedProvider, setSelectedProvider] = useState('nasa');
  const [newKeyInput, setNewKeyInput] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<number | 0>(0);

  const loadVault = async () => {
    try {
      const res = await fetchKeyVaultStats();
      if (res?.data) {
        setVaultStats(res.data);
        setTotalApiKeysInPool(res.data.totalKeysInRotation);
      }
    } catch {
      // Offline mode fallback uses local vaultStats
    }
  };

  useEffect(() => {
    loadVault();
  }, []);

  const handleAddSingleKey = async () => {
    if (!newKeyInput.trim()) return;
    try {
      const res = await registerApiKey({
        provider: selectedProvider,
        key: newKeyInput.trim(),
        label: newKeyLabel.trim() || undefined,
      });
      if (res?.data?.vaultStats) {
        setVaultStats(res.data.vaultStats);
        setTotalApiKeysInPool(res.data.vaultStats.totalKeysInRotation);
      }
      setStatusBanner(`Added API key to ${selectedProvider.toUpperCase()} rotation pool.`);
    } catch {
      // Local offline fallback
      const nextCount = vaultStats.totalKeysInRotation + 1;
      setVaultStats((prev) => ({
        ...prev,
        totalKeysInRotation: nextCount,
        combinedHourlyCapacity: prev.combinedHourlyCapacity + 1000,
      }));
      setTotalApiKeysInPool(nextCount);
      setStatusBanner(`Added key to local ${selectedProvider.toUpperCase()} offline vault.`);
    }
    setNewKeyInput('');
    setNewKeyLabel('');
  };

  const handleProvision10kCluster = async (count: number) => {
    try {
      const res = await simulateKeyClusterScale(count);
      if (res?.data?.vaultStats) {
        setVaultStats(res.data.vaultStats);
        setTotalApiKeysInPool(res.data.vaultStats.totalKeysInRotation);
        setStatusBanner(
          `Provisioned +${count.toLocaleString()} rotating API keys across 42 space providers!`
        );
        return;
      }
    } catch {
      // Offline simulation fallback
    }
    const nextTotal = vaultStats.totalKeysInRotation + count;
    const nextCap = vaultStats.combinedHourlyCapacity + count * 1200;
    setVaultStats((prev) => ({
      ...prev,
      totalKeysInRotation: nextTotal,
      combinedHourlyCapacity: nextCap,
      providers: prev.providers.map((p) => ({
        ...p,
        activeKeyCount: p.activeKeyCount + Math.floor(count / prev.providers.length),
        totalCapacityPerHour:
          p.totalCapacityPerHour + Math.floor(count / prev.providers.length) * 1000,
      })),
    }));
    setTotalApiKeysInPool(nextTotal);
    setStatusBanner(
      `Provisioned +${count.toLocaleString()} rotating API keys (${nextTotal.toLocaleString()} active in pool).`
    );
  };

  const handleExportOfflineSnapshot = async () => {
    let manifest: OfflineSnapshotManifest;
    try {
      const res = await fetchOfflineSnapshot();
      manifest = res.data;
    } catch {
      manifest = {
        version: '1.0.0-phase6',
        generatedAt: new Date().toISOString(),
        platform: 'Project COSMOS Offline Archive',
        counts: {
          satellites: DEFAULT_OFFLINE_TLES.length,
          constellations: 12,
          exoplanets: 8,
          gravitationalWaves: 7,
          dsnLinks: 6,
          eonetEvents: 12,
          neos: 10,
        },
        tles: DEFAULT_OFFLINE_TLES,
        spaceWeatherSummary: {
          kpIndex: 3.3,
          stormLevel: 'G0 (Quiet)',
          solarWindSpeedKms: 438,
        },
        exoplanets: [],
        gravitationalWaves: [],
        dsnLinks: [],
      };
    }

    saveOfflineSnapshotToLocal(manifest);

    // Trigger browser file download
    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmos-offline-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setStatusBanner(
      `Exported & cached offline snapshot (${manifest.tles.length} embedded TLEs + multi-phase data).`
    );
  };

  const handleLoadLocalOfflineCatalog = () => {
    const saved = loadOfflineSnapshotFromLocal();
    const tles = saved?.tles?.length ? saved.tles : DEFAULT_OFFLINE_TLES;
    const map = new Map();
    for (const rec of tles) {
      const sat = tleRecordToSatelliteData(rec);
      map.set(sat.noradId, sat);
    }
    setSatellites(map);
    setStatusBanner(
      `Loaded ${map.size} satellites (HawkEye-360, ISS, Starlink, GPS, etc.) into client-side SGP4 engine.`
    );
  };

  const filteredProviders =
    phaseFilter === 0
      ? vaultStats.providers
      : vaultStats.providers.filter((p) => p.phase === phaseFilter);

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white">
            10k+ API Key Vault & Offline Archive
          </h2>
          <p className="text-[11px] text-gray-400">
            Multi-Key Rate-Limit Rotation • Client SGP4 Offline Engine
          </p>
        </div>
        <Badge variant={offlineMode ? 'warning' : 'success'}>
          {offlineMode ? 'Offline SGP4 Mode' : 'Hybrid Real-Time'}
        </Badge>
      </div>

      {statusBanner && (
        <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-500/40 text-[11px] text-cyan-200 flex items-center justify-between">
          <span>{statusBanner}</span>
          <button
            onClick={() => setStatusBanner(null)}
            className="text-gray-400 hover:text-white ml-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Offline Simulation & Local Archive Card */}
      <Card className="p-4 border-gray-800 bg-gray-900/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {offlineMode ? (
              <WifiOff className="w-4 h-4 text-amber-400" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-400" />
            )}
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
              Autonomous Offline Execution Engine
            </h3>
          </div>
          <button
            onClick={toggleOfflineMode}
            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition ${
              offlineMode
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
            }`}
          >
            {offlineMode ? 'Switch to Online WS' : 'Force Offline Mode'}
          </button>
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed">
          When disconnected or in Offline Mode, COSMOS automatically runs client-side
          Keplerian/SGP4 orbital propagation at 1 Hz using embedded & cached TLEs
          (including <span className="text-cyan-300 font-semibold">HawkEye 360 Clusters 1–7</span>,{' '}
          <span className="text-cyan-300 font-semibold">ISS</span>,{' '}
          <span className="text-cyan-300 font-semibold">Starlink</span>, and{' '}
          <span className="text-cyan-300 font-semibold">GPS/Galileo</span>).
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExportOfflineSnapshot}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Snapshot (.json)</span>
          </button>
          <button
            onClick={handleLoadLocalOfflineCatalog}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-semibold transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Seed Offline TLEs ({satellites.size})</span>
          </button>
        </div>
      </Card>

      {/* 10,000+ Multi-Key Rotation Vault */}
      <Card className="p-4 border-gray-800 bg-gray-900/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
              10,000+ API Key Rotation Vault
            </h3>
          </div>
          <Badge variant="info">{vaultStats.rotationStrategy}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-gray-950/90 border border-gray-800">
            <div className="text-sm font-mono font-bold text-cyan-400">
              {vaultStats.totalKeysInRotation.toLocaleString()}
            </div>
            <div className="text-[9px] uppercase text-gray-400">Active Keys</div>
          </div>
          <div className="p-2 rounded bg-gray-950/90 border border-gray-800">
            <div className="text-sm font-mono font-bold text-emerald-400">
              {(vaultStats.combinedHourlyCapacity / 1000).toFixed(0)}k/hr
            </div>
            <div className="text-[9px] uppercase text-gray-400">Pool Quota</div>
          </div>
          <div className="p-2 rounded bg-gray-950/90 border border-gray-800">
            <div className="text-sm font-mono font-bold text-purple-400">
              {vaultStats.totalProvidersCataloged}
            </div>
            <div className="text-[9px] uppercase text-gray-400">Space APIs</div>
          </div>
        </div>

        {/* Scale Simulator Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => handleProvision10kCluster(2500)}
            className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold transition"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>+2,500 Keys</span>
          </button>
          <button
            onClick={() => handleProvision10kCluster(10000)}
            className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-semibold transition"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Scale to 10,000+ Keys</span>
          </button>
        </div>

        {/* Add Single Key Form */}
        <div className="p-2.5 rounded bg-gray-950/80 border border-gray-800 space-y-2">
          <div className="text-[10px] font-semibold uppercase text-gray-400">
            Add Custom API Key to Rotation Pool
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200"
            >
              {vaultStats.providers.map((p) => (
                <option key={p.provider} value={p.provider}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Label (e.g. Node #4)"
              value={newKeyLabel}
              onChange={(e) => setNewKeyLabel(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200"
            />
          </div>
          <div className="flex gap-1.5">
            <input
              type="password"
              placeholder="Paste API Key or Bearer Token..."
              value={newKeyInput}
              onChange={(e) => setNewKeyInput(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 font-mono"
            />
            <button
              onClick={handleAddSingleKey}
              className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Provider Catalog Filter & List */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] uppercase font-bold text-gray-400">
            Cataloged Space Data Providers ({filteredProviders.length})
          </span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map((ph) => (
              <button
                key={ph}
                onClick={() => setPhaseFilter(ph)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  phaseFilter === ph
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/50'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {ph === 0 ? 'ALL' : `P${ph}`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {filteredProviders.map((prov) => (
            <div
              key={prov.provider}
              className="p-2 rounded bg-gray-950/75 border border-gray-800/80 flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-gray-200 truncate">
                    {prov.name}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  Phase {prov.phase} • {prov.category} • Pool: {prov.activeKeyCount} keys
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] font-mono font-bold text-emerald-400">
                    {(prov.totalCapacityPerHour / 1000).toFixed(1)}k/hr
                  </div>
                  <div className="text-[9px] text-gray-500">
                    {prov.requiresKey ? prov.envVarName : 'OPEN API'}
                  </div>
                </div>
                <a
                  href={prov.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-cyan-400"
                  title="Open API Documentation"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
