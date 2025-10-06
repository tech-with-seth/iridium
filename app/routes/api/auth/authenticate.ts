import { data, redirect } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Route } from './+types/authenticate';
import { getValidatedFormData } from '~/lib/form-validation.server';
import { signInSchema, signUpSchema, type SignInData, type SignUpData } from '~/lib/validations';
import { authClient } from '~/lib/auth-client';
import { Paths } from '~/constants';

export async function action({ request }: Route.ActionArgs) {
    if (request.method === 'POST') {
        const formData = await request.formData();
        const intent = formData.get('intent') as string;

        // Handle Sign In
        if (intent === 'signIn') {
            const { data: validatedData, errors } = await getValidatedFormData<SignInData>(
                request,
                zodResolver(signInSchema)
            );

            if (errors) {
                return data({ errors }, { status: 400 });
            }

            try {
                await authClient.signIn.email(
                    {
                        email: validatedData!.email,
                        password: validatedData!.password
                    },
                    {
                        onError: (ctx) => {
                            throw new Error(ctx.error.message || 'Sign in failed');
                        }
                    }
                );

                return redirect(Paths.DASHBOARD);
            } catch (error) {
                return data(
                    {
                        error: error instanceof Error ? error.message : 'Authentication failed. Please check your credentials.'
                    },
                    { status: 401 }
                );
            }
        }

        // Handle Sign Up
        if (intent === 'signUp') {
            const { data: validatedData, errors } = await getValidatedFormData<SignUpData>(
                request,
                zodResolver(signUpSchema)
            );

            if (errors) {
                return data({ errors }, { status: 400 });
            }

            try {
                await authClient.signUp.email(
                    {
                        email: validatedData!.email,
                        password: validatedData!.password,
                        name: validatedData!.name
                    },
                    {
                        onError: (ctx) => {
                            throw new Error(ctx.error.message || 'Sign up failed');
                        }
                    }
                );

                return redirect(Paths.SIGN_IN);
            } catch (error) {
                return data(
                    {
                        error: error instanceof Error ? error.message : 'Account creation failed. Please try again.'
                    },
                    { status: 400 }
                );
            }
        }

        return data({ error: 'Invalid intent' }, { status: 400 });
    }

    // Handle Sign Out
    if (request.method === 'DELETE') {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onError: (ctx) => {
                        throw new Error(ctx.error.message || 'Sign out failed');
                    }
                }
            });

            return redirect(Paths.HOME);
        } catch (error) {
            return data(
                {
                    error: error instanceof Error ? error.message : 'Sign out failed. Please try again.'
                },
                { status: 500 }
            );
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
