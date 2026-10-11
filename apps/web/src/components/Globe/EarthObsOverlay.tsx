"use client";
import { PointPrimitiveCollection, PointPrimitive, ImageryLayer } from 'resium';
import {
  Color,
  Cartesian3,
  WebMapTileServiceImageryProvider,
  GeographicTilingScheme,
} from 'cesium';
import { useMemo } from 'react';
import { useSatelliteStore } from '@/stores/satelliteStore';

function getCategoryColor(catId: string): string {
  switch (catId) {
    case 'wildfires':
      return '#f97316'; // Orange
    case 'volcanoes':
      return '#ef4444'; // Red
    case 'severeStorms':
      return '#38bdf8'; // Sky Blue
    case 'seaLakeIce':
      return '#e0f2fe'; // Ice White-Blue
    default:
      return '#eab308'; // Yellow
  }
}

export default function EarthObsOverlay() {
  const {
    showNaturalEvents,
    naturalEventMarkers,
    activeGibsLayer,
  } = useSatelliteStore();

  const gibsProvider = useMemo(() => {
    if (!activeGibsLayer) return null;
    try {
      const ext = activeGibsLayer.format === 'image/png' ? 'png' : 'jpg';
      const url = `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/${activeGibsLayer.wmtsLayerName}/default/${activeGibsLayer.defaultDate}/${activeGibsLayer.tileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.${ext}`;
      return new WebMapTileServiceImageryProvider({
        url,
        layer: activeGibsLayer.wmtsLayerName,
        style: 'default',
        format: activeGibsLayer.format,
        tileMatrixSetID: activeGibsLayer.tileMatrixSet,
        maximumLevel: 7,
        tilingScheme: new GeographicTilingScheme(),
        credit: 'NASA EOSDIS GIBS',
      });
    } catch (e) {
      console.warn('Failed to initialize NASA GIBS WMTS provider:', e);
      return null;
    }
  }, [activeGibsLayer]);

  return (
    <>
      {gibsProvider && <ImageryLayer imageryProvider={gibsProvider} alpha={0.78} />}

      {showNaturalEvents && naturalEventMarkers.length > 0 && (
        <PointPrimitiveCollection>
          {naturalEventMarkers.map((ev) => (
            <PointPrimitive
              key={`eonet-${ev.id}`}
              position={Cartesian3.fromDegrees(ev.lon, ev.lat, 5000)}
              color={Color.fromCssColorString(getCategoryColor(ev.categoryId))}
              outlineColor={Color.fromCssColorString('#000000')}
              outlineWidth={2}
              pixelSize={10}
            />
          ))}
        </PointPrimitiveCollection>
      )}
    </>
  );
}
