import { data, Form, Link, useNavigation } from 'react-router';
import { MailCheckIcon } from 'lucide-react';
import { z } from 'zod';
import { auth } from '~/lib/auth.server';
import { log } from '~/lib/logger.server';
import { requireAnonymous } from '~/models/session.server';
import { Field } from '~/components/forms/Field';
import { Input } from '~/components/forms/Input';
import type { Route } from './+types/forgot-password';

const schema = z.object({
    email: z.email({ message: 'Enter a valid email address' }),
});

export async function loader({ request }: Route.LoaderArgs) {
    await requireAnonymous(request);
    return null;
}

export async function action({ request }: Route.ActionArgs) {
    const form = await request.formData();
    const parsed = schema.safeParse(Object.fromEntries(form));

    if (!parsed.success) {
        return data(
            {
                status: 'error' as const,
                errors: z.flattenError(parsed.error).fieldErrors,
            },
            { status: 400 },
        );
    }

    try {
        await auth.api.requestPasswordReset({
            body: { email: parsed.data.email, redirectTo: '/reset-password' },
        });
    } catch (error) {
        // Swallow errors: responding differently for unknown emails would
        // allow account enumeration. The success message is intentional.
        log.exception('password_reset_request_failed', error);
    }

    return data({ status: 'sent' as const, errors: null });
}

export default function ForgotPasswordRoute({
    actionData,
}: Route.ComponentProps) {
    const navigation = useNavigation();
    const isSubmitting = navigation.state !== 'idle';

    return (
        <>
            <title>Forgot Password | Iridium</title>
            <meta
                name="description"
                content="Request a password reset link for your Iridium account."
            />
            <div className="bg-base-300 flex h-full items-center justify-center p-4">
                <div className="card bg-base-100 w-full max-w-md shadow-lg">
                    <div className="card-body">
                        {actionData?.status === 'sent' ? (
                            <div className="flex flex-col items-center gap-4 py-4 text-center">
                                <MailCheckIcon
                                    aria-hidden="true"
                                    className="text-success h-12 w-12"
                                />
                                <h1 className="text-2xl font-bold">
                                    Check your email
                                </h1>
                                <p>
                                    If an account exists for that address, a
                                    password reset link is on its way.
                                </p>
                                <Link to="/login" className="link">
                                    Back to login
                                </Link>
                            </div>
                        ) : (
                            <>
                                <h1 className="mb-2 text-2xl font-bold">
                                    Forgot your password?
                                </h1>
                                <p className="mb-4">
                                    Enter your email address and we will send
                                    you a link to reset it.
                                </p>
                                <Form method="POST" className="space-y-4">
                                    <Field
                                        label="Email address"
                                        name="email"
                                        error={actionData?.errors?.email?.[0]}
                                        disabled={isSubmitting}
                                    >
                                        {(controlProps) => (
                                            <Input
                                                type="email"
                                                name="email"
                                                placeholder="name@example.com"
                                                required
                                                className="w-full"
                                                {...controlProps}
                                            />
                                        )}
                                    </Field>
                                    <button
                                        className="btn btn-accent"
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span
                                                role="status"
                                                aria-label="Loading"
                                                className="loading loading-spinner loading-sm"
                                            />
                                        ) : (
                                            'Send reset link'
                                        )}
                                    </button>
                                </Form>
                                <Link to="/login" className="link mt-2">
                                    Back to login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
