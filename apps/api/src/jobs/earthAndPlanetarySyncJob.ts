import { query } from '../db/client.js';
import { logger } from '../utils/logger.js';
import { fetchEonetNaturalEvents } from '../services/earthObs/nasaEonet.js';
import { fetchPlanetaryEphemerides } from '../services/planetary/jplHorizons.js';
import { fetchMarsRoverPhotos } from '../services/planetary/marsRover.js';

export const runEarthAndPlanetarySync = async (): Promise<void> => {
  logger.info('Starting Earth Observation & Planetary Science synchronization job...');
  try {
    const [events, ephemerides, roverPhotos] = await Promise.all([
      fetchEonetNaturalEvents(30),
      fetchPlanetaryEphemerides(),
      fetchMarsRoverPhotos('curiosity'),
    ]);

    for (const ev of events) {
      await query(
        `INSERT INTO eonet_natural_events (
           id, title, category_id, category_title, event_date, lat, lon,
           magnitude_value, magnitude_unit, source_url, fetched_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
         ON CONFLICT (id) DO UPDATE SET
           event_date = EXCLUDED.event_date,
           lat = EXCLUDED.lat,
           lon = EXCLUDED.lon,
           magnitude_value = EXCLUDED.magnitude_value,
           fetched_at = NOW()`,
        [
          ev.id,
          ev.title,
          ev.categoryId,
          ev.categoryTitle,
          ev.date,
          ev.lat,
          ev.lon,
          ev.magnitudeValue,
          ev.magnitudeUnit,
          ev.sourceUrl,
        ]
      );
    }

    for (const ephem of ephemerides) {
      await query(
        `INSERT INTO planetary_ephemerides (
           body_id, name, category, helio_x_au, helio_y_au, helio_z_au,
           helio_r_au, geo_dist_au, light_time_min, orbital_speed_kms, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
         ON CONFLICT (body_id) DO UPDATE SET
           helio_x_au = EXCLUDED.helio_x_au,
           helio_y_au = EXCLUDED.helio_y_au,
           helio_z_au = EXCLUDED.helio_z_au,
           helio_r_au = EXCLUDED.helio_r_au,
           geo_dist_au = EXCLUDED.geo_dist_au,
           light_time_min = EXCLUDED.light_time_min,
           updated_at = NOW()`,
        [
          ephem.bodyId,
          ephem.name,
          ephem.category,
          ephem.heliocentricAu.x,
          ephem.heliocentricAu.y,
          ephem.heliocentricAu.z,
          ephem.heliocentricAu.r,
          ephem.geocentric.distanceAu,
          ephem.geocentric.lightTimeMinutes,
          ephem.orbitalSpeedKms,
        ]
      );
    }

    for (const photo of roverPhotos) {
      await query(
        `INSERT INTO mars_rover_photos (
           id, sol, earth_date, img_src, camera_name, camera_full_name, rover_name, fetched_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          photo.id,
          photo.sol,
          photo.earthDate,
          photo.imgSrc,
          photo.cameraName,
          photo.cameraFullName,
          photo.roverName,
        ]
      );
    }

    logger.info(
      `Earth Obs & Planetary sync completed: ${events.length} EONET hazards, ${ephemerides.length} planetary bodies, ${roverPhotos.length} Mars photos.`
    );
  } catch (error) {
    logger.warn('Earth Obs & Planetary DB persistence skipped or failed (live API cache still active):', error);
  }
};
