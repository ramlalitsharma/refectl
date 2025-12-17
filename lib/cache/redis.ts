/**
 * Redis caching utilities
 * Falls back to in-memory cache if Redis is not available
 */

let redisClient: any = null;
const memoryCache = new Map<string, { value: any; expires: number }>();

// Try to initialize Redis
try {
  if (process.env.REDIS_URL) {
    const { Redis } = require('@upstash/redis');
    redisClient = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    });
  }
} catch (error) {
  console.warn('Redis not available, using in-memory cache');
}

export async function getCache(key: string): Promise<any | null> {
  try {
    if (redisClient) {
      const value = await redisClient.get(key);
      return value;
    } else {
      // Use in-memory cache
      const cached = memoryCache.get(key);
      if (cached && cached.expires > Date.now()) {
        return cached.value;
      }
      memoryCache.delete(key);
      return null;
    }
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCache(key: string, value: any, ttl: number = 3600): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.set(key, value, { ex: ttl });
    } else {
      // Use in-memory cache
      memoryCache.set(key, {
        value,
        expires: Date.now() + ttl * 1000,
      });
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function clearCache(pattern?: string): Promise<void> {
  try {
    if (redisClient && pattern) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } else {
      if (pattern) {
        // Simple pattern matching for memory cache
        const regex = new RegExp(pattern.replace('*', '.*'));
        for (const key of memoryCache.keys()) {
          if (regex.test(key)) {
            memoryCache.delete(key);
          }
        }
      } else {
        memoryCache.clear();
      }
    }
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

