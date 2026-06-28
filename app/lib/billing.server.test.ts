import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mockLog } = vi.hoisted(() => ({
    mockLog: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        exception: vi.fn(),
    },
}));

vi.mock('~/lib/env.server', () => ({
    env: {
        // No STRIPE_SECRET_KEY: exercises the stub (console fallback) path.
        STRIPE_SECRET_KEY: undefined,
        STRIPE_WEBHOOK_SECRET: undefined,
        STRIPE_PRICE_ID: 'price_test',
    },
}));

vi.mock('~/lib/logger.server', () => ({ log: mockLog }));

import {
    isBillingEnabled,
    createCheckoutSession,
    createBillingPortalSession,
    constructWebhookEvent,
} from './billing.server';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('billing.server (stub mode)', () => {
    it('reports billing as disabled without a STRIPE_SECRET_KEY', () => {
        expect(isBillingEnabled).toBe(false);
    });

    it('returns a stub checkout session pointing at the success URL', async () => {
        const session = await createCheckoutSession({
            userId: 'user_1',
            successUrl: 'https://app.test/billing/success',
            cancelUrl: 'https://app.test/billing/cancel',
        });

        expect(session.id).toMatch(/^cs_stub_/);
        expect(session.url).toBe('https://app.test/billing/success');
        expect(mockLog.info).toHaveBeenCalledWith(
            'billing_stub_checkout',
            expect.objectContaining({ userId: 'user_1' }),
        );
    });

    it('returns a stub portal session pointing at the return URL', async () => {
        const session = await createBillingPortalSession({
            customerId: 'cus_1',
            returnUrl: 'https://app.test/settings',
        });

        expect(session.url).toBe('https://app.test/settings');
        expect(mockLog.info).toHaveBeenCalledWith(
            'billing_stub_portal',
            expect.objectContaining({ customerId: 'cus_1' }),
        );
    });

    it('parses webhook events without signature verification in stub mode', () => {
        const event = constructWebhookEvent(
            JSON.stringify({ type: 'checkout.session.completed', data: {} }),
            null,
        );

        expect(event.type).toBe('checkout.session.completed');
        expect(mockLog.info).toHaveBeenCalledWith(
            'billing_stub_webhook',
            expect.objectContaining({ hasSignature: false }),
        );
    });
});
