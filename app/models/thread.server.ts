import { type UIMessage } from 'ai';

import prisma from '~/lib/prisma';

export function createThread(createdById: string) {
    return prisma.thread.create({
        data: {
            createdById,
            title: 'Untitled',
        },
    });
}

export function getAllThreadsByUserId(
    userId: string,
    { take }: { take?: number } = {},
) {
    return prisma.thread.findMany({
        where: { createdById: userId, deletedAt: null },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
                take: 1,
            },
        },
        orderBy: { createdAt: 'desc' },
        take,
    });
}

export function countThreadsByUserId(userId: string) {
    return prisma.thread.count({
        where: { createdById: userId, deletedAt: null },
    });
}

export function getThreadById(threadId: string) {
    // findFirst, not findUnique: soft-deleted threads must behave as missing.
    return prisma.thread.findFirst({
        where: { id: threadId, deletedAt: null },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
            },
        },
    });
}

export async function saveChat({
    messages,
    threadId,
    userId,
}: {
    messages: UIMessage[];
    threadId: string;
    userId: string;
}) {
    const thread = await getThreadById(threadId);

    if (!thread) throw new Error('Thread not found');

    if (thread.createdById !== userId) {
        throw new Error('Forbidden: thread does not belong to user');
    }

    const existingIds = new Set(thread.messages.map((m) => m.id));

    // Always save the last 2 (latest exchange) plus any unsaved earlier messages.
    const messagesToSave = messages.filter(
        (msg, i) => i >= messages.length - 2 || !existingIds.has(msg.id),
    );

    if (messagesToSave.length === 0) return;

    // Wrap upserts in a transaction so a mid-loop failure rolls back partial writes.
    await prisma.$transaction(
        messagesToSave.map((msg) => {
            const content = JSON.stringify(msg.parts);

            return prisma.message.upsert({
                where: { id: msg.id },
                update: {
                    content,
                },
                create: {
                    id: msg.id,
                    role: msg.role === 'user' ? 'USER' : 'ASSISTANT',
                    content,
                    threadId: thread.id,
                    userId: msg.role === 'user' ? userId : null,
                },
            });
        }),
    );
}

export function updateThreadTitle(threadId: string, title: string) {
    return prisma.thread.update({
        where: { id: threadId },
        data: { title },
    });
}

export function deleteThread(threadId: string) {
    // Soft delete: the row (and its messages) stays for recovery/audit, but
    // every read in this module filters deletedAt: null.
    return prisma.thread.update({
        where: { id: threadId },
        data: { deletedAt: new Date() },
    });
}
