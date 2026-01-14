---
applyTo: 'app/models/polar*.ts,app/routes/api/webhooks/**/*'
---

# Polar Integration

Polar provides billing and subscription management for Iridium. This guide covers the complete integration pattern.

> **Note:** Polar is an optional integration. The starter works without it. See `.env.example` for required environment variables.

## Quick Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| Client Singleton | `app/lib/polar.ts` | Polar SDK instance |
| Model Layer | `app/models/polar.server.ts` | Product/customer operations |
| Webhook Handler | `app/routes/api/webhooks/polar.ts` | Event processing |
| Checkout Route | `app/routes/checkout.tsx` | Payment flow |
| Constants | `app/constants/index.ts` | PostHog event names |

## Environment Variables

```bash
# Required for Polar integration
POLAR_ACCESS_TOKEN="polar_xxx"      # API access token from Polar dashboard
POLAR_WEBHOOK_SECRET="whsec_xxx"    # Webhook signing secret
POLAR_SERVER="sandbox"              # "sandbox" for testing, "production" for live

# Optional
ADMIN_EMAIL="admin@example.com"     # Receives webhook notifications
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Polar Flow                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User clicks "Buy" → Checkout Route → Polar Checkout        │
│                                                             │
│  Polar processes payment → Webhook → Update User/DB         │
│                                                             │
│  User returns → Success URL → Dashboard with new access     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 1. Client Singleton

The Polar client is initialized once and reused across the application.

```typescript
// app/lib/polar.ts
import { Polar } from '@polar-sh/sdk';

export const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    server: process.env.POLAR_SERVER as 'sandbox' | 'production',
});
```

**Usage:**

```typescript
import { polarClient } from '~/lib/polar';

// List products
const products = await polarClient.products.list({
    organizationId: null,
    isArchived: false,
});
```

## 2. Model Layer Pattern

All Polar operations go through the model layer (never call `polarClient` directly in routes).

```typescript
// app/models/polar.server.ts
import { polarClient } from '~/lib/polar';

/**
 * Get all active products from Polar
 */
export function getProducts() {
    return polarClient.products.list({
        organizationId: null,
        isArchived: false,
    });
}

/**
 * Get a customer by their Iridium user ID (external ID)
 * @param userId - The Iridium user ID stored as external_id in Polar
 */
export function getCustomerByExternalId(userId: string) {
    return polarClient.customers.list({
        query: userId,
        limit: 1,
    });
}

/**
 * Get detailed product information
 * @param id - Polar product ID
 */
export function getProductDetails(id: string) {
    return polarClient.products.get({ id });
}

/**
 * Get customer's active subscriptions
 * @param customerId - Polar customer ID
 */
export async function getCustomerSubscriptions(customerId: string) {
    return polarClient.subscriptions.list({
        customerId,
        active: true,
    });
}

/**
 * Cancel a subscription
 * @param subscriptionId - Polar subscription ID
 */
export async function cancelSubscription(subscriptionId: string) {
    return polarClient.subscriptions.update({
        id: subscriptionId,
        body: { cancelAtPeriodEnd: true },
    });
}
```

## 3. Checkout Route

Use the `@polar-sh/remix` package for checkout handling.

```typescript
// app/routes/checkout.tsx
import type { Route } from './+types/checkout';
import { Checkout } from '@polar-sh/remix';

export const loader = Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    successUrl: `${process.env.BETTER_AUTH_URL}/dashboard?checkout=success`,
    server: process.env.POLAR_SERVER as 'sandbox' | 'production',
    theme: 'light', // or 'dark', or omit for system preference
});

// Usage: /checkout?products=prod_xxx&customerEmail=user@example.com
```

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `products` | Yes | Polar product ID |
| `customerId` | No | Polar customer ID |
| `customerExternalId` | No | Your user ID (links to Iridium user) |
| `customerEmail` | No | Pre-fill email |
| `customerName` | No | Pre-fill name |
| `metadata` | No | URL-encoded JSON for custom data |

**Linking checkout to authenticated user:**

```tsx
// In a protected route
import { href } from 'react-router';

export default function PricingPage({ loaderData }: Route.ComponentProps) {
    const { user, products } = loaderData;

    return (
        <div>
            {products.map((product) => (
                <a
                    key={product.id}
                    href={href('/checkout', {
                        products: product.id,
                        customerExternalId: user.id,
                        customerEmail: user.email,
                    })}
                    className="btn btn-primary"
                >
                    Buy {product.name}
                </a>
            ))}
        </div>
    );
}
```

## 4. Customer Portal

Provide a self-service portal for subscription management.

```typescript
// app/routes/portal.tsx
import type { Route } from './+types/portal';
import { CustomerPortal } from '@polar-sh/remix';
import { requireUser } from '~/lib/session.server';
import { getCustomerByExternalId } from '~/models/polar.server';

export const loader = CustomerPortal({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    getCustomerId: async (args) => {
        const user = await requireUser(args.request);
        const customers = await getCustomerByExternalId(user.id);

        if (customers.result.items.length === 0) {
            throw new Response('Customer not found', { status: 404 });
        }

        return customers.result.items[0].id;
    },
    server: process.env.POLAR_SERVER as 'sandbox' | 'production',
});
```

## 5. Webhook Handler

Process Polar events with PostHog analytics and email notifications.

```typescript
// app/routes/api/webhooks/polar.ts
import { Webhooks } from '@polar-sh/remix';
import { PostHogEventNames } from '~/constants';
import { getPostHogClient } from '~/lib/posthog';
import { sendEmail } from '~/models/email.server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const postHogClient = getPostHogClient();

export const action = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

    // Catch-all handler for logging
    onPayload: async (payload) => {
        postHogClient?.capture({
            distinctId: 'system',
            event: PostHogEventNames.POLAR_PAYLOAD_RECEIVED,
            properties: { payload },
        });
    },

    // Handle successful payment
    onOrderPaid: async (payload) => {
        const { id, customer, product } = payload.data;

        postHogClient?.capture({
            distinctId: customer?.externalId ?? 'system',
            event: PostHogEventNames.POLAR_ORDER_PAID,
            properties: {
                orderId: id,
                productId: product?.id,
                amount: payload.data.amount,
            },
        });

        // Update user's subscription status in database
        if (customer?.externalId) {
            await updateUserSubscription(customer.externalId, {
                polarCustomerId: customer.id,
                productId: product?.id,
                status: 'active',
            });
        }

        // Notify admin
        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: 'Polar: Order Paid',
                text: `Order ${id} has been paid.`,
            });
        } catch (error) {
            postHogClient?.captureException(error as Error, 'system', {
                context: PostHogEventNames.POLAR_WEBHOOK_ERROR_ON_ORDER_PAID,
            });
        }
    },

    // Handle subscription lifecycle
    onSubscriptionActive: async (payload) => {
        const { customer } = payload.data;

        if (customer?.externalId) {
            await updateUserSubscription(customer.externalId, {
                status: 'active',
                currentPeriodEnd: payload.data.currentPeriodEnd,
            });
        }
    },

    onSubscriptionCanceled: async (payload) => {
        const { customer } = payload.data;

        if (customer?.externalId) {
            await updateUserSubscription(customer.externalId, {
                status: 'canceled',
                canceledAt: new Date(),
            });
        }
    },

    onSubscriptionRevoked: async (payload) => {
        const { customer } = payload.data;

        if (customer?.externalId) {
            await updateUserSubscription(customer.externalId, {
                status: 'revoked',
                polarCustomerId: null,
            });
        }
    },
});
```

## 6. Route Registration

Register Polar routes in `app/routes.ts`:

```typescript
// app/routes.ts
import { type RouteConfig, route, prefix, layout } from '@react-router/dev/routes';
import { Paths } from './constants';

export default [
    // ... other routes

    // Checkout (public, but uses customerExternalId to link)
    route(Paths.CHECKOUT, 'routes/checkout.tsx'),

    // Customer portal (protected)
    layout('routes/authenticated.tsx', [
        route(Paths.PORTAL, 'routes/portal.tsx'),
    ]),

    // Webhooks (no auth, verified by signature)
    ...prefix(Paths.API, [
        ...prefix('webhooks', [
            route('polar', 'routes/api/webhooks/polar.ts'),
        ]),
    ]),
] satisfies RouteConfig;
```

## 7. Webhook Event Types

| Event | When Triggered | Common Use Case |
|-------|---------------|-----------------|
| `onCheckoutCreated` | Checkout session started | Analytics |
| `onCheckoutUpdated` | Checkout session updated | Analytics |
| `onOrderCreated` | Order placed (before payment) | Pending state |
| `onOrderPaid` | Payment successful | Grant access |
| `onOrderRefunded` | Refund issued | Revoke access |
| `onSubscriptionCreated` | New subscription | Welcome email |
| `onSubscriptionActive` | Subscription became active | Grant access |
| `onSubscriptionCanceled` | User canceled | Grace period |
| `onSubscriptionRevoked` | Subscription ended | Revoke access |
| `onSubscriptionUncanceled` | Cancellation reversed | Restore access |
| `onCustomerCreated` | New customer record | Sync to database |
| `onCustomerStateChanged` | Customer status changed | Update database |

## 8. Error Handling

Always wrap webhook handlers with try-catch and log to PostHog:

```typescript
onOrderPaid: async (payload) => {
    try {
        // Process the order
        await processOrder(payload.data);

        // Send confirmation email
        await sendEmail({
            to: payload.data.customer?.email,
            subject: 'Order Confirmed',
            react: <OrderConfirmationEmail order={payload.data} />,
        });
    } catch (error) {
        // Log to PostHog for debugging
        postHogClient?.captureException(error as Error, 'system', {
            context: 'polar_webhook_order_paid',
            orderId: payload.data.id,
        });

        // Re-throw to signal Polar to retry
        throw error;
    }
}
```

## 9. Testing Webhooks Locally

Use the Polar CLI to forward webhooks to your local dev server:

```bash
# Install Polar CLI
npm install -g @polar-sh/cli

# Forward webhooks to local server
polar webhooks forward --url http://localhost:5173/api/webhooks/polar
```

Or use ngrok:

```bash
ngrok http 5173
# Update Polar dashboard with ngrok URL
```

## 10. Checking Subscription Status

Create a helper to check if a user has an active subscription:

```typescript
// app/models/subscription.server.ts
import { prisma } from '~/db.server';
import { getCustomerSubscriptions } from '~/models/polar.server';

export async function hasActiveSubscription(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { polarCustomerId: true },
    });

    if (!user?.polarCustomerId) {
        return false;
    }

    try {
        const subscriptions = await getCustomerSubscriptions(user.polarCustomerId);
        return subscriptions.result.items.length > 0;
    } catch {
        return false;
    }
}
```

**Usage in middleware:**

```typescript
// app/middleware/subscription.ts
import { redirect } from 'react-router';
import { hasActiveSubscription } from '~/models/subscription.server';

export async function requireSubscription(request: Request, userId: string) {
    const hasAccess = await hasActiveSubscription(userId);

    if (!hasAccess) {
        throw redirect('/pricing?reason=subscription_required');
    }
}
```

## 11. Database Schema

Add Polar fields to your User model:

```prisma
// prisma/schema.prisma
model User {
    id               String    @id @default(cuid())
    email            String    @unique
    // ... other fields

    // Polar integration
    polarCustomerId  String?   @unique
    subscriptionStatus String? @default("none") // none, active, canceled, revoked
    subscriptionEndDate DateTime?

    @@index([polarCustomerId])
}
```

## Troubleshooting

### Webhook not receiving events

1. Check `POLAR_WEBHOOK_SECRET` matches Polar dashboard
2. Verify route is registered: `GET /api/webhooks/polar` should 405
3. Check Polar dashboard for failed webhook deliveries
4. Ensure server is accessible (not localhost in production)

### Customer not linked to user

1. Pass `customerExternalId` in checkout URL
2. Verify `getCustomerByExternalId` uses correct field
3. Check Polar customer's `external_id` field

### Subscription status not updating

1. Check webhook handler is processing events
2. Verify PostHog events are being captured
3. Check database for `polarCustomerId` presence
4. Test with Polar CLI: `polar webhooks test`

### Sandbox vs Production

1. Use `POLAR_SERVER=sandbox` for testing
2. Sandbox and production have separate API keys
3. Switch to `production` only when ready to accept real payments

## Further Reading

- [Polar Documentation](https://docs.polar.sh)
- [Polar Remix Adapter](https://docs.polar.sh/developers/guides/remix)
- [ADR: Polar Billing](../docs/decisions/009-polar-billing.md)
- [PostHog Error Tracking](./.github/instructions/error-tracking.instructions.md)
