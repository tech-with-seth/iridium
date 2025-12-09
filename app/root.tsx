import { useCallback } from 'react';
import {
    data,
    isRouteErrorResponse,
    Link,
    Links,
    Meta,
    NavLink,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLocation,
    useNavigate,
} from 'react-router';
import { CogIcon, FileQuestionIcon } from 'lucide-react';

import { authClient } from './lib/auth-client';
import { Button } from './components/actions/Button';
import { Container } from './components/layout/Container';
import { Drawer } from './components/layout/Drawer';
import { FlagsList } from './components/utilities/FlagsList';
import { Footer } from './components/layout/Footer';
import { getFeatureFlags } from './models/feature-flags.server';
import { getFeatureFlagsForUser } from './models/posthog.server';
import { getUserFromSession } from './lib/session.server';
import { getUserRole } from './models/user.server';
import { Paths } from './constants';
import { PHProvider } from './components/providers/PostHogProvider';
import { TabContent, TabRadio, Tabs } from './components/navigation/Tabs';
import { themeCookie } from './lib/cookies.server';
import { ThemeSwitcher } from './components/utilities/ThemeSwitcher';
import { Turnstile } from './components/utilities/Turnstile';
import { useDrawer } from './hooks/useDrawer';
import { useRootData } from './hooks/useRootData';
import type { Route } from './+types/root';
import {
    Navbar,
    NavbarHamburger,
    NavbarMenu,
    NavbarMenuItem,
} from './components/navigation/Navbar';

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
    const userFlags = await getFeatureFlagsForUser(request);

    const cookieHeader = request.headers.get('Cookie');
    const cookie = (await themeCookie.parse(cookieHeader)) || {};

    return {
        allFlags: allFlags.results,
        productId: process.env.POLAR_PRODUCT_ID || null,
        role: roleObj?.role,
        theme: cookie.theme || process.env.DEFAULT_THEME || 'light',
        user,
        userFlags,
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

interface HeaderProps {
    handleOpenDrawer: () => void;
}

function Header({ handleOpenDrawer }: HeaderProps) {
    const data = useRootData();
    const location = useLocation();
    const navigate = useNavigate();

    const isSignedIn = Boolean(data?.user?.id);
    const isOnHomePage = location.pathname === '/';
    const hasAccessPermissions =
        data?.role === 'ADMIN' || data?.role === 'EDITOR';

    const handleSignOut = useCallback(async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate('/');
                },
            },
        });
    }, [navigate]);

    return (
        <header className="my-4">
            <Container className="px-4">
                <Navbar
                    sticky
                    start={
                        <div className="flex items-center gap-3 w-full">
                            <NavbarHamburger className="lg:hidden">
                                <NavbarMenuItem active={isOnHomePage}>
                                    <NavLink to="/">Home</NavLink>
                                </NavbarMenuItem>
                                {isSignedIn && (
                                    <NavbarMenuItem
                                        active={
                                            location.pathname ===
                                            Paths.DASHBOARD
                                        }
                                    >
                                        <NavLink to={Paths.DASHBOARD}>
                                            Dashboard
                                        </NavLink>
                                    </NavbarMenuItem>
                                )}
                                <NavbarMenuItem className="mt-1 border-t border-base-200 pt-2">
                                    <Button
                                        status="primary"
                                        className="w-full justify-center"
                                        onClick={
                                            !isSignedIn
                                                ? handleOpenDrawer
                                                : handleSignOut
                                        }
                                    >
                                        {`Sign ${isSignedIn ? 'out' : 'in'}`}
                                    </Button>
                                </NavbarMenuItem>
                            </NavbarHamburger>
                            <Link
                                to="/"
                                className="px-3 text-lg font-black tracking-tight"
                            >
                                {`<TWS />`}
                            </Link>
                            <NavbarMenu className="hidden lg:flex items-center gap-1">
                                <NavbarMenuItem active={isOnHomePage}>
                                    <NavLink to="/">Home</NavLink>
                                </NavbarMenuItem>
                            </NavbarMenu>
                        </div>
                    }
                    end={
                        <NavbarMenu className="items-center gap-2">
                            {isSignedIn && (
                                <>
                                    <NavbarMenuItem>
                                        <NavLink to={Paths.PORTAL}>
                                            Portal
                                        </NavLink>
                                    </NavbarMenuItem>
                                    {hasAccessPermissions && (
                                        <>
                                            <NavbarMenuItem
                                                active={
                                                    location.pathname ===
                                                    Paths.DASHBOARD
                                                }
                                            >
                                                <NavLink to={Paths.DASHBOARD}>
                                                    Dashboard
                                                </NavLink>
                                            </NavbarMenuItem>
                                        </>
                                    )}
                                </>
                            )}
                            <NavbarMenuItem>
                                <Button
                                    status="primary"
                                    onClick={
                                        !isSignedIn
                                            ? handleOpenDrawer
                                            : handleSignOut
                                    }
                                >
                                    {`Sign ${isSignedIn ? 'out' : 'in'}`}
                                </Button>
                            </NavbarMenuItem>
                        </NavbarMenu>
                    }
                />
            </Container>
        </header>
    );
}

export function Layout({ children }: { children: React.ReactNode }) {
    const data = useRootData();
    const navigate = useNavigate();

    const [isAdminDrawerOpen, adminDrawerActions] = useDrawer();
    const [isTurnstileDrawerOpen, turnstileDrawerActions] = useDrawer();
    const hasAccessPermissions =
        data?.role === 'ADMIN' || data?.role === 'EDITOR';

    return (
        <html
            lang="en"
            className="min-h-screen bg-base-300"
            data-theme={data?.theme || process.env.DEFAULT_THEME || 'light'}
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
                    <section className="bg-linear-to-br from-primary/50 to-secondary/50 h-98">
                        <Header
                            handleOpenDrawer={turnstileDrawerActions.openDrawer}
                        />
                    </section>
                    <main className="flex grow flex-col -mt-72">
                        {children}
                        <Drawer
                            id="turnstileDrawer"
                            isOpen={isTurnstileDrawerOpen}
                            handleClose={turnstileDrawerActions.closeDrawer}
                            contents={
                                <Turnstile
                                    onSuccessfulLogin={() => {
                                        turnstileDrawerActions.closeDrawer();
                                        navigate('/');
                                    }}
                                />
                            }
                        />
                        {hasAccessPermissions && (
                            <Drawer
                                id="appDrawer"
                                isOpen={
                                    hasAccessPermissions && isAdminDrawerOpen
                                }
                                handleClose={adminDrawerActions.closeDrawer}
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
                                                        data?.theme ||
                                                        process.env
                                                            .DEFAULT_THEME ||
                                                        'light'
                                                    }
                                                />
                                            </TabContent>
                                        </Tabs>
                                    </>
                                }
                                size="lg"
                            />
                        )}
                    </main>
                    <Footer />
                    {hasAccessPermissions && (
                        <div className="fixed bottom-4 right-4">
                            <Button
                                circle
                                onClick={adminDrawerActions.openDrawer}
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
