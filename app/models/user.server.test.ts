import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
            findMany: vi.fn(),
            count: vi.fn(),
        },
    },
}));

vi.mock('~/lib/prisma', () => ({
    default: mockPrisma,
}));

import {
    countUsers,
    getUserById,
    listUsers,
    updateUserBio,
    updateUserRole,
} from './user.server';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getUserById', () => {
    it('queries by id', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' });

        const result = await getUserById('u1');

        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 'u1' },
        });
        expect(result).toEqual({ id: 'u1' });
    });
});

describe('listUsers', () => {
    it('selects safe fields only, newest first', async () => {
        mockPrisma.user.findMany.mockResolvedValue([]);

        await listUsers({ skip: 0, take: 20 });

        const args = mockPrisma.user.findMany.mock.calls[0][0];
        expect(args.select).not.toHaveProperty('password');
        expect(Object.keys(args.select)).toEqual(
            expect.arrayContaining(['id', 'email', 'role', 'banned']),
        );
        expect(args.orderBy).toEqual({ createdAt: 'desc' });
        expect(args.take).toBe(20);
    });

    it('searches name and email case-insensitively', async () => {
        mockPrisma.user.findMany.mockResolvedValue([]);

        await listUsers({ query: 'alice' });

        const args = mockPrisma.user.findMany.mock.calls[0][0];
        expect(args.where.OR).toEqual([
            { name: { contains: 'alice', mode: 'insensitive' } },
            { email: { contains: 'alice', mode: 'insensitive' } },
        ]);
    });
});

describe('countUsers', () => {
    it('counts with the same search filter', async () => {
        mockPrisma.user.count.mockResolvedValue(0);

        await countUsers({ query: 'bob' });

        const args = mockPrisma.user.count.mock.calls[0][0];
        expect(args.where.OR).toHaveLength(2);
    });
});

describe('user filters', () => {
    it('filters by role', async () => {
        mockPrisma.user.findMany.mockResolvedValue([]);

        await listUsers({ role: 'ADMIN' });

        const args = mockPrisma.user.findMany.mock.calls[0][0];
        expect(args.where.role).toBe('ADMIN');
        expect(args.where.OR).toBeUndefined();
    });

    it('filters banned users', async () => {
        mockPrisma.user.findMany.mockResolvedValue([]);

        await listUsers({ banned: true });

        const args = mockPrisma.user.findMany.mock.calls[0][0];
        expect(args.where.banned).toBe(true);
    });

    it('treats never-banned (null) users as active', async () => {
        mockPrisma.user.count.mockResolvedValue(0);

        await countUsers({ banned: false });

        const args = mockPrisma.user.count.mock.calls[0][0];
        expect(args.where.banned).toEqual({ not: true });
    });
});

describe('updateUserRole', () => {
    it('updates the role', async () => {
        mockPrisma.user.update.mockResolvedValue({});

        await updateUserRole('u1', 'EDITOR');

        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'u1' },
            data: { role: 'EDITOR' },
        });
    });
});

describe('updateUserBio', () => {
    it('updates the bio', async () => {
        mockPrisma.user.update.mockResolvedValue({ id: 'u1', bio: 'hi' });

        await updateUserBio('u1', 'hi');

        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'u1' },
            data: { bio: 'hi' },
        });
    });
});
