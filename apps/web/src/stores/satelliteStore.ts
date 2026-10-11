import { create } from 'zustand';

export interface SatelliteData {
  noradId: number;
  name: string;
  intlDes: string;
  type: string;
  status: string;
  constellation?: string;
  tle1: string;
  tle2: string;
  inclination: number;
  raan: number;
  eccentricity: number;
  argPerigee: number;
  meanAnomaly: number;
  meanMotion: number;
  period: number;
  apogee: number;
  perigee: number;
}

interface PositionData {
  lat: number;
  lon: number;
  alt: number;
  vel: number;
}

export interface AuroraCoord {
  lon: number;
  lat: number;
  probability: number;
}

export interface LaunchPadMarker {
  id: string;
  name: string;
  padName: string;
  lat: number;
  lon: number;
  net: string;
  provider: string;
}

export interface FireballMarker {
  id: string;
  date: string;
  lat: number;
  lon: number;
  altKm: number;
  energyKt: number;
}

export interface ReentryMarker {
  noradId: number;
  name: string;
  lat: number;
  lon: number;
  perigeeKm: number;
  status: string;
}

export interface NaturalEventMarker {
  id: string;
  title: string;
  categoryId: string;
  categoryTitle: string;
  lat: number;
  lon: number;
}

export interface GibsLayerSelection {
  id: string;
  wmtsLayerName: string;
  format: string;
  tileMatrixSet: string;
  defaultDate: string;
}

export interface CameraTarget {
  lat: number;
  lon: number;
  altMeters: number;
  label?: string;
}

export interface DsnComplexMarker {
  dishName: string;
  complex: 'Goldstone' | 'Madrid' | 'Canberra';
  lat: number;
  lon: number;
  targetSpacecraft: string;
  downDataRateKbps: number;
}

export interface CosmicRayMarker {
  stationCode: string;
  stationName: string;
  lat: number;
  lon: number;
  countRateCps: number;
  anomalyPercent: number;
  status: 'NOMINAL' | 'FORBUSH_DECREASE' | 'GLE_ELEVATED';
}

interface SatelliteState {
  // Satellite data
  satellites: Map<number, SatelliteData>; // noradId -> data
  positions: Map<number, PositionData>;
  selectedSatelliteId: number | null;
  
  // Filters & Globe Overlays
  activeConstellation: string | null;
  searchQuery: string;
  showDebris: boolean;
  showOrbits: boolean;
  showFootprints: boolean;
  showLabels: boolean;
  showAurora: boolean;
  showLaunchPads: boolean;
  showFireballs: boolean;
  showReentries: boolean;
  showNaturalEvents: boolean;
  showDsnComplexes: boolean;
  showCosmicRayStations: boolean;

  // Phase 2, 3, 4, 5 & 6: Globe overlay data & StatusBar telemetry
  auroraCoordinates: AuroraCoord[];
  launchPadMarkers: LaunchPadMarker[];
  fireballMarkers: FireballMarker[];
  reentryMarkers: ReentryMarker[];
  naturalEventMarkers: NaturalEventMarker[];
  dsnComplexMarkers: DsnComplexMarker[];
  cosmicRayMarkers: CosmicRayMarker[];
  activeGibsLayer: GibsLayerSelection | null;
  currentKp: number | null;
  currentStormLevel: string | null;
  nextLaunchName: string | null;
  nextLaunchNet: string | null;
  criticalConjunctionCount: number;
  upcomingNeoCount: number;
  activeEonetCount: number;
  activeDsnLinkCount: number;
  totalApiKeysInPool: number;
  offlineMode: boolean;
  cameraTarget: CameraTarget | null;
  
  // Time controls
  simulationTime: Date;
  timeMultiplier: number;
  isPlaying: boolean;
  
  // Observer
  observerLocation: { lat: number; lon: number; alt: number } | null;
  
  // Connection status
  wsConnected: boolean;
  lastSyncTime: Date | null;
  
  // Actions
  setSelectedSatellite: (id: number | null) => void;
  setActiveConstellation: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  updatePositions: (positions: Map<number, PositionData>) => void;
  setSatellites: (satellites: Map<number, SatelliteData>) => void;
  toggleDebris: () => void;
  toggleOrbits: () => void;
  toggleFootprints: () => void;
  toggleLabels: () => void;
  toggleAurora: () => void;
  toggleLaunchPads: () => void;
  toggleFireballs: () => void;
  toggleReentries: () => void;
  toggleNaturalEvents: () => void;
  toggleDsnComplexes: () => void;
  toggleCosmicRayStations: () => void;
  toggleOfflineMode: () => void;
  setAuroraCoordinates: (coords: AuroraCoord[]) => void;
  setLaunchPadMarkers: (markers: LaunchPadMarker[]) => void;
  setFireballMarkers: (markers: FireballMarker[]) => void;
  setReentryMarkers: (markers: ReentryMarker[]) => void;
  setNaturalEventMarkers: (markers: NaturalEventMarker[]) => void;
  setDsnComplexMarkers: (markers: DsnComplexMarker[]) => void;
  setCosmicRayMarkers: (markers: CosmicRayMarker[]) => void;
  setActiveGibsLayer: (layer: GibsLayerSelection | null) => void;
  setSpaceWeatherBadge: (kp: number, stormLevel: string) => void;
  setNextLaunchBadge: (name: string | null, net: string | null) => void;
  setDefenseBadges: (criticalConjunctions: number, upcomingNeos: number) => void;
  setActiveEonetCount: (count: number) => void;
  setActiveDsnLinkCount: (count: number) => void;
  setTotalApiKeysInPool: (count: number) => void;
  flyToLocation: (target: CameraTarget | null) => void;
  setTimeMultiplier: (mult: number) => void;
  togglePlaying: () => void;
  setSimulationTime: (time: Date) => void;
  setObserverLocation: (loc: { lat: number; lon: number; alt: number } | null) => void;
  setWsConnected: (connected: boolean) => void;
}

export const useSatelliteStore = create<SatelliteState>((set) => ({
  satellites: new Map(),
  positions: new Map(),
  selectedSatelliteId: null,
  
  activeConstellation: null,
  searchQuery: '',
  showDebris: false,
  showOrbits: true,
  showFootprints: false,
  showLabels: false,
  showAurora: true,
  showLaunchPads: true,
  showFireballs: true,
  showReentries: true,
  showNaturalEvents: true,
  showDsnComplexes: true,
  showCosmicRayStations: true,

  auroraCoordinates: [],
  launchPadMarkers: [],
  fireballMarkers: [],
  reentryMarkers: [],
  naturalEventMarkers: [],
  dsnComplexMarkers: [],
  cosmicRayMarkers: [],
  activeGibsLayer: null,
  currentKp: null,
  currentStormLevel: null,
  nextLaunchName: null,
  nextLaunchNet: null,
  criticalConjunctionCount: 0,
  upcomingNeoCount: 0,
  activeEonetCount: 0,
  activeDsnLinkCount: 0,
  totalApiKeysInPool: 42,
  offlineMode: false,
  cameraTarget: null,
  
  simulationTime: new Date(),
  timeMultiplier: 1,
  isPlaying: true,
  
  observerLocation: null,
  
  wsConnected: false,
  lastSyncTime: null,
  
  setSelectedSatellite: (id) => set({ selectedSatelliteId: id }),
  setActiveConstellation: (id) => set({ activeConstellation: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  updatePositions: (positions) => set({ positions, lastSyncTime: new Date() }),
  setSatellites: (satellites) => set({ satellites }),
  toggleDebris: () => set((state) => ({ showDebris: !state.showDebris })),
  toggleOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),
  toggleFootprints: () => set((state) => ({ showFootprints: !state.showFootprints })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  toggleAurora: () => set((state) => ({ showAurora: !state.showAurora })),
  toggleLaunchPads: () => set((state) => ({ showLaunchPads: !state.showLaunchPads })),
  toggleFireballs: () => set((state) => ({ showFireballs: !state.showFireballs })),
  toggleReentries: () => set((state) => ({ showReentries: !state.showReentries })),
  toggleNaturalEvents: () => set((state) => ({ showNaturalEvents: !state.showNaturalEvents })),
  toggleDsnComplexes: () => set((state) => ({ showDsnComplexes: !state.showDsnComplexes })),
  toggleCosmicRayStations: () => set((state) => ({ showCosmicRayStations: !state.showCosmicRayStations })),
  toggleOfflineMode: () => set((state) => ({ offlineMode: !state.offlineMode })),
  setAuroraCoordinates: (auroraCoordinates) => set({ auroraCoordinates }),
  setLaunchPadMarkers: (launchPadMarkers) => set({ launchPadMarkers }),
  setFireballMarkers: (fireballMarkers) => set({ fireballMarkers }),
  setReentryMarkers: (reentryMarkers) => set({ reentryMarkers }),
  setNaturalEventMarkers: (naturalEventMarkers) => set({ naturalEventMarkers }),
  setDsnComplexMarkers: (dsnComplexMarkers) => set({ dsnComplexMarkers }),
  setCosmicRayMarkers: (cosmicRayMarkers) => set({ cosmicRayMarkers }),
  setActiveGibsLayer: (activeGibsLayer) => set({ activeGibsLayer }),
  setSpaceWeatherBadge: (currentKp, currentStormLevel) => set({ currentKp, currentStormLevel }),
  setNextLaunchBadge: (nextLaunchName, nextLaunchNet) => set({ nextLaunchName, nextLaunchNet }),
  setDefenseBadges: (criticalConjunctionCount, upcomingNeoCount) =>
    set({ criticalConjunctionCount, upcomingNeoCount }),
  setActiveEonetCount: (activeEonetCount) => set({ activeEonetCount }),
  setActiveDsnLinkCount: (activeDsnLinkCount) => set({ activeDsnLinkCount }),
  setTotalApiKeysInPool: (totalApiKeysInPool) => set({ totalApiKeysInPool }),
  flyToLocation: (cameraTarget) => set({ cameraTarget }),
  setTimeMultiplier: (mult) => set({ timeMultiplier: mult }),
  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setSimulationTime: (time) => set({ simulationTime: time }),
  setObserverLocation: (loc) => set({ observerLocation: loc }),
  setWsConnected: (connected) => set({ wsConnected: connected }),
}));
