import { useCallback } from 'react';
import {
    Link,
    NavLink,
    useLocation,
    useNavigate,
    type NavLinkRenderProps,
} from 'react-router';
import { useRootData } from '~/hooks/useRootData';
import { authClient } from '~/lib/auth-client';
import { Container } from './Container';
import { cx } from '~/cva.config';
import {
    Navbar,
    NavbarHamburger,
    NavbarMenu,
    NavbarMenuItem,
} from '../navigation/Navbar';
import { Paths } from '~/constants';
import { Button } from '../actions/Button';

interface HeaderProps {
    handleOpenDrawer: () => void;
    className?: string;
}

export function Header({ handleOpenDrawer, className }: HeaderProps) {
    const data = useRootData();
    const location = useLocation();
    const navigate = useNavigate();

    const isSignedIn = Boolean(data?.user?.id);
    const isOnHomePage = location.pathname === '/';
    const isOnDashboardPage = location.pathname.includes('dashboard');
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

    const navLinkClassName = ({ isActive }: NavLinkRenderProps) =>
        isActive
            ? 'bg-secondary text-secondary-content px-4 py-2.5 rounded-field'
            : '';

    return (
        <header className={cx('my-4', className)}>
            <Container className="px-4">
                <Navbar
                    variant="neutral"
                    start={
                        <div className="flex items-center gap-3 w-full">
                            <NavbarHamburger className="lg:hidden">
                                <NavbarMenuItem>
                                    <NavLink to="/">Home</NavLink>
                                </NavbarMenuItem>
                                {isSignedIn && (
                                    <NavbarMenuItem>
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
                                <NavbarMenuItem>
                                    <NavLink
                                        to="/"
                                        className={navLinkClassName}
                                    >
                                        Home
                                    </NavLink>
                                </NavbarMenuItem>
                            </NavbarMenu>
                        </div>
                    }
                    end={
                        <NavbarMenu className="items-center gap-2">
                            {isSignedIn && (
                                <>
                                    {hasAccessPermissions && (
                                        <>
                                            <NavbarMenuItem>
                                                <NavLink
                                                    to={Paths.DASHBOARD}
                                                    className={navLinkClassName}
                                                >
                                                    Dashboard
                                                </NavLink>
                                            </NavbarMenuItem>
                                            <NavbarMenuItem>
                                                <NavLink
                                                    to="/files"
                                                    className={navLinkClassName}
                                                >
                                                    Files
                                                </NavLink>
                                            </NavbarMenuItem>
                                            <NavbarMenuItem>
                                                <NavLink
                                                    to="/design"
                                                    className={navLinkClassName}
                                                >
                                                    Design
                                                </NavLink>
                                            </NavbarMenuItem>
                                            <NavbarMenuItem>
                                                <NavLink
                                                    to="/forms"
                                                    className={navLinkClassName}
                                                >
                                                    Forms
                                                </NavLink>
                                            </NavbarMenuItem>
                                        </>
                                    )}
                                </>
                            )}
                            <NavbarMenuItem>
                                <NavLink to={Paths.PORTAL}>Portal</NavLink>
                            </NavbarMenuItem>
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
