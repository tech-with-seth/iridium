import type { ReactElement } from 'react';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import { env } from '~/lib/env.server';
import { log } from '~/lib/logger.server';

type SendEmailArgs = {
    to: string;
    subject: string;
    react: ReactElement;
};

export type SentEmail = {
    to: string;
    subject: string;
    text: string;
    /** URLs extracted from the rendered body, e.g. verification links. */
    urls: string[];
};

// Test hook: most recent email per recipient, readable via /api/test-mailbox
// when E2E_TEST_HOOKS is enabled. Never populated in production. Keyed by
// recipient so parallel E2E tests don't race on a single slot.
const MAILBOX_CAP = 200;
export const testMailbox = new Map<string, SentEmail>();

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * Send an email rendered from a react-email component. Without a
 * RESEND_API_KEY the email is logged to the console instead, so local
 * development and CI need no email provider.
 */
export async function sendEmail({ to, subject, react }: SendEmailArgs) {
    const text = await render(react, { plainText: true });

    if (env.NODE_ENV !== 'production') {
        if (testMailbox.size >= MAILBOX_CAP) testMailbox.clear();
        testMailbox.set(to, {
            to,
            subject,
            text,
            urls: text.match(/https?:\/\/\S+/g) ?? [],
        });
    }

    if (!resend) {
        log.info('email_console_fallback', { to, subject, text });
        return;
    }

    const { error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        react,
        text,
    });

    if (error) {
        log.error('email_send_failed', { to, subject, error: error.message });
        throw new Error(`Failed to send email: ${error.message}`);
    }
}
