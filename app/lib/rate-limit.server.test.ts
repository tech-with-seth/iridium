import { describe, expect, it } from 'vitest';
import { rateLimit } from './rate-limit.server';

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
});
