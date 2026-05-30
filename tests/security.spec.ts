import {
    test,
    expect,
    createAuthedContext,
    createThreadViaApi,
} from './fixtures';

test.describe('Thread access control', () => {
    test('shows 404 for a thread that does not exist', async ({
        authedPage: page,
    }) => {
        await page.goto('/chat/this-thread-does-not-exist');
        const alert = page.getByRole('alert');
        await expect(alert).toBeVisible();
        await expect(alert).toContainText('404');
    });

    test("cannot open another user's thread (403)", async ({
        authedPage: page,
        browser,
        baseURL,
    }) => {
        const owner = await createAuthedContext(browser, baseURL!, 'owner');
        try {
            const threadId = await createThreadViaApi(owner);

            // The attacker is the fresh user behind authedPage.
            await page.goto(`/chat/${threadId}`);
            const alert = page.getByRole('alert');
            await expect(alert).toBeVisible();
            await expect(alert).toContainText('403');
        } finally {
            await owner.close();
        }
    });

    test('redirects to login when opening a thread while logged out', async ({
        page,
        browser,
        baseURL,
    }) => {
        // Create a real thread as some user so the id is valid; the point is
        // that an anonymous visitor never gets that far.
        const owner = await createAuthedContext(browser, baseURL!, 'owner');
        try {
            const threadId = await createThreadViaApi(owner);
            await page.goto(`/chat/${threadId}`);
            await expect(page).toHaveURL(/\/login/);
        } finally {
            await owner.close();
        }
    });
});
