import { useState } from 'react';
import {
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
import { getAllFeatureFlags } from './lib/posthog.server';
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
import { Select } from './components/Select';

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
        href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:ital,wght@0,100..900;1,100..900&display=swap',
    },
];

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    const roleObj = user ? await getUserRole(user?.id) : null;

    const allFlags = await getFeatureFlags();
    const flagsMap = await getAllFeatureFlags(request);

    return {
        allFlags: allFlags.results,
        flagsMap,
        role: roleObj?.role,
        user,
    };
}

export function Layout({ children }: { children: React.ReactNode }) {
    const data = useRootData();
    const [isOpen, { openDrawer, closeDrawer }] = useDrawer();
    const postHogFetcher = useFetcher();
    const hasAccessPermissions =
        data?.role === 'ADMIN' || data?.role === 'EDITOR';

    const [selectedTheme, setSelectedTheme] = useState<
        'light' | 'dark' | 'emerald'
    >('light');

    const DrawerContents = () => {
        const flags = data?.allFlags ?? [];

        return (
            <div>
                <h2 className="mb-4 text-lg font-semibold">Feature Flags</h2>
                <ul className="flex flex-col gap-4">
                    {flags.map((flag: FeatureFlag) => {
                        const isTarget =
                            String(postHogFetcher.formData?.get('flagId')) ===
                            String(flag.id);

                        const idle = postHogFetcher.state === 'idle';
                        const label = flag.key;

                        const disabled =
                            isTarget && postHogFetcher.state !== 'idle';

                        // Optimistic UI: Show pending state during submission, then use response data
                        let displayActive = flag.active;
                        if (isTarget) {
                            if (!idle) {
                                // During submission - show optimistic state
                                displayActive =
                                    postHogFetcher.formData?.get('active') ===
                                    'true';
                            } else if (
                                postHogFetcher.data?.success &&
                                postHogFetcher.data?.data
                            ) {
                                // After successful submission - use response data
                                displayActive = postHogFetcher.data.data.active;
                            }
                        }

                        const handleOnChange = () =>
                            postHogFetcher.submit(
                                {
                                    active: !flag.active,
                                    flagId: flag.id,
                                    intent: 'toggleFeatureFlag',
                                },
                                {
                                    method: 'PATCH',
                                    action: '/api/posthog/feature-flags',
                                },
                            );

                        return (
                            <li key={flag.id}>
                                <div className="flex flex-col items-start">
                                    <Toggle
                                        checked={displayActive}
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
                    <Select
                        options={[
                            { label: 'Light', value: 'light' },
                            { label: 'Dark', value: 'dark' },
                            { label: 'Abyss', value: 'abyss' },
                            { label: 'Acid', value: 'acid' },
                            { label: 'Aqua', value: 'aqua' },
                            { label: 'Autumn', value: 'autumn' },
                            { label: 'Black', value: 'black' },
                            { label: 'Bumblebee', value: 'bumblebee' },
                            { label: 'Business', value: 'business' },
                            { label: 'Caramellatte', value: 'caramellatte' },
                            { label: 'CMYK', value: 'cmyk' },
                            { label: 'Coffee', value: 'coffee' },
                            { label: 'Corporate', value: 'corporate' },
                            { label: 'Cupcake', value: 'cupcake' },
                            { label: 'Cyberpunk', value: 'cyberpunk' },
                            { label: 'Dark', value: 'dark' },
                            { label: 'Dim', value: 'dim' },
                            { label: 'Dracula', value: 'dracula' },
                            { label: 'Emerald', value: 'emerald' },
                            { label: 'Emerald', value: 'emerald' },
                            { label: 'Fantasy', value: 'fantasy' },
                            { label: 'Forest', value: 'forest' },
                            { label: 'Garden', value: 'garden' },
                            { label: 'Halloween', value: 'halloween' },
                            { label: 'Lemonade', value: 'lemonade' },
                            { label: 'Lofi', value: 'lofi' },
                            { label: 'Luxury', value: 'luxury' },
                            { label: 'Night', value: 'night' },
                            { label: 'Nord', value: 'nord' },
                            { label: 'Pastel', value: 'pastel' },
                            { label: 'Retro', value: 'retro' },
                            { label: 'Silk', value: 'silk' },
                            { label: 'Sunset', value: 'sunset' },
                            { label: 'Synthwave', value: 'synthwave' },
                            { label: 'Valentine', value: 'valentine' },
                            { label: 'Winter', value: 'winter' },
                            { label: 'Wireframe', value: 'wireframe' },
                        ]}
                        onChange={(event) =>
                            setSelectedTheme(event.target.value as any)
                        }
                    />
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
        <html lang="en" className="min-h-screen" data-theme={selectedTheme}>
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
                    <main className="grow">{mainContent}</main>
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
