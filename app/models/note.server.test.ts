import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        note: {
            create: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

vi.mock('~/lib/prisma', () => ({
    default: mockPrisma,
}));

import { createNote, getNotesByUserId, searchNotes } from './note.server';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('createNote', () => {
    it('creates a note with title/content/userId', async () => {
        mockPrisma.note.create.mockResolvedValue({ id: 'n1' });

        await createNote({ title: 'T', content: 'C', userId: 'u1' });

        expect(mockPrisma.note.create).toHaveBeenCalledWith({
            data: { title: 'T', content: 'C', userId: 'u1' },
        });
    });

    it('truncates title to 200 characters', async () => {
        mockPrisma.note.create.mockResolvedValue({});

        const longTitle = 'a'.repeat(500);
        await createNote({ title: longTitle, content: 'C', userId: 'u1' });

        const args = mockPrisma.note.create.mock.calls[0][0];
        expect(args.data.title.length).toBe(200);
    });

    it('truncates content to 10_000 characters', async () => {
        mockPrisma.note.create.mockResolvedValue({});

        const longContent = 'a'.repeat(20_000);
        await createNote({ title: 'T', content: longContent, userId: 'u1' });

        const args = mockPrisma.note.create.mock.calls[0][0];
        expect(args.data.content.length).toBe(10_000);
    });
});

describe('getNotesByUserId', () => {
    it('queries by userId desc by createdAt', async () => {
        mockPrisma.note.findMany.mockResolvedValue([]);

        await getNotesByUserId('u1');

        expect(mockPrisma.note.findMany).toHaveBeenCalledWith({
            where: { userId: 'u1' },
            orderBy: { createdAt: 'desc' },
        });
    });
});

describe('searchNotes', () => {
    it('searches title and content with case-insensitive contains, scoped to user', async () => {
        mockPrisma.note.findMany.mockResolvedValue([]);

        await searchNotes({ userId: 'u1', query: 'hello' });

        expect(mockPrisma.note.findMany).toHaveBeenCalledWith({
            where: {
                userId: 'u1',
                OR: [
                    { title: { contains: 'hello', mode: 'insensitive' } },
                    { content: { contains: 'hello', mode: 'insensitive' } },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
    });
});
