import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import prisma from '~/lib/prisma';
import { env } from '~/lib/env.server';

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_BASE_URL,
    emailAndPassword: {
        enabled: true,
    },
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    plugins: [admin({ defaultRole: 'USER' })],
    // Better Auth's built-in rate limiter. Defaults are off in non-prod;
    // explicitly enable so dev and CI exercise the same limits as prod.
    rateLimit: {
        enabled: true,
        // 10s sliding window, 100 req/window per IP across all auth endpoints.
        window: 10,
        max: 100,
        // Tighter limits on the abusable endpoints.
        customRules: {
            '/sign-in/email': { window: 60, max: 10 },
            '/sign-up/email': { window: 60, max: 5 },
            '/forget-password': { window: 60, max: 5 },
            '/reset-password': { window: 60, max: 5 },
        },
    },
});
