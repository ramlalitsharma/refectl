// Cache Service - Simple In-Memory Cache with TTL
// Note: In a production cluster, this should be replaced with Redis.
// For a single-instance deployment, this Map-based approach is extremely fast and sufficient.

type CacheItem<T> = {
    value: T;
    expiresAt: number;
};

// Global cache store
const cache = new Map<string, CacheItem<any>>();

export const CacheService = {
    /**
     * Get item from cache
     */
    get: <T>(key: string): T | null => {
        const item = cache.get(key);

        if (!item) return null;

        if (Date.now() > item.expiresAt) {
            cache.delete(key);
            return null;
        }

        return item.value;
    },

    /**
     * Set item in cache
     * @param ttlSeconds Time to live in seconds
     */
    set: <T>(key: string, value: T, ttlSeconds: number): void => {
        const expiresAt = Date.now() + (ttlSeconds * 1000);
        cache.set(key, { value, expiresAt });

        // Simple cleanup to prevent overflow (optional limit could be added)
        if (cache.size > 1000) {
            // Evict oldest if needed
        }
    },

    /**
     * Delete item from cache
     */
    del: (key: string): void => {
        cache.delete(key);
    },

    /**
     * Invalidate all keys matching a prefix
     */
    invalidatePattern: (prefix: string): void => {
        for (const key of cache.keys()) {
            if (key.startsWith(prefix)) {
                cache.delete(key);
            }
        }
    },

    /**
     * Helper: Wrap a promise with caching
     */
    wrap: async <T>(
        key: string,
        ttlSeconds: number,
        fetchFn: () => Promise<T>
    ): Promise<T> => {
        const cached = CacheService.get<T>(key);
        if (cached) {
            return cached;
        }

        const fresh = await fetchFn();
        if (fresh) {
            CacheService.set(key, fresh, ttlSeconds);
        }
        return fresh;
    }
};
