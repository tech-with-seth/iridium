import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Role } from '~/generated/prisma/client';
import {
    getUserRole,
    getUserProfile,
    updateUser,
    deleteUser,
    getUsersByRole,
    updateUserRole,
    countUsersByRole,
} from './user.server';

// Mock the Prisma client
vi.mock('~/db.server', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
    },
}));

// Import the mocked prisma after mocking
import { prisma } from '~/db.server';

describe('User Model', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getUserRole', () => {
        it('fetches user role by ID', async () => {
            const mockUserId = 'user-123';
            const mockResult = { role: Role.USER };

            vi.mocked(prisma.user.findUnique).mockResolvedValue(
                mockResult as any,
            );

            const result = await getUserRole(mockUserId);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockUserId },
                select: { role: true },
            });
            expect(result).toEqual(mockResult);
        });

        it('returns null for non-existent user', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

            const result = await getUserRole('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('getUserProfile', () => {
        it('fetches complete user profile', async () => {
            const mockUserId = 'user-123';
            const mockProfile = {
                id: mockUserId,
                email: 'test@example.com',
                name: 'Test User',
                bio: 'Software developer',
                website: 'https://example.com',
                location: 'San Francisco',
                phoneNumber: '+1234567890',
                image: null,
                emailVerified: true,
                role: Role.USER,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            };

            vi.mocked(prisma.user.findUnique).mockResolvedValue(
                mockProfile as any,
            );

            const result = await getUserProfile(mockUserId);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockUserId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    bio: true,
                    website: true,
                    location: true,
                    phoneNumber: true,
                    image: true,
                    emailVerified: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            expect(result).toEqual(mockProfile);
        });
    });

    describe('updateUser', () => {
        it('updates user with provided data', async () => {
            const mockUserId = 'user-123';
            const updateData = {
                name: 'Updated Name',
                bio: 'Updated bio',
                website: 'https://newsite.com',
            };
            const mockUpdatedUser = {
                id: mockUserId,
                ...updateData,
            };

            vi.mocked(prisma.user.update).mockResolvedValue(
                mockUpdatedUser as any,
            );

            const result = await updateUser({
                userId: mockUserId,
                data: updateData,
            });

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: mockUserId },
                data: {
                    name: updateData.name,
                    bio: updateData.bio,
                    website: updateData.website,
                    location: null,
                    phoneNumber: null,
                },
            });
            expect(result).toEqual(mockUpdatedUser);
        });

        it('handles null values for optional fields', async () => {
            const mockUserId = 'user-123';
            const updateData = {
                name: 'Test User',
                bio: undefined,
                website: '',
            };

            vi.mocked(prisma.user.update).mockResolvedValue({} as any);

            await updateUser({ userId: mockUserId, data: updateData });

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: mockUserId },
                data: {
                    name: updateData.name,
                    bio: null,
                    website: null,
                    location: null,
                    phoneNumber: null,
                },
            });
        });
    });

    describe('deleteUser', () => {
        it('deletes user by ID', async () => {
            const mockUserId = 'user-123';
            const mockDeletedUser = { id: mockUserId };

            vi.mocked(prisma.user.delete).mockResolvedValue(
                mockDeletedUser as any,
            );

            const result = await deleteUser(mockUserId);

            expect(prisma.user.delete).toHaveBeenCalledWith({
                where: { id: mockUserId },
            });
            expect(result).toEqual(mockDeletedUser);
        });
    });

    describe('getUsersByRole', () => {
        it('fetches all users with a specific role', async () => {
            const mockUsers = [
                {
                    id: 'user-1',
                    email: 'editor1@example.com',
                    name: 'Editor 1',
                    role: Role.EDITOR,
                    createdAt: new Date('2024-01-01'),
                    updatedAt: new Date('2024-01-01'),
                },
                {
                    id: 'user-2',
                    email: 'editor2@example.com',
                    name: 'Editor 2',
                    role: Role.EDITOR,
                    createdAt: new Date('2024-01-02'),
                    updatedAt: new Date('2024-01-02'),
                },
            ];

            vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);

            const result = await getUsersByRole(Role.EDITOR);

            expect(prisma.user.findMany).toHaveBeenCalledWith({
                where: { role: Role.EDITOR },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual(mockUsers);
        });
    });

    describe('updateUserRole', () => {
        it('updates user role', async () => {
            const mockUserId = 'user-123';
            const newRole = Role.EDITOR;
            const mockUpdatedUser = {
                id: mockUserId,
                email: 'test@example.com',
                name: 'Test User',
                role: newRole,
            };

            vi.mocked(prisma.user.update).mockResolvedValue(
                mockUpdatedUser as any,
            );

            const result = await updateUserRole(mockUserId, newRole);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: mockUserId },
                data: { role: newRole },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                },
            });
            expect(result).toEqual(mockUpdatedUser);
        });
    });

    describe('countUsersByRole', () => {
        it('counts users by each role', async () => {
            const mockCounts = [5, 3, 1]; // USER, EDITOR, ADMIN

            vi.mocked(prisma.user.count)
                .mockResolvedValueOnce(mockCounts[0])
                .mockResolvedValueOnce(mockCounts[1])
                .mockResolvedValueOnce(mockCounts[2]);

            const result = await countUsersByRole();

            expect(prisma.user.count).toHaveBeenCalledTimes(3);
            expect(prisma.user.count).toHaveBeenNthCalledWith(1, {
                where: { role: Role.USER },
            });
            expect(prisma.user.count).toHaveBeenNthCalledWith(2, {
                where: { role: Role.EDITOR },
            });
            expect(prisma.user.count).toHaveBeenNthCalledWith(3, {
                where: { role: Role.ADMIN },
            });

            expect(result).toEqual({
                [Role.USER]: 5,
                [Role.EDITOR]: 3,
                [Role.ADMIN]: 1,
                total: 9,
            });
        });
    });
});
