import { NavLink, Outlet } from 'react-router';
import { Container } from '~/components/Container';
import { SiteFooter } from '~/components/SiteFooter';
import { SiteHeader } from '~/components/SiteHeader';

export default function AppLayout() {
    return (
        <div className="grid h-dvh grid-rows-[auto_1fr_auto]">
            <SiteHeader />
            <main className="flex min-h-0 flex-col overflow-y-auto">
                <Container className="mb-8 px-4">
                    <ul className="menu menu-vertical lg:menu-horizontal rounded-box">
                        <li>
                            <NavLink to="/dashboard">Dashboard</NavLink>
                        </li>
                        <li>
                            <NavLink to="/chat">Chat</NavLink>
                        </li>
                    </ul>
                </Container>
                <Outlet />
            </main>
            <SiteFooter />
        </div>
    );
}
