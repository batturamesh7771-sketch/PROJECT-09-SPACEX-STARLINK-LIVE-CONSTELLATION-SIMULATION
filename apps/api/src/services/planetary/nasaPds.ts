import type { PlanetaryMissionDataset } from '@cosmos/types';

/**
 * Returns NASA Planetary Data System (PDS4) & ESA Planetary Science Archive (PSA) datasets
 */
export async function fetchPlanetaryMissionDatasets(target?: string): Promise<PlanetaryMissionDataset[]> {
  const all: PlanetaryMissionDataset[] = [
    {
      id: 'urn:nasa:pds:mars2020_pixl',
      title: 'Mars 2020 Perseverance PIXL X-Ray Spectrometer Geochemical Bundle',
      missionName: 'Mars 2020 (Perseverance)',
      targetBody: 'Mars',
      instrumentName: 'PIXL',
      pdsVersion: 'PDS4',
      releaseDate: '2026-08-15',
      archiveUrl: 'https://pds-geosciences.wustl.edu/missions/mars2020/',
    },
    {
      id: 'urn:nasa:pds:lro_lola_dem',
      title: 'Lunar Reconnaissance Orbiter LOLA Global Laser Altimetry DEM (118m)',
      missionName: 'Lunar Reconnaissance Orbiter (LRO)',
      targetBody: 'Moon',
      instrumentName: 'LOLA',
      pdsVersion: 'PDS4',
      releaseDate: '2026-06-01',
      archiveUrl: 'https://pds-geosciences.wustl.edu/missions/lro/',
    },
    {
      id: 'urn:nasa:pds:juno_junocam',
      title: 'Juno Perijove 64 JunoCam Visible Color Imagery & Magnetometer Bundle',
      missionName: 'Juno',
      targetBody: 'Jupiter',
      instrumentName: 'JunoCam / MAG',
      pdsVersion: 'PDS4',
      releaseDate: '2026-09-01',
      archiveUrl: 'https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/JUNO/juno.html',
    },
    {
      id: 'urn:nasa:pds:osiris_rex_bennu',
      title: 'OSIRIS-REx Sample Return Capsule Regolith Spectral & PolyCam Global Mosaic',
      missionName: 'OSIRIS-REx',
      targetBody: 'Bennu',
      instrumentName: 'OCAMS / OVIRS',
      pdsVersion: 'PDS4',
      releaseDate: '2026-04-20',
      archiveUrl: 'https://sbn.psi.edu/pds/resource/orex/',
    },
    {
      id: 'urn:esa:psa:bepicolombo_mpo',
      title: 'BepiColombo Mercury Flyby MERTIS Thermal Infrared & MAG Telemetry',
      missionName: 'BepiColombo (ESA/JAXA)',
      targetBody: 'Mercury',
      instrumentName: 'MERTIS / MPO-MAG',
      pdsVersion: 'PDS4',
      releaseDate: '2026-07-12',
      archiveUrl: 'https://archives.esac.esa.int/psa/',
    },
  ];

  if (target && target !== 'ALL') {
    return all.filter((d) => d.targetBody.toLowerCase() === target.toLowerCase());
  }
  return all;
}
