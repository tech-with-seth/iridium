import { useReducer, type JSX } from 'react';
import {
    Form,
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
    LogOutIcon,
    MessageSquareIcon,
    PentagonIcon,
    UserCircle2Icon,
} from 'lucide-react';
import { getUserFromSession } from '~/models/session.server';
import type { Route } from './+types/root';
import { Container } from './components/Container';
import { Card } from './components/Card';
import { navLinkClassName } from './shared';
import { Drawer } from './components/Drawer';

import './app.css';

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

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);

    return {
        isAuthenticated: Boolean(user),
    };
}

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
            <body className="h-full overflow-hidden">
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

function ConditionalWrapper({
    condition,
    wrapper,
    children,
}: {
    condition: boolean;
    wrapper: (children: React.ReactNode) => JSX.Element;
    children: React.ReactNode;
}) {
    return condition ? wrapper(children) : children;
}

export default function App({ loaderData }: Route.ComponentProps) {
    const [isDrawerOpen, toggleDrawer] = useReducer((s) => !s, false);

    return (
        <Drawer
            className="h-full"
            contents={<>Stuff</>}
            drawerContentClassName="flex h-full flex-col overflow-hidden"
            handleClose={toggleDrawer}
            id="main-drawer"
            isOpen={isDrawerOpen}
            right
        >
            <header className="shrink-0 mb-4">
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
                            {loaderData.isAuthenticated && (
                                <>
                                    <li>
                                        <Form
                                            method="POST"
                                            action="/logout"
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="hidden"
                                                name="intent"
                                                value="logout"
                                            />
                                            <button
                                                type="submit"
                                                className="flex gap-2"
                                            >
                                                <LogOutIcon className="h-6 w-6" />
                                                <strong className="font-bold">
                                                    Logout
                                                </strong>
                                            </button>
                                        </Form>
                                    </li>
                                </>
                            )}
                            {!loaderData.isAuthenticated && (
                                <li>
                                    <Link to="/login" className="flex gap-2">
                                        <LockIcon className="h-6 w-6" />
                                        <strong className="font-bold">
                                            Login
                                        </strong>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </Container>
                </nav>
            </header>
            <main className="min-h-0 grow overflow-hidden">
                <Container className="grid h-full grid-cols-12 gap-4">
                    <Card className="col-span-3">
                        <ul className="flex flex-col gap-4 p-4">
                            <li>
                                <NavLink to="/" className={navLinkClassName}>
                                    <HomeIcon className="h-6 w-6" />
                                    Home
                                </NavLink>
                            </li>
                            {loaderData.isAuthenticated && (
                                <>
                                    <li>
                                        <NavLink
                                            to="/profile"
                                            className={navLinkClassName}
                                        >
                                            <UserCircle2Icon className="h-6 w-6" />
                                            Profile
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
                                </>
                            )}
                        </ul>
                    </Card>
                    <Card className="col-span-9 overflow-hidden">
                        <Outlet />
                    </Card>
                </Container>
            </main>
            <footer className="bg-base-300 shrink-0 mt-4 py-4">
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
