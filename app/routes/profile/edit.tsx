import {
    Link,
    data,
    Form,
    redirect,
    useActionData,
    useNavigation,
} from 'react-router';
import invariant from 'tiny-invariant';
import { useState } from 'react';

import { Container } from '~/components/Container';
import { TextInput } from '~/components/TextInput';
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';
import type { Route } from './+types/edit';
import { Button, buttonVariants } from '~/components/Button';
import { updateUser } from '~/models/user.server';
import { Card } from '~/components/Card';
import { Paths } from '~/constants';
import { cx } from '~/cva.config';
import { Alert } from '~/components/Alert';
import { postHogClient } from '~/lib/posthog';

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();

    const name = String(formData.get('name'));
    invariant(name, 'Name is required');

    const userId = String(formData.get('userId'));
    invariant(userId, 'User ID is required');

    try {
        await updateUser({
            userId,
            data: { name },
        });

        return redirect(Paths.PROFILE);
    } catch (error: unknown) {
        console.error('Profile update error:', error);

        // Track error with PostHog
        postHogClient.captureException(error as Error, 'system', {
            context: 'profile_edit',
            name,
            userId,
        });

        return data(
            { error: 'Failed to update profile. Please try again.' },
            { status: 500 },
        );
    }
}

export default function ProfileEditRoute() {
    const { user } = useAuthenticatedContext();
    const navigation = useNavigation();
    const actionData = useActionData<typeof action>();
    const [name, setName] = useState(user?.name ?? '');
    const isSubmitting = navigation.state === 'submitting';
    const joinedDate = formatDate(user?.createdAt);

    return (
        <Container className="space-y-8 px-4 py-8">
            <title>Edit Profile | Iridium</title>
            <meta
                name="description"
                content="Update your Iridium profile details"
            />

            <div className="space-y-2">
                <Link
                    to={Paths.PROFILE}
                    className="text-sm font-medium text-primary hover:text-primary-focus"
                >
                    Back to profile
                </Link>
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-base-content">
                        Profile settings
                    </h1>
                    <p className="text-base text-base-content/70">
                        Keep these details concise and professional—this is how
                        teammates and invoices reference you.
                    </p>
                </div>
            </div>

            {actionData?.error && (
                <Alert
                    status="error"
                    variant="soft"
                    className="border border-error/20 bg-error/10 text-error"
                >
                    <span className="font-medium">Update failed.</span>
                    <span>{actionData.error}</span>
                </Alert>
            )}

            <Form method="POST" className="space-y-6">
                <input type="hidden" name="userId" value={user?.id} />
                <Card
                    title="Basic information"
                    className="border border-base-200 bg-base-100/80 shadow-lg"
                >
                    <div className="space-y-6">
                        <TextInput
                            label="Full name"
                            name="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Ada Lovelace"
                            helperText="Displayed across the app and on billing documents."
                            required
                        />
                        <div className="rounded-xl bg-base-200/70 px-4 py-3 text-sm text-base-content/70">
                            Use your preferred professional name. This helps
                            teammates identify you quickly.
                        </div>
                    </div>
                </Card>

                <Card
                    title="Account details"
                    className="border border-base-200 bg-base-100/70 shadow-lg"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-base-200/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                                Email address
                            </p>
                            <p className="mt-1 text-base font-medium">
                                {user?.email}
                            </p>
                        </div>
                        <div className="rounded-xl border border-base-200/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                                Member since
                            </p>
                            <p className="mt-1 text-base font-medium">
                                {joinedDate}
                            </p>
                        </div>
                    </div>
                </Card>

                <div className="flex flex-wrap items-center justify-end gap-3">
                    <Link
                        to={Paths.PROFILE}
                        className={cx(
                            buttonVariants({
                                variant: 'ghost',
                            }),
                            'no-underline',
                        )}
                    >
                        Cancel
                    </Link>
                    <Button
                        status="primary"
                        type="submit"
                        loading={isSubmitting}
                    >
                        Save changes
                    </Button>
                </div>
            </Form>
        </Container>
    );
}

const formatDate = (value?: Date | string | null) => {
    if (!value) {
        return '—';
    }

    const dateValue =
        value instanceof Date ? value : new Date(value ?? undefined);

    if (Number.isNaN(dateValue.getTime())) {
        return '—';
    }

    return dateValue.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
};
