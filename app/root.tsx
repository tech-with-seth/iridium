import {
    isRouteErrorResponse,
    Link,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration
} from 'react-router';

import type { Route } from './+types/root';

import './app.css';
import { Navbar, NavbarMenu, NavbarMenuItem } from './components/Navbar';
import { Container } from './components/Container';
import { Paths } from './constants';

export const links: Route.LinksFunction = () => [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous'
    },
    {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap'
    }
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body>
                <header className="my-4">
                    <Container>
                        <Navbar
                            sticky
                            className="rounded-xl bg-sky-900"
                            shadow
                            brand={
                                <Link
                                    to="/"
                                    className="btn btn-ghost text-xl font-bold"
                                >
                                    {`<TWS />`}
                                </Link>
                            }
                            center={
                                <NavbarMenu>
                                    <NavbarMenuItem>
                                        <Link to="/">Home</Link>
                                    </NavbarMenuItem>
                                    <NavbarMenuItem>
                                        <Link to="/dashboard">Dashboard</Link>
                                    </NavbarMenuItem>
                                    <NavbarMenuItem>
                                        <Link to="/profile">Profile</Link>
                                    </NavbarMenuItem>
                                </NavbarMenu>
                            }
                            end={
                                <NavbarMenu>
                                    <NavbarMenuItem>
                                        <Link to={Paths.SIGN_IN}>Sign In</Link>
                                    </NavbarMenuItem>
                                    <NavbarMenuItem>
                                        <Link to={Paths.SIGN_UP}>Sign Up</Link>
                                    </NavbarMenuItem>
                                    <NavbarMenuItem>
                                        <Link to={Paths.SIGN_OUT}>
                                            Sign Out
                                        </Link>
                                    </NavbarMenuItem>
                                </NavbarMenu>
                            }
                        />
                    </Container>
                </header>
                <main>{children}</main>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = 'Oops!';
    let details = 'An unexpected error occurred.';
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? '404' : 'Error';
        details =
            error.status === 404
                ? 'The requested page could not be found.'
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
