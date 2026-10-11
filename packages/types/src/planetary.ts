export interface PlanetaryEphemeris {
  bodyId: string;
  name: string;
  category: 'PLANET' | 'DWARF_PLANET' | 'MOON' | 'SPACECRAFT';
  heliocentricAu: {
    x: number;
    y: number;
    z: number;
    r: number; // Heliocentric radial distance in AU
    lonDeg: number;
  };
  geocentric: {
    distanceAu: number;
    lightTimeMinutes: number;
    raDeg: number;
    decDeg: number;
    elongationDeg: number;
  };
  orbitalSpeedKms: number;
  periodDays: number;
  radiusKm: number;
  colorHex: string;
}

export interface MarsRoverPhoto {
  id: number;
  sol: number;
  earthDate: string;
  imgSrc: string;
  cameraName: string;
  cameraFullName: string;
  roverName: string;
  roverStatus: string;
}

export interface PlanetaryMissionDataset {
  id: string;
  title: string;
  missionName: string;
  targetBody: string;
  instrumentName: string;
  pdsVersion: 'PDS4' | 'PDS3';
  releaseDate: string;
  archiveUrl: string;
}

export interface PlanetarySurfaceLayer {
  id: string;
  targetBody: 'MOON' | 'MARS' | 'MERCURY' | 'EUROPA';
  name: string;
  instrument: string;
  wmsUrl: string;
  layerId: string;
  resolutionMeters: number;
}
