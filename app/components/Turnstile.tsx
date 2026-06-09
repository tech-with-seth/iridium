import { useReducer, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authClient } from '~/lib/auth.client';
import { Field } from '~/components/forms/Field';
import { FormAlert } from '~/components/forms/FormAlert';
import { Input } from '~/components/forms/Input';

const formSchema = z.object({
    name: z.string().optional(),
    email: z.email({ message: 'Enter a valid email address' }),
    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

const REDIRECT_PATH = '/dashboard';

export function Turnstile() {
    const navigate = useNavigate();
    const [isSignIn, toggleSignIn] = useReducer((s) => !s, true);
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormValues) => {
        setFormError(null);

        if (!isSignIn && !data.name?.trim()) {
            setError('name', { message: 'Name is required' });
            return;
        }

        const callbackURL = `${window.location.origin}${REDIRECT_PATH}`;

        if (isSignIn) {
            await authClient.signIn.email(
                { email: data.email, password: data.password, callbackURL },
                {
                    onSuccess: () => navigate(REDIRECT_PATH),
                    onError: (ctx) =>
                        setFormError(ctx.error.message ?? 'Sign in failed.'),
                },
            );
        } else {
            await authClient.signUp.email(
                {
                    email: data.email,
                    password: data.password,
                    name: data.name!,
                    callbackURL,
                },
                {
                    onSuccess: () => navigate(REDIRECT_PATH),
                    onError: (ctx) =>
                        setFormError(
                            ctx.error.message ?? 'Registration failed.',
                        ),
                },
            );
        }
    };

    return (
        <>
            <title>{`${isSignIn ? 'Sign In' : 'Sign Up'} | Iridium`}</title>
            <meta
                name="description"
                content={
                    isSignIn
                        ? 'Access your Iridium account with your email and password.'
                        : 'Create your Iridium account to explore the SaaS starter kit.'
                }
            />
            <div className="p-8">
                <h2 className="mb-8 text-3xl font-bold">Authenticate</h2>
                <FormAlert message={formError} className="mb-4" />
                <div>
                    <div className="join mb-4">
                        <input
                            className="join-item btn"
                            type="radio"
                            name="loginOptions"
                            aria-label="Login"
                            onChange={toggleSignIn}
                            disabled={isSubmitting}
                            defaultChecked
                        />
                        <input
                            className="join-item btn"
                            type="radio"
                            name="loginOptions"
                            aria-label="Register"
                            onChange={toggleSignIn}
                            disabled={isSubmitting}
                        />
                    </div>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {!isSignIn && (
                            <Field
                                label="Name"
                                name="name"
                                error={errors.name?.message}
                                disabled={isSubmitting}
                            >
                                {(controlProps) => (
                                    <Input
                                        type="text"
                                        placeholder="Your name"
                                        {...controlProps}
                                        {...register('name')}
                                    />
                                )}
                            </Field>
                        )}
                        <Field
                            label="Email address"
                            name="email"
                            error={errors.email?.message}
                            disabled={isSubmitting}
                        >
                            {(controlProps) => (
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    {...controlProps}
                                    {...register('email')}
                                />
                            )}
                        </Field>
                        <Field
                            label="Password"
                            name="password"
                            error={errors.password?.message}
                            disabled={isSubmitting}
                        >
                            {(controlProps) => (
                                <Input
                                    type="password"
                                    placeholder="Your password"
                                    {...controlProps}
                                    {...register('password')}
                                />
                            )}
                        </Field>
                        <div className="flex items-center justify-between">
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
                                ) : isSignIn ? (
                                    'Login'
                                ) : (
                                    'Register'
                                )}
                            </button>
                            {isSignIn && (
                                <Link
                                    to="/forgot-password"
                                    className="link text-sm"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
