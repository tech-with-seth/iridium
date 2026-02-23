import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import prisma from '~/lib/prisma';

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_BASE_URL,
    emailAndPassword: {
        enabled: true,
    },
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    plugins: [admin({ defaultRole: 'USER' })],
});
