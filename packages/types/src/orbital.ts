export interface OrbitalElements {
  inclination: number;       // degrees
  raan: number;              // Right Ascension of Ascending Node (degrees)
  eccentricity: number;
  argumentOfPerigee: number; // degrees
  meanAnomaly: number;       // degrees
  meanMotion: number;        // revolutions per day
  bstar: number;             // drag coefficient
  epoch: Date;
  apogee: number;            // km
  perigee: number;           // km
  period: number;            // minutes
  revolutionNumber: number;
}

export interface CartesianState {
  position: { x: number; y: number; z: number }; // km
  velocity: { x: number; y: number; z: number }; // km/s
}

export interface GeoPosition {
  latitude: number;  // degrees
  longitude: number; // degrees
  altitude: number;  // km
}

export interface ObserverLocation {
  latitude: number;
  longitude: number;
  altitude: number; // meters above sea level
}

export interface PassPrediction {
  noradId: number;
  satelliteName: string;
  aos: { time: Date; azimuth: number; elevation: number };
  maxElevation: { time: Date; azimuth: number; elevation: number };
  los: { time: Date; azimuth: number; elevation: number };
  duration: number; // seconds
  isVisible: boolean;
  maxMagnitude?: number;
}
