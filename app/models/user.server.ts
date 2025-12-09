import { prisma } from '~/db.server';
import type { User } from '~/generated/prisma/client';
import { Role } from '~/generated/prisma/client';

export function getUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
            id: true,
            email: true,
            name: true,
            image: true,
        },
    });
}

export function getUserRole(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            role: true,
        },
    });
}

export function getUserProfile(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            image: true,
            emailVerified: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export function updateUser({
    userId,
    data,
}: {
    userId: string;
    data: Partial<User>;
}) {
    return prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name,
        },
    });
}

export function deleteUser(userId: string) {
    return prisma.user.delete({
        where: { id: userId },
    });
}

export function getUsersByRole(role: Role) {
    return prisma.user.findMany({
        where: { role },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}

export function updateUserRole(userId: string, newRole: Role) {
    return prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        },
    });
}

export async function countUsersByRole() {
    const [userCount, editorCount, adminCount] = await Promise.all([
        prisma.user.count({ where: { role: Role.USER } }),
        prisma.user.count({ where: { role: Role.EDITOR } }),
        prisma.user.count({ where: { role: Role.ADMIN } }),
    ]);

    return {
        [Role.USER]: userCount,
        [Role.EDITOR]: editorCount,
        [Role.ADMIN]: adminCount,
        total: userCount + editorCount + adminCount,
    };
}
