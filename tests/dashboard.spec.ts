import { test, expect } from './fixtures';

test.describe('Dashboard', () => {
    test('renders for an authenticated user', async ({ authedPage: page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/dashboard$/);
        await expect(page.getByText('Hello Dashboard!')).toBeVisible();
    });

    test('redirects to login when logged out', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/login/);
        await expect(
            page.getByRole('heading', { name: 'Authenticate' }),
        ).toBeVisible();
    });
});
