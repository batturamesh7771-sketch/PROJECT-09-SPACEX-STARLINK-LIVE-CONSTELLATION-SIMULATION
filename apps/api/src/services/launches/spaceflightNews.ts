import axios from 'axios';
import { cacheGet, cacheSet } from '../../cache/redis.js';
import { logger } from '../../utils/logger.js';
import type { SpaceNewsArticle } from '@cosmos/types';

const SNAPI_BASE = 'https://api.spaceflightnewsapi.net/v4';

/**
 * Fetches latest spaceflight news articles from SNAPI v4
 */
export async function fetchSpaceflightNews(limit = 15): Promise<SpaceNewsArticle[]> {
  const cacheKey = `snapi:articles:${limit}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response = await axios.get(`${SNAPI_BASE}/articles/`, {
      params: { limit },
      timeout: 10000,
    });

    const results: any[] = response.data?.results || [];
    const articles: SpaceNewsArticle[] = results.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      imageUrl: item.image_url || '',
      newsSite: item.news_site || 'Spaceflight News',
      summary: item.summary || '',
      publishedAt: item.published_at,
      featured: Boolean(item.featured),
      launches: Array.isArray(item.launches)
        ? item.launches.map((l: any) => ({
            launchId: l.launch_id,
            provider: l.provider,
          }))
        : [],
    }));

    await cacheSet(cacheKey, JSON.stringify(articles), 900); // 15 min TTL
    return articles;
  } catch (error) {
    logger.warn('Failed to fetch Spaceflight News API v4:', error);
    return [];
  }
}
