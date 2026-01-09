import { expect, test } from '@playwright/test';

test.describe('Smoke', () => {
    test('renders signed-out navigation', async ({ page }) => {
        await test.step('Setup', async () => {
            await page.goto('/');
        });

        await test.step('Assert', async () => {
            const header = page.getByRole('banner');
            await expect(
                header.getByRole('link', { name: /home/i }),
            ).toBeVisible();
            await expect(
                header.getByRole('button', { name: /sign in/i }),
            ).toBeVisible();
        });
    });

    test('opens auth drawer and shows email flow', async ({ page }) => {
        await test.step('Setup', async () => {
            await page.goto('/');
        });

        await test.step('Action', async () => {
            const header = page.getByRole('banner');
            await header.getByRole('button', { name: /sign in/i }).click();
        });

        await test.step('Assert', async () => {
            await expect(
                page.getByRole('radio', { name: /sign in/i }),
            ).toBeVisible();
            await expect(page.getByLabel(/email/i)).toBeVisible();
            await expect(page.getByLabel(/password/i)).toBeVisible();
        });
    });

    test('redirects unauthenticated users from protected routes', async ({
        page,
    }) => {
        await test.step('Action', async () => {
            await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
        });

        await test.step('Assert', async () => {
            await expect(page).toHaveURL(/\/$/);
        });
    });
});
