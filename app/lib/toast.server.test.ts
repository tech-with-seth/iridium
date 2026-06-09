import { describe, expect, it, vi } from 'vitest';

vi.mock('~/lib/env.server', () => ({
    env: {
        BETTER_AUTH_SECRET: 'test-secret-test-secret-test-secret!',
        NODE_ENV: 'test',
    },
}));

import { getToast, redirectWithToast } from './toast.server';

describe('toast flash round-trip', () => {
    it('redirects with a Set-Cookie header', async () => {
        const response = await redirectWithToast('/dashboard', {
            type: 'success',
            message: 'Saved',
        });

        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('/dashboard');
        expect(response.headers.get('Set-Cookie')).toContain('__toast=');
    });

    it('reads the toast back from the flash cookie and clears it', async () => {
        const redirectResponse = await redirectWithToast('/dashboard', {
            type: 'error',
            message: 'Something failed',
        });
        const cookie = redirectResponse.headers.get('Set-Cookie')!;

        const request = new Request('http://localhost/dashboard', {
            headers: { Cookie: cookie.split(';')[0] },
        });
        const { toast, headers } = await getToast(request);

        expect(toast).toEqual({ type: 'error', message: 'Something failed' });
        // Consuming the flash must re-commit the session to clear it.
        expect(headers.get('Set-Cookie')).toBeTruthy();
    });

    it('returns null and no headers when there is no toast', async () => {
        const request = new Request('http://localhost/dashboard');
        const { toast, headers } = await getToast(request);

        expect(toast).toBeNull();
        expect(headers.get('Set-Cookie')).toBeNull();
    });
});
