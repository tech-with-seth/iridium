import {
    isRouteErrorResponse,
    Link,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration
} from 'react-router';
import invariant from 'tiny-invariant';
import { CogIcon } from 'lucide-react';

import { Button } from './components/Button';
import { Container } from './components/Container';
import { Drawer } from './components/Drawer';
import { getUserFromSession } from './lib/session.server';
import { getUserRole } from './models/user.server';
import { Navbar, NavbarMenu, NavbarMenuItem } from './components/Navbar';
import { Paths } from './constants';
import { useReducer } from 'react';
import { useRootData } from './hooks/useRootData';
import type { Route } from './+types/root';

import './app.css';
import { Footer } from './components/Footer';

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

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User not found');

    const roleObj = await getUserRole(user?.id);

    return { user, role: roleObj?.role };
}

export function Layout({ children }: { children: React.ReactNode }) {
    const data = useRootData();
    const [isOpen, dispatch] = useReducer((state, action) => {
        if (action.type === 'OPEN') {
            return true;
        }

        if (action.type === 'CLOSE') {
            return false;
        }

        if (action.type === 'TOGGLE') {
            return !state;
        }

        return state;
    }, false);

    const closeDrawer = () => dispatch({ type: 'CLOSE' });
    const openDrawer = () => dispatch({ type: 'OPEN' });

    const canOpen = data?.role === 'ADMIN' || data?.role === 'EDITOR';

    return (
        <html lang="en" className="min-h-screen">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body className="min-h-screen flex flex-col">
                <header className="my-4">
                    <Container>
                        <Navbar
                            brand={
                                <Link to="/" className="px-4 text-xl font-bold">
                                    {`<TWS />`}
                                </Link>
                            }
                            sticky
                            shadow
                            center={
                                <NavbarMenu>
                                    <NavbarMenuItem>
                                        <Link to="/">Home</Link>
                                    </NavbarMenuItem>
                                    <NavbarMenuItem>
                                        <Link to={Paths.ABOUT}>About</Link>
                                    </NavbarMenuItem>
                                    {data?.user?.id && (
                                        <>
                                            <NavbarMenuItem>
                                                <Link to="/dashboard">
                                                    Dashboard
                                                </Link>
                                            </NavbarMenuItem>
                                        </>
                                    )}
                                </NavbarMenu>
                            }
                            end={
                                <NavbarMenu>
                                    {data?.user?.id ? (
                                        <>
                                            <NavbarMenuItem>
                                                <Link to="/profile">
                                                    {data?.user?.name}
                                                </Link>
                                            </NavbarMenuItem>
                                            <NavbarMenuItem>
                                                <Link to={Paths.SIGN_OUT}>
                                                    Sign Out
                                                </Link>
                                            </NavbarMenuItem>
                                        </>
                                    ) : (
                                        <>
                                            <NavbarMenuItem>
                                                <Link to={Paths.SIGN_IN}>
                                                    Sign In
                                                </Link>
                                            </NavbarMenuItem>
                                        </>
                                    )}
                                </NavbarMenu>
                            }
                        />
                    </Container>
                </header>
                <main className="flex-grow">
                    <Drawer
                        id="appDrawer"
                        isOpen={canOpen && isOpen}
                        handleClose={closeDrawer}
                    >
                        {children}
                    </Drawer>
                </main>
                <Footer />
                <div className="fixed bottom-4 right-4">
                    <Button circle onClick={openDrawer}>
                        <CogIcon />
                    </Button>
                </div>
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
