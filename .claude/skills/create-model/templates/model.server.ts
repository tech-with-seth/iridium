/**
 * Template: Model Layer Functions
 *
 * Replace placeholders:
 * - Item → Your model name (PascalCase)
 * - item → Your model name (camelCase)
 *
 * After creating:
 * 1. Update prisma/schema.prisma if needed
 * 2. Run npx prisma migrate dev --name add_item
 * 3. Run npx prisma generate
 */

import { prisma } from '~/db.server';
import type { Item } from '~/generated/prisma/client';

// ============================================
// Types
// ============================================

/** Input for creating a new item */
export interface CreateItemInput {
    name: string;
    description?: string;
}

/** Input for updating an item */
export interface UpdateItemInput {
    name?: string;
    description?: string;
}

// ============================================
// READ Operations
// ============================================

/**
 * Get a single item by ID
 * @param id - The item ID
 * @returns The item or null if not found
 */
export function getItem(id: string) {
    return prisma.item.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            description: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

/**
 * Get all items for a specific user
 * @param userId - The user ID
 * @returns Array of items
 */
export function getItemsByUser(userId: string) {
    return prisma.item.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Get items with pagination
 * @param userId - The user ID
 * @param page - Page number (1-indexed)
 * @param pageSize - Items per page
 * @returns Items and pagination info
 */
export async function getItemsPaginated(
    userId: string,
    page: number = 1,
    pageSize: number = 10
) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
        prisma.item.findMany({
            where: { userId },
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.item.count({ where: { userId } }),
    ]);

    return {
        items,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
            hasNextPage: skip + items.length < total,
            hasPrevPage: page > 1,
        },
    };
}

/**
 * Search items by name
 * @param userId - The user ID
 * @param query - Search query
 * @returns Matching items
 */
export function searchItems(userId: string, query: string) {
    return prisma.item.findMany({
        where: {
            userId,
            name: {
                contains: query,
                mode: 'insensitive',
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Count items for a user
 * @param userId - The user ID
 * @returns Number of items
 */
export function countItems(userId: string) {
    return prisma.item.count({
        where: { userId },
    });
}

// ============================================
// CREATE Operations
// ============================================

/**
 * Create a new item
 * @param userId - The owner's user ID
 * @param data - Item data
 * @returns The created item
 */
export function createItem(userId: string, data: CreateItemInput) {
    return prisma.item.create({
        data: {
            ...data,
            userId,
        },
    });
}

/**
 * Create multiple items at once
 * @param userId - The owner's user ID
 * @param items - Array of item data
 * @returns Count of created items
 */
export function createManyItems(userId: string, items: CreateItemInput[]) {
    return prisma.item.createMany({
        data: items.map((item) => ({ ...item, userId })),
    });
}

// ============================================
// UPDATE Operations
// ============================================

/**
 * Update an existing item
 * @param id - The item ID
 * @param data - Fields to update
 * @returns The updated item
 */
export function updateItem(id: string, data: UpdateItemInput) {
    return prisma.item.update({
        where: { id },
        data,
    });
}

/**
 * Update or create an item (upsert)
 * @param userId - The owner's user ID
 * @param uniqueField - Unique identifier field value
 * @param data - Item data
 * @returns The upserted item
 */
export function upsertItem(
    userId: string,
    uniqueField: string,
    data: CreateItemInput
) {
    return prisma.item.upsert({
        where: { /* unique field */ },
        update: data,
        create: { ...data, userId },
    });
}

// ============================================
// DELETE Operations
// ============================================

/**
 * Delete an item
 * @param id - The item ID
 * @returns The deleted item
 */
export function deleteItem(id: string) {
    return prisma.item.delete({
        where: { id },
    });
}

/**
 * Delete all items for a user
 * @param userId - The user ID
 * @returns Count of deleted items
 */
export function deleteItemsByUser(userId: string) {
    return prisma.item.deleteMany({
        where: { userId },
    });
}

/**
 * Soft delete an item (if using soft delete pattern)
 * @param id - The item ID
 * @returns The updated item
 */
export function softDeleteItem(id: string) {
    return prisma.item.update({
        where: { id },
        data: { deletedAt: new Date() },
    });
}
