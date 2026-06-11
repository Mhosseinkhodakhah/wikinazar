import Redis from 'ioredis';
import { env } from '../../config';
import { logger } from '../logger/logger';

let redisClient: Redis | null = null;
let redisAvailable = false;

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: env.redis.host,
      port: env.redis.port,
      password: env.redis.password,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
      redisAvailable = true;
      logger.info('Redis connected', { host: env.redis.host, port: env.redis.port });
    });

    redisClient.on('error', (err) => {
      redisAvailable = false;
      logger.error('Redis connection error', err);
    });

    redisClient.on('close', () => {
      redisAvailable = false;
      logger.warn('Redis connection closed');
    });
  }

  return redisClient;
}

export function isRedisAvailable(): boolean {
  return redisAvailable;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    redisAvailable = false;
    logger.info('Redis disconnected');
  }
}

async function runWithRedis<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!redisAvailable) return fallback;
  try {
    return await fn();
  } catch (error) {
    logger.warn('Redis operation failed', { error: (error as Error).message });
    return fallback;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
  return runWithRedis(async () => {
    const redis = getRedis();
    const serialized = JSON.stringify(value);
    await redis.setex(key, ttlSeconds, serialized);
  }, undefined);
}

export async function getCache<T>(key: string): Promise<T | null> {
  return runWithRedis(async () => {
    const redis = getRedis();
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }, null);
}

export async function invalidateCache(key: string): Promise<void> {
  return runWithRedis(async () => {
    const redis = getRedis();
    await redis.del(key);
  }, undefined);
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  return runWithRedis(async () => {
    const redis = getRedis();
    const keys: string[] = [];
    let cursor = '0';
    do {
      const result = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== '0');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }, undefined);
}
