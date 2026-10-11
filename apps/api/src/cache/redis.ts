import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 50, 2000);
  },
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    return await redis.get(key);
  } catch (error) {
    logger.warn(`Redis get error for key ${key}:`, error);
    return null;
  }
};

export const cacheSet = async (key: string, value: string, ttlSeconds: number = 300): Promise<void> => {
  try {
    await redis.set(key, value, 'EX', ttlSeconds);
  } catch (error) {
    logger.warn(`Redis set error for key ${key}:`, error);
  }
};

export const cacheDelete = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    logger.warn(`Redis delete error for key ${key}:`, error);
  }
};

export const cacheClear = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.warn(`Redis clear error for pattern ${pattern}:`, error);
  }
};
