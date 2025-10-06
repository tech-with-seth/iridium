import type { Route } from './+types/profile';
import { data, redirect } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { validateFormData } from '~/lib/form-validation.server';
import { profileUpdateSchema, type ProfileUpdateData } from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { auth } from '~/lib/auth.server';
import { Paths } from '~/constants';
import { getUserProfile, updateUser, deleteUser } from '~/models/user.server';

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
            console.error('Profile update error:', error);
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
            return data(
                { error: 'Failed to delete account. Please try again.' },
                { status: 500 }
            );
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
