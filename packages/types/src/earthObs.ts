export type NaturalEventCategory =
  | 'wildfires'
  | 'volcanoes'
  | 'severeStorms'
  | 'seaLakeIce'
  | 'earthquakes'
  | 'floods'
  | 'dustHaze'
  | 'other';

export interface EonetNaturalEvent {
  id: string;
  title: string;
  description: string | null;
  categoryId: NaturalEventCategory;
  categoryTitle: string;
  date: string;
  lat: number;
  lon: number;
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
  sourceUrl: string | null;
}

export interface GibsImageryLayer {
  id: string;
  title: string;
  subtitle: string;
  category: 'OPTICAL' | 'THERMAL' | 'ATMOSPHERE' | 'CRYOSPHERE' | 'NIGHT';
  wmtsLayerName: string;
  format: 'image/jpeg' | 'image/png';
  tileMatrixSet: string;
  resolution: string;
  defaultDate: string;
}

export interface EarthObservationScene {
  id: string;
  mission: 'Sentinel-2 L2A' | 'Sentinel-1 SAR' | 'Landsat-9 OLI-2';
  title: string;
  datetime: string;
  cloudCoverPercent: number | null;
  centerLat: number;
  centerLon: number;
  platform: string;
  constellation: string;
  thumbnailUrl: string | null;
  stacUrl: string | null;
}
