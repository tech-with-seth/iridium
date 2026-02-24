import { useReducer, useState } from 'react';
import { useNavigate } from 'react-router';
import { CircleXIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authClient } from '~/lib/auth.client';

const formSchema = z.object({
    name: z.string().optional(),
    email: z.email({ message: 'Enter a valid email address' }),
    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

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

        const callbackURL = `${window.location.origin}/profile`;

        if (isSignIn) {
            await authClient.signIn.email(
                { email: data.email, password: data.password, callbackURL },
                {
                    onSuccess: () => navigate('/profile'),
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
                    onSuccess: () => navigate('/profile'),
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
            <div className="p-4">
                <h2 className="mb-8 text-3xl font-bold">Authenticate</h2>
                {formError && (
                    <div role="alert" className="alert alert-error mb-4">
                        <CircleXIcon aria-hidden="true" className="h-6 w-6" />
                        <span>{formError}</span>
                    </div>
                )}
                <div>
                    <div className="join mb-4">
                        <input
                            className="join-item btn"
                            type="radio"
                            name="loginOptions"
                            aria-label="Login"
                            onChange={toggleSignIn}
                            defaultChecked
                        />
                        <input
                            className="join-item btn"
                            type="radio"
                            name="loginOptions"
                            aria-label="Register"
                            onChange={toggleSignIn}
                        />
                    </div>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {!isSignIn && (
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Name
                                </legend>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Your name"
                                    aria-describedby={
                                        errors.name ? 'name-error' : undefined
                                    }
                                    {...register('name')}
                                />
                                {errors.name && (
                                    <p
                                        id="name-error"
                                        className="text-error text-sm"
                                    >
                                        {errors.name.message}
                                    </p>
                                )}
                            </fieldset>
                        )}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Email address
                            </legend>
                            <input
                                type="email"
                                className="input"
                                placeholder="name@example.com"
                                aria-describedby={
                                    errors.email ? 'email-error' : undefined
                                }
                                {...register('email')}
                            />
                            {errors.email && (
                                <p
                                    id="email-error"
                                    className="text-error text-sm"
                                >
                                    {errors.email.message}
                                </p>
                            )}
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Password
                            </legend>
                            <input
                                type="password"
                                className="input"
                                placeholder="Your password"
                                aria-describedby={
                                    errors.password
                                        ? 'password-error'
                                        : undefined
                                }
                                {...register('password')}
                            />
                            {errors.password && (
                                <p
                                    id="password-error"
                                    className="text-error text-sm"
                                >
                                    {errors.password.message}
                                </p>
                            )}
                        </fieldset>
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
                    </form>
                </div>
            </div>
        </>
    );
}
