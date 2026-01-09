/**
 * Template: Playwright E2E Test
 *
 * Replace placeholders:
 * - Feature → Your feature name
 * - /feature → Your route path
 */

import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
    // ============================================
    // Setup (if needed)
    // ============================================

    test.beforeEach(async ({ page }) => {
        // Navigate to feature page or login if needed
        await page.goto('/feature');
    });

    // ============================================
    // Page Load & Content Tests
    // ============================================

    test('displays page content correctly', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: /feature title/i }),
        ).toBeVisible();

        await expect(page.getByText(/description/i)).toBeVisible();
    });

    test('has correct page metadata', async ({ page }) => {
        await expect(page).toHaveTitle(/Feature - Iridium/);

        const metaDescription = page.locator('meta[name="description"]');
        await expect(metaDescription).toHaveAttribute(
            'content',
            /feature description/i,
        );
    });

    // ============================================
    // Navigation Tests
    // ============================================

    test('navigates to related page', async ({ page }) => {
        await page.getByRole('link', { name: /related page/i }).click();

        await expect(page).toHaveURL(/related/);
    });

    test('back button returns to previous page', async ({ page }) => {
        await page.getByRole('link', { name: /details/i }).click();
        await expect(page).toHaveURL(/details/);

        await page.goBack();
        await expect(page).toHaveURL(/feature/);
    });

    // ============================================
    // Form Interaction Tests
    // ============================================

    test('submits form with valid data', async ({ page }) => {
        await page.getByLabel(/name/i).fill('Test Name');
        await page.getByLabel(/email/i).fill('test@example.com');

        await page.getByRole('button', { name: /submit/i }).click();

        await expect(page.getByText(/success/i)).toBeVisible();
    });

    test('shows validation errors for invalid data', async ({ page }) => {
        // Submit empty form
        await page.getByRole('button', { name: /submit/i }).click();

        await expect(page.getByText(/name is required/i)).toBeVisible();
        await expect(page.getByText(/email is required/i)).toBeVisible();
    });

    // ============================================
    // API Integration Tests
    // ============================================

    test('loads data from API', async ({ page }) => {
        // Wait for data to load
        await expect(page.getByRole('listitem')).toHaveCount(5);

        // Verify content from loader
        await expect(page.getByText(/item 1/i)).toBeVisible();
    });

    test('handles API errors gracefully', async ({ page }) => {
        // Intercept API to simulate error
        await page.route('**/api/feature/**', (route) => {
            route.fulfill({ status: 500, body: 'Server Error' });
        });

        await page.reload();

        await expect(page.getByText(/error|try again/i)).toBeVisible();
    });

    // ============================================
    // User Interaction Tests
    // ============================================

    test('toggles visibility on button click', async ({ page }) => {
        const content = page.getByTestId('toggleable-content');

        // Initially hidden
        await expect(content).not.toBeVisible();

        // Click to show
        await page.getByRole('button', { name: /show/i }).click();
        await expect(content).toBeVisible();

        // Click to hide
        await page.getByRole('button', { name: /hide/i }).click();
        await expect(content).not.toBeVisible();
    });

    test('filters list based on search input', async ({ page }) => {
        await page.getByRole('searchbox').fill('specific item');

        // Wait for filter to apply
        await expect(page.getByRole('listitem')).toHaveCount(1);
        await expect(page.getByText(/specific item/i)).toBeVisible();
    });
});

// ============================================
// Authenticated Tests (separate describe block)
// ============================================

test.describe('Feature - Authenticated', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto('/sign-in');
        await page.getByLabel(/email/i).fill('admin@iridium.com');
        await page.getByLabel(/password/i).fill('Admin123!');
        await page.getByRole('button', { name: /sign in/i }).click();
        await expect(page).toHaveURL(/dashboard/);

        // Navigate to protected feature
        await page.goto('/feature');
    });

    test('shows user-specific content', async ({ page }) => {
        await expect(page.getByText(/admin@iridium.com/i)).toBeVisible();
    });

    test('allows saving changes', async ({ page }) => {
        // Listen for API call
        const responsePromise = page.waitForResponse(
            (response) =>
                response.url().includes('/api/feature') &&
                response.status() === 200,
        );

        // Make changes
        await page.getByLabel(/setting/i).check();
        await page.getByRole('button', { name: /save/i }).click();

        // Verify API called
        await responsePromise;

        // Verify success feedback
        await expect(page.getByText(/saved/i)).toBeVisible();
    });
});
