import type { Page, Route as PwRoute } from '@playwright/test';
import { test, expect } from './fixtures';

// ---------------------------------------------------------------------------
// Mock helpers — fake the /api/chat SSE stream so no AI service is needed
// ---------------------------------------------------------------------------

const SSE_HEADERS = {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
    'x-vercel-ai-ui-message-stream': 'v1',
};

/** Build an SSE payload from an array of UI message stream chunks. */
function sseBody(chunks: Record<string, unknown>[]): string {
    return (
        chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join('') +
        'data: [DONE]\n\n'
    );
}

/** Standard chunks that stream a plain text reply. */
function textReplyChunks(text: string, messageId = 'mock-msg-1') {
    return [
        { type: 'start', messageId },
        { type: 'start-step' },
        { type: 'text-start', id: 'txt-1' },
        { type: 'text-delta', id: 'txt-1', delta: text },
        { type: 'text-end', id: 'txt-1' },
        { type: 'finish-step' },
        { type: 'finish', finishReason: 'stop' },
    ];
}

/** Intercept POST /api/chat and reply with a canned SSE stream. */
async function mockChatApi(page: Page, text: string, messageId?: string) {
    await page.route('**/api/chat', async (route: PwRoute) => {
        await route.fulfill({
            status: 200,
            headers: SSE_HEADERS,
            body: sseBody(textReplyChunks(text, messageId)),
        });
    });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Chat', () => {
    test('can create a new thread', async ({ authedPage: page }) => {
        await page.goto('/chat');
        await expect(page.getByText('Pick a thread!')).toBeVisible();

        await page.getByRole('button', { name: 'New Thread' }).click();
        await expect(page).toHaveURL(/\/chat\/.+/);

        // The thread view shows the empty state
        await expect(page.getByText('No messages yet')).toBeVisible();
    });

    test('sending a message shows it in the chat', async ({
        authedPage: page,
    }) => {
        await page.goto('/chat');
        await page.getByRole('button', { name: 'New Thread' }).click();
        await expect(page).toHaveURL(/\/chat\/.+/);

        const reply = 'Hello from mock AI!';
        await mockChatApi(page, reply);

        const input = page.getByPlaceholder('Your message here...');
        await input.fill('Hi there');
        await page.getByRole('button', { name: 'Send' }).click();

        // User message appears
        await expect(page.getByText('Hi there')).toBeVisible();
        // AI reply streams in
        await expect(page.getByText(reply)).toBeVisible();
    });

    test('AI response streams back and renders', async ({
        authedPage: page,
    }) => {
        await page.goto('/chat');
        await page.getByRole('button', { name: 'New Thread' }).click();
        await expect(page).toHaveURL(/\/chat\/.+/);

        // Stream two separate deltas to verify incremental rendering
        await page.route('**/api/chat', async (route: PwRoute) => {
            await route.fulfill({
                status: 200,
                headers: SSE_HEADERS,
                body: sseBody([
                    { type: 'start', messageId: 'msg-stream' },
                    { type: 'start-step' },
                    { type: 'text-start', id: 'txt-s' },
                    {
                        type: 'text-delta',
                        id: 'txt-s',
                        delta: 'first chunk ',
                    },
                    {
                        type: 'text-delta',
                        id: 'txt-s',
                        delta: 'second chunk',
                    },
                    { type: 'text-end', id: 'txt-s' },
                    { type: 'finish-step' },
                    { type: 'finish', finishReason: 'stop' },
                ]),
            });
        });

        const input = page.getByPlaceholder('Your message here...');
        await input.fill('Stream test');
        await page.getByRole('button', { name: 'Send' }).click();

        // Both deltas should be concatenated
        await expect(
            page.getByText('first chunk second chunk'),
        ).toBeVisible();
    });

    test('thread appears in the sidebar after creation', async ({
        authedPage: page,
    }) => {
        await page.goto('/chat');

        const sidebar = page.getByRole('navigation', {
            name: 'Conversations',
        });

        // Count threads before
        const beforeCount = await sidebar.getByRole('listitem').count();

        await page.getByRole('button', { name: 'New Thread' }).click();
        await expect(page).toHaveURL(/\/chat\/.+/);

        // Sidebar should now have one more thread
        await expect(sidebar.getByRole('listitem')).toHaveCount(
            beforeCount + 1,
        );
    });

    test('thread can be deleted', async ({ authedPage: page }) => {
        await page.goto('/chat');
        await page.getByRole('button', { name: 'New Thread' }).click();
        await expect(page).toHaveURL(/\/chat\/.+/);

        const sidebar = page.getByRole('navigation', {
            name: 'Conversations',
        });

        // The new thread should be in the sidebar
        const threadCount = await sidebar.getByRole('listitem').count();
        expect(threadCount).toBeGreaterThanOrEqual(1);

        // Delete the first thread — button is hidden until hover
        const firstThread = sidebar.getByRole('listitem').first();
        await firstThread.hover();
        await firstThread
            .getByRole('button', { name: 'Delete thread' })
            .click();

        // Should redirect to /chat and have one fewer thread
        await expect(page).toHaveURL(/\/chat$/);
        await expect(sidebar.getByRole('listitem')).toHaveCount(
            threadCount - 1,
        );
    });

    test('navigating between threads loads correct messages', async ({
        authedPage: page,
    }) => {
        // Create two threads
        await page.goto('/chat');
        await page.getByRole('button', { name: 'New Thread' }).click();
        await expect(page).toHaveURL(/\/chat\/.+/);
        const firstThreadUrl = page.url();

        // Send a message in the first thread
        await mockChatApi(page, 'Reply to thread one');
        const input = page.getByPlaceholder('Your message here...');
        await input.fill('Message in thread one');
        await page.getByRole('button', { name: 'Send' }).click();
        await expect(page.getByText('Reply to thread one')).toBeVisible();

        // Create a second thread
        await page.unrouteAll({ behavior: 'wait' });
        await page.getByRole('button', { name: 'New Thread' }).click();
        await page.waitForURL(/\/chat\/.+/);
        // Make sure we're on a different thread
        expect(page.url()).not.toBe(firstThreadUrl);
        await expect(page.getByText('No messages yet')).toBeVisible();

        // Navigate back to the first thread
        const sidebar = page.getByRole('navigation', {
            name: 'Conversations',
        });
        // The first thread should still have its message when we reload it
        await sidebar.getByRole('link').first().click();
        await expect(page.getByText('Message in thread one')).toBeVisible();
    });
});
