import { test, expect } from './fixtures';

test.describe('Healthcheck', () => {
    test('reports ok when both databases are reachable', async ({
        request,
    }) => {
        const res = await request.get('/healthcheck');
        expect(res.status()).toBe(200);
        expect(res.headers()['content-type']).toContain('application/json');
        await expect(res.json()).resolves.toEqual({ status: 'ok' });
    });
});
