import { test, expect, createThreadViaApi } from './fixtures';
import { mockChatReply } from './chat-mock';

test.describe('Per-thread model selection', () => {
    test('changing the model persists across reload', async ({
        authedPage: page,
    }) => {
        const threadId = await createThreadViaApi(page.context());
        await page.goto(`/chat/${threadId}`);

        const select = page.getByLabel('Model');
        await expect(select).toHaveValue('anthropic/claude-haiku-4-5-20251001');

        await select.selectOption('anthropic/claude-sonnet-4-6');
        // The fetcher posts to /chat; wait for it to settle before reload.
        await expect(select).toHaveValue('anthropic/claude-sonnet-4-6');
        await page.waitForLoadState('networkidle');

        await page.reload();
        await expect(page.getByLabel('Model')).toHaveValue(
            'anthropic/claude-sonnet-4-6',
        );
    });

    test('rejects a model outside the allowlist', async ({
        authedPage: page,
    }) => {
        const threadId = await createThreadViaApi(page.context());

        const res = await page.context().request.post('/chat', {
            form: {
                intent: 'set-model',
                threadId,
                model: 'anthropic/claude-evil-9000',
            },
        });

        expect(res.status()).toBe(400);
    });
});

test.describe('Message regeneration', () => {
    test('regenerate replaces the last assistant response', async ({
        authedPage: page,
    }) => {
        const threadId = await createThreadViaApi(page.context());

        await mockChatReply(page, 'First answer');
        await page.goto(`/chat/${threadId}`);

        await page.getByLabel('Message').fill('Tell me something');
        await page.getByRole('button', { name: 'Send' }).click();
        await expect(page.getByText('First answer')).toBeVisible();

        // Swap the mock so the regenerated response is distinguishable, and
        // capture the request body to assert the regenerate trigger.
        let regenerateBody: Record<string, unknown> | null = null;
        await page.unroute('/api/chat');
        await page.route('/api/chat', async (route) => {
            regenerateBody = route.request().postDataJSON();
            const { SSE_HEADERS, sseBody, textReplyChunks } =
                await import('./chat-mock');
            await route.fulfill({
                status: 200,
                headers: SSE_HEADERS,
                body: sseBody(textReplyChunks('Second answer', 'mock-msg-2')),
            });
        });

        await page.getByRole('button', { name: 'Regenerate' }).click();

        await expect(page.getByText('Second answer')).toBeVisible();
        await expect(page.getByText('First answer')).toHaveCount(0);
        expect((regenerateBody as { trigger?: string } | null)?.trigger).toBe(
            'regenerate-message',
        );
    });
});
