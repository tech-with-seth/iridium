import prisma from '~/lib/prisma';

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 10_000;

type PageOptions = {
    skip?: number;
    take?: number;
};

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

export function getNotesByUserId(
    userId: string,
    { skip, take }: PageOptions = {},
) {
    return prisma.note.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
    });
}

export function getNoteById(noteId: string) {
    // findFirst, not findUnique: soft-deleted notes must behave as missing.
    return prisma.note.findFirst({
        where: { id: noteId, deletedAt: null },
    });
}

export function countNotesByUserId(userId: string, query?: string) {
    return prisma.note.count({
        where: noteSearchWhere(userId, query),
    });
}

export function updateNote({
    noteId,
    title,
    content,
}: {
    noteId: string;
    title: string;
    content: string;
}) {
    return prisma.note.update({
        where: { id: noteId },
        data: {
            title: title.slice(0, MAX_TITLE_LENGTH),
            content: content.slice(0, MAX_CONTENT_LENGTH),
        },
    });
}

export function deleteNote(noteId: string) {
    // Soft delete: every read in this module filters deletedAt: null.
    return prisma.note.update({
        where: { id: noteId },
        data: { deletedAt: new Date() },
    });
}

function noteSearchWhere(userId: string, query?: string) {
    return {
        userId,
        deletedAt: null,
        ...(query
            ? {
                  OR: [
                      {
                          title: {
                              contains: query,
                              mode: 'insensitive' as const,
                          },
                      },
                      {
                          content: {
                              contains: query,
                              mode: 'insensitive' as const,
                          },
                      },
                  ],
              }
            : {}),
    };
}

export function searchNotes({
    userId,
    query,
    skip,
    take,
}: {
    userId: string;
    query: string;
} & PageOptions) {
    return prisma.note.findMany({
        where: noteSearchWhere(userId, query),
        orderBy: { createdAt: 'desc' },
        skip,
        take,
    });
}
