import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { createElement } from 'react';
import prisma from '~/lib/prisma';
import { env } from '~/lib/env.server';
import { sendEmail } from '~/lib/email.server';
import { log } from '~/lib/logger.server';
import { ResetPasswordEmail } from '~/emails/ResetPasswordEmail';
import { VerificationEmail } from '~/emails/VerificationEmail';

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
        sendResetPassword: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: 'Reset your Iridium password',
                react: createElement(ResetPasswordEmail, {
                    name: user.name,
                    url,
                }),
            });
        },
    },
    // Soft verification: a verification email goes out on sign-up, but
    // unverified users may still sign in. Flip requireEmailVerification to
    // true to hard-gate (note: the E2E fixtures rely on sign-up auto-login,
    // so they would need a verification step added first).
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: 'Verify your email address',
                react: createElement(VerificationEmail, {
                    name: user.name,
                    url,
                }),
            });
        },
    },
    user: {
        deleteUser: {
            enabled: true,
            afterDelete: async (user) => {
                // Prisma cascades remove the user's rows in the app DB, but
                // VoltAgent conversation memory lives in a separate store.
                try {
                    const { memory } = await import('~/voltagent');
                    // No conversationId: clears every conversation for the user.
                    await memory.clearMessages(user.id);
                } catch (error) {
                    log.exception('voltagent_memory_cleanup_failed', error, {
                        userId: user.id,
                    });
                }
            },
        },
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
    // explicitly enable so dev and CI exercise the same limits as prod. The
    // E2E test server opts out via DISABLE_AUTH_RATE_LIMIT so it can create
    // many sessions quickly.
    rateLimit: {
        enabled: !env.DISABLE_AUTH_RATE_LIMIT,
        // 10s sliding window, 100 req/window per IP across all auth endpoints.
        window: 10,
        max: 100,
        // Tighter limits on the abusable endpoints.
        customRules: {
            '/sign-in/email': { window: 60, max: 10 },
            '/sign-up/email': { window: 60, max: 5 },
            '/request-password-reset': { window: 60, max: 5 },
            '/reset-password': { window: 60, max: 5 },
        },
    },
});
