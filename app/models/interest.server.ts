import { prisma } from '~/db.server';
import type { InterestFormData } from '~/lib/validations';

/**
 * Interest List Model
 *
 * Handles database operations for interest list signups.
 */

/**
 * Create a new interest list signup
 */
export async function createInterestSignup(data: InterestFormData) {
    return await prisma.interestListSignup.create({
        data: {
            email: data.email,
            inquiryType: data.inquiryType,
            note: data.note || null,
        },
    });
}

/**
 * Check if an email is already on the interest list
 */
export async function getInterestSignupByEmail(email: string) {
    return await prisma.interestListSignup.findUnique({
        where: { email },
    });
}

/**
 * Get all interest list signups (for admin use)
 */
export async function getAllInterestSignups() {
    return await prisma.interestListSignup.findMany({
        orderBy: { createdAt: 'desc' },
    });
}
