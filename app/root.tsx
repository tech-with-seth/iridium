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
    MenuIcon,
    MessageSquareIcon,
    PentagonIcon,
    UserCircle2Icon,
} from 'lucide-react';
import { getUserFromSession } from '~/models/session.server';
import type { Route } from './+types/root';
import { Container } from './components/Container';
import { Card } from './components/Card';
import { cx } from 'cva.config';
import { listItemClassName, navLinkClassName } from './shared';
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

function DrawerContent({
    isAuthenticated,
    onClose,
}: {
    isAuthenticated: boolean;
    onClose: () => void;
}) {
    return (
        <nav aria-label="Mobile navigation">
            <ul className="flex flex-col gap-4">
                <li>
                    <NavLink
                        to="/"
                        className={navLinkClassName}
                        onClick={onClose}
                    >
                        <HomeIcon aria-hidden="true" className="h-6 w-6" />
                        Home
                    </NavLink>
                </li>
                {isAuthenticated && (
                    <>
                        <li>
                            <NavLink
                                to="/profile"
                                className={navLinkClassName}
                                onClick={onClose}
                            >
                                <UserCircle2Icon
                                    aria-hidden="true"
                                    className="h-6 w-6"
                                />
                                Profile
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/chat"
                                className={navLinkClassName}
                                onClick={onClose}
                            >
                                <MessageSquareIcon
                                    aria-hidden="true"
                                    className="h-6 w-6"
                                />
                                Chat
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/form"
                                className={navLinkClassName}
                                onClick={onClose}
                            >
                                <FormIcon
                                    aria-hidden="true"
                                    className="h-6 w-6"
                                />
                                Form
                            </NavLink>
                        </li>
                        <li>
                            <Form
                                method="POST"
                                action="/logout"
                                onSubmit={onClose}
                            >
                                <input
                                    type="hidden"
                                    name="intent"
                                    value="logout"
                                />
                                <button
                                    type="submit"
                                    className={cx(listItemClassName, 'w-full')}
                                >
                                    <LogOutIcon
                                        aria-hidden="true"
                                        className="h-6 w-6"
                                    />
                                    Logout
                                </button>
                            </Form>
                        </li>
                    </>
                )}
                {!isAuthenticated && (
                    <li>
                        <NavLink
                            to="/login"
                            className={navLinkClassName}
                            onClick={onClose}
                        >
                            <LockIcon aria-hidden="true" className="h-6 w-6" />
                            Login
                        </NavLink>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default function App({ loaderData }: Route.ComponentProps) {
    const [isDrawerOpen, toggleDrawer] = useReducer((s) => !s, false);

    return (
        <Drawer
            className="h-full"
            contents={
                <DrawerContent
                    isAuthenticated={loaderData.isAuthenticated}
                    onClose={toggleDrawer}
                />
            }
            drawerContentClassName="flex h-full flex-col overflow-hidden"
            handleClose={toggleDrawer}
            id="main-drawer"
            isOpen={isDrawerOpen}
            right
        >
            <a
                href="#main-content"
                className="focus:bg-base-100 focus:text-base-content sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:px-4 focus:py-2 focus:outline"
            >
                Skip to main content
            </a>
            <header className="mb-4 shrink-0">
                <nav
                    aria-label="Site"
                    className="bg-neutral text-neutral-content py-4"
                >
                    <Container className="flex items-center justify-between">
                        <ul className="flex gap-4 px-4">
                            <li>
                                <Link to="/" className="flex gap-2">
                                    <PentagonIcon
                                        aria-hidden="true"
                                        className="h-6 w-6"
                                    />
                                    <strong className="font-bold">
                                        Iridium
                                    </strong>
                                </Link>
                            </li>
                        </ul>
                        <ul className="hidden gap-4 px-4 md:flex">
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
                                                <LogOutIcon
                                                    aria-hidden="true"
                                                    className="h-6 w-6"
                                                />
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
                                        <LockIcon
                                            aria-hidden="true"
                                            className="h-6 w-6"
                                        />
                                        <strong className="font-bold">
                                            Login
                                        </strong>
                                    </Link>
                                </li>
                            )}
                        </ul>
                        <button
                            type="button"
                            className="btn btn-ghost mx-4 px-2 md:hidden"
                            onClick={toggleDrawer}
                            aria-label="Open navigation menu"
                            aria-expanded={isDrawerOpen}
                            aria-controls="main-drawer"
                        >
                            <MenuIcon aria-hidden="true" className="h-6 w-6" />
                        </button>
                    </Container>
                </nav>
            </header>
            <main
                id="main-content"
                tabIndex={-1}
                className="min-h-0 grow overflow-hidden"
            >
                <Container className="grid h-full grid-cols-1 gap-4 md:grid-cols-12">
                    <Card className="hidden md:col-span-4 md:block lg:col-span-3">
                        <nav aria-label="Main navigation">
                            <ul className="flex flex-col gap-4 p-4">
                                <li>
                                    <NavLink
                                        to="/"
                                        className={navLinkClassName}
                                    >
                                        <HomeIcon
                                            aria-hidden="true"
                                            className="h-6 w-6"
                                        />
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
                                                <UserCircle2Icon
                                                    aria-hidden="true"
                                                    className="h-6 w-6"
                                                />
                                                Profile
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink
                                                to="/chat"
                                                className={navLinkClassName}
                                            >
                                                <MessageSquareIcon
                                                    aria-hidden="true"
                                                    className="h-6 w-6"
                                                />
                                                Chat
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink
                                                to="/form"
                                                className={navLinkClassName}
                                            >
                                                <FormIcon
                                                    aria-hidden="true"
                                                    className="h-6 w-6"
                                                />
                                                Form
                                            </NavLink>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </nav>
                    </Card>
                    <Card className="col-span-1 overflow-hidden md:col-span-8 lg:col-span-9">
                        <Outlet />
                    </Card>
                </Container>
            </main>
            <footer className="bg-base-300 mt-4 shrink-0 py-4">
                <Container className="px-4">
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
        <main role="alert" className="container mx-auto p-4 pt-16">
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
