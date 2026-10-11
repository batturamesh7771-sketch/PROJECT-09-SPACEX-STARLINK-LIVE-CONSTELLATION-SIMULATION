import { fetchAllActive } from '../services/celestrak.js';
import { query } from '../db/client.js';
import { logger } from '../utils/logger.js';

export const runTleSync = async () => {
  logger.info('Starting TLE sync job...');
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  try {
    const tles = await fetchAllActive();

    for (const tle of tles) {
      try {
        const noradId = parseInt(tle.line1.substring(2, 7).trim(), 10);
        
        // Extract epoch year and day from line 1
        const epochYear = parseInt(tle.line1.substring(18, 20), 10);
        const epochDay = parseFloat(tle.line1.substring(20, 32));
        
        const fullYear = epochYear < 57 ? 2000 + epochYear : 1900 + epochYear;
        const epochDate = new Date(Date.UTC(fullYear, 0, 0));
        epochDate.setUTCDate(epochDate.getUTCDate() + epochDay);

        // Upsert tle_current
        await query(`
          INSERT INTO tle_current (norad_id, name, line1, line2, epoch)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (norad_id) DO UPDATE SET
            name = EXCLUDED.name,
            line1 = EXCLUDED.line1,
            line2 = EXCLUDED.line2,
            epoch = EXCLUDED.epoch,
            fetched_at = NOW()
        `, [noradId, tle.name, tle.line1, tle.line2, epochDate]);

        // Insert tle_history (ignore duplicates)
        await query(`
          INSERT INTO tle_history (norad_id, name, line1, line2, epoch)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (norad_id, epoch) DO NOTHING
        `, [noradId, tle.name, tle.line1, tle.line2, epochDate]);
        
        successCount++;
      } catch (e) {
        errorCount++;
      }
    }
    
    logger.info(`TLE sync complete in ${Date.now() - startTime}ms. Success: ${successCount}, Errors: ${errorCount}`);
  } catch (error) {
    logger.error('TLE sync failed:', error);
  }
};
