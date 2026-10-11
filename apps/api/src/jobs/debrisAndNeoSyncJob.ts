import { query } from '../db/client.js';
import { logger } from '../utils/logger.js';
import { fetchConjunctionAlerts } from '../services/debris/conjunctionData.js';
import { fetchNeoCloseApproaches } from '../services/asteroids/jplCad.js';
import { fetchSentryImpactRisks } from '../services/asteroids/jplSentry.js';
import { fetchFireballEvents } from '../services/asteroids/jplFireball.js';

export const runDebrisAndNeoSync = async (): Promise<void> => {
  logger.info('Starting Space Debris & Planetary Defense (NEO) synchronization job...');
  try {
    const [conjunctions, neos, sentryRisks, fireballs] = await Promise.all([
      fetchConjunctionAlerts(),
      fetchNeoCloseApproaches(15),
      fetchSentryImpactRisks(),
      fetchFireballEvents(30),
    ]);

    for (const c of conjunctions) {
      await query(
        `INSERT INTO conjunction_alerts (
           cdm_id, tca, min_range_km, rel_speed_kms, collision_prob, risk_level,
           sat1_norad, sat1_name, sat2_norad, sat2_name, raw_data, fetched_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
         ON CONFLICT (cdm_id) DO UPDATE SET
           min_range_km = EXCLUDED.min_range_km,
           collision_prob = EXCLUDED.collision_prob,
           risk_level = EXCLUDED.risk_level,
           raw_data = EXCLUDED.raw_data,
           fetched_at = NOW()`,
        [
          c.cdmId,
          c.tca,
          c.minRangeKm,
          c.relativeSpeedKms,
          c.collisionProbability,
          c.riskLevel,
          c.sat1.noradId,
          c.sat1.name,
          c.sat2.noradId,
          c.sat2.name,
          JSON.stringify(c),
        ]
      );
    }

    for (const n of neos) {
      const id = `${n.designation}-${n.closeApproachDate.slice(0, 10)}`;
      const parsedDate = new Date(n.closeApproachDate);
      const validIso = Number.isNaN(parsedDate.getTime())
        ? new Date().toISOString()
        : parsedDate.toISOString();

      await query(
        `INSERT INTO neo_close_approaches (
           id, designation, full_name, approach_date, dist_lunar, dist_km,
           v_rel_kms, h_mag, diameter_min_m, diameter_max_m, is_pha, fetched_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
         ON CONFLICT (id) DO UPDATE SET
           dist_lunar = EXCLUDED.dist_lunar,
           dist_km = EXCLUDED.dist_km,
           v_rel_kms = EXCLUDED.v_rel_kms,
           fetched_at = NOW()`,
        [
          id,
          n.designation,
          n.fullName,
          validIso,
          n.distLunar,
          n.distKm,
          n.vRelKms,
          n.hMag,
          n.estimatedDiameterMeters.min,
          n.estimatedDiameterMeters.max,
          n.isPotentiallyHazardous,
        ]
      );
    }

    for (const s of sentryRisks) {
      await query(
        `INSERT INTO sentry_risks (
           designation, full_name, ip_cumulative, ps_cumulative, ts_max,
           impact_count, year_range, diameter_km, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
         ON CONFLICT (designation) DO UPDATE SET
           ip_cumulative = EXCLUDED.ip_cumulative,
           ps_cumulative = EXCLUDED.ps_cumulative,
           impact_count = EXCLUDED.impact_count,
           updated_at = NOW()`,
        [
          s.designation,
          s.fullName,
          s.ipCumulative,
          s.psCumulative,
          s.tsMax,
          s.impactCount,
          s.yearRange,
          s.diameterKm,
        ]
      );
    }

    for (const fb of fireballs) {
      await query(
        `INSERT INTO fireball_events (id, event_date, lat, lon, alt_km, velocity_kms, energy_kt, fetched_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
         ON CONFLICT (id) DO NOTHING`,
        [fb.id, fb.date, fb.lat, fb.lon, fb.altKm, fb.velocityKms, fb.impactEnergyKt]
      );
    }

    logger.info(
      `Debris & NEO sync completed: ${conjunctions.length} CDMs, ${neos.length} NEO flybys, ${sentryRisks.length} Sentry objects, ${fireballs.length} fireballs.`
    );
  } catch (error) {
    logger.warn('Debris & NEO DB persistence skipped or failed (live API cache still active):', error);
  }
};
