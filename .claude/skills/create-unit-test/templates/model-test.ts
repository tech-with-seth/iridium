/**
 * Template: Model Layer Unit Test
 *
 * Replace placeholders:
 * - Item → Your model name (PascalCase)
 * - item → Your model name (camelCase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Role } from '~/generated/prisma/client';

// ============================================
// CRITICAL: Mock BEFORE importing prisma
// ============================================
vi.mock('~/db.server', () => ({
    prisma: {
        item: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
    },
}));

// Import AFTER mocking
import { prisma } from '~/db.server';
import {
    getItem,
    getItemsByUser,
    createItem,
    updateItem,
    deleteItem,
} from './item.server';

describe('Item Model', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ============================================
    // READ Operations
    // ============================================

    describe('getItem', () => {
        it('fetches item by ID', async () => {
            const mockItem = {
                id: 'item-123',
                name: 'Test Item',
                userId: 'user-123',
                createdAt: new Date(),
            };

            vi.mocked(prisma.item.findUnique).mockResolvedValue(mockItem as any);

            const result = await getItem('item-123');

            expect(prisma.item.findUnique).toHaveBeenCalledWith({
                where: { id: 'item-123' },
                select: expect.objectContaining({
                    id: true,
                    name: true,
                }),
            });
            expect(result).toEqual(mockItem);
        });

        it('returns null for non-existent item', async () => {
            vi.mocked(prisma.item.findUnique).mockResolvedValue(null);

            const result = await getItem('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('getItemsByUser', () => {
        it('fetches all items for a user', async () => {
            const mockItems = [
                { id: 'item-1', name: 'Item 1', userId: 'user-123' },
                { id: 'item-2', name: 'Item 2', userId: 'user-123' },
            ];

            vi.mocked(prisma.item.findMany).mockResolvedValue(mockItems as any);

            const result = await getItemsByUser('user-123');

            expect(prisma.item.findMany).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toHaveLength(2);
        });

        it('returns empty array when user has no items', async () => {
            vi.mocked(prisma.item.findMany).mockResolvedValue([]);

            const result = await getItemsByUser('user-no-items');

            expect(result).toEqual([]);
        });
    });

    // ============================================
    // CREATE Operations
    // ============================================

    describe('createItem', () => {
        it('creates item with user association', async () => {
            const mockItem = {
                id: 'new-item',
                name: 'New Item',
                userId: 'user-123',
            };

            vi.mocked(prisma.item.create).mockResolvedValue(mockItem as any);

            const result = await createItem('user-123', { name: 'New Item' });

            expect(prisma.item.create).toHaveBeenCalledWith({
                data: {
                    name: 'New Item',
                    userId: 'user-123',
                },
            });
            expect(result).toEqual(mockItem);
        });
    });

    // ============================================
    // UPDATE Operations
    // ============================================

    describe('updateItem', () => {
        it('updates item fields', async () => {
            const mockUpdated = {
                id: 'item-123',
                name: 'Updated Name',
            };

            vi.mocked(prisma.item.update).mockResolvedValue(mockUpdated as any);

            const result = await updateItem('item-123', { name: 'Updated Name' });

            expect(prisma.item.update).toHaveBeenCalledWith({
                where: { id: 'item-123' },
                data: { name: 'Updated Name' },
            });
            expect(result.name).toBe('Updated Name');
        });
    });

    // ============================================
    // DELETE Operations
    // ============================================

    describe('deleteItem', () => {
        it('deletes item by ID', async () => {
            const mockDeleted = { id: 'item-123' };

            vi.mocked(prisma.item.delete).mockResolvedValue(mockDeleted as any);

            const result = await deleteItem('item-123');

            expect(prisma.item.delete).toHaveBeenCalledWith({
                where: { id: 'item-123' },
            });
            expect(result.id).toBe('item-123');
        });
    });

    // ============================================
    // Error Handling
    // ============================================

    describe('error handling', () => {
        beforeEach(() => {
            // Suppress console.error for error tests
            vi.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('propagates database errors', async () => {
            const dbError = new Error('Database connection failed');
            vi.mocked(prisma.item.findUnique).mockRejectedValue(dbError);

            await expect(getItem('item-123')).rejects.toThrow(
                'Database connection failed',
            );
        });
    });
});
