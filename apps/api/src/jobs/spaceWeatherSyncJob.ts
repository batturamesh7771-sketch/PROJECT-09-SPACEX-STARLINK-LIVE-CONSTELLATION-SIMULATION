import { query } from '../db/client.js';
import { logger } from '../utils/logger.js';
import { fetchNoaaKpIndex } from '../services/spaceWeather/noaaSwpc.js';
import { fetchDonkiSolarFlares, fetchDonkiCMEs } from '../services/spaceWeather/nasaDonki.js';

export const runSpaceWeatherSync = async (): Promise<void> => {
  logger.info('Starting Space Weather synchronization job...');
  try {
    const [kpReadings, flares, cmes] = await Promise.all([
      fetchNoaaKpIndex(),
      fetchDonkiSolarFlares(7),
      fetchDonkiCMEs(7),
    ]);

    for (const r of kpReadings) {
      await query(
        `INSERT INTO space_weather_kp (timestamp, kp, a_running, station_count, storm_level, source)
         VALUES ($1, $2, $3, $4, $5, 'noaa')
         ON CONFLICT (timestamp) DO UPDATE SET
           kp = EXCLUDED.kp,
           a_running = EXCLUDED.a_running,
           storm_level = EXCLUDED.storm_level`,
        [r.timestamp, r.kp, r.aRunning, r.stationCount, r.stormLevel]
      );
    }

    for (const flr of flares) {
      await query(
        `INSERT INTO space_weather_events (id, event_type, start_time, peak_time, class_or_speed, source_location, is_earth_directed, details)
         VALUES ($1, 'FLARE', $2, $3, $4, $5, FALSE, $6)
         ON CONFLICT (id) DO UPDATE SET
           class_or_speed = EXCLUDED.class_or_speed,
           details = EXCLUDED.details,
           fetched_at = NOW()`,
        [flr.flrID, flr.beginTime, flr.peakTime, flr.classType, flr.sourceLocation, JSON.stringify(flr)]
      );
    }

    for (const cme of cmes) {
      await query(
        `INSERT INTO space_weather_events (id, event_type, start_time, peak_time, class_or_speed, source_location, is_earth_directed, details)
         VALUES ($1, 'CME', $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           is_earth_directed = EXCLUDED.is_earth_directed,
           details = EXCLUDED.details,
           fetched_at = NOW()`,
        [
          cme.activityID,
          cme.startTime,
          cme.estimatedArrivalTime,
          cme.speed ? `${cme.speed} km/s` : 'Unknown',
          cme.sourceLocation,
          cme.isEarthDirected,
          JSON.stringify(cme),
        ]
      );
    }

    logger.info(
      `Space Weather sync completed: ${kpReadings.length} Kp rows, ${flares.length} flares, ${cmes.length} CMEs.`
    );
  } catch (error) {
    logger.warn('Space Weather DB persistence skipped or failed (live API cache still active):', error);
  }
};
