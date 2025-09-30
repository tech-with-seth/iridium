import { FlatCache } from 'flat-cache';

const cache = new FlatCache();

cache.load('app-cache', 'cache');

export function getCachedData<T>(key: string): T | undefined {
    return cache.getKey(key);
}

export function setCachedData<T>(
    key: string,
    data: T,
    ttlSeconds: number = 300
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

export { cache };
