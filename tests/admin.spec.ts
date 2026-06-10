import type { Browser } from '@playwright/test';
import {
    test,
    expect,
    createFreshAdmin,
    createFreshUser,
    waitForHydration,
} from './fixtures';

/** Create a throwaway user (in its own context) for the admin to manage. */
async function createTargetUser(
    browser: Browser,
    baseURL: string,
    tag: string,
) {
    const context = await browser.newContext({ baseURL });
    const target = await createFreshUser(context, baseURL, tag);
    await context.close();
    return target;
}

test.describe('Admin panel', () => {
    test('blocks non-admin users with a 403', async ({ authedPage: page }) => {
        await page.goto('/admin');

        await expect(page.getByRole('alert')).toContainText('403');
    });

    test('redirects logged-out users to login', async ({ page }) => {
        await page.goto('/admin');

        await expect(page).toHaveURL(/\/login/);
    });

    test('hides the Admin nav item from regular users', async ({
        authedPage: page,
    }) => {
        await page.goto('/dashboard');

        await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0);
    });

    test('admin can find a user and change their role', async ({
        browser,
    }, testInfo) => {
        const baseURL = testInfo.project.use.baseURL!;
        const tag = `role-${testInfo.workerIndex}`;

        // The user to manage.
        const target = await createTargetUser(browser, baseURL, tag);

        const adminContext = await browser.newContext({ baseURL });
        await createFreshAdmin(adminContext, baseURL, tag);
        const page = await adminContext.newPage();

        await page.goto('/admin');
        await expect(
            page.getByRole('heading', { name: 'Admin' }),
        ).toBeVisible();
        // The role select auto-submits via React; wait for hydration so the
        // change handler is attached before interacting.
        await waitForHydration(page);

        // Search to pin down the target among the many e2e users.
        await page.getByLabel('Search users').fill(target.email);
        await page.getByRole('button', { name: 'Search' }).click();

        const roleSelect = page.getByLabel(`Role for ${target.email}`);
        await expect(roleSelect).toHaveValue('USER');
        await roleSelect.selectOption('EDITOR');

        await expect(page.getByRole('status')).toContainText('Role updated');
        await page.reload();
        await expect(page.getByLabel(`Role for ${target.email}`)).toHaveValue(
            'EDITOR',
        );

        await adminContext.close();
    });

    test('admin can ban and unban a user', async ({ browser }, testInfo) => {
        const baseURL = testInfo.project.use.baseURL!;
        const tag = `ban-${testInfo.workerIndex}`;

        const target = await createTargetUser(browser, baseURL, tag);

        const adminContext = await browser.newContext({ baseURL });
        await createFreshAdmin(adminContext, baseURL, tag);
        const page = await adminContext.newPage();

        await page.goto(`/admin?q=${encodeURIComponent(target.email)}`);
        // The ban dialog opens via a React click handler; wait for hydration.
        await waitForHydration(page);

        await page.getByRole('button', { name: 'Ban', exact: true }).click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog
            .getByPlaceholder('Why is this user being banned?')
            .fill('Spamming the chat');
        await dialog.getByRole('button', { name: 'Ban user' }).click();

        await expect(page.getByRole('status')).toContainText('User banned');
        await expect(page.getByText('Banned', { exact: true })).toBeVisible();

        // The banned user can no longer sign in.
        const bannedContext = await browser.newContext({ baseURL });
        const signIn = await bannedContext.request.post(
            '/api/auth/sign-in/email',
            {
                headers: { Origin: baseURL },
                data: { email: target.email, password: target.password },
            },
        );
        expect(signIn.ok()).toBe(false);
        await bannedContext.close();

        // Unban restores access.
        await page.goto(`/admin?q=${encodeURIComponent(target.email)}`);
        await page.getByRole('button', { name: 'Unban' }).click();
        await expect(page.getByRole('status')).toContainText('User unbanned');

        await adminContext.close();
    });

    test('admin can impersonate a user and stop', async ({
        browser,
    }, testInfo) => {
        const baseURL = testInfo.project.use.baseURL!;
        const tag = `imp-${testInfo.workerIndex}`;

        const target = await createTargetUser(browser, baseURL, tag);

        const adminContext = await browser.newContext({ baseURL });
        await createFreshAdmin(adminContext, baseURL, tag);
        const page = await adminContext.newPage();

        await page.goto(`/admin?q=${encodeURIComponent(target.email)}`);
        await waitForHydration(page);
        await page.getByRole('button', { name: 'Impersonate' }).click();

        // Lands on the target's dashboard with the warning banner.
        await expect(page).toHaveURL(/\/dashboard$/);
        await expect(
            page.getByText('You are impersonating this account.'),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { name: `Hello E2E User ${tag}!` }),
        ).toBeVisible();

        await page.getByRole('button', { name: 'Stop impersonating' }).click();

        await expect(page).toHaveURL(/\/admin/);
        await expect(
            page.getByText('You are impersonating this account.'),
        ).toHaveCount(0);

        await adminContext.close();
    });
});
