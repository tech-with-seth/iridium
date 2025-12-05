import type { Route } from './+types/email';
import { data } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { validateFormData } from '~/lib/form-validation.server';
import {
    sendEmailSchema,
    emailTemplateSchema,
    type SendEmailData,
    type EmailTemplateData,
} from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendTransactionalEmail,
} from '~/models/email.server';
import { getPostHogClient } from '~/lib/posthog';
import { PostHogEventNames } from '~/constants';

/**
 * Email API Endpoint
 *
 * Centralized endpoint for sending emails from anywhere in the app.
 * Can be called via useFetcher() from components or via fetch() from server-side code.
 *
 * POST /api/email - Send email with custom content
 * POST /api/email?template=true - Send email using a predefined template
 *
 * @see .github/instructions/resend.instructions.md
 * @see .github/instructions/api-endpoints.instructions.md
 */

// POST - Send email
export async function action({ request }: Route.ActionArgs) {
    // Require authentication for all email sending
    const user = await requireUser(request);
    const postHogClient = getPostHogClient();

    if (request.method !== 'POST') {
        return data({ error: 'Method not allowed' }, { status: 405 });
    }

    const url = new URL(request.url);
    const useTemplate = url.searchParams.get('template') === 'true';

    try {
        // Route 1: Template-based email
        if (useTemplate) {
            const formData = await request.formData();

            const { data: validatedData, errors } =
                await validateFormData<EmailTemplateData>(
                    formData,
                    zodResolver(emailTemplateSchema),
                );

            if (errors) {
                return data({ errors }, { status: 400 });
            }

            const { templateName, to, props } = validatedData!;

            let result;

            // Route to appropriate template function
            switch (templateName) {
                case 'verification':
                    if (!props?.verificationUrl) {
                        postHogClient?.captureException(
                            new Error(
                                'Missing verificationUrl in email template',
                            ),
                            'user',
                            {
                                distinctId: user.id,
                            },
                        );

                        return data(
                            {
                                error: 'Verification URL is required for verification template',
                            },
                            { status: 400 },
                        );
                    }
                    result = await sendVerificationEmail({
                        to,
                        verificationUrl: props.verificationUrl,
                    });

                    postHogClient?.capture({
                        distinctId: user.id,
                        event: PostHogEventNames.RESEND_VERIFICATION_EMAIL_SENT,
                        properties: {
                            type: 'template',
                            templateName,
                            recipient: to,
                        },
                    });

                    break;

                case 'password-reset':
                    if (!props?.resetUrl) {
                        postHogClient?.captureException(
                            new Error('Missing resetUrl in email template'),
                            'user',
                            {
                                distinctId: user.id,
                            },
                        );

                        return data(
                            {
                                error: 'resetUrl is required for password-reset template',
                            },
                            { status: 400 },
                        );
                    }
                    result = await sendPasswordResetEmail({
                        to,
                        resetUrl: props.resetUrl,
                    });

                    postHogClient?.capture({
                        distinctId: user.id,
                        event: PostHogEventNames.RESEND_PASSWORD_RESET_EMAIL_SENT,
                        properties: {
                            type: 'template',
                            templateName,
                            recipient: to,
                        },
                    });

                    break;

                case 'welcome':
                    if (!props?.userName || !props?.dashboardUrl) {
                        postHogClient?.captureException(
                            new Error(
                                'Missing userName or dashboardUrl in welcome email template',
                            ),
                            'user',
                            {
                                distinctId: user.id,
                            },
                        );

                        return data(
                            {
                                error: 'userName and dashboardUrl are required for welcome template',
                            },
                            { status: 400 },
                        );
                    }
                    result = await sendWelcomeEmail({
                        to,
                        userName: props.userName,
                        dashboardUrl: props.dashboardUrl,
                    });

                    postHogClient?.capture({
                        distinctId: user.id,
                        event: PostHogEventNames.RESEND_WELCOME_EMAIL_SENT,
                        properties: {
                            type: 'template',
                            templateName,
                            recipient: to,
                        },
                    });

                    break;

                case 'transactional':
                    if (
                        !props?.heading ||
                        !props?.previewText ||
                        !props?.message
                    ) {
                        postHogClient?.captureException(
                            new Error(
                                'Missing heading, previewText, or message in transactional email template',
                            ),
                            'user',
                            {
                                distinctId: user.id,
                            },
                        );

                        return data(
                            {
                                error: 'heading, previewText, and message are required for transactional template',
                            },
                            { status: 400 },
                        );
                    }
                    result = await sendTransactionalEmail({
                        to,
                        heading: props.heading,
                        previewText: props.previewText,
                        message: props.message,
                        buttonText: props.buttonText,
                        buttonUrl: props.buttonUrl,
                        footerText: props.footerText,
                    });

                    postHogClient?.capture({
                        distinctId: user.id,
                        event: PostHogEventNames.RESEND_TRANSACTIONAL_EMAIL_SENT,
                        properties: {
                            type: 'template',
                            templateName,
                            recipient: to,
                        },
                    });

                    break;

                default:
                    return data(
                        { error: `Unknown template: ${templateName}` },
                        { status: 400 },
                    );
            }

            return data({
                success: true,
                message: 'Email sent successfully',
                data: result.data,
            });
        }

        // Route 2: Custom email (raw HTML/text)
        const formData = await request.formData();

        const { data: validatedData, errors } =
            await validateFormData<SendEmailData>(
                formData,
                zodResolver(sendEmailSchema),
            );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        const result = await sendEmail(validatedData!);

        postHogClient?.capture({
            distinctId: user.id,
            event: PostHogEventNames.RESEND_EMAIL_SEND_SUCCESS,
            properties: {
                type: 'custom',
                recipient: validatedData!.to,
                subject: validatedData!.subject,
            },
        });

        return data({
            success: true,
            message: 'Email sent successfully',
            data: result.data,
        });
    } catch (error) {
        postHogClient?.captureException(
            new Error('Failed to send email'),
            'system',
        );

        return data(
            {
                error: 'Failed to send email. Please try again.',
                details:
                    import.meta.env.DEV && error instanceof Error
                        ? error.message
                        : undefined,
            },
            { status: 500 },
        );
    }
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    // Custom error response for API route
    if (error instanceof Error) {
        return data(
            {
                error: 'An unexpected error occurred while sending email',
                message: import.meta.env.DEV ? error.message : undefined,
                stack: import.meta.env.DEV ? error.stack : undefined,
            },
            { status: 500 },
        );
    }

    return data({ error: 'Unknown error occurred' }, { status: 500 });
}
