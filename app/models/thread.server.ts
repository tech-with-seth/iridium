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

export function getAllThreads() {
    return prisma.thread.findMany({
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
            },
        },
    });
}

export function getAllThreadsByUserId(userId: string) {
    return prisma.thread.findMany({
        where: { createdById: userId },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}

export function getThreadById(threadId: string) {
    return prisma.thread.findUnique({
        where: { id: threadId },
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
        (msg, i) =>
            i >= messages.length - 2 || !existingIds.has(msg.id),
    );

    for (const msg of messagesToSave) {
        const content = JSON.stringify(msg.parts);

        await prisma.message.upsert({
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
    }
}

export function updateThreadTitle(threadId: string, title: string) {
    return prisma.thread.update({
        where: { id: threadId },
        data: { title },
    });
}

export function deleteThread(threadId: string) {
    return prisma.thread.delete({
        where: { id: threadId },
    });
}
