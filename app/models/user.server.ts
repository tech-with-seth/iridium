import prisma from '~/lib/prisma';
import type { Role } from '~/generated/prisma/client';

export function getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
}

export type UserFilters = {
    query?: string;
    role?: Role;
    banned?: boolean;
};

function userSearchWhere({ query, role, banned }: UserFilters = {}) {
    return {
        ...(query
            ? {
                  OR: [
                      {
                          name: {
                              contains: query,
                              mode: 'insensitive' as const,
                          },
                      },
                      {
                          email: {
                              contains: query,
                              mode: 'insensitive' as const,
                          },
                      },
                  ],
              }
            : {}),
        ...(role ? { role } : {}),
        // Better Auth leaves `banned` null for users it never touched, so
        // "active" means anything that is not explicitly banned.
        ...(banned === undefined
            ? {}
            : banned
              ? { banned: true }
              : { banned: { not: true } }),
    };
}

/** Admin: list users (safe fields only) with optional search and filters. */
export function listUsers({
    skip,
    take,
    ...filters
}: UserFilters & {
    skip?: number;
    take?: number;
} = {}) {
    return prisma.user.findMany({
        where: userSearchWhere(filters),
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

export function countUsers(filters: UserFilters = {}) {
    return prisma.user.count({ where: userSearchWhere(filters) });
}

export function updateUserRole(id: string, role: Role) {
    // Note: the role is cached in the Better Auth session cookie for up to
    // cookieCache.maxAge (5 min); the change applies to new sessions at once.
    return prisma.user.update({ where: { id }, data: { role } });
}

/** Test hook only (api-test-role): same caching caveat as updateUserRole. */
export function updateUserRoleByEmail(email: string, role: Role) {
    return prisma.user.update({ where: { email }, data: { role } });
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
