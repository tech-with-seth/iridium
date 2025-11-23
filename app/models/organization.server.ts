import { prisma } from '~/db.server';
import type {
    Organization,
    OrganizationMember,
    OrganizationRole,
} from '~/generated/prisma/client';

/**
 * Create a new organization with the creator as owner
 */
export async function createOrganization({
    name,
    slug,
    ownerId,
}: {
    name: string;
    slug: string;
    ownerId: string;
}): Promise<Organization> {
    return prisma.organization.create({
        data: {
            name,
            slug,
            ownerId,
            members: {
                create: {
                    userId: ownerId,
                    role: 'OWNER',
                },
            },
        },
    });
}

/**
 * Get organization by slug (excluding soft-deleted)
 */
export async function getOrganizationBySlug(
    slug: string,
): Promise<Organization | null> {
    return prisma.organization.findFirst({
        where: {
            slug,
            deletedAt: null,
        },
    });
}

/**
 * Get organization by slug with members
 */
export async function getOrganizationWithMembers(slug: string) {
    return prisma.organization.findFirst({
        where: {
            slug,
            deletedAt: null,
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            },
            owner: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                },
            },
        },
    });
}

/**
 * Get all organizations for a user (excluding soft-deleted)
 */
export async function getUserOrganizations(
    userId: string,
): Promise<Organization[]> {
    const memberships = await prisma.organizationMember.findMany({
        where: {
            userId,
            organization: {
                deletedAt: null,
            },
        },
        include: {
            organization: true,
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    return memberships.map((m) => m.organization);
}

/**
 * Get user's membership in an organization
 */
export async function getOrganizationMembership(
    organizationId: string,
    userId: string,
): Promise<OrganizationMember | null> {
    return prisma.organizationMember.findUnique({
        where: {
            organizationId_userId: {
                organizationId,
                userId,
            },
        },
    });
}

/**
 * Check if user has a specific role or higher in organization
 */
export async function hasOrganizationRole(
    organizationId: string,
    userId: string,
    requiredRole: OrganizationRole,
): Promise<boolean> {
    const membership = await getOrganizationMembership(organizationId, userId);
    if (!membership) return false;

    const roleHierarchy: Record<OrganizationRole, number> = {
        OWNER: 3,
        ADMIN: 2,
        MEMBER: 1,
    };

    return roleHierarchy[membership.role] >= roleHierarchy[requiredRole];
}

/**
 * Update organization details
 */
export async function updateOrganization(
    organizationId: string,
    data: { name?: string; slug?: string },
): Promise<Organization> {
    return prisma.organization.update({
        where: { id: organizationId },
        data,
    });
}

/**
 * Soft delete organization (30-day grace period)
 */
export async function deleteOrganization(
    organizationId: string,
): Promise<Organization> {
    return prisma.organization.update({
        where: { id: organizationId },
        data: {
            deletedAt: new Date(),
        },
    });
}

/**
 * Permanently delete organization (after grace period)
 */
export async function permanentlyDeleteOrganization(
    organizationId: string,
): Promise<void> {
    await prisma.organization.delete({
        where: { id: organizationId },
    });
}

/**
 * Restore soft-deleted organization
 */
export async function restoreOrganization(
    organizationId: string,
): Promise<Organization> {
    return prisma.organization.update({
        where: { id: organizationId },
        data: {
            deletedAt: null,
        },
    });
}

/**
 * Add a member to an organization
 */
export async function addMember({
    organizationId,
    userId,
    role = 'MEMBER',
}: {
    organizationId: string;
    userId: string;
    role?: OrganizationRole;
}): Promise<OrganizationMember> {
    return prisma.organizationMember.create({
        data: {
            organizationId,
            userId,
            role,
        },
    });
}

/**
 * Remove a member from an organization
 */
export async function removeMember(
    organizationId: string,
    userId: string,
): Promise<void> {
    await prisma.organizationMember.delete({
        where: {
            organizationId_userId: {
                organizationId,
                userId,
            },
        },
    });
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
    organizationId: string,
    userId: string,
    role: OrganizationRole,
): Promise<OrganizationMember> {
    return prisma.organizationMember.update({
        where: {
            organizationId_userId: {
                organizationId,
                userId,
            },
        },
        data: { role },
    });
}

/**
 * Get all members of an organization
 */
export async function getOrganizationMembers(organizationId: string) {
    return prisma.organizationMember.findMany({
        where: { organizationId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                },
            },
        },
        orderBy: [{ role: 'desc' }, { createdAt: 'asc' }],
    });
}

/**
 * Count members in an organization
 */
export async function countOrganizationMembers(
    organizationId: string,
): Promise<number> {
    return prisma.organizationMember.count({
        where: { organizationId },
    });
}
