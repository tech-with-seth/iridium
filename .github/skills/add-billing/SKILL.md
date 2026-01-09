---
name: add-billing
description: Add Polar billing integration for subscriptions and payments. Use when implementing checkout flows, customer portals, or processing payment webhooks.
---

# Add Billing

Adds Polar billing integration for subscriptions, one-time payments, and customer management.

## When to Use

- Implementing checkout flows
- Adding customer portal for subscription management
- Processing payment webhooks
- Checking subscription status
- User asks to "add billing", "payments", or "subscriptions"

## Environment Variables

```bash
POLAR_ACCESS_TOKEN="polar_xxx"      # API access token
POLAR_WEBHOOK_SECRET="whsec_xxx"    # Webhook signing secret
POLAR_SERVER="sandbox"              # "sandbox" or "production"
```

## Architecture

```
User clicks "Buy" → Checkout Route → Polar Checkout
    ↓
Polar processes payment → Webhook → Update Database
    ↓
User returns → Success URL → Dashboard
```

**Never call `polarClient` directly in routes. Use model layer functions.**

## Step 1: Checkout Route

```typescript
// app/routes/checkout.tsx
import type { Route } from './+types/checkout';
import { Checkout } from '@polar-sh/remix';

export const loader = Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    successUrl: `${process.env.BETTER_AUTH_URL}/dashboard?checkout=success`,
    server: process.env.POLAR_SERVER as 'sandbox' | 'production',
});

// Usage: /checkout?products=prod_xxx&customerEmail=user@example.com
```

**Query Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `products` | Yes | Polar product ID |
| `customerExternalId` | No | Your user ID (links to Iridium user) |
| `customerEmail` | No | Pre-fill email |

## Step 2: Customer Portal

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

## Step 3: Webhook Handler

```typescript
// app/routes/api/webhooks/polar.ts
import { Webhooks } from '@polar-sh/remix';
import { updateUserSubscription } from '~/models/user.server';

export const action = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

    onOrderPaid: async (payload) => {
        const { customer, product } = payload.data;

        if (customer?.externalId) {
            await updateUserSubscription(customer.externalId, {
                polarCustomerId: customer.id,
                productId: product?.id,
                status: 'active',
            });
        }
    },

    onSubscriptionCanceled: async (payload) => {
        const { customer } = payload.data;

        if (customer?.externalId) {
            await updateUserSubscription(customer.externalId, {
                status: 'canceled',
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

## Step 4: Model Layer

```typescript
// app/models/polar.server.ts
import { polarClient } from '~/lib/polar';

export function getProducts() {
    return polarClient.products.list({
        organizationId: null,
        isArchived: false,
    });
}

export function getCustomerByExternalId(userId: string) {
    return polarClient.customers.list({
        query: userId,
        limit: 1,
    });
}

export function getCustomerSubscriptions(customerId: string) {
    return polarClient.subscriptions.list({
        customerId,
        active: true,
    });
}
```

## Step 5: Check Subscription Status

```typescript
// app/models/subscription.server.ts
import { prisma } from '~/db.server';
import { getCustomerSubscriptions } from '~/models/polar.server';

export async function hasActiveSubscription(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { polarCustomerId: true },
    });

    if (!user?.polarCustomerId) return false;

    try {
        const subscriptions = await getCustomerSubscriptions(user.polarCustomerId);
        return subscriptions.result.items.length > 0;
    } catch {
        return false;
    }
}
```

## Linking Checkout to User

```tsx
import { href } from 'react-router';

<a
    href={href('/checkout', {
        products: product.id,
        customerExternalId: user.id,
        customerEmail: user.email,
    })}
    className="btn btn-primary"
>
    Buy {product.name}
</a>
```

## Register Routes

```typescript
// app/routes.ts
export default [
    route(Paths.CHECKOUT, 'routes/checkout.tsx'),

    layout('routes/authenticated.tsx', [
        route(Paths.PORTAL, 'routes/portal.tsx'),
    ]),

    ...prefix(Paths.API, [
        ...prefix('webhooks', [
            route('polar', 'routes/api/webhooks/polar.ts'),
        ]),
    ]),
] satisfies RouteConfig;
```

## Webhook Events

| Event | Use Case |
|-------|----------|
| `onOrderPaid` | Grant access |
| `onSubscriptionActive` | Grant access |
| `onSubscriptionCanceled` | Grace period |
| `onSubscriptionRevoked` | Revoke access |
| `onCustomerCreated` | Sync to database |

## Testing

```bash
# Use sandbox mode
POLAR_SERVER="sandbox"

# Forward webhooks locally
polar webhooks forward --url http://localhost:5173/api/webhooks/polar
```

## Anti-Patterns

- Calling `polarClient` directly in routes
- Not linking checkout to user via `customerExternalId`
- Missing webhook error handling
- Not validating webhook signatures

## Full Reference

See `.github/instructions/polar.instructions.md` for comprehensive documentation.
