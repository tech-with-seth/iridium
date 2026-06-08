import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { Container } from '~/components/Container';
import { SiteFooter } from '~/components/SiteFooter';
import { SiteHeader } from '~/components/SiteHeader';

const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/chat', label: 'Chat' },
];

const DRAWER_ID = 'app-drawer';

export default function AppLayout() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Close the mobile drawer after picking a destination.
    const closeDrawer = () => setIsDrawerOpen(false);

    return (
        <div className="drawer h-dvh">
            <input
                id={DRAWER_ID}
                type="checkbox"
                className="drawer-toggle"
                checked={isDrawerOpen}
                onChange={(event) => setIsDrawerOpen(event.target.checked)}
            />
            <div className="drawer-content grid min-h-0 grid-rows-[auto_1fr_auto]">
                <SiteHeader onMenuClick={() => setIsDrawerOpen(true)} />
                <main className="flex min-h-0 flex-col overflow-y-auto">
                    <Container className="hidden px-4 py-2 lg:block">
                        <ul className="menu menu-horizontal rounded-box gap-2 p-0">
                            {navItems.map((item) => (
                                <li key={item.to}>
                                    <NavLink
                                        to={item.to}
                                        className={({ isActive }) =>
                                            isActive ? 'menu-active' : ''
                                        }
                                    >
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </Container>
                    <Outlet />
                </main>
                <SiteFooter />
            </div>
            <div className="drawer-side z-20">
                <label
                    htmlFor={DRAWER_ID}
                    aria-label="Close navigation menu"
                    className="drawer-overlay"
                />
                <ul className="menu bg-base-200 text-base-content min-h-full w-72 gap-1 p-4">
                    <li className="menu-title">Navigation</li>
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                onClick={closeDrawer}
                                className={({ isActive }) =>
                                    isActive ? 'menu-active' : ''
                                }
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
