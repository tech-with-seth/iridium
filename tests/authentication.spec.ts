import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('sign-in page is accessible', async ({ page }) => {
        await page.goto('/sign-in');

        // Check for sign-in form elements
        await expect(page).toHaveURL(/sign-in/);

        // Look for email input (label may not have explicit name attribute)
        const emailInput = page.locator('input[type="email"]');
        await expect(emailInput).toBeVisible();

        // Look for password input
        const passwordInput = page.locator('input[type="password"]');
        await expect(passwordInput).toBeVisible();

        // Look for sign-in button
        const signInButton = page.getByRole('button', { name: /sign in/i });
        await expect(signInButton).toBeVisible();
    });

    test('protected routes redirect to sign-in when not authenticated', async ({
        page,
    }) => {
        // Try to access dashboard without authentication
        await page.goto('/dashboard');

        // Should redirect to sign-in
        await expect(page).toHaveURL(/sign-in/);
    });

    test('profile route is protected', async ({ page }) => {
        // Try to access profile without authentication
        await page.goto('/profile');

        // Should redirect to sign-in
        await expect(page).toHaveURL(/sign-in/);
    });

    test('admin routes are protected', async ({ page }) => {
        // Try to access admin area without authentication
        await page.goto('/admin/design');

        // Should redirect to sign-in
        await expect(page).toHaveURL(/sign-in/);
    });
});
