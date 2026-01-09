/**
 * Example: Protected Route with Role-Based Access
 */

import type { Route } from './+types/admin';
import { requireAdmin } from '~/lib/session.server';
import { Container } from '~/components/layout/Container';
import { useUserRole } from '~/hooks/useUserRole';

/**
 * Loader: Requires admin role
 * Redirects to sign-in if not authenticated
 * Returns 403 if authenticated but not admin
 */
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireAdmin(request);

    // User is guaranteed to be an admin here
    const stats = await getAdminStats();

    return { user, stats };
}

export default function AdminPage({ loaderData }: Route.ComponentProps) {
    const { user, stats } = loaderData;
    const { isAdmin } = useUserRole();

    return (
        <>
            <title>Admin Panel | Iridium</title>

            <Container>
                <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
                <p>Welcome, {user.name} (Admin)</p>

                {/* Client-side role check for UI only */}
                {isAdmin && (
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="stat bg-base-200 rounded-box">
                            <div className="stat-title">Total Users</div>
                            <div className="stat-value">{stats.totalUsers}</div>
                        </div>
                        {/* More admin stats */}
                    </div>
                )}
            </Container>
        </>
    );
}
