import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('displays main heading and description', async ({ page }) => {
    await page.goto('/');

    // Check for main heading
    const heading = page.getByRole('heading', { name: 'TWS Foundations' });
    await expect(heading).toBeVisible();

    // Check for description text
    await expect(page.getByText(/production-ready SaaS boilerplate/i)).toBeVisible();
  });

  test('displays hero image', async ({ page }) => {
    await page.goto('/');

    // Check for hero section with background image
    const hero = page.locator('.bg-cover.rounded-xl');
    await expect(hero).toBeVisible();
  });

  test('page has correct meta information', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle('TWS Foundations');

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Modern full-stack boilerplate/);
  });
});
