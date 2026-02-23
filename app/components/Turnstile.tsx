import { useReducer, useState } from 'react';
import { Form } from 'react-router';
import { authClient } from '~/lib/auth.client';

export function Turnstile() {
    const [isSignIn, toggleSignIn] = useReducer((s) => !s, false);

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const signIn = async () => {
        await authClient.signIn.email(
            {
                email,
                password,
            },
            {
                onRequest: (ctx) => {
                    // show loading state
                },
                onSuccess: (ctx) => {
                    // redirect to home
                },
                onError: (ctx) => {
                    alert(ctx.error);
                },
            },
        );
    };

    const signUp = async () => {
        await authClient.signUp.email(
            {
                email,
                password,
                name,
            },
            {
                onRequest: (ctx) => {
                    // show loading state
                },
                onSuccess: (ctx) => {
                    // redirect to home
                },
                onError: (ctx) => {
                    alert(ctx.error);
                },
            },
        );
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
                <div>
                    <div className="tabs tabs-box mb-4">
                        <input
                            type="radio"
                            name="sign-in-tabs"
                            className="tab"
                            aria-label="Login"
                            checked={isSignIn}
                            onChange={toggleSignIn}
                        />
                        <input
                            type="radio"
                            name="sign-in-tabs"
                            className="tab"
                            aria-label="Register"
                            checked={!isSignIn}
                            onChange={toggleSignIn}
                        />
                    </div>
                    <Form
                        onSubmit={isSignIn ? signIn : signUp}
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
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Password
                            </legend>
                            <input
                                type="password"
                                className="input"
                                placeholder="Your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </fieldset>
                        <button className="btn btn-accent" type="submit">
                            {isSignIn ? 'Login' : 'Register'}
                        </button>
                    </Form>
                </div>
            </div>
        </>
    );
}
