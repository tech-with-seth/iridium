/**
 * Template: Layout Route with Outlet
 *
 * Replace placeholders:
 * - my-layout → Your route file name (kebab-case)
 * - MyLayout → Your component name (PascalCase)
 *
 * After creating:
 * 1. Add to app/routes.ts with child routes
 * 2. Run npm run typecheck
 */

import type { Route } from './+types/my-layout';
import { Outlet, NavLink } from 'react-router';
import { Container } from '~/components/layout/Container';
import { requireUser } from '~/lib/session.server';
import { cx } from '~/cva.config';

/**
 * Optional loader for layout-level data
 */
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    return {
        user,
    };
}

/**
 * Layout component - renders child routes via Outlet
 *
 * IMPORTANT: Use <Outlet /> to render child routes
 * NEVER use a children prop - it doesn't exist
 */
export default function MyLayout({ loaderData }: Route.ComponentProps) {
    const { user } = loaderData;

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        cx(
            'px-4 py-2 rounded-lg transition-colors',
            isActive
                ? 'bg-primary text-primary-content'
                : 'hover:bg-base-200'
        );

    return (
        <>
            <title>Section Title | Iridium</title>

            <Container>
                <div className="flex gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="w-64 shrink-0">
                        <nav className="space-y-2">
                            <NavLink to="." end className={navLinkClass}>
                                Overview
                            </NavLink>
                            <NavLink to="settings" className={navLinkClass}>
                                Settings
                            </NavLink>
                            <NavLink to="members" className={navLinkClass}>
                                Members
                            </NavLink>
                        </nav>
                    </aside>

                    {/* Main Content - Child routes render here */}
                    <main className="flex-1">
                        <Outlet />
                    </main>
                </div>
            </Container>
        </>
    );
}
