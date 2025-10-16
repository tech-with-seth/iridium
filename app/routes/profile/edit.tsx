import { data, Form, redirect } from 'react-router';
import invariant from 'tiny-invariant';
import posthog from 'posthog-js';

import { Container } from '~/components/Container';
import { TextInput } from '~/components/TextInput';
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';
import type { Route } from './+types/edit';
import { Button } from '~/components/Button';
import { updateUser } from '~/models/user.server';
import React from 'react';

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();

    const name = String(formData.get('name'));
    invariant(name, 'Name is required');

    const userId = String(formData.get('userId'));
    invariant(userId, 'User ID is required');

    try {
        const updatedUser = await updateUser({
            userId,
            data: { name }
        });

        return redirect('/profile');
    } catch (error) {
        console.error('Profile update error:', error);

        // Track error with PostHog
        posthog.captureException(error, {
            userId,
            context: 'profile_edit',
            name,
            timestamp: new Date().toISOString()
        });

        return data(
            { error: 'Failed to update profile. Please try again.' },
            { status: 500 }
        );
    }
}

export default function ProfileEditRoute() {
    const { user } = useAuthenticatedContext();

    const [name, setName] = React.useState(user?.name || '');

    return (
        <Container>
            <h1 className="text-3xl font-bold mb-4">Profile</h1>
            <Form method="POST" className="space-y-4">
                <input type="hidden" name="userId" value={user?.id} />
                <p>
                    Name:{' '}
                    <TextInput
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </p>
                <p>Email: {user?.email}</p>
                <p>Joined: {user?.createdAt.toLocaleDateString()}</p>
                <Button status="primary" type="submit" color="">
                    Save
                </Button>
            </Form>
        </Container>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    // Let all errors bubble to root
    // Profile edit errors are handled in the action
    throw error;
}
