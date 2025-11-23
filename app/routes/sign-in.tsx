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
import { usePostHog } from 'posthog-js/react';
import { Tab, TabRadio, Tabs } from '~/components/Tabs';
import { Container } from '~/components/Container';

type AuthMode = 'signIn' | 'signUp';

export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('signIn');
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const navigate = useNavigate();
    const postHog = usePostHog();

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
            postHog.capture(isSignIn ? 'sign_in_attempt' : 'sign_up_attempt', {
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
                            postHog.capture('sign_in_success', {
                                email: data.email,
                            });
                            navigate(Paths.DASHBOARD);
                        },
                        onError: (ctx) => {
                            setIsLoading(false);
                            postHog.captureException(ctx.error, {
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
                            postHog.capture('sign_up_success', {
                                email: signUpData.email,
                                name: signUpData.name,
                            });
                            navigate(Paths.DASHBOARD);
                        },
                        onError: (ctx) => {
                            postHog.captureException(ctx.error, {
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
            postHog.captureException(error as Error, {
                context: isSignIn ? 'sign_in' : 'sign_up',
                email: data.email,
                timestamp: new Date().toISOString(),
            });
            setServerError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    const onGoogleSignIn = async (data: SignInData | SignUpData) => {
        setIsLoading(true);
        setServerError(null);

        try {
            await authClient.signIn.social({
                provider: 'google',
            });

            postHog.capture('google_sign_in_success', {
                email: data.email,
            });

            navigate(Paths.DASHBOARD);
        } catch (error: unknown) {
            postHog.captureException(error as Error, {
                context: 'google_sign_in',
                timestamp: new Date().toISOString(),
            });
            setServerError(
                'An unexpected error occurred during Google sign-in. Please try again.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const onGitHubSignIn = async (data: SignInData | SignUpData) => {
        setIsLoading(true);
        setServerError(null);

        try {
            await authClient.signIn.social({
                provider: 'github',
            });

            postHog.capture('github_sign_in_success', {
                email: data.email,
            });

            navigate(Paths.DASHBOARD);
        } catch (error: unknown) {
            postHog.captureException(error as Error, {
                context: 'github_sign_in',
                timestamp: new Date().toISOString(),
            });
            setServerError(
                'An unexpected error occurred during GitHub sign-in. Please try again.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Track mode toggles (sign in <-> sign up)
    const handleToggleMode = () => {
        const newMode: AuthMode = isSignIn ? 'signUp' : 'signIn';

        postHog.capture('auth_mode_toggle', {
            previousMode: mode,
            newMode,
        });

        setMode(newMode);
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
            <Container className="flex flex-col items-center justify-center pt-24 px-4">
                <Tabs variant="box" className="mb-4 shrink">
                    <TabRadio
                        active={isSignIn}
                        label="Sign In"
                        name="loginMethod"
                        onClick={() => setMode('signIn')}
                        value="signIn"
                    />
                    <TabRadio
                        active={!isSignIn}
                        label="Sign Up"
                        name="loginMethod"
                        onClick={() => setMode('signUp')}
                        value="signUp"
                    />
                </Tabs>
                <Card className="w-full max-w-4xl">
                    {serverError && (
                        <Alert status="error" className="mb-4">
                            {serverError}
                        </Alert>
                    )}

                    <div className="grid grid-cols-12">
                        <div className="col-span-6">
                            <h2 className="text-2xl font-bold mb-8">Email</h2>
                        </div>
                        <div className="col-span-6">
                            <h2 className="text-2xl font-bold mb-8">Social</h2>
                        </div>
                        <div className="col-span-6">
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
                        </div>
                        <div className="col-span-6">
                            <div className="flex flex-col gap-4">
                                <Button
                                    type="button"
                                    onClick={handleSubmit(onGoogleSignIn)}
                                    loading={isLoading}
                                    className="w-full"
                                >
                                    {isSignIn
                                        ? 'Sign in with Google'
                                        : 'Sign up with Google'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleSubmit(onGitHubSignIn)}
                                    loading={isLoading}
                                    className="w-full"
                                >
                                    {isSignIn
                                        ? 'Sign in with GitHub'
                                        : 'Sign up with GitHub'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </Container>
        </>
    );
}
