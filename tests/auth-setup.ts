import { test as setup } from '@playwright/test';
import { STORAGE_STATE, TEST_USER } from './fixtures';

/**
 * Runs once before all test projects. Signs in as the test user
 * and saves the authenticated browser state to disk so every
 * subsequent test reuses the session cookie without re-logging in.
 */
setup('authenticate', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('name@example.com').fill(TEST_USER.email);
    await page.getByPlaceholder('Your password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL(/\/profile/);

    await page.context().storageState({ path: STORAGE_STATE });
});
