import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        note: {
            create: vi.fn(),
            findMany: vi.fn(),
            findFirst: vi.fn(),
            count: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock('~/lib/prisma', () => ({
    default: mockPrisma,
}));

import {
    countNotesByUserId,
    createNote,
    deleteNote,
    getNoteById,
    getNotesByUserId,
    searchNotes,
    updateNote,
} from './note.server';

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
    it('queries non-deleted notes by userId desc by createdAt', async () => {
        mockPrisma.note.findMany.mockResolvedValue([]);

        await getNotesByUserId('u1');

        expect(mockPrisma.note.findMany).toHaveBeenCalledWith({
            where: { userId: 'u1', deletedAt: null },
            orderBy: { createdAt: 'desc' },
            skip: undefined,
            take: undefined,
        });
    });

    it('passes skip/take for pagination', async () => {
        mockPrisma.note.findMany.mockResolvedValue([]);

        await getNotesByUserId('u1', { skip: 20, take: 10 });

        const args = mockPrisma.note.findMany.mock.calls[0][0];
        expect(args.skip).toBe(20);
        expect(args.take).toBe(10);
    });
});

describe('getNoteById', () => {
    it('excludes soft-deleted notes', async () => {
        mockPrisma.note.findFirst.mockResolvedValue(null);

        await getNoteById('n1');

        expect(mockPrisma.note.findFirst).toHaveBeenCalledWith({
            where: { id: 'n1', deletedAt: null },
        });
    });
});

describe('countNotesByUserId', () => {
    it('counts non-deleted notes for the user', async () => {
        mockPrisma.note.count.mockResolvedValue(0);

        await countNotesByUserId('u1');

        expect(mockPrisma.note.count).toHaveBeenCalledWith({
            where: { userId: 'u1', deletedAt: null },
        });
    });

    it('applies the search filter when a query is given', async () => {
        mockPrisma.note.count.mockResolvedValue(0);

        await countNotesByUserId('u1', 'hello');

        const args = mockPrisma.note.count.mock.calls[0][0];
        expect(args.where.OR).toHaveLength(2);
    });
});

describe('updateNote', () => {
    it('updates title and content with truncation', async () => {
        mockPrisma.note.update.mockResolvedValue({});

        await updateNote({
            noteId: 'n1',
            title: 'a'.repeat(500),
            content: 'C',
        });

        const args = mockPrisma.note.update.mock.calls[0][0];
        expect(args.where).toEqual({ id: 'n1' });
        expect(args.data.title.length).toBe(200);
        expect(args.data.content).toBe('C');
    });
});

describe('deleteNote', () => {
    it('soft deletes by setting deletedAt', async () => {
        mockPrisma.note.update.mockResolvedValue({});

        await deleteNote('n1');

        expect(mockPrisma.note.update).toHaveBeenCalledWith({
            where: { id: 'n1' },
            data: { deletedAt: expect.any(Date) },
        });
    });
});

describe('searchNotes', () => {
    it('searches title and content with case-insensitive contains, scoped to user, excluding deleted', async () => {
        mockPrisma.note.findMany.mockResolvedValue([]);

        await searchNotes({ userId: 'u1', query: 'hello' });

        expect(mockPrisma.note.findMany).toHaveBeenCalledWith({
            where: {
                userId: 'u1',
                deletedAt: null,
                OR: [
                    { title: { contains: 'hello', mode: 'insensitive' } },
                    { content: { contains: 'hello', mode: 'insensitive' } },
                ],
            },
            orderBy: { createdAt: 'desc' },
            skip: undefined,
            take: undefined,
        });
    });
});
