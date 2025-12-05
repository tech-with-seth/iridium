import { useNavigate } from 'react-router';
import { usePostHog } from 'posthog-js/react';
import { useState } from 'react';
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
import { Paths, PostHogEventNames } from '~/constants';
import { TabRadio, Tabs } from '~/components/Tabs';
import { Container } from '~/components/Container';

type AuthMode = 'signIn' | 'signUp';

export function Turnstile({
    onSuccessfulLogin,
}: {
    onSuccessfulLogin: () => void;
}) {
    const navigate = useNavigate();
    const postHog = usePostHog();

    const [mode, setMode] = useState<AuthMode>('signIn');
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

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
            postHog.capture(
                isSignIn
                    ? PostHogEventNames.SIGN_IN_ATTEMPT
                    : PostHogEventNames.SIGN_UP_ATTEMPT,
                {
                    email: data.email,
                },
            );

            if (isSignIn) {
                await authClient.signIn.email(
                    {
                        email: data.email,
                        password: data.password,
                    },
                    {
                        onSuccess: () => {
                            postHog.capture(PostHogEventNames.SIGN_IN_SUCCESS, {
                                email: data.email,
                            });
                            onSuccessfulLogin();
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
                const signUpData = data as SignUpData;
                await authClient.signUp.email(
                    {
                        email: signUpData.email,
                        password: signUpData.password,
                        name: signUpData.name,
                    },
                    {
                        onSuccess: () => {
                            postHog.capture(PostHogEventNames.SIGN_UP_SUCCESS, {
                                email: signUpData.email,
                                name: signUpData.name,
                            });
                            onSuccessfulLogin();
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
                        },
                    },
                );
            }
        } catch (error: unknown) {
            postHog.captureException(error as Error, {
                context: isSignIn
                    ? PostHogEventNames.SIGN_IN_FAILURE
                    : PostHogEventNames.SIGN_UP_FAILURE,
                email: data.email,
                timestamp: new Date().toISOString(),
            });
            setServerError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const onSocialSignIn =
        (provider: 'google' | 'github') =>
        async (data: SignInData | SignUpData) => {
            setIsLoading(true);
            setServerError(null);

            try {
                await authClient.signIn.social({
                    provider,
                });

                postHog.capture(
                    provider === 'google'
                        ? PostHogEventNames.GOOGLE_SIGN_IN_SUCCESS
                        : PostHogEventNames.GITHUB_SIGN_IN_SUCCESS,
                    {
                        email: data.email,
                    },
                );

                navigate(Paths.DASHBOARD);
            } catch (error: unknown) {
                postHog.captureException(error as Error, {
                    context:
                        provider === 'google'
                            ? PostHogEventNames.GOOGLE_SIGN_IN_FAILURE
                            : PostHogEventNames.GITHUB_SIGN_IN_FAILURE,
                    timestamp: new Date().toISOString(),
                });
                setServerError(
                    `An unexpected error occurred during ${provider === 'google' ? 'Google' : 'GitHub'} sign-in. Please try again.`,
                );
            } finally {
                setIsLoading(false);
            }
        };

    const handleToggleMode = () => {
        const newMode: AuthMode = isSignIn ? 'signUp' : 'signIn';

        postHog.capture(
            isSignIn
                ? PostHogEventNames.AUTH_MODE_TOGGLE_SIGN_IN
                : PostHogEventNames.AUTH_MODE_TOGGLE_SIGN_UP,
            {
                previousMode: mode,
                newMode,
            },
        );

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
            <Container>
                {/* TODO: Figure out why tabs are toggling incorrectly */}
                <Tabs variant="box" className="mb-8">
                    <TabRadio
                        checked={mode === 'signIn'}
                        label="Sign In"
                        name="loginMethod"
                        onChange={handleToggleMode}
                        value="signIn"
                    />
                    <TabRadio
                        checked={mode === 'signUp'}
                        label="Sign Up"
                        name="loginMethod"
                        onChange={handleToggleMode}
                        value="signUp"
                    />
                </Tabs>
                {serverError && (
                    <Alert status="error" className="mb-4">
                        {serverError}
                    </Alert>
                )}
                <h2 className="text-xl font-bold mb-8">Social</h2>
                <div className="flex flex-col gap-4 mb-8">
                    <Button
                        type="button"
                        onClick={handleSubmit(onSocialSignIn('google'))}
                        loading={isLoading}
                        className="w-full"
                        status="primary"
                    >
                        <svg
                            role="img"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 fill-base-content mr-2"
                        >
                            <title>Google</title>
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                        </svg>
                        {`Sign ${isSignIn ? 'in' : 'up'} with Google`}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit(onSocialSignIn('github'))}
                        loading={isLoading}
                        className="w-full"
                        status="primary"
                    >
                        <svg
                            role="img"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 fill-base-content mr-2"
                        >
                            <title>GitHub</title>
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                        {`Sign ${isSignIn ? 'in' : 'up'} with GitHub`}
                    </Button>
                </div>
                <hr className="border-base-300 my-4" />
                <h2 className="text-xl font-bold mb-8">Email</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <Button type="submit" loading={isLoading} status="primary">
                        {`Sign ${isSignIn ? 'In' : 'Up'}`}
                    </Button>
                </form>
            </Container>
        </>
    );
}
