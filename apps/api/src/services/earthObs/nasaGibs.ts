import type { GibsImageryLayer } from '@cosmos/types';

/**
 * Returns curated NASA Global Imagery Browse Services (GIBS) WMTS layers
 * compatible with CesiumJS WebMapTileServiceImageryProvider (EPSG:4326)
 */
export function getGibsImageryLayers(): GibsImageryLayer[] {
  const yesterday = new Date(Date.now() - 2 * 86400 * 1000).toISOString().slice(0, 10);

  return [
    {
      id: 'viirs_snpp_truecolor',
      title: 'VIIRS SNPP True Color',
      subtitle: 'Suomi NPP Corrected Reflectance (250m Daily Global)',
      category: 'OPTICAL',
      wmtsLayerName: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
      format: 'image/jpeg',
      tileMatrixSet: '250m',
      resolution: '250m',
      defaultDate: yesterday,
    },
    {
      id: 'modis_terra_truecolor',
      title: 'MODIS Terra True Color',
      subtitle: 'Terra Corrected Reflectance Surface Imagery (250m)',
      category: 'OPTICAL',
      wmtsLayerName: 'MODIS_Terra_CorrectedReflectance_TrueColor',
      format: 'image/jpeg',
      tileMatrixSet: '250m',
      resolution: '250m',
      defaultDate: yesterday,
    },
    {
      id: 'viirs_city_lights',
      title: 'VIIRS Earth at Night (Black Marble)',
      subtitle: 'Day/Night Band Radiance Composite (500m)',
      category: 'NIGHT',
      wmtsLayerName: 'VIIRS_CityLights_2012',
      format: 'image/jpeg',
      tileMatrixSet: '500m',
      resolution: '500m',
      defaultDate: '2012-04-18',
    },
    {
      id: 'modis_thermal_anomalies',
      title: 'IMERG Global Precipitation Rate',
      subtitle: 'GPM Half-Hourly Rain & Storm Intensity (2km)',
      category: 'ATMOSPHERE',
      wmtsLayerName: 'IMERG_Precipitation_Rate',
      format: 'image/png',
      tileMatrixSet: '2km',
      resolution: '2km',
      defaultDate: yesterday,
    },
    {
      id: 'omps_aerosol_index',
      title: 'OMPS Aerosol Optical Index',
      subtitle: 'Dust, Smoke & Volcanic Plume Aerosols (2km)',
      category: 'ATMOSPHERE',
      wmtsLayerName: 'OMPS_Aerosol_Index',
      format: 'image/png',
      tileMatrixSet: '2km',
      resolution: '2km',
      defaultDate: yesterday,
    },
  ];
}
