import { render } from '@react-email/components';
import { getResendClient } from '~/lib/resend';
import VerificationEmail from '~/emails/verification-email';
import PasswordResetEmail from '~/emails/password-reset-email';
import WelcomeEmail from '~/emails/welcome-email';
import TransactionalEmail from '~/emails/transactional-email';
import { getPostHogClient } from '~/lib/posthog';

/**
 * Email Model Layer
 *
 * Abstracts all Resend email operations.
 * NEVER call Resend directly in routes - always use these functions.
 *
 * @see .github/instructions/resend.instructions.md
 */

interface SendEmailOptions {
    to: string | string[];
    from?: string;
    subject: string;
    html?: string;
    text?: string;
    replyTo?: string;
    cc?: string | string[];
    bcc?: string | string[];
}

/**
 * Send a raw email with custom HTML/text content
 * Use this for one-off emails or when you don't have a template
 */
export async function sendEmail(options: SendEmailOptions) {
    const resend = getResendClient();

    // If Resend is not configured, log and skip (useful for seeding/dev)
    if (!resend) {
        console.warn(
            '[Email] Resend not configured (missing RESEND_API_KEY), skipping email:',
            options.subject,
        );
        return { success: true, data: null, skipped: true };
    }

    try {
        const emailPayload: {
            from: string;
            to: string | string[];
            subject: string;
            html?: string;
            text?: string;
            replyTo?: string;
            cc?: string | string[];
            bcc?: string | string[];
        } = {
            from: options.from || process.env.RESEND_FROM_EMAIL!,
            to: options.to,
            subject: options.subject,
            replyTo: options.replyTo,
            cc: options.cc,
            bcc: options.bcc,
        };

        // Add html or text
        if (options.html) {
            emailPayload.html = options.html;
        }
        if (options.text) {
            emailPayload.text = options.text;
        }

        const { data, error } = await resend.emails.send(emailPayload as any);

        if (error) {
            const postHogClient = getPostHogClient();
            postHogClient?.captureException(error);
            throw new Error(`Failed to send email: ${error.message}`);
        }

        return { success: true, data };
    } catch (error) {
        const postHogClient = getPostHogClient();
        postHogClient?.captureException(error);
        throw error;
    }
}

/**
 * Send email verification email
 * Used by BetterAuth for email verification flow
 */
export async function sendVerificationEmail({
    to,
    verificationUrl,
    from,
}: {
    to: string;
    verificationUrl: string;
    from?: string;
}) {
    const html = await render(
        VerificationEmail({
            verificationUrl,
            userEmail: to,
        }),
    );

    return sendEmail({
        to,
        from: from || process.env.RESEND_FROM_EMAIL!,
        subject: 'Verify your email address',
        html,
    });
}

/**
 * Send password reset email
 * Used by BetterAuth for password reset flow
 */
export async function sendPasswordResetEmail({
    to,
    resetUrl,
    from,
}: {
    to: string;
    resetUrl: string;
    from?: string;
}) {
    const html = await render(
        PasswordResetEmail({
            resetUrl,
            userEmail: to,
        }),
    );

    return sendEmail({
        to,
        from: from || process.env.RESEND_FROM_EMAIL!,
        subject: 'Reset your password',
        html,
    });
}

/**
 * Send welcome email to new users
 * Call this after successful sign up
 */
export async function sendWelcomeEmail({
    to,
    userName,
    dashboardUrl,
    from,
}: {
    to: string;
    userName: string;
    dashboardUrl: string;
    from?: string;
}) {
    const html = await render(
        WelcomeEmail({
            userName,
            dashboardUrl,
        }),
    );

    return sendEmail({
        to,
        from: from || process.env.RESEND_FROM_EMAIL!,
        subject: 'Welcome to Iridium!',
        html,
    });
}

/**
 * Send a generic transactional email using the template
 * Use this for notifications, alerts, etc.
 */
export async function sendTransactionalEmail({
    to,
    heading,
    previewText,
    message,
    buttonText,
    buttonUrl,
    footerText,
    from,
}: {
    to: string;
    heading: string;
    previewText: string;
    message: string;
    buttonText?: string;
    buttonUrl?: string;
    footerText?: string;
    from?: string;
}) {
    const html = await render(
        TransactionalEmail({
            heading,
            previewText,
            message,
            buttonText,
            buttonUrl,
            footerText,
        }),
    );

    return sendEmail({
        to,
        from: from || process.env.RESEND_FROM_EMAIL!,
        subject: heading,
        html,
    });
}

/**
 * Batch send emails to multiple recipients
 * Use for newsletters, announcements, etc.
 * Note: Resend has rate limits - be mindful of batch sizes
 */
export async function sendBatchEmails(emails: SendEmailOptions[]) {
    try {
        const results = await Promise.allSettled(emails.map(sendEmail));

        const successful = results.filter(
            (r) => r.status === 'fulfilled',
        ).length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        return {
            success: true,
            total: emails.length,
            successful,
            failed,
            results,
        };
    } catch (error) {
        console.error('Batch email sending error:', error);
        throw error;
    }
}
