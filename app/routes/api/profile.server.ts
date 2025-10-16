import type { Route } from './+types/profile.server';
import { data, redirect } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { validateFormData } from '~/lib/form-validation.server';
import { profileUpdateSchema, type ProfileUpdateData } from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { auth } from '~/lib/auth.server';
import { Paths } from '~/constants';
import { getUserProfile, updateUser, deleteUser } from '~/models/user.server';
import posthog from 'posthog-js';

// GET - Read profile
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    const profile = await getUserProfile(user.id);

    if (!profile) {
        throw new Response('Profile not found', { status: 404 });
    }

    return data({ profile });
}

// PUT/DELETE - Update or Delete profile
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    // UPDATE - PUT
    if (request.method === 'PUT') {
        const formData = await request.formData();

        const { data: validatedData, errors } =
            await validateFormData<ProfileUpdateData>(
                formData,
                zodResolver(profileUpdateSchema)
            );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        try {
            const updatedUser = await updateUser({
                userId: user.id,
                data: validatedData!
            });

            return data({
                success: true,
                profile: updatedUser,
                message: 'Profile updated successfully'
            });
        } catch (error) {
            // Track error with PostHog
            posthog.captureException(error, {
                userId: user.id,
                context: 'profile_update',
                data: validatedData,
                timestamp: new Date().toISOString()
            });

            return data(
                { error: 'Failed to update profile. Please try again.' },
                { status: 500 }
            );
        }
    }

    // DELETE - Delete account
    if (request.method === 'DELETE') {
        try {
            // Delete user account (cascade will handle sessions and accounts)
            await deleteUser(user.id);

            // Sign out the user
            await auth.api.signOut({
                headers: request.headers
            });

            return redirect(Paths.HOME);
        } catch (error) {
            console.error('Account deletion error:', error);

            // Track error with PostHog
            posthog.captureException(error, {
                userId: user.id,
                context: 'account_deletion',
                timestamp: new Date().toISOString()
            });

            return data(
                { error: 'Failed to delete account. Please try again.' },
                { status: 500 }
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
                stack: import.meta.env.DEV ? error.stack : undefined
            },
            { status: 500 }
        );
    }

    return data({ error: 'Unknown error occurred' }, { status: 500 });
}
