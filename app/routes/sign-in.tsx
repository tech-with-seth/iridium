import { useState } from 'react';
import { Form, useNavigate } from 'react-router';

import { authClient } from '~/lib/auth-client';
import { Button } from '~/components/Button';
import { Card } from '~/components/Card';
import { Paths } from '~/constants';
import { TextInput } from '~/components/TextInput';

export default function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const signIn = async () => {
        await authClient.signIn.email(
            {
                email,
                password
            },
            {
                onRequest: (ctx) => {
                    setIsLoading(true);
                },
                onSuccess: (ctx) => {
                    navigate(Paths.DASHBOARD);
                },
                onError: (ctx) => {
                    setIsLoading(false);
                    alert(ctx.error);
                }
            }
        );
    };

    return (
        <>
            <title>Sign In - TWS Foundations</title>
            <meta
                name="description"
                content="Access your TWS Foundations account with your email and password."
            />
            <div className="flex items-center justify-center p-24">
                <Card>
                    <h2 className="text-2xl font-bold">Sign In</h2>
                    <Form onSubmit={signIn} className="space-y-4">
                        <TextInput
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextInput
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button type="submit" loading={isLoading}>
                            Sign In
                        </Button>
                    </Form>
                </Card>
            </div>
        </>
    );
}
