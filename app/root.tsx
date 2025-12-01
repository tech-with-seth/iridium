import { useCallback, useMemo } from 'react';
import {
    data,
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useFetcher,
} from 'react-router';
import { CogIcon, FileQuestionIcon } from 'lucide-react';

import { Button } from './components/Button';
import { Drawer } from './components/Drawer';
import { Footer } from './components/Footer';
import { getFeatureFlagsForUser } from './models/posthog.server';
import { getFeatureFlags } from './models/feature-flags.server';
import { getUserFromSession } from './lib/session.server';
import { getUserRole } from './models/user.server';
import { Header } from './components/Header';
import { PHProvider } from './components/PostHogProvider';
import { Toggle } from './components/Toggle';
import { useDrawer } from './hooks/useDrawer';
import { useRootData } from './hooks/useRootData';
import type { FeatureFlag } from './types/posthog';
import type { Route } from './+types/root';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { themeCookie } from './lib/cookies.server';
import { Alert } from './components/Alert';

import './app.css';
import { Container } from './components/Container';
import { TabContent, TabRadio, Tabs } from './components/Tabs';

export const links: Route.LinksFunction = () => [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
    },
    {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:ital,wght@0,100..900;1,100..900&display=swap',
    },
];

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    const roleObj = user ? await getUserRole(user?.id) : null;

    const allFlags = await getFeatureFlags();
    const userFlags = await getFeatureFlagsForUser(request);

    const cookieHeader = request.headers.get('Cookie');
    const cookie = (await themeCookie.parse(cookieHeader)) || {};

    return {
        allFlags: allFlags.results,
        userFlags,
        role: roleObj?.role,
        user,
        theme: cookie.theme || 'light',
    };
}

export async function action({ request }: Route.ActionArgs) {
    const cookieHeader = request.headers.get('Cookie');
    const cookie = (await themeCookie.parse(cookieHeader)) || {};

    return data(null, {
        headers: {
            'Set-Cookie': await themeCookie.serialize({
                ...cookie,
                theme: (await request.formData()).get('theme') as string,
            }),
        },
    });
}

function FlagsList({ flags }: { flags: FeatureFlag[] }) {
    const flagFetcher = useFetcher();

    return (
        <>
            {flags.map((flag: FeatureFlag) => {
                const isTarget =
                    String(flagFetcher.formData?.get('flagId')) ===
                    String(flag.id);

                const isLoading = flagFetcher.state !== 'idle';

                const handleOnChange = useCallback(
                    () =>
                        flagFetcher.submit(
                            {
                                active: !flag.active,
                                flagId: flag.id,
                                intent: 'toggleFeatureFlag',
                            },
                            {
                                method: 'PATCH',
                                action: '/api/posthog/feature-flags',
                            },
                        ),
                    [flag.active],
                );

                return (
                    <div
                        className="flex flex-col items-start py-4 rounded-box"
                        key={flag.id}
                    >
                        {flag.name && (
                            <p className="text-sm text-base-content mb-2">
                                {flag.name}
                            </p>
                        )}
                        <Toggle
                            checked={flag.active}
                            disabled={isTarget && flagFetcher.state !== 'idle'}
                            label={flag.key}
                            loading={isTarget && isLoading}
                            onChange={handleOnChange}
                        />
                    </div>
                );
            })}
        </>
    );
}

export function Layout({ children }: { children: React.ReactNode }) {
    const data = useRootData();
    const [isOpen, { openDrawer, closeDrawer }] = useDrawer();
    const hasAccessPermissions =
        data?.role === 'ADMIN' || data?.role === 'EDITOR';

    const alertExperimentActive = useMemo(() => {
        return data?.allFlags.find((flag) => flag.key === 'alert-experiment')
            ?.active;
    }, [data?.allFlags]);

    return (
        <html
            lang="en"
            className="min-h-screen"
            data-theme={data?.theme || 'light'}
        >
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
                    {alertExperimentActive && (
                        <div>
                            <Container className="px-4">
                                <Alert status="warning" className="mb-4">
                                    <p>You are in the experiment</p>
                                </Alert>
                            </Container>
                        </div>
                    )}
                    <main className="flex grow flex-col min-h-0">
                        {hasAccessPermissions ? (
                            <Drawer
                                id="appDrawer"
                                isOpen={hasAccessPermissions && isOpen}
                                handleClose={closeDrawer}
                                contents={
                                    <>
                                        <h2 className="text-lg font-semibold">
                                            Admin Panel
                                        </h2>
                                        <p className="mb-8">
                                            Toggle feature flags and customize
                                            application settings.
                                        </p>
                                        <Tabs variant="lift">
                                            <TabRadio
                                                name="my_tabs"
                                                label="Feature flags"
                                                defaultChecked
                                            />
                                            <TabContent className="bg-base-100 border-base-300 p-6">
                                                <FlagsList
                                                    flags={data.allFlags}
                                                />
                                            </TabContent>

                                            <TabRadio
                                                name="my_tabs"
                                                label="Theme"
                                            />
                                            <TabContent className="bg-base-100 border-base-300 p-6">
                                                <p className="mb-4">
                                                    Select the theme to
                                                    temporarily apply to the
                                                    application interface.
                                                </p>
                                                <ThemeSwitcher
                                                    selectedTheme={
                                                        data?.theme || 'light'
                                                    }
                                                />
                                            </TabContent>
                                        </Tabs>
                                    </>
                                }
                                size="lg"
                            >
                                {children}
                            </Drawer>
                        ) : (
                            children
                        )}
                    </main>
                    <Footer />
                    {hasAccessPermissions && (
                        <div className="fixed bottom-4 right-12 md:bottom-4 md:right-4">
                            <Button
                                circle
                                onClick={() => {
                                    openDrawer();
                                }}
                                status="primary"
                            >
                                <CogIcon />
                            </Button>
                        </div>
                    )}
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
