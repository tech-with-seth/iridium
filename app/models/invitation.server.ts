import { prisma } from '~/db.server';
import type {
    OrganizationInvitation,
    OrganizationRole,
} from '~/generated/prisma/client';
import { randomBytes } from 'crypto';

const INVITATION_TTL_DAYS = 7;

/**
 * Generate a secure invitation token
 */
function generateInvitationToken(): string {
    return randomBytes(32).toString('hex');
}

/**
 * Create a new organization invitation
 */
export async function createInvitation({
    organizationId,
    email,
    role = 'MEMBER',
}: {
    organizationId: string;
    email: string;
    role?: OrganizationRole;
}): Promise<OrganizationInvitation> {
    const token = generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_TTL_DAYS);

    return prisma.organizationInvitation.create({
        data: {
            organizationId,
            email: email.toLowerCase(),
            role,
            token,
            expiresAt,
        },
    });
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(
    token: string,
): Promise<OrganizationInvitation | null> {
    return prisma.organizationInvitation.findUnique({
        where: { token },
        include: {
            organization: true,
        },
    });
}

/**
 * Check if invitation is valid (not expired, not accepted)
 */
export function isInvitationValid(invitation: OrganizationInvitation): boolean {
    if (invitation.acceptedAt) return false;
    if (new Date() > invitation.expiresAt) return false;
    return true;
}

/**
 * Accept an organization invitation
 */
export async function acceptInvitation(
    token: string,
    userId: string,
): Promise<OrganizationInvitation> {
    const invitation = await getInvitationByToken(token);

    if (!invitation) {
        throw new Error('Invitation not found');
    }

    if (!isInvitationValid(invitation)) {
        throw new Error('Invitation is invalid or expired');
    }

    // Add user to organization
    await prisma.organizationMember.create({
        data: {
            organizationId: invitation.organizationId,
            userId,
            role: invitation.role,
        },
    });

    // Mark invitation as accepted
    return prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: {
            acceptedAt: new Date(),
        },
    });
}

/**
 * Revoke an organization invitation
 */
export async function revokeInvitation(invitationId: string): Promise<void> {
    await prisma.organizationInvitation.delete({
        where: { id: invitationId },
    });
}

/**
 * Get all pending invitations for an organization
 */
export async function getOrganizationInvitations(
    organizationId: string,
): Promise<OrganizationInvitation[]> {
    return prisma.organizationInvitation.findMany({
        where: {
            organizationId,
            acceptedAt: null,
            expiresAt: {
                gt: new Date(),
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}

/**
 * Get pending invitation for a specific email in an organization
 */
export async function getPendingInvitation(
    organizationId: string,
    email: string,
): Promise<OrganizationInvitation | null> {
    return prisma.organizationInvitation.findFirst({
        where: {
            organizationId,
            email: email.toLowerCase(),
            acceptedAt: null,
            expiresAt: {
                gt: new Date(),
            },
        },
    });
}

/**
 * Check if user has a pending invitation
 */
export async function hasPendingInvitation(
    organizationId: string,
    email: string,
): Promise<boolean> {
    const invitation = await getPendingInvitation(organizationId, email);
    return invitation !== null;
}

/**
 * Clean up expired invitations (older than TTL)
 */
export async function cleanupExpiredInvitations(): Promise<number> {
    const result = await prisma.organizationInvitation.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
            acceptedAt: null,
        },
    });

    return result.count;
}

/**
 * Get all invitations for a user's email
 */
export async function getUserInvitations(
    email: string,
): Promise<OrganizationInvitation[]> {
    return prisma.organizationInvitation.findMany({
        where: {
            email: email.toLowerCase(),
            acceptedAt: null,
            expiresAt: {
                gt: new Date(),
            },
        },
        include: {
            organization: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}
