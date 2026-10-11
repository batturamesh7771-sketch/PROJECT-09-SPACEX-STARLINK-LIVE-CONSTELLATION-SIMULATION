export type ConjunctionRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface ConjunctionObjectInfo {
  noradId: number;
  name: string;
  objectType: 'PAYLOAD' | 'ROCKET_BODY' | 'DEBRIS' | 'UNKNOWN';
  operator: string;
  altitudeKm: number;
}

export interface ConjunctionAlert {
  cdmId: string;
  createdAt: string;
  tca: string;                  // Time of Closest Approach (ISO)
  minRangeKm: number;           // Miss distance in km
  radialMissKm: number;
  inTrackMissKm: number;
  crossTrackMissKm: number;
  relativeSpeedKms: number;     // km/s
  collisionProbability: number; // e.g. 1.4e-4
  riskLevel: ConjunctionRiskLevel;
  sat1: ConjunctionObjectInfo;
  sat2: ConjunctionObjectInfo;
}

export interface OrbitalDebrisDensityShell {
  altitudeKm: number;
  shellLabel: string;
  payloadCount: number;
  rocketBodyCount: number;
  debrisCount: number;
  spatialDensityPerMillionKm3: number;
}

export interface DiscosObjectCharacteristic {
  noradId: number;
  name: string;
  objectClass: string;
  massKg: number | null;
  crossSectionSqm: number | null;
  shape: string | null;
  widthMeters: number | null;
  heightMeters: number | null;
  depthMeters: number | null;
  fragmentationOrigin?: string | null;
}

export interface FragmentationEventSummary {
  id: string;
  parentName: string;
  parentNoradId: number;
  eventDate: string;
  cause: 'COLLISION' | 'ASAT_TEST' | 'PROPULSION' | 'BATTERY' | 'AERODYNAMIC' | 'UNKNOWN';
  altitudeKm: number;
  catalogedDebrisTotal: number;
  remainingInOrbit: number;
}

export interface ReentryPrediction {
  noradId: number;
  name: string;
  objectType: 'PAYLOAD' | 'ROCKET_BODY' | 'DEBRIS';
  predictedEpoch: string;
  uncertaintyHours: number;
  inclinationDeg: number;
  perigeeKm: number;
  apogeeKm: number;
  lat: number;
  lon: number;
  status: 'MONITORING' | 'IMMINENT' | 'REENTERED';
}
