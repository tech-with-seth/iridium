# Polar Integration via BetterAuth Plugin

**Status**: Accepted

**Date**: 2025-01-15

## Context

For a SaaS boilerplate, billing and subscription management is critical. Options considered:

1. **Stripe**: Industry standard, complex integration
2. **Paddle**: Merchant of record, handles taxes
3. **LemonSqueezy**: Simple, good DX
4. **Polar**: Developer-first, open-source friendly
5. **Custom billing**: Roll our own

Requirements:
- Subscriptions and one-time payments
- Usage-based billing support
- Customer portal for self-service
- Webhook handling
- Integration with auth system
- Good developer experience

Key Decision Point: How to integrate with authentication?
- Option A: Separate billing service, sync users manually
- Option B: BetterAuth plugin (tight integration)

## Decision

Use **Polar.sh** for billing, integrated via the **BetterAuth Polar Plugin** (`@polar-sh/better-auth`).

This approach provides:
- Automatic customer creation on signup
- Unified auth + billing state
- Client methods on `authClient` for checkout, portal, etc.
- Server-side webhook handling in BetterAuth config
- Type-safe billing operations

Configuration:
```typescript
// app/lib/auth.server.ts
polar({
  createCustomerOnSignUp: true,
  checkout: {
    successUrl: '/payment/success',
    products: [...]
  },
  webhooks: {
    onOrderPaid: async ({ order }) => { /* ... */ }
  }
})
```

## Consequences

### Positive

- **Seamless Integration**: Auth and billing in one flow
- **Auto Customer Sync**: Users automatically become Polar customers
- **Client Methods**: `authClient.checkout()`, `authClient.customer.portal()`
- **Webhook Handling**: BetterAuth handles signature verification
- **Type Safety**: Full TypeScript support across stack
- **Developer Experience**: Polar's API is clean and well-documented
- **Open Source Friendly**: Polar built for open-source projects

### Negative

- **Vendor Lock-in**: Tightly coupled to Polar
- **BetterAuth Dependency**: Requires BetterAuth (can't use with other auth)
- **Young Platform**: Polar is newer than Stripe/Paddle
- **Limited Payment Methods**: Fewer payment options than Stripe
- **Migration Difficulty**: Hard to switch to different billing provider

### Neutral

- **Plugin Approach**: BetterAuth plugin system (not standalone SDK)
- **Customer ID Sync**: Uses `externalId` to link users and customers
- **Webhook Endpoint**: Fixed at `/api/auth/polar/webhooks`
- **Sandbox/Production**: Requires separate Polar accounts
