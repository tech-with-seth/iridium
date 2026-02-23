import {
    isRouteErrorResponse,
    Link,
    Links,
    Meta,
    NavLink,
    Outlet,
    Scripts,
    ScrollRestoration,
} from 'react-router';
import {
    FormIcon,
    HomeIcon,
    LockIcon,
    MessageSquareIcon,
    PentagonIcon,
    UserCircle2Icon,
} from 'lucide-react';
import type { Route } from './+types/root';
import { Container } from './components/Container';
import { Card } from './components/Card';
import { navLinkClassName } from './shared';

import './app.css';
import { Drawer } from './components/Drawer';
import { Turnstile } from './components/Turnstile';
import { useReducer } from 'react';

export const links: Route.LinksFunction = () => [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
    },
    {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap',
    },
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-full">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body className="h-full">
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    const [isDrawerOpen, toggleDrawer] = useReducer((s) => !s, false);

    return (
        <Drawer
            className="min-h-screen"
            contents={<Turnstile />}
            drawerContentClassName="flex flex-col"
            handleClose={toggleDrawer}
            id="main-drawer"
            isOpen={isDrawerOpen}
            right
        >
            <header className="mb-4">
                <nav className="bg-base-300 py-4">
                    <Container className="flex items-center justify-between">
                        <ul className="flex gap-4 px-4">
                            <li>
                                <Link to="/" className="flex gap-2">
                                    <PentagonIcon className="h-6 w-6" />
                                    <strong className="font-bold">
                                        Iridium
                                    </strong>
                                </Link>
                            </li>
                        </ul>
                        <ul className="flex gap-4 px-4">
                            <li>
                                <Link to="/profile" className="flex gap-2">
                                    <UserCircle2Icon className="h-6 w-6" />
                                    <strong className="font-bold">
                                        Profile
                                    </strong>
                                </Link>
                            </li>
                            <li>
                                <button
                                    className="flex gap-2"
                                    onClick={toggleDrawer}
                                >
                                    <LockIcon className="h-6 w-6" />
                                    <strong className="font-bold">Login</strong>
                                </button>
                            </li>
                        </ul>
                    </Container>
                </nav>
            </header>
            <main className="grow">
                <Container className="grid h-full grid-cols-12 gap-4">
                    <Card className="col-span-3">
                        <ul className="flex flex-col gap-4 p-4">
                            <li>
                                <NavLink to="/" className={navLinkClassName}>
                                    <HomeIcon className="h-6 w-6" />
                                    Home
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/chat"
                                    className={navLinkClassName}
                                >
                                    <MessageSquareIcon className="h-6 w-6" />
                                    Chat
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/form"
                                    className={navLinkClassName}
                                >
                                    <FormIcon className="h-6 w-6" />
                                    Form
                                </NavLink>
                            </li>
                        </ul>
                    </Card>
                    <Card className="col-span-9">
                        <Outlet />
                    </Card>
                </Container>
            </main>
            <footer className="bg-base-300 mt-4 py-4">
                <Container>
                    <p className="text-base-content">
                        Iridium is so hot right now
                    </p>
                </Container>
            </footer>
        </Drawer>
    );
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
        <main className="container mx-auto p-4 pt-16">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full overflow-x-auto p-4">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
