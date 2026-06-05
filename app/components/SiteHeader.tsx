import { PentagonIcon } from 'lucide-react';
import { Form, Link, useRouteLoaderData } from 'react-router';
import { Container } from '~/components/Container';
import { Header } from '~/components/Header';
import type { loader as rootLoader } from '~/root';

export function SiteHeader() {
    const data = useRouteLoaderData<typeof rootLoader>('root');
    const isAuthenticated = Boolean(data?.isAuthenticated);

    return (
        <Header>
            <Container className="flex items-center justify-between">
                <Link className="btn btn-ghost text-xl normal-case" to="/">
                    <PentagonIcon /> Iridium
                </Link>
                {isAuthenticated ? (
                    <Form method="POST" action="/logout">
                        <button className="btn" type="submit">
                            Logout
                        </button>
                    </Form>
                ) : (
                    <Link className="btn" to="/login">
                        Login
                    </Link>
                )}
            </Container>
        </Header>
    );
}
