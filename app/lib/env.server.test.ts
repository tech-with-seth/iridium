import { describe, it, expect } from 'vitest';
import { computeEnvWarnings } from './env.server';

// A fully-configured env; individual tests override fields to simulate gaps.
const base = {
    DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
    BETTER_AUTH_SECRET: 'x'.repeat(32),
    BETTER_AUTH_BASE_URL: 'http://localhost:5173',
    BETTER_AUTH_TRUSTED_ORIGINS: [],
    ANTHROPIC_API_KEY: 'sk-ant-test',
    RESEND_API_KEY: 're_test',
    EMAIL_FROM: 'Test <test@example.com>',
    GITHUB_CLIENT_ID: 'gh-id',
    GITHUB_CLIENT_SECRET: 'gh-secret',
    GOOGLE_CLIENT_ID: 'g-id',
    GOOGLE_CLIENT_SECRET: 'g-secret',
    TRIGGER_SECRET_KEY: 'tr_test',
    STRIPE_SECRET_KEY: 'sk_test',
    STRIPE_WEBHOOK_SECRET: 'whsec_test',
    STRIPE_PRICE_ID: 'price_test',
    VOLTAGENT_DATABASE_URL: 'postgresql://u:p@localhost:5433/db',
    NODE_ENV: 'test' as const,
    DISABLE_AUTH_RATE_LIMIT: false,
    E2E_TEST_HOOKS: false,
} satisfies Parameters<typeof computeEnvWarnings>[0];

describe('computeEnvWarnings', () => {
    it('returns no warnings when everything is configured', () => {
        expect(computeEnvWarnings(base, [])).toEqual([]);
    });

    it('flags a placeholdered infra var as an error', () => {
        const warnings = computeEnvWarnings(base, ['DATABASE_URL']);
        const dbWarning = warnings.find((w) => w.key === 'DATABASE_URL');
        expect(dbWarning?.severity).toBe('error');
        expect(dbWarning?.effect).toMatch(/database/i);
    });

    it('reports every placeholdered infra var as an error', () => {
        const warnings = computeEnvWarnings(base, [
            'DATABASE_URL',
            'BETTER_AUTH_SECRET',
        ]);
        expect(warnings.map((w) => w.key)).toEqual([
            'DATABASE_URL',
            'BETTER_AUTH_SECRET',
        ]);
        expect(warnings.every((w) => w.severity === 'error')).toBe(true);
    });

    it('does not surface unset optional feature keys', () => {
        const warnings = computeEnvWarnings(
            {
                ...base,
                ANTHROPIC_API_KEY: undefined,
                STRIPE_SECRET_KEY: undefined,
                RESEND_API_KEY: undefined,
                GITHUB_CLIENT_SECRET: undefined,
                GOOGLE_CLIENT_ID: undefined,
                TRIGGER_SECRET_KEY: undefined,
            },
            [],
        );
        expect(warnings).toEqual([]);
    });
});
