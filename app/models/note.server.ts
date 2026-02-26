import prisma from '~/lib/prisma';

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
        data: { title, content, userId },
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
