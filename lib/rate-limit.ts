import { getDatabase } from './mongodb';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  key: string; // Unique key (e.g., userId, IP)
}

export async function rateLimit(options: RateLimitOptions): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  const { windowMs, max, key } = options;
  const db = await getDatabase();
  const rateLimitCollection = db.collection('rateLimits');

  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  // Clean up old entries
  await rateLimitCollection.deleteMany({ expiresAt: { $lt: now } });

  // Get current count
  const count = await rateLimitCollection.countDocuments({
    key,
    createdAt: { $gte: windowStart }
  });

  if (count >= max) {
    const oldest = await rateLimitCollection.findOne(
      { key, createdAt: { $gte: windowStart } },
      { sort: { createdAt: 1 } }
    );
    const resetTime = oldest ? new Date(oldest.createdAt.getTime() + windowMs) : new Date(now.getTime() + windowMs);
    return { allowed: false, remaining: 0, resetTime };
  }

  // Record this request
  await rateLimitCollection.insertOne({
    key,
    createdAt: now,
    expiresAt: new Date(now.getTime() + windowMs)
  });

  // Create TTL index if it doesn't exist
  try {
    await rateLimitCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  } catch {
    // Index might already exist
  }

  return {
    allowed: true,
    remaining: max - count - 1,
    resetTime: new Date(now.getTime() + windowMs)
  };
}

