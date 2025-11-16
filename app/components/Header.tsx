import { Link, NavLink, useLocation } from 'react-router';

import { Container } from './Container';
import { Navbar, NavbarMenu, NavbarMenuItem } from './Navbar';
import { Paths } from '~/constants';
import { UserCircleIcon } from 'lucide-react';
import { useRootData } from '~/hooks/useRootData';

export function Header() {
    const data = useRootData();
    const isSignedIn = Boolean(data?.user?.id);

    const location = useLocation();

    return (
        <header className="my-4">
            <Container className="px-4">
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
                            <NavbarMenuItem active={location.pathname === '/'}>
                                <NavLink to="/">Home</NavLink>
                            </NavbarMenuItem>
                            {isSignedIn && (
                                <>
                                    <NavbarMenuItem
                                        active={
                                            location.pathname === '/dashboard'
                                        }
                                    >
                                        <NavLink to="/dashboard">
                                            Dashboard
                                        </NavLink>
                                    </NavbarMenuItem>
                                    <NavbarMenuItem
                                        active={location.pathname === '/design'}
                                    >
                                        <NavLink to="/design">Design</NavLink>
                                    </NavbarMenuItem>
                                    <NavbarMenuItem
                                        active={location.pathname === '/chat'}
                                    >
                                        <NavLink to="/chat">Chat</NavLink>
                                    </NavbarMenuItem>
                                </>
                            )}
                            <NavbarMenuItem
                                active={location.pathname === '/shop'}
                            >
                                <NavLink to="/shop">Shop</NavLink>
                            </NavbarMenuItem>
                        </NavbarMenu>
                    }
                    end={
                        <NavbarMenu>
                            {isSignedIn ? (
                                <>
                                    <NavbarMenuItem
                                        active={
                                            location.pathname === '/profile'
                                        }
                                    >
                                        <NavLink to="/profile">
                                            <UserCircleIcon className="inline-block mr-2 h-4 w-4" />
                                            {data?.user?.name}
                                        </NavLink>
                                    </NavbarMenuItem>
                                    <NavbarMenuItem
                                        active={location.pathname === '/portal'}
                                    >
                                        <Link to="/portal">Portal</Link>
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
                                        <NavLink
                                            className={navLinkClassName}
                                            to={Paths.SIGN_IN}
                                        >
                                            Sign In
                                        </NavLink>
                                    </NavbarMenuItem>
                                </>
                            )}
                        </NavbarMenu>
                    }
                />
            </Container>
        </header>
    );
}
