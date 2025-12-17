import type { Route } from './+types/interest';
import { data } from 'react-router';
import { validateFormData } from '~/lib/form-validation.server';
import { interestFormSchema, type InterestFormData } from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { prisma } from '~/db.server';
import { Prisma } from '~/generated/prisma/client';
import { getPostHogClient } from '~/lib/posthog';
import { sendInterestListConfirmationEmail } from '~/models/email.server';

/**
 * Interest List Signup API Endpoint
 *
 * Allows anonymous users to sign up for the interest list/mailing list
 * from the landing page.
 *
 * POST /api/interest - Add email to interest list
 */

// POST - Add email to interest list
export async function action({ request }: Route.ActionArgs) {
    const postHogClient = getPostHogClient();

    if (request.method !== 'POST') {
        return data({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const formData = await request.formData();

        const { data: validatedData, errors } =
            await validateFormData<InterestFormData>(
                formData,
                zodResolver(interestFormSchema),
            );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        // Create interest list signup
        await prisma.interestListSignup.create({
            data: {
                email: validatedData!.email,
            },
        });

        // Send confirmation email
        try {
            await sendInterestListConfirmationEmail({
                to: validatedData!.email,
            });
        } catch (emailError) {
            // Log email error but don't fail the signup
            console.error('Failed to send confirmation email:', emailError);
            postHogClient?.captureException(
                new Error('Failed to send interest list confirmation email'),
                'system',
            );
        }

        // Track successful signup in PostHog
        postHogClient?.capture({
            distinctId: validatedData!.email,
            event: 'interest_list_signup',
            properties: {
                email: validatedData!.email,
                source: 'landing_page',
            },
        });

        return data({
            success: true,
            message: "Thanks for your interest! Check your email for confirmation.",
        });
    } catch (error) {
        // Handle duplicate email error
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            return data(
                {
                    error: 'This email is already on our interest list.',
                },
                { status: 409 },
            );
        }

        // Log unexpected errors
        postHogClient?.captureException(
            new Error('Failed to add email to interest list'),
            'system',
        );

        return data(
            {
                error: 'Failed to sign up. Please try again.',
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
    if (error instanceof Error) {
        return data(
            {
                error: 'An unexpected error occurred while signing up',
                message: import.meta.env.DEV ? error.message : undefined,
                stack: import.meta.env.DEV ? error.stack : undefined,
            },
            { status: 500 },
        );
    }

    return data({ error: 'Unknown error occurred' }, { status: 500 });
}
