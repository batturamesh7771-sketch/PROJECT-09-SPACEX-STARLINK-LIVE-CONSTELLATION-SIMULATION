export type GeomagneticStormLevel =
  | 'QUIET'
  | 'UNSETTLED'
  | 'ACTIVE'
  | 'G1_MINOR'
  | 'G2_MODERATE'
  | 'G3_STRONG'
  | 'G4_SEVERE'
  | 'G5_EXTREME';

export interface KpIndexReading {
  timestamp: string;
  kp: number;
  aRunning: number;
  stationCount: number;
  stormLevel: GeomagneticStormLevel;
}

export interface SolarWindReading {
  timestamp: string;
  density: number;     // protons/cm^3
  speed: number;       // km/s
  temperature: number; // K
  bx: number;          // nT
  by: number;          // nT
  bz: number;          // nT (southward Bz < 0 drives geomagnetic storms)
  bt: number;          // total magnetic field nT
}

export type FlareClassCategory = 'A' | 'B' | 'C' | 'M' | 'X';

export interface XRayFluxReading {
  timestamp: string;
  flux: number;        // W/m^2
  energyBand: string;  // e.g. '0.1-0.8nm'
  flareClass: string;  // e.g. 'M2.4'
  category: FlareClassCategory;
}

export interface AuroraPoint {
  lon: number;
  lat: number;
  probability: number; // 0-100
}

export interface AuroraForecastData {
  observationTime: string;
  forecastTime: string;
  coordinates: AuroraPoint[];
}

export interface SpaceWeatherAlert {
  productId: string;
  issueDatetime: string;
  message: string;
  severity: 'INFO' | 'WATCH' | 'WARNING' | 'ALERT';
}

export interface SolarFlareEvent {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime: string | null;
  classType: string;
  sourceLocation: string;
  activeRegionNum: number | null;
  link: string;
}

export interface CoronalMassEjection {
  activityID: string;
  startTime: string;
  sourceLocation: string;
  activeRegionNum: number | null;
  note: string;
  speed: number | null;           // km/s
  halfAngle: number | null;       // degrees
  cmeType: string | null;         // S, C, O, R, ER
  isEarthDirected: boolean;
  estimatedArrivalTime: string | null;
  link: string;
}

export interface GeomagneticStormEvent {
  gstID: string;
  startTime: string;
  maxKp: number;
  readings: Array<{
    observedTime: string;
    kpIndex: number;
    source: string;
  }>;
}

export interface SpaceWeatherSummary {
  currentKp: KpIndexReading;
  kpHistory: KpIndexReading[];
  currentSolarWind: SolarWindReading;
  solarWindHistory: SolarWindReading[];
  currentXRay: XRayFluxReading;
  radioFlux107cm: number;
  activeAlerts: SpaceWeatherAlert[];
  recentFlares: SolarFlareEvent[];
  recentCMEs: CoronalMassEjection[];
  updatedAt: string;
}
