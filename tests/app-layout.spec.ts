import { test, expect } from '@playwright/test';

test.describe('Application Layout', () => {
  test('renders header and footer on homepage', async ({ page }) => {
    await page.goto('/');

    // Check that header is present
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check that footer is present
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('renders main content area', async ({ page }) => {
    await page.goto('/');

    // Check that main content area exists
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('does not show settings button for anonymous users', async ({ page }) => {
    await page.goto('/');

    // Settings button should not be visible for non-authenticated users
    const settingsButton = page.getByRole('button').filter({ has: page.locator('svg') });
    const count = await settingsButton.count();

    // If there are any circular buttons, verify they're not the settings cog
    if (count > 0) {
      // The settings button is at fixed bottom-4 right-4
      const fixedButton = page.locator('.fixed.bottom-4.right-4');
      await expect(fixedButton).not.toBeVisible();
    }
  });
});

test.describe('Error Handling', () => {
  test('displays 404 page for non-existent routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');

    // Check for 404 heading or error message
    await expect(page.getByText(/404|not found/i)).toBeVisible();
  });
});
