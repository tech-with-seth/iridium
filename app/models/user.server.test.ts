import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock('~/lib/prisma', () => ({
    default: mockPrisma,
}));

import { getUserById, updateUserBio } from './user.server';

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
