import { logger } from '../utils/logger.js';
import { query } from '../db/client.js';
import { fetchExoplanets } from '../services/deepSpace/exoplanetArchive.js';
import { fetchGravitationalWaveEvents } from '../services/deepSpace/gwosc.js';
import { fetchDsnTelemetryLinks } from '../services/deepSpace/cosmicRay.js';

export async function runDeepSpaceSync(): Promise<void> {
  try {
    logger.info('Starting Deep Space, Exoplanets & Multi-Messenger Astrophysics sync...');

    const [exoplanets, gwEvents, dsnLinks] = await Promise.all([
      fetchExoplanets(),
      fetchGravitationalWaveEvents(),
      fetchDsnTelemetryLinks(),
    ]);

    for (const p of exoplanets) {
      await query(
        `INSERT INTO exoplanets (
          pl_name, hostname, disc_year, discovery_method, orb_per_days, rade_earth,
          bmasse_earth, eq_temp_k, sy_dist_pc, is_habitable, esi_score, fetched_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
        ON CONFLICT (pl_name) DO UPDATE SET
          rade_earth = EXCLUDED.rade_earth,
          bmasse_earth = EXCLUDED.bmasse_earth,
          eq_temp_k = EXCLUDED.eq_temp_k,
          is_habitable = EXCLUDED.is_habitable,
          esi_score = EXCLUDED.esi_score,
          fetched_at = NOW()`,
        [
          p.plName,
          p.hostname,
          p.discYear,
          p.discoveryMethod,
          p.orbPerDays,
          p.radeEarth,
          p.bmasseEarth,
          p.eqTempK,
          p.syDistPc,
          p.isHabitableZone,
          p.esiScore,
        ]
      ).catch(() => {});
    }

    for (const gw of gwEvents) {
      await query(
        `INSERT INTO gravitational_wave_events (
          common_name, catalog_name, event_utc, mass_1_solar, mass_2_solar,
          final_mass_solar, chirp_mass_solar, distance_mpc, network_snr, merger_type, fetched_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
        ON CONFLICT (common_name) DO UPDATE SET
          network_snr = EXCLUDED.network_snr,
          distance_mpc = EXCLUDED.distance_mpc,
          fetched_at = NOW()`,
        [
          gw.commonName,
          gw.catalogName,
          gw.eventUtc,
          gw.mass1Solar,
          gw.mass2Solar,
          gw.finalMassSolar,
          gw.chirpMassSolar,
          gw.luminosityDistanceMpc,
          gw.networkSnr,
          gw.mergerType,
        ]
      ).catch(() => {});
    }

    for (const dsn of dsnLinks) {
      await query(
        `INSERT INTO dsn_telemetry_links (
          dish_name, complex, target_spacecraft, down_freq_ghz, down_rate_kbps,
          rtlt_hours, distance_mkm, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
        ON CONFLICT (dish_name) DO UPDATE SET
          target_spacecraft = EXCLUDED.target_spacecraft,
          down_rate_kbps = EXCLUDED.down_rate_kbps,
          rtlt_hours = EXCLUDED.rtlt_hours,
          updated_at = NOW()`,
        [
          dsn.dishName,
          dsn.complex,
          dsn.targetSpacecraft,
          dsn.downSignalFreqGhz,
          dsn.downDataRateKbps,
          dsn.roundTripLightTimeHours,
          dsn.distanceMillionKm,
        ]
      ).catch(() => {});
    }

    logger.info(
      `Deep Space sync completed: ${exoplanets.length} exoplanets, ${gwEvents.length} GW events, ${dsnLinks.length} DSN links.`
    );
  } catch (error) {
    logger.error('Error in runDeepSpaceSync:', error);
  }
}
