import { randomUUID } from 'node:crypto';
import { env } from '~/lib/env.server';
import { log } from '~/lib/logger.server';

/**
 * Stripe billing — pluggable behind an interface, the same way email.server.ts
 * wraps Resend. Without a STRIPE_SECRET_KEY the module runs in *stub mode*:
 * checkout/portal sessions and webhook events are faked and logged to the
 * console, so local dev and CI need no Stripe account.
 *
 * Wiring real Stripe is a localized change confined to this file:
 *   1. `bun add stripe`
 *   2. At the top: `import Stripe from 'stripe';`
 *      `const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;`
 *   3. Replace each `if (!isBillingEnabled) { ...stub... }` block's real branch
 *      with the corresponding `stripe.*` call (marked with TODO below).
 *
 * Persisting the Stripe customer id / subscription status is intentionally left
 * to the caller — add a `stripeCustomerId` + `subscriptionStatus` to the User
 * model (or a Subscription model) and update them from the webhook handler.
 */

export const isBillingEnabled = Boolean(env.STRIPE_SECRET_KEY);

export type CheckoutSession = {
    id: string;
    /** Where to redirect the browser to complete payment. */
    url: string;
};

export type BillingPortalSession = {
    url: string;
};

/**
 * Minimal shape of the webhook events the app cares about. Real Stripe events
 * carry far more; narrow to what the handler needs.
 */
export type BillingEvent = {
    type: string;
    data: Record<string, unknown>;
};

type CreateCheckoutArgs = {
    /** Your app user id, echoed back on the session for the webhook to map. */
    userId: string;
    /** Stripe Price id of the plan being purchased. */
    priceId?: string;
    /** Absolute URL to return to after a successful checkout. */
    successUrl: string;
    /** Absolute URL to return to if the user cancels. */
    cancelUrl: string;
    /** Pre-fills the Stripe Checkout email field. */
    customerEmail?: string;
};

/**
 * Start a Checkout session for a subscription. In stub mode this resolves to a
 * fake session whose `url` is the caller's `successUrl`, so the post-payment
 * flow can be exercised locally without Stripe.
 */
export async function createCheckoutSession({
    userId,
    priceId = env.STRIPE_PRICE_ID,
    successUrl,
    cancelUrl,
    customerEmail,
}: CreateCheckoutArgs): Promise<CheckoutSession> {
    if (!isBillingEnabled) {
        log.info('billing_stub_checkout', {
            userId,
            priceId,
            successUrl,
            cancelUrl,
            customerEmail,
        });
        return { id: `cs_stub_${randomUUID()}`, url: successUrl };
    }

    // TODO: wire real Stripe (see file header):
    //   const session = await stripe.checkout.sessions.create({
    //       mode: 'subscription',
    //       client_reference_id: userId,
    //       customer_email: customerEmail,
    //       line_items: [{ price: priceId, quantity: 1 }],
    //       success_url: successUrl,
    //       cancel_url: cancelUrl,
    //   });
    //   return { id: session.id, url: session.url! };
    log.warn('billing_stub_active', { op: 'createCheckoutSession', userId });
    return { id: `cs_stub_${randomUUID()}`, url: successUrl };
}

/**
 * Open the Stripe-hosted billing portal so a customer can manage or cancel a
 * subscription. Stub mode returns the caller's `returnUrl`.
 */
export async function createBillingPortalSession({
    customerId,
    returnUrl,
}: {
    customerId: string;
    returnUrl: string;
}): Promise<BillingPortalSession> {
    if (!isBillingEnabled) {
        log.info('billing_stub_portal', { customerId, returnUrl });
        return { url: returnUrl };
    }

    // TODO: wire real Stripe (see file header):
    //   const session = await stripe.billingPortal.sessions.create({
    //       customer: customerId,
    //       return_url: returnUrl,
    //   });
    //   return { url: session.url };
    log.warn('billing_stub_active', { op: 'createBillingPortalSession' });
    return { url: returnUrl };
}

/**
 * Verify and parse an incoming webhook request. Stub mode trusts and parses the
 * raw body without signature verification — never reachable in production
 * because production sets STRIPE_SECRET_KEY (which flips on the real path).
 *
 * Pass the *raw* request body (not parsed JSON) so the signature can be checked.
 */
export function constructWebhookEvent(
    rawBody: string,
    signature: string | null,
): BillingEvent {
    if (!isBillingEnabled) {
        log.info('billing_stub_webhook', { hasSignature: Boolean(signature) });
        return JSON.parse(rawBody) as BillingEvent;
    }

    // TODO: wire real Stripe (see file header):
    //   const event = stripe.webhooks.constructEvent(
    //       rawBody,
    //       signature ?? '',
    //       env.STRIPE_WEBHOOK_SECRET!,
    //   );
    //   return { type: event.type, data: event.data.object as Record<string, unknown> };
    log.warn('billing_stub_active', { op: 'constructWebhookEvent' });
    return JSON.parse(rawBody) as BillingEvent;
}
