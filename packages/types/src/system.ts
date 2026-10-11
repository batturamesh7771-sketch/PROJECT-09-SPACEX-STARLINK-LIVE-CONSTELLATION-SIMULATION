export interface ApiKeyPoolItem {
  id: string;
  provider: string;
  category: string;
  maskedKey: string;
  label: string;
  requestsMade: number;
  maxRequestsPerHour: number;
  status: 'ACTIVE' | 'RATE_LIMITED' | 'STANDBY';
  lastUsedAt: string | null;
}

export interface ProviderPoolSummary {
  provider: string;
  name: string;
  category: string;
  phase: number;
  requiresKey: boolean;
  envVarName: string;
  activeKeyCount: number;
  totalCapacityPerHour: number;
  requestsUsedThisWindow: number;
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'OFFLINE_FALLBACK';
  docsUrl: string;
}

export interface KeyVaultStats {
  totalProvidersCataloged: number;
  totalKeysInRotation: number;
  combinedHourlyCapacity: number;
  requestsMadeLastHour: number;
  rotationStrategy: 'ROUND_ROBIN_LEAST_USED';
  providers: ProviderPoolSummary[];
  sampleKeys: ApiKeyPoolItem[];
}

export interface OfflineTleRecord {
  noradId: number;
  name: string;
  constellation: string;
  type: 'PAYLOAD' | 'ROCKET_BODY' | 'DEBRIS';
  orbitType: 'LEO' | 'MEO' | 'GEO' | 'HEO' | 'SSO';
  line1: string;
  line2: string;
}

export interface OfflineSnapshotManifest {
  version: string;
  generatedAt: string;
  platform: 'Project COSMOS Offline Archive';
  counts: {
    satellites: number;
    constellations: number;
    exoplanets: number;
    gravitationalWaves: number;
    dsnLinks: number;
    eonetEvents: number;
    neos: number;
  };
  tles: OfflineTleRecord[];
  spaceWeatherSummary: {
    kpIndex: number;
    stormLevel: string;
    solarWindSpeedKms: number;
  };
  exoplanets: unknown[];
  gravitationalWaves: unknown[];
  dsnLinks: unknown[];
}
