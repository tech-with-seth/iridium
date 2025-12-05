import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, organization } from 'better-auth/plugins';
import {
    checkout,
    polar,
    usage,
    portal,
    webhooks,
} from '@polar-sh/better-auth';

import { prisma } from '~/db.server';
import { polarClient } from './polar';
import {
    // sendVerificationEmail,
    sendPasswordResetEmail,
    sendVerificationEmail,
} from '~/models/email.server';

export const auth = betterAuth({
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            prompt: 'select_account',
        },
    },
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true to require email verification
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail({
                to: user.email,
                resetUrl: url,
            });
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await sendVerificationEmail({
                to: user.email,
                verificationUrl: url,
            });
        },
        sendOnSignUp: false, // Don't send verification emails since requireEmailVerification is false
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    onAPIError: {
        throw: false, // Don't throw errors automatically
        onError: (error, ctx) => {
            // Log errors but don't crash the application
            console.error('Better Auth API Error:', {
                error: error instanceof Error ? error.message : String(error),
                context: ctx,
            });
        },
    },
    plugins: [
        admin({
            defaultRole: 'USER',
        }),
        organization(),
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    successUrl:
                        process.env.POLAR_SUCCESS_URL || '/payment/success',
                    authenticatedUsersOnly: true,
                }),
                portal(),
                usage(),
                webhooks({
                    secret: process.env.POLAR_WEBHOOK_SECRET!,
                    onCustomerStateChanged: async (payload) => {
                        console.log('Customer state changed:', payload);
                    },
                    onOrderPaid: async (payload) => {
                        console.log('Order paid:', payload);
                    },
                    onPayload: async (payload) => {
                        console.log('Polar webhook received:', payload);
                    },
                }),
            ],
        }),
    ],
});
