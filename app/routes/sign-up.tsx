import { Form, useNavigate } from 'react-router';
import { useState } from 'react';
import { authClient } from '~/lib/auth-client';
import { TextInput } from '~/components/TextInput';
import { Button } from '~/components/Button';
import { Card } from '~/components/Card';
import { Paths } from '~/constants';

export default function SignUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const signUp = async () => {
        await authClient.signUp.email(
            {
                email,
                password,
                name
            },
            {
                onRequest: (ctx) => {
                    setIsLoading(true);
                },
                onSuccess: (ctx) => {
                    navigate(Paths.SIGN_IN);
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
            <title>Sign Up - TWS Foundations</title>
            <meta
                name="description"
                content="Create your TWS Foundations account to explore the SaaS starter kit."
            />
            <div className="flex items-center justify-center p-24">
                <Card className="min-w-lg">
                    <h2 className="text-2xl font-bold">Sign Up</h2>
                    <Form onSubmit={signUp} className="space-y-4">
                        <TextInput
                            label="Name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name"
                        />
                        <TextInput
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                        />
                        <TextInput
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                        />
                        <Button
                            type="submit"
                            loading={isLoading}
                            color="secondary"
                        >
                            Sign Up
                        </Button>
                    </Form>
                </Card>
            </div>
        </>
    );
}
