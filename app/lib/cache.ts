// Browser-compatible cache (uses sessionStorage)
const CACHE_PREFIX = 'rr-cache:';

function getCachedData<T>(key: string): T | undefined {
    if (typeof window === 'undefined') return undefined;

    try {
        const item = sessionStorage.getItem(CACHE_PREFIX + key);
        return item ? JSON.parse(item) : undefined;
    } catch {
        return undefined;
    }
}

function setCachedData<T>(
    key: string,
    data: T,
    ttlSeconds: number = 300,
): void {
    if (typeof window === 'undefined') return;

    try {
        sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
        sessionStorage.setItem(
            CACHE_PREFIX + key + ':ttl',
            String(Date.now() + ttlSeconds * 1000),
        );
    } catch (error) {
        console.warn('Cache storage failed:', error);
    }
}

function deleteCachedData(key: string): void {
    if (typeof window === 'undefined') return;

    try {
        sessionStorage.removeItem(CACHE_PREFIX + key);
        sessionStorage.removeItem(CACHE_PREFIX + key + ':ttl');
    } catch {
        // Ignore errors
    }
}

function isCacheExpired(key: string): boolean {
    if (typeof window === 'undefined') return true;

    try {
        const ttl = sessionStorage.getItem(CACHE_PREFIX + key + ':ttl');
        if (!ttl) return true;
        return Date.now() > parseInt(ttl, 10);
    } catch {
        return true;
    }
}

/**
 * Creates a cached clientLoader for React Router with hydration support
 * Eliminates duplication in clientLoader caching pattern
 *
 * @param cacheKey - Unique cache key for this loader
 * @param ttl - Time-to-live in seconds (default: 300)
 * @returns A clientLoader function with hydration property
 *
 * @example
 * export const clientLoader = createCachedClientLoader({
 *     cacheKey: 'user-profile',
 *     ttl: 900
 * });
 */
export function createCachedClientLoader<T>(options: {
    cacheKey: string;
    ttl?: number;
}) {
    const { cacheKey, ttl = 300 } = options;
    let isInitialRequest = true;

    const clientLoader = async ({
        serverLoader,
    }: {
        serverLoader: () => Promise<T>;
    }): Promise<T> => {
        // (1) Prime cache on first load
        if (isInitialRequest) {
            isInitialRequest = false;
            const serverData = await serverLoader();
            setCachedData(cacheKey, serverData, ttl);
            return serverData;
        }

        // (2) Check if cache exists and is valid
        const cachedData = getCachedData<T>(cacheKey);
        if (cachedData && !isCacheExpired(cacheKey)) {
            return cachedData;
        }

        // (3) Cache miss or expired - fetch from server and update cache
        const serverData = await serverLoader();
        setCachedData(cacheKey, serverData, ttl);
        return serverData;
    };

    // Enable hydration
    clientLoader.hydrate = true as const;

    return clientLoader;
}

/**
 * Creates a cached clientAction for React Router
 * Automatically invalidates cache before executing server action
 *
 * @param cacheKey - Cache key to invalidate
 * @returns A clientAction function
 *
 * @example
 * export const clientAction = createCachedClientAction({
 *     cacheKey: 'user-profile'
 * });
 */
export function createCachedClientAction(options: { cacheKey: string }) {
    const { cacheKey } = options;

    return async ({
        serverAction,
    }: {
        serverAction: () => Promise<unknown>;
    }) => {
        // Clear cache before mutation to ensure fresh data on next load
        deleteCachedData(cacheKey);

        // Execute server action
        const result = await serverAction();
        return result;
    };
}

// No cache export for client-side (use sessionStorage directly)
