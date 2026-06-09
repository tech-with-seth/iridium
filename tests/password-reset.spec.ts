import { test, expect, createFreshUser, loginViaUI } from './fixtures';

/** Poll the test mailbox for the most recent email sent to `to`. */
async function waitForEmail(
    request: import('@playwright/test').APIRequestContext,
    to: string,
) {
    await expect
        .poll(
            async () => {
                const res = await request.get(
                    `/api/test-mailbox?to=${encodeURIComponent(to)}`,
                );
                const body = await res.json();
                return body.email?.subject ?? null;
            },
            { timeout: 10_000 },
        )
        .not.toBeNull();

    const res = await request.get(
        `/api/test-mailbox?to=${encodeURIComponent(to)}`,
    );
    return (await res.json()).email as {
        subject: string;
        urls: string[];
    };
}

test.describe('Password reset', () => {
    test('full flow: request link via email, set new password, sign in', async ({
        browser,
    }, testInfo) => {
        const baseURL = testInfo.project.use.baseURL!;
        const context = await browser.newContext({ baseURL });
        const { email } = await createFreshUser(
            context,
            baseURL,
            `reset-${testInfo.workerIndex}`,
        );
        // Use a logged-out page: the reset flow is for anonymous users.
        await context.clearCookies();
        const page = await context.newPage();

        await page.goto('/login');
        await page.getByRole('link', { name: 'Forgot password?' }).click();
        await expect(page).toHaveURL(/\/forgot-password$/);

        await page.getByPlaceholder('name@example.com').fill(email);
        await page.getByRole('button', { name: 'Send reset link' }).click();
        await expect(page.getByText('Check your email')).toBeVisible();

        const sent = await waitForEmail(context.request, email);
        expect(sent.subject).toContain('Reset');
        const resetUrl = sent.urls.find((u) => u.includes('reset-password'));
        expect(resetUrl).toBeTruthy();

        await page.goto(resetUrl!);
        await expect(page).toHaveURL(/\/reset-password\?token=/);

        const newPassword = 'brand-new-password-1';
        await page.getByPlaceholder('At least 8 characters').fill(newPassword);
        await page.getByPlaceholder('Repeat the password').fill(newPassword);
        await page.getByRole('button', { name: 'Reset password' }).click();

        // Lands on login with a success toast.
        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByRole('status')).toContainText(
            'Password updated',
        );

        await loginViaUI(page, { email, password: newPassword });
        await expect(page).toHaveURL(/\/dashboard$/);

        await context.close();
    });

    test('unknown email still shows the success message (no enumeration)', async ({
        page,
    }) => {
        await page.goto('/forgot-password');
        await page
            .getByPlaceholder('name@example.com')
            .fill('nobody@iridium.test');
        await page.getByRole('button', { name: 'Send reset link' }).click();

        await expect(page.getByText('Check your email')).toBeVisible();
    });

    test('reset page without a token redirects to forgot-password', async ({
        page,
    }) => {
        await page.goto('/reset-password');
        await expect(page).toHaveURL(/\/forgot-password$/);
    });
});
