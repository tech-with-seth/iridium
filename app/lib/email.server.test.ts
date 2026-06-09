import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createElement } from 'react';

const { mockLog } = vi.hoisted(() => ({
    mockLog: { info: vi.fn(), error: vi.fn(), exception: vi.fn() },
}));

vi.mock('~/lib/env.server', () => ({
    env: {
        // No RESEND_API_KEY: exercises the console fallback path.
        RESEND_API_KEY: undefined,
        EMAIL_FROM: 'Test <test@example.com>',
        NODE_ENV: 'test',
    },
}));

vi.mock('~/lib/logger.server', () => ({ log: mockLog }));

import { sendEmail, testMailbox } from './email.server';

function TestEmail({ url }: { url: string }) {
    return createElement('a', { href: url }, 'Click here');
}

beforeEach(() => {
    vi.clearAllMocks();
    testMailbox.clear();
});

describe('sendEmail (console fallback)', () => {
    it('logs instead of sending when RESEND_API_KEY is missing', async () => {
        await sendEmail({
            to: 'user@example.com',
            subject: 'Hello',
            react: createElement(TestEmail, { url: 'https://example.com/x' }),
        });

        expect(mockLog.info).toHaveBeenCalledWith(
            'email_console_fallback',
            expect.objectContaining({
                to: 'user@example.com',
                subject: 'Hello',
            }),
        );
    });

    it('records the email in the test mailbox with extracted URLs', async () => {
        await sendEmail({
            to: 'user@example.com',
            subject: 'Reset',
            react: createElement(TestEmail, {
                url: 'https://example.com/reset?token=abc',
            }),
        });

        const email = testMailbox.get('user@example.com');
        expect(email).toBeTruthy();
        expect(email!.subject).toBe('Reset');
        expect(
            email!.urls.some((u) =>
                u.startsWith('https://example.com/reset?token=abc'),
            ),
        ).toBe(true);
    });
});
