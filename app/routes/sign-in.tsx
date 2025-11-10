import { useState } from 'react';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '~/components/Button';
import { Card } from '~/components/Card';
import { TextInput } from '~/components/TextInput';
import { Alert } from '~/components/Alert';
import { useValidatedForm } from '~/lib/form-hooks';
import {
    signInSchema,
    signUpSchema,
    type SignInData,
    type SignUpData,
} from '~/lib/validations';
import { authClient } from '~/lib/auth-client';
import { Paths } from '~/constants';
import { logEvent, logException } from '~/lib/posthog';

type AuthMode = 'signIn' | 'signUp';

export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('signIn');
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const navigate = useNavigate();

    const isSignIn = mode === 'signIn';
    const schema = isSignIn ? signInSchema : signUpSchema;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useValidatedForm<SignInData | SignUpData>({
        defaultValues: {
            email: 'admin@iridium.com',
            password: 'Admin123!',
            name: 'Important Person',
        },
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: SignInData | SignUpData) => {
        setIsLoading(true);
        setServerError(null);

        try {
            // Track attempt
            logEvent(isSignIn ? 'sign_in_attempt' : 'sign_up_attempt', {
                email: data.email,
            });

            if (isSignIn) {
                // Sign In
                await authClient.signIn.email(
                    {
                        email: data.email,
                        password: data.password,
                    },
                    {
                        onSuccess: () => {
                            logEvent('sign_in_success', {
                                email: data.email,
                            });
                            navigate(Paths.DASHBOARD);
                        },
                        onError: (ctx) => {
                            setIsLoading(false);
                            logEvent('sign_in_error', {
                                email: data.email,
                                error: ctx?.error?.message || 'unknown',
                            });
                            setServerError(
                                ctx.error.message ||
                                    'Invalid credentials. Please try again.',
                            );
                        },
                    },
                );
            } else {
                // Sign Up
                const signUpData = data as SignUpData;
                await authClient.signUp.email(
                    {
                        email: signUpData.email,
                        password: signUpData.password,
                        name: signUpData.name,
                    },
                    {
                        onSuccess: () => {
                            logEvent('sign_up_success', {
                                email: signUpData.email,
                                name: signUpData.name,
                            });
                            navigate(Paths.DASHBOARD);
                        },
                        onError: (ctx) => {
                            logEvent('sign_up_error', {
                                email: signUpData.email,
                                error: ctx?.error?.message || 'unknown',
                            });
                            setServerError(
                                ctx.error.message ||
                                    'Account creation failed. Please try again.',
                            );
                            setIsLoading(false);
                        },
                    },
                );
            }
        } catch (error: unknown) {
            logException(error as Error, {
                context: isSignIn ? 'sign_in' : 'sign_up',
                email: data.email,
                timestamp: new Date().toISOString(),
            });
            setServerError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    // Track mode toggles (sign in <-> sign up)
    const handleToggleMode = () => {
        const newMode: AuthMode = isSignIn ? 'signUp' : 'signIn';

        logEvent('auth_mode_toggle', {
            previousMode: mode,
            newMode,
        });

        setMode(newMode);
    };

    return (
        <>
            <title>{`${isSignIn ? 'Sign In' : 'Sign Up'} - Iridium`}</title>
            <meta
                name="description"
                content={
                    isSignIn
                        ? 'Access your Iridium account with your email and password.'
                        : 'Create your Iridium account to explore the SaaS starter kit.'
                }
            />
            <div className="flex items-center justify-center p-24">
                <Card className="min-w-lg">
                    <h2 className="text-2xl font-bold mb-4">
                        {isSignIn ? 'Sign In' : 'Sign Up'}
                    </h2>

                    {serverError && (
                        <Alert status="error" className="mb-4">
                            {serverError}
                        </Alert>
                    )}

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {!isSignIn && (
                            <TextInput
                                {...register('name')}
                                label="Name"
                                type="text"
                                error={
                                    'name' in errors
                                        ? errors.name?.message
                                        : undefined
                                }
                                required
                            />
                        )}

                        <TextInput
                            {...register('email')}
                            label="Email"
                            type="email"
                            error={errors.email?.message}
                            required
                        />

                        <TextInput
                            {...register('password')}
                            label="Password"
                            type="password"
                            error={errors.password?.message}
                            helperText={
                                isSignIn
                                    ? undefined
                                    : 'Must be at least 8 characters with letters and numbers'
                            }
                            required
                        />

                        <Button
                            type="submit"
                            loading={isLoading}
                            status="primary"
                        >
                            {isSignIn ? 'Sign In' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={handleToggleMode}
                            className="link link-primary"
                        >
                            {isSignIn
                                ? "Don't have an account? Sign up"
                                : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </Card>
            </div>
        </>
    );
}
