import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import {
    polar,
    checkout,
    portal,
    usage,
    webhooks,
} from '@polar-sh/better-auth';

import { prisma } from '~/db.server';
import { polarClient } from './polar.server';
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
} from '~/models/email.server';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true to require email verification
        sendResetPassword: async ({ user, url }) => {
            // Send password reset email via Resend
            await sendPasswordResetEmail({
                to: user.email,
                resetUrl: url,
            });
        },
    },
    emailVerification: {
        // sendVerificationEmail: async ({ user, url }) => {
        //     // Send verification email via Resend
        //     await sendVerificationEmail({
        //         to: user.email,
        //         verificationUrl: url,
        //     });
        // },
        sendVerificationEmail: async () => {
            console.log('Verification email sending is currently disabled.');
        },
        sendOnSignUp: true, // Automatically send verification email on signup
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
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                // checkout({
                //     // Add your product configurations here
                //     products: [{ productId: "your-product-id", slug: "pro" }],
                //     successUrl:
                //         process.env.POLAR_SUCCESS_URL || '/payment/success',
                //     authenticatedUsersOnly: true,
                // }),
                // portal(),
                usage(),
                // webhooks({
                //     secret: process.env.POLAR_WEBHOOK_SECRET!,
                //     onCustomerStateChanged: async (payload) => {
                //         console.log('Customer state changed:', payload);
                //     },
                //     onOrderPaid: async (payload) => {
                //         console.log('Order paid:', payload);
                //     },
                //     onPayload: async (payload) => {
                //         console.log('Polar webhook received:', payload);
                //     },
                // }),
            ],
        }),
    ],
});
