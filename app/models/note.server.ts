import prisma from '~/lib/prisma';

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 10_000;

export function createNote({
    title,
    content,
    userId,
}: {
    title: string;
    content: string;
    userId: string;
}) {
    return prisma.note.create({
        data: {
            title: title.slice(0, MAX_TITLE_LENGTH),
            content: content.slice(0, MAX_CONTENT_LENGTH),
            userId,
        },
    });
}

export function getNotesByUserId(userId: string) {
    return prisma.note.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
}

export function searchNotes({
    userId,
    query,
}: {
    userId: string;
    query: string;
}) {
    return prisma.note.findMany({
        where: {
            userId,
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
            ],
        },
        orderBy: { createdAt: 'desc' },
    });
}
