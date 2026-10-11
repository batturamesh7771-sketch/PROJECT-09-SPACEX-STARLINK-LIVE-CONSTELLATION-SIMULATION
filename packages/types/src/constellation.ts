export interface Constellation {
  id: string;
  name: string;
  operator: string;
  description: string;
  category: ConstellationCategory;
  activeSatellites: number;
  plannedSatellites: number;
  orbitType: string;
  altitudeKm: number;
  inclinationDeg: number;
  noradIds: number[];
}

export type ConstellationCategory =
  | 'BROADBAND'
  | 'NAVIGATION'
  | 'EARTH_OBSERVATION'
  | 'WEATHER'
  | 'COMMUNICATIONS'
  | 'RF_GEOLOCATION'
  | 'SCIENTIFIC'
  | 'MILITARY'
  | 'OTHER';
