# 009: Polar Billing

## Status

Accepted

## Context

We needed a billing and subscription management solution that:

- Handles subscriptions and payments
- Integrates with authentication
- Supports multiple pricing tiers
- Provides webhook handling
- Offers good developer experience
- Has reasonable pricing
- Works with our tech stack
- Supports modern payment methods

Billing is critical infrastructure that must be reliable, secure, and easy to integrate.

## Decision

We chose Polar for billing and subscription management, integrated via the Better Auth Polar plugin.

Polar is a modern billing platform built for developers, with first-class support for Better Auth integration.

### Key Features

**Better Auth Integration**:

```typescript
import { polar } from '@polar-sh/better-auth';

export const auth = betterAuth({
    plugins: [
        polar({
            // Configuration
        }),
    ],
});
```

**Subscription Management**: Built-in subscription checking

**Webhook Handling**: Automatic webhook verification

**Type-Safe API**: Full TypeScript support

## Consequences

### Positive

- **Better Auth Plugin**: Seamless integration with authentication
- **Developer Friendly**: Clean API and documentation
- **Modern Platform**: Built for current web standards
- **Type Safety**: Full TypeScript support
- **Webhook Handling**: Automatic verification and processing
- **Reasonable Pricing**: Competitive transaction fees
- **Good Documentation**: Clear integration guides
- **Active Development**: Regular updates and improvements

### Negative

- **Newer Platform**: Smaller community than Stripe
- **Ecosystem**: Fewer integrations than established platforms
- **Limited Features**: Some advanced features missing
- **Less Battle-Tested**: Not as proven at massive scale
- **Support**: Smaller support team

### Neutral

- **Vendor Lock-In**: Switching providers requires migration
- **Payment Processing**: Handles payments and subscriptions
- **Regional Support**: May have limitations in some regions

## Alternatives Considered

### Stripe

**Pros:**

- Industry standard
- Comprehensive features
- Great documentation
- Large ecosystem
- Proven at scale
- Many integrations

**Cons:**

- Complex API
- More setup required
- No Better Auth plugin
- Higher complexity
- More boilerplate

**Why not chosen:** More complex to integrate. Polar's Better Auth plugin provides simpler integration for our needs.

### Paddle

**Pros:**

- Merchant of record
- Handles taxes automatically
- Global payments
- Good for SaaS

**Cons:**

- Higher fees
- Less flexible
- No Better Auth plugin
- Complex integration
- Limited customization

**Why not chosen:** Higher fees and no Better Auth integration. Polar offers better developer experience.

### Lemon Squeezy

**Pros:**

- Merchant of record
- Easy setup
- Good for digital products
- Handles taxes

**Cons:**

- Higher fees
- Limited features
- No Better Auth plugin
- Less developer-focused

**Why not chosen:** Polar provides better integration with our auth system.

### Chargebee

**Pros:**

- Comprehensive features
- Good for complex billing
- Strong subscription management
- Enterprise ready

**Cons:**

- Expensive
- Complex setup
- No Better Auth plugin
- Overkill for simple use cases

**Why not chosen:** Too complex and expensive for our needs.

### Custom Stripe Integration

**Pros:**

- Full control
- Widely supported
- Proven technology
- Extensive features

**Cons:**

- Significant development time
- More code to maintain
- Complex webhook handling
- Security considerations

**Why not chosen:** Polar's Better Auth plugin eliminates boilerplate while using proven payment processing.

## Implementation Details

### Authentication Setup

```typescript
// app/lib/auth.server.ts
import { betterAuth } from 'better-auth';
import { polar } from '@polar-sh/better-auth';

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: 'postgresql',
    }),
    plugins: [
        polar({
            organizationId: process.env.POLAR_ORGANIZATION_ID!,
            accessToken: process.env.POLAR_ACCESS_TOKEN!,
        }),
    ],
});
```

### Checking Subscription

```typescript
import { auth } from '~/lib/auth.server';

export async function loader({ request }: Route.LoaderArgs) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
        throw redirect('/login');
    }

    // Check subscription via Polar plugin
    const subscription = await getSubscription(session.user.id);

    if (!subscription?.active) {
        throw redirect('/pricing');
    }

    return { user: session.user };
}
```

### Webhook Handling

```typescript
// app/routes/api/webhooks/polar.ts
import { Route } from './+types/api.webhooks.polar';
import { polar } from '~/lib/polar.server';

export async function action({ request }: Route.ActionArgs) {
    const payload = await request.text();
    const signature = request.headers.get('polar-signature');

    try {
        const event = polar.webhooks.verify(payload, signature!);

        switch (event.type) {
            case 'subscription.created':
                await handleSubscriptionCreated(event.data);
                break;
            case 'subscription.updated':
                await handleSubscriptionUpdated(event.data);
                break;
            case 'subscription.cancelled':
                await handleSubscriptionCancelled(event.data);
                break;
        }

        return new Response(null, { status: 200 });
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response('Invalid signature', { status: 400 });
    }
}
```

### Creating Checkout

```typescript
import { polar } from '~/lib/polar.server';

export async function action({ request }: Route.ActionArgs) {
    const session = await auth.api.getSession({ headers: request.headers });

    const checkout = await polar.checkouts.create({
        productPriceId: 'price_id',
        customerId: session.user.id,
        successUrl: 'https://yourapp.com/success',
        cancelUrl: 'https://yourapp.com/cancel',
    });

    return redirect(checkout.url);
}
```

### Subscription Status

```typescript
// app/models/subscription.server.ts
import { db } from '~/db.server';

export async function getSubscriptionStatus(userId: string) {
    const subscription = await db.subscription.findFirst({
        where: {
            userId,
            status: 'active',
        },
    });

    return {
        isActive: !!subscription,
        tier: subscription?.tier,
        expiresAt: subscription?.expiresAt,
    };
}

export async function hasFeatureAccess(
    userId: string,
    feature: string,
): Promise<boolean> {
    const subscription = await getSubscriptionStatus(userId);

    if (!subscription.isActive) return false;

    const tierFeatures = {
        free: ['basic'],
        pro: ['basic', 'advanced'],
        enterprise: ['basic', 'advanced', 'premium'],
    };

    return tierFeatures[subscription.tier]?.includes(feature) ?? false;
}
```

## Pricing Tiers

### Implementation

```typescript
// app/lib/pricing.ts
export const pricingTiers = {
    free: {
        name: 'Free',
        price: 0,
        features: ['Feature 1', 'Feature 2'],
    },
    pro: {
        name: 'Pro',
        price: 29,
        features: ['All Free features', 'Feature 3', 'Feature 4'],
    },
    enterprise: {
        name: 'Enterprise',
        price: 99,
        features: ['All Pro features', 'Feature 5', 'Feature 6'],
    },
};

export function canAccessFeature(tier: string, feature: string): boolean {
    // Implementation
}
```

## Webhook Events

Key events to handle:

- `subscription.created` - New subscription
- `subscription.updated` - Subscription changed
- `subscription.cancelled` - Subscription cancelled
- `payment.succeeded` - Payment successful
- `payment.failed` - Payment failed

## Testing

### Development Mode

Use Polar test mode for development:

```env
POLAR_ACCESS_TOKEN=test_...
POLAR_ORGANIZATION_ID=test_org_...
```

### Webhook Testing

Use Polar CLI or tools like ngrok to test webhooks locally:

```bash
polar webhooks forward --url http://localhost:5173/api/webhooks/polar
```

## Security Considerations

- **Verify Webhooks**: Always verify webhook signatures
- **Secure Credentials**: Keep access tokens secret
- **HTTPS Only**: Use HTTPS in production
- **Rate Limiting**: Implement on webhook endpoints
- **Idempotency**: Handle duplicate webhooks
- **Logging**: Log all billing events

## Error Handling

```typescript
try {
  const checkout = await polar.checkouts.create({...});
  return redirect(checkout.url);
} catch (error) {
  if (error instanceof PolarError) {
    // Handle Polar-specific errors
    return { error: error.message };
  }

  // Handle unexpected errors
  throw error;
}
```

## Monitoring

Monitor key metrics:

- Successful checkouts
- Failed payments
- Subscription churn
- Revenue
- Webhook delivery

## Best Practices

1. **Verify Webhooks**: Always verify signatures
2. **Handle Idempotency**: Same event may arrive multiple times
3. **Update Local State**: Sync subscription status
4. **Log Events**: Track all billing events
5. **Error Handling**: Gracefully handle failures
6. **Test Thoroughly**: Test all subscription flows
7. **Monitor Metrics**: Track key business metrics

## Migration Strategy

If migrating from another provider:

1. Export customer data
2. Create equivalent products in Polar
3. Migrate active subscriptions
4. Update webhook endpoints
5. Test thoroughly
6. Gradual rollout

## References

- [Polar Documentation](https://polar.sh/docs)
- [Better Auth Polar Plugin](https://better-auth.com/docs/plugins/polar)
- [Polar API Reference](https://api.polar.sh/docs)
- [Webhook Guide](https://polar.sh/docs/webhooks)
- [Better Auth Decision](./002-better-auth.md)
