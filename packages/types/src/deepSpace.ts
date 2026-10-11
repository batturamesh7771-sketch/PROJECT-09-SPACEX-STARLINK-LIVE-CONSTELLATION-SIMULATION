export interface ExoplanetRecord {
  plName: string;
  hostname: string;
  discYear: number;
  discoveryMethod: string;
  orbPerDays: number | null;
  radeEarth: number | null;     // Planet radius in Earth radii
  bmasseEarth: number | null;   // Planet mass in Earth masses
  eqTempK: number | null;       // Equilibrium temperature (K)
  syDistPc: number | null;      // Distance in parsecs
  distanceLightYears: number | null;
  stTeffK: number | null;       // Host star effective temperature (K)
  stRadSolar: number | null;    // Host star radius in Solar radii
  isHabitableZone: boolean;
  esiScore: number;             // Earth Similarity Index (0.00 - 1.00)
}

export interface GravitationalWaveEvent {
  commonName: string;
  catalogName: string;
  version: number;
  gpsTime: number;
  eventUtc: string;
  mass1Solar: number;
  mass2Solar: number;
  finalMassSolar: number | null;
  chirpMassSolar: number;
  luminosityDistanceMpc: number;
  networkSnr: number;
  farPerYear: number;
  mergerType: 'BBH' | 'BNS' | 'NSBH';
  referenceUrl: string;
}

export interface DeepSpaceObservation {
  id: string;
  observatory: 'JWST' | 'HST' | 'CHANDRA' | 'APOD';
  targetName: string;
  title: string;
  instrument: string;
  wavelengthBand: string;
  obsDate: string;
  raDeg: number;
  decDeg: number;
  imageUrl: string;
  description: string;
  archiveUrl: string;
}

export interface CosmicRayStationReading {
  stationCode: string;
  stationName: string;
  country: string;
  lat: number;
  lon: number;
  altitudeMeters: number;
  cutoffRigidityGv: number;
  countRateCps: number;
  anomalyPercent: number;       // Deviation from 24h baseline (e.g. Forbush decrease < 0, GLE > 0)
  status: 'NOMINAL' | 'FORBUSH_DECREASE' | 'GLE_ELEVATED';
  updatedAt: string;
}

export interface DsnAntennaLink {
  dishName: string;
  complex: 'Goldstone' | 'Madrid' | 'Canberra';
  complexLat: number;
  complexLon: number;
  azimuthDeg: number;
  elevationDeg: number;
  windSpeedKmh: number;
  targetSpacecraft: string;
  upSignalFreqGhz: number | null;
  upPowerKw: number | null;
  downSignalFreqGhz: number;
  downDataRateKbps: number;
  roundTripLightTimeHours: number;
  distanceMillionKm: number;
}

export interface StellarAndTransientObject {
  id: string;
  name: string;
  category: 'GAIA_NEARBY_STAR' | 'SUPERNOVA_TRANSIENT' | 'PULSAR';
  raDeg: number;
  decDeg: number;
  distanceLy: number | null;
  redshift: number | null;
  apparentMag: number;
  spectralOrTransientType: string;
  notes: string;
}
