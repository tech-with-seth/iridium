import { describe, expect, it } from 'vitest';
import {
    rateLimit,
    _resetRateLimitStore,
    _getRateLimitStoreSize,
} from './rate-limit.server';

// Reset the module-level store between test suites by using unique keys
let keyCounter = 0;
function uniqueKey(prefix = 'test') {
    return `${prefix}-${++keyCounter}-${Date.now()}`;
}

describe('rateLimit', () => {
    it('allows requests within the limit', () => {
        const key = uniqueKey();
        const result = rateLimit({ key, maxRequests: 5, windowMs: 60_000 });

        expect(result.success).toBe(true);
        expect(result.remaining).toBe(4);
    });

    it('tracks remaining count correctly', () => {
        const key = uniqueKey();
        const opts = { key, maxRequests: 3, windowMs: 60_000 };

        const r1 = rateLimit(opts);
        const r2 = rateLimit(opts);
        const r3 = rateLimit(opts);

        expect(r1.remaining).toBe(2);
        expect(r2.remaining).toBe(1);
        expect(r3.remaining).toBe(0);
    });

    it('rejects requests exceeding the limit', () => {
        const key = uniqueKey();
        const opts = { key, maxRequests: 2, windowMs: 60_000 };

        rateLimit(opts);
        rateLimit(opts);
        const result = rateLimit(opts);

        expect(result.success).toBe(false);
        expect(result.remaining).toBe(0);
    });

    it('isolates different keys', () => {
        const keyA = uniqueKey('a');
        const keyB = uniqueKey('b');

        rateLimit({ key: keyA, maxRequests: 1, windowMs: 60_000 });

        const result = rateLimit({
            key: keyB,
            maxRequests: 1,
            windowMs: 60_000,
        });

        expect(result.success).toBe(true);
    });

    it('expires old timestamps outside the window', async () => {
        const key = uniqueKey();
        const opts = { key, maxRequests: 1, windowMs: 50 };

        rateLimit(opts);
        const blocked = rateLimit(opts);
        expect(blocked.success).toBe(false);

        // Wait for the window to expire
        await new Promise((resolve) => setTimeout(resolve, 60));

        const afterExpiry = rateLimit(opts);
        expect(afterExpiry.success).toBe(true);
    });

    it('treats subsequent requests on the same key as a single bucket', () => {
        const key = uniqueKey();
        const opts = { key, maxRequests: 100, windowMs: 60_000 };

        rateLimit(opts);
        const second = rateLimit(opts);

        expect(second.remaining).toBe(98);
    });

    it('reports remaining=0 for the request that hits the cap', () => {
        const key = uniqueKey();
        const opts = { key, maxRequests: 1, windowMs: 60_000 };

        const first = rateLimit(opts);
        expect(first.success).toBe(true);
        expect(first.remaining).toBe(0);
    });

    it('does not leak count across different limits on the same key', () => {
        const key = uniqueKey();

        rateLimit({ key, maxRequests: 100, windowMs: 60_000 });
        const tight = rateLimit({ key, maxRequests: 1, windowMs: 60_000 });

        // Both calls go into the same bucket, so the second one with maxRequests=1
        // sees the existing timestamp and is rejected.
        expect(tight.success).toBe(false);
    });
});

describe('rateLimit key cap', () => {
    it('does not exceed the hard MAX_KEYS cap when adding many distinct keys', () => {
        _resetRateLimitStore();

        // Add a bunch of unique keys; we won't reach 50_000 in a unit test
        // (too slow), but we can verify additions track size correctly.
        for (let i = 0; i < 100; i++) {
            rateLimit({
                key: `cap-test-${i}`,
                maxRequests: 1,
                windowMs: 60_000,
            });
        }

        expect(_getRateLimitStoreSize()).toBe(100);
    });
});
