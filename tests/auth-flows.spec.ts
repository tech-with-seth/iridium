import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
    test.describe('Sign In', () => {
        test('successfully signs in with valid credentials', async ({
            page,
        }) => {
            await page.goto('/sign-in');

            // Fill in credentials
            await page.fill('input[name="email"]', 'admin@iridium.com');
            await page.fill('input[name="password"]', 'Admin123!');

            // Submit form
            await page.click('button[type="submit"]');

            // Should redirect to dashboard
            await page.waitForURL('/dashboard');
            await expect(page).toHaveURL('/dashboard');
        });

        test('shows error with invalid credentials', async ({ page }) => {
            await page.goto('/sign-in');

            await page.fill('input[name="email"]', 'invalid@example.com');
            await page.fill('input[name="password"]', 'wrongpassword');

            await page.click('button[type="submit"]');

            // Should show error message (adjust selector based on your implementation)
            await expect(
                page.locator('text=/invalid.*credentials/i'),
            ).toBeVisible({ timeout: 5000 });
        });

        test('validates email format', async ({ page }) => {
            await page.goto('/sign-in');

            await page.fill('input[name="email"]', 'not-an-email');
            await page.fill('input[name="password"]', 'somepassword');

            await page.click('button[type="submit"]');

            // Should show validation error
            const emailInput = page.locator('input[name="email"]');
            const isInvalid = await emailInput.evaluate(
                (el: HTMLInputElement) => el.checkValidity(),
            );
            expect(isInvalid).toBe(false);
        });

        test('requires all fields', async ({ page }) => {
            await page.goto('/sign-in');

            // Try to submit without filling anything
            await page.click('button[type="submit"]');

            // Should not redirect (stay on sign-in page)
            await expect(page).toHaveURL(/sign-in/);
        });
    });

    test.describe('Sign Out', () => {
        test('successfully signs out', async ({ page }) => {
            // Sign in first
            await page.goto('/sign-in');
            await page.fill('input[name="email"]', 'admin@iridium.com');
            await page.fill('input[name="password"]', 'Admin123!');
            await page.click('button[type="submit"]');
            await page.waitForURL('/dashboard');

            // Sign out
            await page.goto('/sign-out');

            // Should redirect to home
            await page.waitForURL('/');

            // Should not be able to access protected routes
            await page.goto('/dashboard');
            await expect(page).toHaveURL(/sign-in/);
        });
    });

    test.describe('Protected Routes', () => {
        test('redirects unauthenticated users to sign-in', async ({ page }) => {
            const protectedRoutes = [
                '/dashboard',
                '/profile',
                '/profile/edit',
                '/admin/design',
            ];

            for (const route of protectedRoutes) {
                await page.goto(route);
                await expect(page).toHaveURL(/sign-in/);
            }
        });

        test('allows authenticated users to access protected routes', async ({
            page,
        }) => {
            // Sign in
            await page.goto('/sign-in');
            await page.fill('input[name="email"]', 'admin@iridium.com');
            await page.fill('input[name="password"]', 'Admin123!');
            await page.click('button[type="submit"]');
            await page.waitForURL('/dashboard');

            // Test access to various protected routes
            await page.goto('/dashboard');
            await expect(page).toHaveURL('/dashboard');

            await page.goto('/profile');
            await expect(page).toHaveURL('/profile');

            await page.goto('/admin/design');
            await expect(page).toHaveURL('/admin/design');
        });
    });

    test.describe('Session Persistence', () => {
        test('maintains session across page reloads', async ({ page }) => {
            // Sign in
            await page.goto('/sign-in');
            await page.fill('input[name="email"]', 'admin@iridium.com');
            await page.fill('input[name="password"]', 'Admin123!');
            await page.click('button[type="submit"]');
            await page.waitForURL('/dashboard');

            // Reload page
            await page.reload();

            // Should still be authenticated
            await expect(page).toHaveURL('/dashboard');

            // Navigate to another protected route
            await page.goto('/profile');
            await expect(page).toHaveURL('/profile');
        });

        test('maintains session across navigation', async ({ page }) => {
            // Sign in
            await page.goto('/sign-in');
            await page.fill('input[name="email"]', 'admin@iridium.com');
            await page.fill('input[name="password"]', 'Admin123!');
            await page.click('button[type="submit"]');
            await page.waitForURL('/dashboard');

            // Navigate to home
            await page.goto('/');

            // Navigate back to protected route - should not redirect
            await page.goto('/dashboard');
            await expect(page).toHaveURL('/dashboard');
        });
    });

    test.describe('User Roles', () => {
        test('admin user can access admin routes', async ({ page }) => {
            await page.goto('/sign-in');
            await page.fill('input[name="email"]', 'admin@iridium.com');
            await page.fill('input[name="password"]', 'Admin123!');
            await page.click('button[type="submit"]');
            await page.waitForURL('/dashboard');

            await page.goto('/admin/design');
            await expect(page).toHaveURL('/admin/design');
        });

        test('regular user can access dashboard', async ({ page }) => {
            await page.goto('/sign-in');
            await page.fill('input[name="email"]', 'alice@iridium.com');
            await page.fill('input[name="password"]', 'Alice123!');
            await page.click('button[type="submit"]');
            await page.waitForURL('/dashboard');

            await expect(page).toHaveURL('/dashboard');
        });
    });
});
