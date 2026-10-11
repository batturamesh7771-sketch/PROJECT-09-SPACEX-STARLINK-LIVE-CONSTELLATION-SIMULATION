import type { PlanetarySurfaceLayer } from '@cosmos/types';

/**
 * Returns OGC-compliant USGS Astrogeology Planetary Cartography WMS layers
 */
export function getPlanetarySurfaceLayers(): PlanetarySurfaceLayer[] {
  return [
    {
      id: 'usgs_moon_wac',
      targetBody: 'MOON',
      name: 'LRO Wide Angle Camera (WAC) Global Mosaic',
      instrument: 'LROC WAC',
      wmsUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/earth/moon_simp_cyl.map',
      layerId: 'LROC_WAC',
      resolutionMeters: 100,
    },
    {
      id: 'usgs_mars_mola',
      targetBody: 'MARS',
      name: 'MGS MOLA Colorized Shaded Relief Elevation DEM',
      instrument: 'Mars Orbiter Laser Altimeter',
      wmsUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
      layerId: 'MOLA_color',
      resolutionMeters: 463,
    },
    {
      id: 'usgs_mars_viking',
      targetBody: 'MARS',
      name: 'Viking Orbiter MDIM 2.1 Global Color Mosaic',
      instrument: 'Viking VIS',
      wmsUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
      layerId: 'MDIM21_color',
      resolutionMeters: 231,
    },
    {
      id: 'usgs_mercury_mdis',
      targetBody: 'MERCURY',
      name: 'MESSENGER MDIS Global Basemap BDR',
      instrument: 'Mercury Dual Imaging System',
      wmsUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mercury/mercury_simp_cyl.map',
      layerId: 'MERCURY_BDR',
      resolutionMeters: 166,
    },
  ];
}
