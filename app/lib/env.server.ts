import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.url({ message: 'DATABASE_URL must be a valid URL' }),
    BETTER_AUTH_SECRET: z
        .string()
        .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
    BETTER_AUTH_BASE_URL: z.url(),
    ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
    VOLTAGENT_DATABASE_URL: z.url({
        message: 'VOLTAGENT_DATABASE_URL must be a valid URL',
    }),
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
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
