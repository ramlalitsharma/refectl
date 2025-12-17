import { getDatabase } from './mongodb';
import { sanitizeString } from './security';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  key: string; // Unique key (e.g., userId, IP)
  identifier?: string; // Optional identifier for logging
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // Seconds until retry is allowed
}

export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { windowMs, max, key, identifier } = options;
  
  // Sanitize key to prevent injection
  const sanitizedKey = sanitizeString(key, 200);
  
  const db = await getDatabase();
  const rateLimitCollection = db.collection('rateLimits');

  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  try {
    // Clean up old entries (async, don't wait)
    rateLimitCollection.deleteMany({ expiresAt: { $lt: now } }).catch(() => {});

    // Get current count with optimized query
    const count = await rateLimitCollection.countDocuments({
      key: sanitizedKey,
      createdAt: { $gte: windowStart }
    });

    if (count >= max) {
      // Find oldest request to calculate reset time
      const oldest = await rateLimitCollection.findOne(
        { key: sanitizedKey, createdAt: { $gte: windowStart } },
        { sort: { createdAt: 1 }, projection: { createdAt: 1 } }
      );
      
      const resetTime = oldest 
        ? new Date(oldest.createdAt.getTime() + windowMs) 
        : new Date(now.getTime() + windowMs);
      
      const retryAfter = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);
      
      // Log rate limit hit (optional)
      if (identifier) {
        console.warn(`Rate limit exceeded for ${identifier} (key: ${sanitizedKey.substring(0, 20)}...)`);
      }

      return { 
        allowed: false, 
        remaining: 0, 
        resetTime,
        retryAfter: Math.max(1, retryAfter)
      };
    }

    // Record this request
    await rateLimitCollection.insertOne({
      key: sanitizedKey,
      createdAt: now,
      expiresAt: new Date(now.getTime() + windowMs),
      ...(identifier && { identifier: sanitizeString(identifier, 100) })
    });

    // Ensure TTL index exists (async, don't wait)
    rateLimitCollection.createIndex(
      { expiresAt: 1 }, 
      { expireAfterSeconds: 0, background: true }
    ).catch(() => {});

    // Also create index on key and createdAt for faster queries
    rateLimitCollection.createIndex(
      { key: 1, createdAt: -1 },
      { background: true }
    ).catch(() => {});

    return {
      allowed: true,
      remaining: max - count - 1,
      resetTime: new Date(now.getTime() + windowMs)
    };
  } catch (error) {
    // On error, allow the request but log it
    console.error('Rate limit check failed:', error);
    return {
      allowed: true,
      remaining: max,
      resetTime: new Date(now.getTime() + windowMs)
    };
  }
}

/**
 * In-memory rate limiter for high-frequency checks (fallback)
 */
class InMemoryRateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (now > value.resetTime) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  check(key: string, max: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return {
        allowed: true,
        remaining: max - 1,
        resetTime: new Date(now + windowMs)
      };
    }

    if (entry.count >= max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(entry.resetTime),
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: max - entry.count,
      resetTime: new Date(entry.resetTime)
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Global in-memory rate limiter instance
export const inMemoryRateLimiter = new InMemoryRateLimiter();

