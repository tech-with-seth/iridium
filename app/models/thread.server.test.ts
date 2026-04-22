import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { UIMessage } from 'ai';

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        thread: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        message: {
            upsert: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

vi.mock('~/lib/prisma', () => ({
    default: mockPrisma,
}));

import {
    createThread,
    getAllThreadsByUserId,
    getThreadById,
    updateThreadTitle,
    deleteThread,
    saveChat,
} from './thread.server';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('createThread', () => {
    it('creates with Untitled title', async () => {
        mockPrisma.thread.create.mockResolvedValue({ id: 't1' });

        await createThread('user-1');

        expect(mockPrisma.thread.create).toHaveBeenCalledWith({
            data: { createdById: 'user-1', title: 'Untitled' },
        });
    });
});

describe('getAllThreadsByUserId', () => {
    it('queries threads desc by createdAt with first message included', async () => {
        mockPrisma.thread.findMany.mockResolvedValue([]);

        await getAllThreadsByUserId('user-1');

        expect(mockPrisma.thread.findMany).toHaveBeenCalledWith({
            where: { createdById: 'user-1' },
            include: {
                messages: { orderBy: { createdAt: 'asc' }, take: 1 },
            },
            orderBy: { createdAt: 'desc' },
        });
    });
});

describe('getThreadById', () => {
    it('queries by id with all messages asc', async () => {
        mockPrisma.thread.findUnique.mockResolvedValue(null);

        await getThreadById('t1');

        expect(mockPrisma.thread.findUnique).toHaveBeenCalledWith({
            where: { id: 't1' },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
    });
});

describe('updateThreadTitle', () => {
    it('updates the title', async () => {
        mockPrisma.thread.update.mockResolvedValue({});

        await updateThreadTitle('t1', 'New Title');

        expect(mockPrisma.thread.update).toHaveBeenCalledWith({
            where: { id: 't1' },
            data: { title: 'New Title' },
        });
    });
});

describe('deleteThread', () => {
    it('deletes by id', async () => {
        mockPrisma.thread.delete.mockResolvedValue({});

        await deleteThread('t1');

        expect(mockPrisma.thread.delete).toHaveBeenCalledWith({
            where: { id: 't1' },
        });
    });
});

describe('saveChat', () => {
    function makeMessages(): UIMessage[] {
        return [
            {
                id: 'm1',
                role: 'user',
                parts: [{ type: 'text', text: 'hi' }],
            } as UIMessage,
            {
                id: 'm2',
                role: 'assistant',
                parts: [{ type: 'text', text: 'hello' }],
            } as UIMessage,
        ];
    }

    it('throws when thread does not exist', async () => {
        mockPrisma.thread.findUnique.mockResolvedValue(null);

        await expect(
            saveChat({
                messages: makeMessages(),
                threadId: 't-missing',
                userId: 'u1',
            }),
        ).rejects.toThrow('Thread not found');

        expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws when thread belongs to another user', async () => {
        mockPrisma.thread.findUnique.mockResolvedValue({
            id: 't1',
            createdById: 'other-user',
            messages: [],
        });

        await expect(
            saveChat({
                messages: makeMessages(),
                threadId: 't1',
                userId: 'u1',
            }),
        ).rejects.toThrow('Forbidden');

        expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('does nothing when there are no messages to save', async () => {
        mockPrisma.thread.findUnique.mockResolvedValue({
            id: 't1',
            createdById: 'u1',
            messages: [],
        });

        await saveChat({ messages: [], threadId: 't1', userId: 'u1' });

        expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('wraps upserts in a single transaction', async () => {
        mockPrisma.thread.findUnique.mockResolvedValue({
            id: 't1',
            createdById: 'u1',
            messages: [],
        });
        mockPrisma.$transaction.mockResolvedValue([]);
        mockPrisma.message.upsert.mockReturnValue('upsert-promise');

        await saveChat({
            messages: makeMessages(),
            threadId: 't1',
            userId: 'u1',
        });

        expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
        // The argument must be an array of upsert calls (one per message).
        const calls = mockPrisma.$transaction.mock.calls[0][0];
        expect(Array.isArray(calls)).toBe(true);
        expect(calls).toHaveLength(2);
    });

    it('rolls back when the transaction rejects', async () => {
        mockPrisma.thread.findUnique.mockResolvedValue({
            id: 't1',
            createdById: 'u1',
            messages: [],
        });
        mockPrisma.$transaction.mockRejectedValue(new Error('db down'));

        await expect(
            saveChat({
                messages: makeMessages(),
                threadId: 't1',
                userId: 'u1',
            }),
        ).rejects.toThrow('db down');
    });

    it('serializes parts as JSON in upsert payloads', async () => {
        mockPrisma.thread.findUnique.mockResolvedValue({
            id: 't1',
            createdById: 'u1',
            messages: [],
        });
        mockPrisma.$transaction.mockResolvedValue([]);
        mockPrisma.message.upsert.mockImplementation((args) => args);

        await saveChat({
            messages: makeMessages(),
            threadId: 't1',
            userId: 'u1',
        });

        const upsertCalls = mockPrisma.message.upsert.mock.calls;
        const userMessageArgs = upsertCalls[0][0];

        expect(userMessageArgs.where).toEqual({ id: 'm1' });
        expect(userMessageArgs.create.role).toBe('USER');
        expect(userMessageArgs.create.userId).toBe('u1');
        expect(JSON.parse(userMessageArgs.create.content)).toEqual([
            { type: 'text', text: 'hi' },
        ]);

        const assistantMessageArgs = upsertCalls[1][0];
        expect(assistantMessageArgs.create.role).toBe('ASSISTANT');
        expect(assistantMessageArgs.create.userId).toBeNull();
    });

    it('does not re-save messages already in the thread (older than the last 2)', async () => {
        const messages: UIMessage[] = [
            {
                id: 'old1',
                role: 'user',
                parts: [{ type: 'text', text: 'old' }],
            } as UIMessage,
            {
                id: 'm1',
                role: 'user',
                parts: [{ type: 'text', text: 'hi' }],
            } as UIMessage,
            {
                id: 'm2',
                role: 'assistant',
                parts: [{ type: 'text', text: 'hello' }],
            } as UIMessage,
        ];

        mockPrisma.thread.findUnique.mockResolvedValue({
            id: 't1',
            createdById: 'u1',
            // 'old1' already exists in DB.
            messages: [{ id: 'old1' }],
        });
        mockPrisma.$transaction.mockResolvedValue([]);
        mockPrisma.message.upsert.mockImplementation((args) => args);

        await saveChat({ messages, threadId: 't1', userId: 'u1' });

        // Should only upsert the last 2 (m1, m2), not the existing old1.
        expect(mockPrisma.message.upsert).toHaveBeenCalledTimes(2);
        const ids = mockPrisma.message.upsert.mock.calls.map(
            (c) => c[0].where.id,
        );
        expect(ids).toEqual(['m1', 'm2']);
    });
});
