export interface NearEarthCloseApproach {
  designation: string;
  fullName: string;
  orbitId: string;
  closeApproachDate: string; // ISO or YYYY-MMM-DD HH:mm
  distAu: number;
  distLunar: number;         // Lunar distances (1 LD ≈ 384,400 km)
  distKm: number;
  vRelKms: number;           // Relative velocity km/s
  vInfKms: number;
  hMag: number;              // Absolute magnitude H
  estimatedDiameterMeters: {
    min: number;
    max: number;
  };
  isPotentiallyHazardous: boolean;
}

export interface SentryImpactRisk {
  designation: string;
  fullName: string;
  ipCumulative: number;      // Cumulative impact probability
  psCumulative: number;      // Cumulative Palermo Scale
  psMax: number;             // Maximum Palermo Scale
  tsMax: number;             // Maximum Torino Scale (0–10)
  impactCount: number;       // Number of potential impact solutions
  yearRange: string;         // e.g. '2068-2116'
  vImpactKms: number;
  diameterKm: number;
  hMag: number;
  lastObserved: string;
}

export interface FireballEvent {
  id: string;
  date: string;
  lat: number;
  lon: number;
  altKm: number;
  velocityKms: number;
  totalRadiatedEnergyJ: number;
  impactEnergyKt: number;    // Kilotons of TNT equivalent
}

export interface SmallBodyDetail {
  spkid: string;
  fullName: string;
  pdes: string;
  name: string | null;
  orbitClass: string;
  isNeo: boolean;
  isPha: boolean;
  hMag: number | null;
  diameterKm: number | null;
  albedo: number | null;
  rotationPeriodHours: number | null;
  spectralType: string | null;
  orbitalElements: {
    eccentricity: number;
    semiMajorAxisAu: number;
    perihelionAu: number;
    aphelionAu: number;
    inclinationDeg: number;
    ascendingNodeDeg: number;
    argPerihelionDeg: number;
    periodYears: number;
    moidAu: number | null;
  };
}

export interface MinorPlanetCandidate {
  tempDesig: string;
  discoveryDate: string;
  raDeg: number;
  decDeg: number;
  vMag: number;
  nObs: number;
  arcHours: number;
  hMagEstimate: number;
}
