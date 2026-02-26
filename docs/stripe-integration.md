# Stripe Integration (Payment Link Tool)

This document captures all Stripe-related changes added to Iridium.

## Summary

The app now supports creating Stripe payment links from the agent via a new tool:

- Tool name: `create_stripe_payment_link`
- Location: `app/voltagent/agents.ts`
- SDK: official `stripe` Node SDK

## Files Changed

- `package.json`
  - Added dependency: `stripe@^20.4.0`
- `bun.lock`
  - Lockfile updated for `stripe`
- `app/voltagent/agents.ts`
  - Added Stripe SDK import and lazy Stripe client initialization
  - Added `create_stripe_payment_link` VoltAgent tool
  - Added Stripe-specific error handling
  - Updated agent instructions and tool registration list
- `README.md`
  - Added `STRIPE_SECRET_KEY` env var in setup section
  - Added the Stripe tool in the Agent Tools table

## Environment Requirements

Required server environment variable:

```env
STRIPE_SECRET_KEY="sk_test_..."
```

Validation now enforced at runtime in `getStripeClient()`:

- `STRIPE_SECRET_KEY` must be present
- Key is trimmed
- Key must start with `sk_`

If invalid or missing, tool execution fails early with a clear error.

## Tool Contract

### Input schema

`create_stripe_payment_link` accepts:

- `productName` (`string`, required, min 1, max 120)
- `unitAmount` (`integer`, required, positive)
- `currency` (`string`, required, 3-letter ISO code, default `usd`, normalized to lowercase)
- `quantity` (`integer`, optional, default `1`, min `1`, max `100`)
- `allowPromotionCodes` (`boolean`, optional, default `false`)
- `afterCompletionUrl` (`string` URL, optional)

### Execution behavior

The tool:

1. Confirms user is authenticated (`options.userId`)
2. Creates a one-time Stripe Payment Link using inline `price_data`
3. Adds metadata:
   - `createdBy: iridium-agent`
   - `createdByUserId: <current user id>`
4. Uses idempotency key:
   - `iridium-payment-link-<toolCallId or fallback>`
5. Returns:
   - `paymentLinkId`
   - `url`
   - echo fields (`productName`, `unitAmount`, `currency`, `quantity`)

## Error Handling

Stripe errors are normalized:

- `StripeAuthenticationError` ->  
  `Stripe authentication failed. Check STRIPE_SECRET_KEY and restart the server.`
- Other Stripe errors ->  
  `Stripe error (<code>)`

Notes:

- Raw Stripe key fragments are no longer propagated in the tool error message.
- If env keys are changed, restart the app process so the server picks up new values.

## Agent Integration Details

The tool is registered directly on the main agent in `app/voltagent/agents.ts`.

No changes were required in:

- `app/routes/api-chat.ts` (existing stream + tool execution path already works)
- `app/routes/thread.tsx` (existing generic tool fallback renderer already works)

## Test Checklist

1. Set `STRIPE_SECRET_KEY` in `.env`
2. Restart dev server
3. In chat, ask:
   - "Create a payment link for X, 200000 cents, USD, quantity 1, no promos"
4. Verify response includes a `url`
5. Open URL and verify product/amount

## Known Failure Mode

If you get `Stripe authentication failed...`:

1. Rotate or regenerate Stripe test key in Stripe Dashboard
2. Update `.env`
3. Restart server
4. Retry tool call

