import { prisma } from '~/db.server';
import type { User } from '~/generated/prisma/client';

export function getUserProfile(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            bio: true,
            website: true,
            location: true,
            phoneNumber: true,
            image: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true
        }
    });
}

export function updateUser({
    userId,
    data
}: {
    userId: string;
    data: Partial<User>;
}) {
    return prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name,
            bio: data.bio || null,
            website: data.website || null,
            location: data.location || null,
            phoneNumber: data.phoneNumber || null
        }
    });
}

export function deleteUser(userId: string) {
    return prisma.user.delete({
        where: { id: userId }
    });
}
