import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useFetcher
} from 'react-router';
import { CogIcon, FileQuestionIcon } from 'lucide-react';

import { Button } from './components/Button';
import { Drawer } from './components/Drawer';
import { Footer } from './components/Footer';
import { getUserFromSession } from './lib/session.server';
import { getUserRole } from './models/user.server';
import { Header } from './components/Header';
import { PHProvider } from './components/PostHogProvider';
import { Toggle } from './components/Toggle';
import { useDrawer } from './hooks/useDrawer';
import { useRootData } from './hooks/useRootData';
import type { Route } from './+types/root';
import type { FeatureFlag, FeatureFlagsResponse } from './types/posthog';
// import { Alert } from './components/Alert';
// import { Badge } from './components/Badge';

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

    const featureFlagsResponse = await fetch(
        'http://localhost:5173/api/posthog/feature-flags',
        {
            method: 'GET'
        }
    );

    const featureFlagsJson: FeatureFlagsResponse =
        await featureFlagsResponse.json();

    const getActiveFlags = (data: FeatureFlagsResponse) => {
        if (!data.results) return {};

        return data.results.reduce(
            (acc: Record<string, boolean>, flag) => {
                acc[flag.key] = flag.active;
                return acc;
            },
            {} as Record<string, boolean>
        );
    };

    return {
        user,
        role: roleObj?.role,
        activeFlags: getActiveFlags(featureFlagsJson),
        featureFlags: featureFlagsJson.results
    };
}

export function Layout({ children }: { children: React.ReactNode }) {
    const data = useRootData();
    const [isOpen, { openDrawer, closeDrawer }] = useDrawer();
    const postHogFetcher = useFetcher();
    const hasAccessPermissions =
        data?.role === 'ADMIN' || data?.role === 'EDITOR';

    const DrawerContents = () => {
        const flags = data?.featureFlags ?? [];

        return (
            <div>
                <h2 className="mb-4 text-lg font-semibold">Feature Flags</h2>
                <ul className="flex flex-col gap-4">
                    {flags.map((flag: FeatureFlag) => {
                        const isTarget =
                            String(postHogFetcher.formData?.get('flagId')) ===
                            String(flag.id);

                        const idle = postHogFetcher.state === 'idle';

                        // const label =
                        //     isTarget && postHogFetcher.state === 'submitting'
                        //         ? 'Sending...'
                        //         : isTarget && postHogFetcher.state === 'loading'
                        //           ? 'Loading...'
                        //           : flag.key;

                        const label = flag.key;

                        const alertText =
                            isTarget && postHogFetcher.state === 'submitting'
                                ? 'Sending...'
                                : isTarget && postHogFetcher.state === 'loading'
                                  ? 'Loading...'
                                  : 'Standby';

                        const disabled =
                            isTarget && postHogFetcher.state !== 'idle';

                        const handleOnChange = () =>
                            postHogFetcher.submit(
                                {
                                    active: !flag.active,
                                    flagId: flag.id,
                                    intent: 'toggleFeatureFlag'
                                },
                                {
                                    method: 'PATCH',
                                    action: '/api/posthog/feature-flags'
                                }
                            );

                        return (
                            <li key={flag.id}>
                                <div className="flex flex-col items-start">
                                    {/* {isTarget && !idle && (
                                        <Badge color="warning">
                                            {alertText}
                                        </Badge>
                                    )} */}
                                    <Toggle
                                        checked={flag.active}
                                        onChange={handleOnChange}
                                        label={label}
                                        disabled={disabled}
                                        loading={isTarget && !idle}
                                    />
                                    {flag.name && (
                                        <p className="text-sm text-gray-500">
                                            {flag.name}
                                        </p>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };

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
                <PHProvider>
                    <Header />
                    <main className="flex-grow">{mainContent}</main>
                    <Footer />
                    {hasAccessPermissions && <DrawerTrigger />}
                    <ScrollRestoration />
                    <Scripts />
                </PHProvider>
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
