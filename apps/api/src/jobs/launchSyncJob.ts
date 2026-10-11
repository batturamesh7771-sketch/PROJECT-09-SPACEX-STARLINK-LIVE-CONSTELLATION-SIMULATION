import { query } from '../db/client.js';
import { logger } from '../utils/logger.js';
import { fetchUpcomingLaunches } from '../services/launches/launchLibrary.js';
import { fetchSpaceflightNews } from '../services/launches/spaceflightNews.js';

export const runLaunchSync = async (): Promise<void> => {
  logger.info('Starting Launch & Spaceflight News synchronization job...');
  try {
    const [launches, news] = await Promise.all([
      fetchUpcomingLaunches(20),
      fetchSpaceflightNews(20),
    ]);

    for (const l of launches) {
      await query(
        `INSERT INTO launches (
           id, name, status, net, window_start, window_end,
           provider_name, rocket_name, mission_name, mission_orbit,
           pad_name, pad_location, pad_lat, pad_lon, image_url, raw_data, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW())
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           net = EXCLUDED.net,
           window_start = EXCLUDED.window_start,
           window_end = EXCLUDED.window_end,
           raw_data = EXCLUDED.raw_data,
           updated_at = NOW()`,
        [
          l.id,
          l.name,
          l.status,
          l.net,
          l.windowStart,
          l.windowEnd,
          l.provider.name,
          l.rocket.fullName,
          l.mission?.name || null,
          l.mission?.orbitAbbrev || null,
          l.pad.name,
          l.pad.locationName,
          l.pad.latitude,
          l.pad.longitude,
          l.imageUrl,
          JSON.stringify(l),
        ]
      );
    }

    for (const article of news) {
      await query(
        `INSERT INTO space_news (id, title, url, image_url, news_site, summary, published_at, fetched_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           summary = EXCLUDED.summary`,
        [
          article.id,
          article.title,
          article.url,
          article.imageUrl,
          article.newsSite,
          article.summary,
          article.publishedAt,
        ]
      );
    }

    logger.info(`Launch sync completed: ${launches.length} upcoming launches, ${news.length} news articles.`);
  } catch (error) {
    logger.warn('Launch DB persistence skipped or failed (live API cache still active):', error);
  }
};
