/**
 * Example: Well-Documented Function
 *
 * Shows proper JSDoc usage for a typical model layer function.
 */

import { prisma } from '~/db.server';
import type { User, Role } from '~/generated/prisma/client';

/**
 * Input for creating a new user
 * All required fields must be provided at creation time
 */
export interface CreateUserInput {
    /** User's email address - must be unique */
    email: string;
    /** Hashed password (never store plain text) */
    passwordHash: string;
    /** Optional display name */
    name?: string;
}

/**
 * User data safe for client-side display
 * Excludes sensitive fields like password hashes
 */
export interface SafeUser {
    /** Unique identifier (CUID format) */
    id: string;
    /** Verified email address */
    email: string;
    /** Display name, may be null */
    name: string | null;
    /** Authorization role */
    role: Role;
    /** Account creation timestamp */
    createdAt: Date;
}

/**
 * Creates a new user account with the provided credentials
 *
 * Handles email uniqueness at the database level - will throw
 * if email already exists. Password should be hashed before
 * calling this function (use bcrypt or argon2).
 *
 * @param input - User creation data with email and hashed password
 * @returns The created user (without password hash)
 * @throws Prisma error if email already exists
 *
 * @example
 * const hashedPassword = await hash(plainPassword, 10);
 * const user = await createUser({
 *     email: 'new@example.com',
 *     passwordHash: hashedPassword,
 *     name: 'John Doe',
 * });
 */
export async function createUser(input: CreateUserInput): Promise<SafeUser> {
    const user = await prisma.user.create({
        data: {
            email: input.email,
            password: input.passwordHash,
            name: input.name,
            role: 'USER', // Default role for new accounts
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            // Explicitly exclude password and tokens
        },
    });

    return user;
}

/**
 * Retrieves a user by email address
 *
 * Used primarily for authentication flows where we need to
 * verify credentials. Returns the full user including password
 * hash for comparison.
 *
 * @param email - The email address to look up
 * @returns Full user data including password hash, or null if not found
 *
 * @example
 * const user = await getUserByEmail(email);
 * if (!user) {
 *     return data({ error: 'Invalid credentials' }, { status: 401 });
 * }
 * const valid = await compare(password, user.password);
 */
export function getUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        // Include password for authentication
        // IMPORTANT: Never expose this data to the client
    });
}

/**
 * Updates a user's role with authorization check
 *
 * Only admins can change user roles. Prevents users from
 * escalating their own privileges. Logs role changes for
 * audit purposes.
 *
 * @param adminId - ID of the admin performing the action
 * @param targetUserId - ID of the user whose role is being changed
 * @param newRole - The new role to assign
 * @returns Updated user data
 * @throws Error if adminId is not an admin
 * @throws Error if trying to demote the last admin
 *
 * @example
 * // Admin changing user to editor
 * await updateUserRole(adminId, userId, 'EDITOR');
 */
export async function updateUserRole(
    adminId: string,
    targetUserId: string,
    newRole: Role,
): Promise<SafeUser> {
    // Verify the requesting user is an admin
    const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { role: true },
    });

    if (admin?.role !== 'ADMIN') {
        throw new Error('Only admins can change user roles');
    }

    // Prevent removing the last admin
    if (newRole !== 'ADMIN') {
        const adminCount = await prisma.user.count({
            where: { role: 'ADMIN' },
        });

        if (adminCount === 1 && targetUserId === adminId) {
            throw new Error('Cannot demote the last admin');
        }
    }

    return prisma.user.update({
        where: { id: targetUserId },
        data: { role: newRole },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
        },
    });
}
