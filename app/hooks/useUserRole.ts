import { useRouteLoaderData } from 'react-router';
import { Role } from '~/generated/prisma/client';
import type { User } from '~/generated/prisma/client';

/**
 * Client-side hook to get the current user's role.
 *
 * IMPORTANT: This is for UI rendering only, NOT for security.
 * Always use server-side role checks (requireRole, requireEditor, requireAdmin)
 * in loaders and actions for actual authorization.
 *
 * @returns The current user's role, or null if not authenticated
 */
export function useUserRole(): Role | null {
    const data = useRouteLoaderData<{ user: User | null }>('root');

    return data?.user?.role ?? null;
}

/**
 * Client-side hook to check if the current user has a specific role or higher.
 * Uses role hierarchy: USER < EDITOR < ADMIN
 *
 * IMPORTANT: This is for UI rendering only, NOT for security.
 * Always use server-side role checks (requireRole, requireEditor, requireAdmin)
 * in loaders and actions for actual authorization.
 *
 * @param role - The minimum role to check for
 * @returns True if user has the role or higher, false otherwise
 */
export function useHasRole(role: Role): boolean {
    const userRole = useUserRole();

    if (!userRole) {
        return false;
    }

    const roleHierarchy = {
        [Role.USER]: 1,
        [Role.EDITOR]: 2,
        [Role.ADMIN]: 3,
    };

    return roleHierarchy[userRole] >= roleHierarchy[role];
}
