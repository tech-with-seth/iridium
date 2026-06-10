import { defineConfig } from '@trigger.dev/sdk';
import { prismaExtension } from '@trigger.dev/build/extensions/prisma';

export default defineConfig({
    // Set TRIGGER_PROJECT_REF in .env after creating a project at
    // https://cloud.trigger.dev (or self-hosted). The placeholder keeps the
    // config loadable before then.
    project: process.env.TRIGGER_PROJECT_REF ?? 'proj_replace_me',
    runtime: 'node',
    logLevel: 'log',
    maxDuration: 300,
    retries: {
        enabledInDev: true,
        default: {
            maxAttempts: 3,
            minTimeoutInMs: 1000,
            maxTimeoutInMs: 10000,
            factor: 2,
            randomize: true,
        },
    },
    dirs: ['./trigger'],
    build: {
        extensions: [
            // Modern mode for Prisma 7's `prisma-client` provider + pg
            // adapter: the generated client (app/generated/prisma) is plain
            // TypeScript and bundles like any other source file.
            prismaExtension({
                mode: 'modern',
            }),
        ],
    },
});
