import { test as base, expect } from '@playwright/test';
import path from 'node:path';

export const STORAGE_STATE = path.join(
    import.meta.dirname,
    '../test-results/.auth/user.json',
);

export const TEST_USER = {
    name: 'Alice',
    email: 'alice@iridium.dev',
    password: 'password123',
};

/**
 * Extend the base test with an `authedPage` fixture that reuses a
 * pre-authenticated storageState so we never re-login per test.
 */
export const test = base.extend<{
    authedPage: import('@playwright/test').Page;
}>({
    authedPage: async ({ browser }, use) => {
        const context = await browser.newContext({
            storageState: STORAGE_STATE,
        });
        const page = await context.newPage();
        await use(page);
        await context.close();
    },
});

export { expect };
