import type { Route } from './+types/profile';
import { data, redirect } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { validateFormData } from '~/lib/form-validation.server';
import { profileUpdateSchema, type ProfileUpdateData } from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { auth } from '~/lib/auth.server';
import { Paths } from '~/constants';
import { getUserProfile, updateUser, deleteUser } from '~/models/user.server';
import { getPostHogClient } from '~/lib/posthog';
import {
    sendAccountDeletionEmail,
    sendTransactionalEmail,
} from '~/models/email.server';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    const profile = await getUserProfile(user.id);

    if (!profile) {
        throw new Response('Profile not found', { status: 404 });
    }

    return data({ profile });
}

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const postHogClient = getPostHogClient();

    // UPDATE - PUT
    if (request.method === 'PUT') {
        const formData = await request.formData();

        const { data: validatedData, errors } =
            await validateFormData<ProfileUpdateData>(
                formData,
                zodResolver(profileUpdateSchema),
            );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        try {
            const updatedUser = await updateUser({
                userId: user.id,
                data: validatedData!,
            });

            void sendTransactionalEmail({
                to: updatedUser.email,
                heading: 'Profile updated',
                previewText: 'Your profile information has changed.',
                message:
                    'Your profile information was recently updated. If you did not make this change, please contact support immediately.',
                buttonText: 'View profile',
                buttonUrl: Paths.PROFILE,
                footerText:
                    'We send notifications for important account changes to help keep your account secure.',
            }).catch((error) =>
                console.error('Failed to send profile update email', error),
            );

            return data({
                success: true,
                profile: updatedUser,
                message: 'Profile updated successfully',
            });
        } catch (error: unknown) {
            // Track error with PostHog
            postHogClient?.captureException(error as Error, 'system', {
                context: 'profile_update',
                userId: user.id,
                ...validatedData,
            });

            return data(
                { error: 'Failed to update profile. Please try again.' },
                { status: 500 },
            );
        }
    }

    // DELETE - Delete account
    if (request.method === 'DELETE') {
        try {
            const userEmail = user.email;
            const userName = user.name || 'there';

            // Delete user account (cascade will handle sessions and accounts)
            await deleteUser(user.id);

            void sendAccountDeletionEmail({
                to: userEmail,
                name: userName,
            }).catch((error) =>
                console.error('Failed to send account deletion email', error),
            );

            // Sign out the user
            await auth.api.signOut({
                headers: request.headers,
            });

            return redirect(Paths.HOME);
        } catch (error) {
            console.error('Account deletion error:', error);

            // Track error with PostHog
            postHogClient?.captureException(error as Error, 'system', {
                userId: user.id,
                context: 'account_deletion',
            });

            return data(
                { error: 'Failed to delete account. Please try again.' },
                { status: 500 },
            );
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    // Custom error response for API route
    if (error instanceof Error) {
        return data(
            {
                error: 'An unexpected error occurred',
                message: import.meta.env.DEV ? error.message : undefined,
                stack: import.meta.env.DEV ? error.stack : undefined,
            },
            { status: 500 },
        );
    }

    return data({ error: 'Unknown error occurred' }, { status: 500 });
}
