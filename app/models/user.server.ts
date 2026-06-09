import prisma from '~/lib/prisma';

export function getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
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
