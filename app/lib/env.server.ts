import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.url({ message: 'DATABASE_URL must be a valid URL' }),
    BETTER_AUTH_SECRET: z
        .string()
        .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
    BETTER_AUTH_BASE_URL: z.url(),
    /**
     * Comma-separated list of additional trusted origins for Better Auth.
     * BETTER_AUTH_BASE_URL is always trusted; use this for preview deploys,
     * staging hosts, or custom domains served by the same backend.
     */
    BETTER_AUTH_TRUSTED_ORIGINS: z
        .string()
        .optional()
        .transform((value) =>
            value
                ? value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                : [],
        ),
    ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
    VOLTAGENT_DATABASE_URL: z.url({
        message: 'VOLTAGENT_DATABASE_URL must be a valid URL',
    }),
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    /**
     * Disables Better Auth's rate limiter. Intended only for the E2E test
     * server, which creates many sessions quickly; unset everywhere else so
     * dev, CI, and prod keep the production limits.
     */
    DISABLE_AUTH_RATE_LIMIT: z
        .enum(['true', 'false'])
        .optional()
        .transform((value) => value === 'true'),
});

function validateEnv() {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        const formatted = result.error.issues
            .map((i) => `  ✗ ${i.path.join('.')}: ${i.message}`)
            .join('\n');

        console.error(`\n❌ Invalid environment variables:\n${formatted}\n`);
        console.error('→ Copy .env.example to .env and fill in the values.\n');
        process.exit(1);
    }

    return result.data;
}

export const env = validateEnv();
