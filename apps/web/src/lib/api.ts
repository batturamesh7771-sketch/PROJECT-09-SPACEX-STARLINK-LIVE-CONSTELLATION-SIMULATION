import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// ═══ Phase 1: Satellites & Orbits ═══
export const fetchSatellites = async (params?: any) => {
  const res = await api.get('/satellites', { params });
  return res.data;
};

export const fetchSatellite = async (noradId: number) => {
  const res = await api.get(`/satellites/${noradId}`);
  return res.data;
};

export const fetchConstellations = async () => {
  const res = await api.get('/constellations');
  return res.data;
};

export const fetchConstellation = async (id: string) => {
  const res = await api.get(`/constellations/${id}`);
  return res.data;
};

export const fetchPasses = async (noradId: number, observer: { lat: number; lon: number; alt: number }) => {
  const res = await api.post(`/satellites/${noradId}/passes`, { observer });
  return res.data;
};

export const fetchTLE = async (noradId: number) => {
  const res = await api.get(`/satellites/${noradId}/tle`);
  return res.data;
};

export const fetchHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

// ═══ Phase 2: Space Weather ═══
export const fetchSpaceWeatherSummary = async () => {
  const res = await api.get('/space-weather/summary');
  return res.data;
};

export const fetchKpIndex = async (days = 7) => {
  const res = await api.get('/space-weather/kp', { params: { days } });
  return res.data;
};

export const fetchSolarWind = async () => {
  const res = await api.get('/space-weather/solar-wind');
  return res.data;
};

export const fetchAuroraForecast = async () => {
  const res = await api.get('/space-weather/aurora');
  return res.data;
};

export const fetchSolarFlares = async (days = 7) => {
  const res = await api.get('/space-weather/flares', { params: { days } });
  return res.data;
};

export const fetchCMEs = async (days = 7) => {
  const res = await api.get('/space-weather/cmes', { params: { days } });
  return res.data;
};

export const fetchSpaceWeatherAlerts = async () => {
  const res = await api.get('/space-weather/alerts');
  return res.data;
};

// ═══ Phase 2: Rocket Launches & Space News ═══
export const fetchUpcomingLaunches = async (limit = 15) => {
  const res = await api.get('/launches/upcoming', { params: { limit } });
  return res.data;
};

export const fetchPreviousLaunches = async (limit = 15) => {
  const res = await api.get('/launches/previous', { params: { limit } });
  return res.data;
};

export const fetchSpaceXStats = async () => {
  const res = await api.get('/launches/spacex');
  return res.data;
};

export const fetchSpaceNews = async (limit = 15) => {
  const res = await api.get('/launches/news', { params: { limit } });
  return res.data;
};

// ═══ Phase 3: Space Debris & Conjunctions ═══
export const fetchConjunctionAlerts = async () => {
  const res = await api.get('/debris/conjunctions');
  return res.data;
};

export const fetchDebrisDensity = async () => {
  const res = await api.get('/debris/density');
  return res.data;
};

export const fetchDiscosData = async (limit = 15) => {
  const res = await api.get('/debris/discos', { params: { limit } });
  return res.data;
};

export const fetchReentries = async () => {
  const res = await api.get('/debris/reentries');
  return res.data;
};

// ═══ Phase 3: Asteroids, NEOs & Planetary Defense ═══
export const fetchNeoCloseApproaches = async (distMaxLd = 15) => {
  const res = await api.get('/asteroids/close-approaches', { params: { distMaxLd } });
  return res.data;
};

export const fetchSentryRisks = async () => {
  const res = await api.get('/asteroids/sentry');
  return res.data;
};

export const fetchFireballEvents = async (limit = 35) => {
  const res = await api.get('/asteroids/fireballs', { params: { limit } });
  return res.data;
};

export const fetchNeocpCandidates = async () => {
  const res = await api.get('/asteroids/neocp');
  return res.data;
};

export const lookupSmallBody = async (sstr: string) => {
  const res = await api.get('/asteroids/lookup', { params: { sstr } });
  return res.data;
};

// ═══ Phase 4: Earth Observation & Planetary Science ═══
export const fetchEonetEvents = async (limit = 35) => {
  const res = await api.get('/earth-obs/eonet', { params: { limit } });
  return res.data;
};

export const fetchGibsLayers = async () => {
  const res = await api.get('/earth-obs/gibs-layers');
  return res.data;
};

export const fetchEarthObsScenes = async () => {
  const res = await api.get('/earth-obs/scenes');
  return res.data;
};

export const fetchPlanetaryEphemerides = async () => {
  const res = await api.get('/planetary/ephemerides');
  return res.data;
};

export const fetchMarsRoverPhotos = async (rover = 'curiosity') => {
  const res = await api.get('/planetary/mars-rover', { params: { rover } });
  return res.data;
};

export const fetchPlanetaryDatasets = async (target?: string) => {
  const res = await api.get('/planetary/pds', { params: target ? { target } : {} });
  return res.data;
};

export const fetchPlanetaryMaps = async () => {
  const res = await api.get('/planetary/maps');
  return res.data;
};

// ═══ Phase 5: Deep Space, Exoplanets & Multi-Messenger Astrophysics ═══
export const fetchExoplanets = async (habitable = false) => {
  const res = await api.get('/deep-space/exoplanets', { params: { habitable } });
  return res.data;
};

export const fetchGravitationalWaves = async (type = 'ALL') => {
  const res = await api.get('/deep-space/gravitational-waves', { params: { type } });
  return res.data;
};

export const fetchDeepSpaceObservations = async (telescope = 'ALL') => {
  const res = await api.get('/deep-space/observations', { params: { telescope } });
  return res.data;
};

export const fetchStellarTransients = async (type = 'ALL') => {
  const res = await api.get('/deep-space/transients', { params: { type } });
  return res.data;
};

export const fetchCosmicRayStations = async () => {
  const res = await api.get('/deep-space/cosmic-rays');
  return res.data;
};

export const fetchDsnLinks = async () => {
  const res = await api.get('/deep-space/dsn');
  return res.data;
};

// ═══ Phase 6: 10,000+ API Key Vault & Offline Snapshot System ═══
export const fetchKeyVaultStats = async () => {
  const res = await api.get('/system/key-vault');
  return res.data;
};

export const registerApiKey = async (payload: {
  provider?: string;
  key?: string;
  label?: string;
  bulk?: Array<{ provider: string; key: string; label?: string }>;
}) => {
  const res = await api.post('/system/key-vault', payload);
  return res.data;
};

export const simulateKeyClusterScale = async (count = 2500) => {
  const res = await api.post('/system/key-vault/simulate-scale', { count });
  return res.data;
};

export const fetchOfflineSnapshot = async () => {
  const res = await api.get('/system/offline-snapshot');
  return res.data;
};

export default api;

