import prisma from '~/lib/prisma';

export function getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
}

export function updateUserBio(id: string, bio: string) {
    return prisma.user.update({ where: { id }, data: { bio } });
}
