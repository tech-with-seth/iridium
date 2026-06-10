import prisma from '~/lib/prisma';
import type { Role } from '~/generated/prisma/client';

export function getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
}

function userSearchWhere(query?: string) {
    return query
        ? {
              OR: [
                  { name: { contains: query, mode: 'insensitive' as const } },
                  { email: { contains: query, mode: 'insensitive' as const } },
              ],
          }
        : {};
}

/** Admin: list users (safe fields only) with optional name/email search. */
export function listUsers({
    query,
    skip,
    take,
}: {
    query?: string;
    skip?: number;
    take?: number;
} = {}) {
    return prisma.user.findMany({
        where: userSearchWhere(query),
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            banned: true,
            banReason: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
    });
}

export function countUsers(query?: string) {
    return prisma.user.count({ where: userSearchWhere(query) });
}

export function updateUserRole(id: string, role: Role) {
    // Note: the role is cached in the Better Auth session cookie for up to
    // cookieCache.maxAge (5 min); the change applies to new sessions at once.
    return prisma.user.update({ where: { id }, data: { role } });
}

export function updateUserBio(id: string, bio: string) {
    return prisma.user.update({ where: { id }, data: { bio } });
}

export function updateUserProfile(
    id: string,
    { name, bio }: { name: string; bio: string | null },
) {
    // Note: name is also cached in the Better Auth session cookie for up to
    // cookieCache.maxAge (5 min); reads via getUserById stay fresh.
    return prisma.user.update({ where: { id }, data: { name, bio } });
}
