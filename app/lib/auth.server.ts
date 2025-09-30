import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { prisma } from '~/db.server';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql'
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24 // 1 day
    },
    onAPIError: {
        throw: false, // Don't throw errors automatically
        onError: (error, ctx) => {
            // Log errors but don't crash the application
            console.error('Better Auth API Error:', {
                error: error instanceof Error ? error.message : String(error),
                context: ctx
            });
        }
    }
});
