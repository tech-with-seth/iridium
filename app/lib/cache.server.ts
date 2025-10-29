import { FlatCache } from 'flat-cache';

const cache = new FlatCache();

cache.load('app-cache', 'cache');

export function getCachedData<T>(key: string): T | undefined {
    return cache.getKey(key);
}

export function setCachedData<T>(
    key: string,
    data: T,
    ttlSeconds: number = 300,
): void {
    cache.setKey(key, data);
    // Set expiration
    cache.setKey(`${key}:ttl`, Date.now() + ttlSeconds * 1000);
    cache.save();
}

export function deleteCachedData(key: string): void {
    cache.removeKey(key);
    cache.removeKey(`${key}:ttl`);
    cache.save();
}

export function isCacheExpired(key: string): boolean {
    const ttl = cache.getKey(`${key}:ttl`);
    if (typeof ttl !== 'number') return true;

    return Date.now() > ttl;
}

export function getUserScopedKey(userId: string, key: string): string {
    return `user:${userId}:${key}`;
}

/**
 * Wraps an async function with caching logic
 * For use in model layer or any server-side function
 *
 * @param fetcher - The async function to wrap
 * @param cacheKey - Unique cache key
 * @param ttl - Time-to-live in seconds (default: 300)
 * @param fallback - Optional fallback value on error
 * @returns Cached version of the function
 *
 * @example
 * export const getFeatureFlags = withCache(
 *     async () => {
 *         const response = await fetch(...);
 *         return response.json();
 *     },
 *     'posthog:feature-flags',
 *     600,
 *     { results: [] }
 * );
 */
export function withCache<T>(
    fetcher: () => Promise<T>,
    cacheKey: string,
    ttl: number = 300,
    fallback?: T,
): () => Promise<T> {
    return async (): Promise<T> => {
        // Check cache first
        const cachedData = getCachedData<T>(cacheKey);

        if (cachedData && !isCacheExpired(cacheKey)) {
            return cachedData;
        }

        // Cache miss or expired - fetch data
        try {
            const freshData = await fetcher();

            // Update cache
            setCachedData(cacheKey, freshData, ttl);

            return freshData;
        } catch (error) {
            console.error(`Cache fetch error for key "${cacheKey}":`, error);

            // Return cached data if available, even if expired
            if (cachedData) {
                return cachedData;
            }

            // Return fallback if provided
            if (fallback !== undefined) {
                return fallback;
            }

            // Re-throw if no fallback
            throw error;
        }
    };
}

export { cache };
