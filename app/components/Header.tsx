import { Link } from 'react-router';

import { Container } from './Container';
import { Navbar, NavbarMenu, NavbarMenuItem } from './Navbar';
import { Paths } from '~/constants';
import { UserCircleIcon } from 'lucide-react';
import { useRootData } from '~/hooks/useRootData';

export function Header() {
    const data = useRootData();

    return (
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
                            {data?.user?.id && (
                                <>
                                    <NavbarMenuItem>
                                        <Link to="/dashboard">Dashboard</Link>
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
                                            <UserCircleIcon className="inline-block mr-2" />
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
                                        <Link to={Paths.SIGN_IN}>Sign In</Link>
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
