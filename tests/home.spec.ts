import { test, expect } from './fixtures';

test.describe('Home', () => {
    test('loads with the expected title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Iridium/i);
    });

    test('renders the marketing content', async ({ page }) => {
        await page.goto('/');
        await expect(
            page.getByRole('heading', { name: 'Iridium', level: 1 }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'What is included' }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'The stack' }),
        ).toBeVisible();
    });

    test('is reachable without authentication', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    });
});
