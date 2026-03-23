/**
 * Simple in-memory sliding-window rate limiter.
 * Suitable for single-instance deployments. For distributed setups,
 * replace the backing store with Redis or a similar shared store.
 */

interface RateLimitEntry {
    timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(windowMs: number) {
    if (cleanupTimer) return;
    cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store) {
            entry.timestamps = entry.timestamps.filter(
                (t) => now - t < windowMs,
            );
            if (entry.timestamps.length === 0) {
                store.delete(key);
            }
        }
    }, CLEANUP_INTERVAL_MS);

    // Allow the process to exit without waiting for this timer.
    if (
        cleanupTimer &&
        typeof cleanupTimer === 'object' &&
        'unref' in cleanupTimer
    ) {
        cleanupTimer.unref();
    }
}

export function rateLimit({
    key,
    maxRequests,
    windowMs,
}: {
    /** Unique key for the rate limit bucket (e.g. userId). */
    key: string;
    /** Maximum number of requests allowed in the window. */
    maxRequests: number;
    /** Window duration in milliseconds. */
    windowMs: number;
}): { success: boolean; remaining: number } {
    startCleanup(windowMs);

    const now = Date.now();
    let entry = store.get(key);

    if (!entry) {
        entry = { timestamps: [] };
        store.set(key, entry);
    }

    // Remove expired timestamps
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    if (entry.timestamps.length >= maxRequests) {
        return { success: false, remaining: 0 };
    }

    entry.timestamps.push(now);
    return { success: true, remaining: maxRequests - entry.timestamps.length };
}
