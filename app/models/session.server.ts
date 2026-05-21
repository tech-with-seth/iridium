import { redirect } from 'react-router';
import { auth } from '~/lib/auth.server';
import { log } from '~/lib/logger.server';
import { Role } from '~/generated/prisma/client';

type UserWithRole = {
    id: string;
    role: Role;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export async function getUserFromSession(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        return session?.user ?? null;
    } catch (error) {
        log.exception('session_lookup_failed', error);

        return null;
    }
}

export async function requireUser(request: Request) {
    const user = await getUserFromSession(request);

    if (!user) {
        throw new Response('Unauthorized', { status: 401 });
    }

    return user;
}

/**
 * Redirect already-signed-in users away from anonymous-only pages (login,
 * signup, reset-password). Throws a redirect on hit so callers can use this
 * inline as the first line of a loader.
 */
export async function requireAnonymous(
    request: Request,
    redirectTo = '/profile',
) {
    const user = await getUserFromSession(request);
    if (user) throw redirect(redirectTo);
}

export function hasRole(user: { role: Role }, role: Role): boolean {
    const roleHierarchy = {
        [Role.USER]: 1,
        [Role.EDITOR]: 2,
        [Role.ADMIN]: 3,
    };

    return roleHierarchy[user.role] >= roleHierarchy[role];
}

export async function requireRole(
    request: Request,
    allowedRoles: Role[],
): Promise<UserWithRole> {
    const user = await requireUser(request);

    // Better Auth's types omit `role` from the user object even though the
    // admin plugin populates it. Schema allows null; default to USER so
    // role-gated routes have a non-null guarantee.
    const role = ((user as { role?: Role | null }).role ?? Role.USER) as Role;
    const userWithRole = { ...(user as object), role } as UserWithRole;

    if (!allowedRoles.includes(userWithRole.role)) {
        throw new Response('Forbidden', { status: 403 });
    }

    return userWithRole;
}

export async function requireEditor(request: Request) {
    return requireRole(request, [Role.EDITOR, Role.ADMIN]);
}

export async function requireAdmin(request: Request) {
    return requireRole(request, [Role.ADMIN]);
}
