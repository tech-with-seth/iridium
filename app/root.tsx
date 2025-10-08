import {
    isRouteErrorResponse,
    Link,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration
} from 'react-router';
import { CogIcon, FileQuestionIcon } from 'lucide-react';

import { Button } from './components/Button';
import { Drawer } from './components/Drawer';
import { Footer } from './components/Footer';
import { getUserFromSession } from './lib/session.server';
import { getUserRole } from './models/user.server';
import { Header } from './components/Header';
import { useDrawer } from './hooks/useDrawer';
import { useRootData } from './hooks/useRootData';
import type { Route } from './+types/root';

import './app.css';

export const links: Route.LinksFunction = () => [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous'
    },
    {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:ital,wght@0,100..900;1,100..900&display=swap'
    }
];

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    const roleObj = user ? await getUserRole(user?.id) : null;

    return { user, role: roleObj?.role };
}

export function Layout({ children }: { children: React.ReactNode }) {
    const data = useRootData();
    const [isOpen, { openDrawer, closeDrawer }] = useDrawer();

    const hasAccessPermissions =
        data?.role === 'ADMIN' || data?.role === 'EDITOR';

    const DrawerContents = () => (
        <ul>
            <li>
                <Link to="/link1">Link 1</Link>
            </li>
            <li>
                <Link to="/link2">Link 2</Link>
            </li>
            <li>
                <Link to="/link3">Link 3</Link>
            </li>
        </ul>
    );

    const DrawerWrapper = ({ children }: { children: React.ReactNode }) => (
        <Drawer
            id="appDrawer"
            isOpen={hasAccessPermissions && isOpen}
            handleClose={closeDrawer}
            contents={<DrawerContents />}
        >
            {children}
        </Drawer>
    );

    const DrawerTrigger = () => (
        <div className="fixed bottom-4 right-4">
            <Button circle onClick={openDrawer} status="secondary">
                <CogIcon />
            </Button>
        </div>
    );

    const mainContent = hasAccessPermissions ? (
        <DrawerWrapper>{children}</DrawerWrapper>
    ) : (
        children
    );

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
                <Header />
                <main className="flex-grow">{mainContent}</main>
                <Footer />
                {hasAccessPermissions && <DrawerTrigger />}
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
            <div className="mb-8">
                <FileQuestionIcon className="h-12 w-12 text-zinc-400" />
            </div>
            <h1 className="text-6xl font-bold">{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
