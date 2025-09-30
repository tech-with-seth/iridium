import { Form, useNavigate } from 'react-router';
import { useState } from 'react';
import { authClient } from '~/lib/auth-client';

export default function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = async () => {
        await authClient.signIn.email(
            {
                email,
                password
            },
            {
                onRequest: (ctx) => {
                    // show loading state
                },
                onSuccess: (ctx) => {
                    navigate('/dashboard');
                },
                onError: (ctx) => {
                    alert(ctx.error);
                }
            }
        );
    };

    return (
        <div>
            <h2>Sign In</h2>
            <Form onSubmit={signIn}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Sign In</button>
            </Form>
        </div>
    );
}
