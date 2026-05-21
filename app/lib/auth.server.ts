import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import prisma from '~/lib/prisma';
import { env } from '~/lib/env.server';

const isProduction = env.NODE_ENV === 'production';

export const auth = betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_BASE_URL,
    trustedOrigins: [
        env.BETTER_AUTH_BASE_URL,
        ...env.BETTER_AUTH_TRUSTED_ORIGINS,
    ],
    emailAndPassword: {
        enabled: true,
        // Better Auth defaults to 8; restating for visibility.
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true,
    },
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    session: {
        // Cache the session in a signed cookie so most requests skip the DB
        // session lookup. Revocations still take effect within cookieCache.maxAge.
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },
    advanced: {
        defaultCookieAttributes: {
            httpOnly: true,
            sameSite: 'lax',
            secure: isProduction,
        },
    },
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
