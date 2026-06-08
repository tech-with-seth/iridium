import { MenuIcon, PentagonIcon } from 'lucide-react';
import { Form, Link, useRouteLoaderData } from 'react-router';
import { Container } from '~/components/Container';
import { Header } from '~/components/Header';
import type { loader as rootLoader } from '~/root';

type SiteHeaderProps = {
    /** When provided, renders a mobile-only hamburger button to toggle the nav drawer. */
    onMenuClick?: () => void;
};

export function SiteHeader({ onMenuClick }: SiteHeaderProps) {
    const data = useRouteLoaderData<typeof rootLoader>('root');
    const isAuthenticated = Boolean(data?.isAuthenticated);

    return (
        <Header>
            <Container className="flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    {onMenuClick ? (
                        <button
                            type="button"
                            aria-label="Open navigation menu"
                            className="btn btn-square btn-ghost lg:hidden"
                            onClick={onMenuClick}
                        >
                            <MenuIcon />
                        </button>
                    ) : null}
                    <Link to="/" className="flex items-center gap-2 font-bold">
                        <PentagonIcon /> Iridium
                    </Link>
                </div>
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
