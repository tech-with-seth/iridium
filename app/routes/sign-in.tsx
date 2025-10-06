import { useState } from 'react';
import { useFetcher } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '~/components/Button';
import { Card } from '~/components/Card';
import { TextInput } from '~/components/TextInput';
import { Alert } from '~/components/Alert';
import { useValidatedForm } from '~/lib/form-hooks';
import { signInSchema, signUpSchema, type SignInData, type SignUpData } from '~/lib/validations';

type AuthMode = 'signIn' | 'signUp';

export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('signIn');
    const fetcher = useFetcher();

    const isSignUp = mode === 'signUp';
    const schema = isSignUp ? signUpSchema : signInSchema;

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useValidatedForm<SignInData | SignUpData>({
        resolver: zodResolver(schema),
        errors: fetcher.data?.errors
    });

    const onSubmit = (data: SignInData | SignUpData) => {
        const formData = new FormData();
        formData.append('intent', isSignUp ? 'signUp' : 'signIn');
        formData.append('email', data.email);
        formData.append('password', data.password);

        if (isSignUp && 'name' in data) {
            formData.append('name', data.name);
        }

        fetcher.submit(formData, {
            method: 'POST',
            action: '/api/auth/authenticate'
        });
    };

    const isLoading = fetcher.state === 'submitting' || fetcher.state === 'loading';

    return (
        <>
            <title>{isSignUp ? 'Sign Up' : 'Sign In'} - TWS Foundations</title>
            <meta
                name="description"
                content={
                    isSignUp
                        ? 'Create your TWS Foundations account to explore the SaaS starter kit.'
                        : 'Access your TWS Foundations account with your email and password.'
                }
            />
            <div className="flex items-center justify-center p-24">
                <Card className="min-w-lg">
                    <h2 className="text-2xl font-bold mb-4">
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </h2>

                    {fetcher.data?.error && (
                        <Alert status="error" className="mb-4">
                            {fetcher.data.error}
                        </Alert>
                    )}

                    <fetcher.Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <input type="hidden" name="intent" value={isSignUp ? 'signUp' : 'signIn'} />

                        {isSignUp && (
                            <TextInput
                                {...register('name')}
                                label="Name"
                                type="text"
                                error={'name' in errors ? errors.name?.message : undefined}
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
                            helperText={isSignUp ? 'Must be at least 8 characters with letters and numbers' : undefined}
                            required
                        />

                        <Button type="submit" loading={isLoading} status={isSignUp ? 'secondary' : 'primary'}>
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </Button>
                    </fetcher.Form>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => setMode(isSignUp ? 'signIn' : 'signUp')}
                            className="link link-primary"
                        >
                            {isSignUp
                                ? 'Already have an account? Sign in'
                                : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </Card>
            </div>
        </>
    );
}
