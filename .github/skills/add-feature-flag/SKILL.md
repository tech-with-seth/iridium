---
name: add-feature-flag
description: Add PostHog feature flags for gradual rollouts, A/B tests, or beta features. Use when implementing feature toggles, experiments, or canary releases.
---

# Add Feature Flag

Adds PostHog feature flags for controlling feature rollout, running experiments, and toggling functionality.

## When to Use

- Gradual feature rollouts (canary releases)
- A/B testing and experiments
- Beta feature gating
- Quick feature kill switches
- User asks to "add feature flag", "A/B test", or "gradual rollout"

## Server-Side (Flicker-Free)

Use server-side evaluation when initial render matters.

### Step 1: Evaluate in Loader

```typescript
import type { Route } from './+types/product-page';
import { isFeatureEnabled } from '~/lib/posthog.server';

export async function loader({ request, params }: Route.LoaderArgs) {
    const product = await getProduct(params.id);

    // Evaluate feature flag server-side
    const showNewLayout = await isFeatureEnabled('new-product-layout', request);

    return {
        product,
        featureFlags: {
            showNewLayout,
        },
    };
}
```

### Step 2: Use in Component

```tsx
import type { Route } from './+types/product-page';

export default function ProductPage({ loaderData }: Route.ComponentProps) {
    const { product, featureFlags } = loaderData;

    return (
        <Container>
            {featureFlags.showNewLayout ? (
                <NewProductLayout product={product} />
            ) : (
                <LegacyProductLayout product={product} />
            )}
        </Container>
    );
}
```

### Multiple Flags in Parallel

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const [showBetaUI, enableAdvanced, useNewAPI] = await Promise.all([
        isFeatureEnabled('beta-ui', request),
        isFeatureEnabled('advanced-features', request),
        isFeatureEnabled('new-api-v2', request)
    ]);

    return {
        featureFlags: { showBetaUI, enableAdvanced, useNewAPI }
    };
}
```

## Client-Side (Simpler)

Use for UI-only changes where brief flicker is acceptable.

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function FeatureComponent() {
    const posthog = usePostHog();
    const [showFeature, setShowFeature] = useState(false);

    useEffect(() => {
        if (posthog) {
            const isEnabled = posthog.isFeatureEnabled('new-feature');
            setShowFeature(isEnabled ?? false);
        }
    }, [posthog]);

    return showFeature ? <NewFeature /> : <LegacyFeature />;
}
```

## A/B Testing with Variants

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function PricingExperiment() {
    const posthog = usePostHog();
    const [variant, setVariant] = useState<string>('control');

    useEffect(() => {
        if (posthog) {
            const experimentVariant = posthog.getFeatureFlag('pricing-test');
            setVariant(experimentVariant as string);
        }
    }, [posthog]);

    return (
        <div>
            {variant === 'control' && <StandardPricing />}
            {variant === 'simplified' && <SimplifiedPricing />}
            {variant === 'value-based' && <ValueBasedPricing />}
        </div>
    );
}
```

## Tracking Conversion Events

```tsx
import { usePostHog } from 'posthog-js/react';

function CheckoutButton() {
    const posthog = usePostHog();

    const handleCheckout = () => {
        posthog?.capture('checkout_initiated', {
            price: 99.99,
            plan: 'pro',
        });
    };

    return <button onClick={handleCheckout}>Start Checkout</button>;
}
```

## When to Use Server vs Client

| Use Server-Side When | Use Client-Side When |
|---------------------|---------------------|
| SEO-critical content | UI-only changes |
| No flicker required | Flicker acceptable |
| Performance critical | Simpler implementation |
| Security-sensitive | Real-time updates needed |

## Naming Conventions

```tsx
// Good - clear and descriptive
'new-checkout-flow'
'ai-assistant-beta'
'regional-promo-us'

// Bad - vague or confusing
'flag-123'
'newFeature'
'test'
```

## Gradual Rollout Strategy

1. Start: 5-10% (early detection)
2. After 24hrs: 25% (if no issues)
3. After 48hrs: 50%
4. After 72hrs: 75%
5. After 1 week: 100%

## Debug Locally

```tsx
// In browser console
posthog.featureFlags.override({
    'new-feature': true,
    'beta-ui': 'test-variant',
});

// Clear overrides
posthog.featureFlags.override({});
```

## Cleanup Reminder

```tsx
// Document flags for cleanup
// TODO: Remove after Q1 2025 - new checkout fully rolled out
const showNewCheckout = posthog.isFeatureEnabled('new-checkout-v2');
```

## Anti-Patterns

- Using vague flag names (`flag-123`, `test`)
- Not documenting flag purpose
- Leaving stale flags in codebase
- Using client-side for SEO content
- Not tracking experiment exposure

## Full Reference

See `.github/instructions/feature-flags.instructions.md` for comprehensive documentation.
