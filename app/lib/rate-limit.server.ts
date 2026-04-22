/**
 * Simple in-memory sliding-window rate limiter.
 * Suitable for single-instance deployments. For distributed setups,
 * replace the backing store with Redis or a similar shared store.
 */

interface RateLimitEntry {
    timestamps: number[];
    /** Last access timestamp, used for LRU-ish eviction when over key cap. */
    lastTouched: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60_000;

/** Hard cap on the number of distinct keys held in memory. */
const MAX_KEYS = 50_000;

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

/**
 * Evict the least-recently-touched entries when the store exceeds MAX_KEYS.
 * Crude but bounded — prevents adversarial keyspace expansion from blowing
 * memory. Map iteration order is insertion order, so we sort by lastTouched.
 */
function enforceKeyCap() {
    if (store.size <= MAX_KEYS) return;

    const overage = store.size - MAX_KEYS;
    const entries = Array.from(store.entries()).sort(
        (a, b) => a[1].lastTouched - b[1].lastTouched,
    );

    for (let i = 0; i < overage; i++) {
        store.delete(entries[i][0]);
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
        entry = { timestamps: [], lastTouched: now };
        store.set(key, entry);
        enforceKeyCap();
    } else {
        entry.lastTouched = now;
    }

    // Remove expired timestamps
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    if (entry.timestamps.length >= maxRequests) {
        return { success: false, remaining: 0 };
    }

    entry.timestamps.push(now);
    return { success: true, remaining: maxRequests - entry.timestamps.length };
}

/** Internal: test-only reset hook. Not exported via public API. */
export function _resetRateLimitStore() {
    store.clear();
}

/** Internal: test-only inspection. */
export function _getRateLimitStoreSize() {
    return store.size;
}
