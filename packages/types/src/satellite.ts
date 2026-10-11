export interface Satellite {
  noradId: number;
  name: string;
  intlDesignator: string;
  launchDate: string;
  decayDate: string | null;
  objectType: 'PAYLOAD' | 'ROCKET_BODY' | 'DEBRIS' | 'UNKNOWN';
  country: string;
  operator: string | null;
  constellation: string | null;
  orbitType: 'LEO' | 'MEO' | 'GEO' | 'HEO' | 'SSO' | 'POLAR' | 'UNKNOWN';
  status: 'ACTIVE' | 'INACTIVE' | 'DECAYED' | 'UNKNOWN';
}

export interface SatellitePosition {
  noradId: number;
  timestamp: Date;
  latitude: number;   // degrees
  longitude: number;  // degrees
  altitude: number;   // km
  velocity: number;   // km/s
  azimuth?: number;   // degrees (observer-relative)
  elevation?: number; // degrees (observer-relative)
  range?: number;     // km (observer-relative)
}

export interface SatelliteDetail extends Satellite {
  tle: import('./tle').TLE;
  orbitalElements: import('./orbital').OrbitalElements;
  currentPosition: SatellitePosition;
}
