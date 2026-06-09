import { test, expect } from './fixtures';

test.describe('Theme switching', () => {
    test('defaults to system (no data-theme attribute)', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('html')).not.toHaveAttribute(
            'data-theme',
            /./,
        );
    });

    test('selecting dark sets data-theme and persists across reload without FOUC', async ({
        page,
    }) => {
        await page.goto('/');

        await page.getByRole('button', { name: 'Change theme' }).click();
        await page.getByRole('button', { name: 'Dark' }).click();

        await expect(page.locator('html')).toHaveAttribute(
            'data-theme',
            'night',
        );

        // SSR must set the attribute in the initial HTML payload (no flash):
        // fetch the document directly instead of waiting for hydration.
        const response = await page.request.get('/');
        expect(await response.text()).toContain('data-theme="night"');

        await page.reload();
        await expect(page.locator('html')).toHaveAttribute(
            'data-theme',
            'night',
        );
    });

    test('selecting light sets the light theme', async ({ page }) => {
        await page.goto('/');

        await page.getByRole('button', { name: 'Change theme' }).click();
        await page.getByRole('button', { name: 'Light' }).click();

        await expect(page.locator('html')).toHaveAttribute(
            'data-theme',
            'emerald',
        );
    });

    test('rejects an invalid theme value', async ({ page }) => {
        const response = await page.request.post('/api/theme', {
            form: { theme: 'neon' },
        });

        expect(response.status()).toBe(400);
    });
});
