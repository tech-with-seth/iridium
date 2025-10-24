# PostHog Feature Flags

## Overview

Feature flags enable you to toggle features for specific users or cohorts, perform gradual rollouts, run A/B tests, and quickly disable problematic features in production. This project uses PostHog for both client-side and server-side feature flag evaluation.

## When to Use Feature Flags

Use feature flags when you need to:

- ✅ Test new features with a subset of users before full rollout
- ✅ Perform gradual rollouts (canary releases) starting at 5-10% of users
- ✅ Show different UI variations for A/B testing and experiments
- ✅ Gate beta features for specific user groups or email addresses
- ✅ Quickly disable problematic features without deploying code
- ✅ Show/hide features based on user properties (location, plan, etc.)
- ✅ Display one-time popups or announcements
- ✅ Control access to premium features based on subscription status

## Architecture: Client vs Server-Side Evaluation

### Client-Side Feature Flags

**When to use:**

- UI variations and component visibility
- Features that can briefly "flicker" during load
- Non-critical feature toggles
- Simpler implementation with automatic hydration

**How it works:**

1. PostHog loads in browser after hydration
2. Flags evaluated client-side using `posthog.isFeatureEnabled()`
3. React state updates trigger re-render with correct variation

### Server-Side Feature Flags

**When to use:**

- Initial page render requires flag value (prevent flicker)
- SEO-critical content that must be correct on first paint
- Features that affect server-side data fetching
- A/B tests where initial render matters

**How it works:**

1. Flag evaluated in route `loader()` using `posthog-node`
2. Flag value included in loader data
3. Component receives correct value immediately, no flicker

## Implementation Patterns

Use for SEO-critical content or when flicker-free experience is required.

#### Step 1: Evaluate Flag in Loader

```typescript
import type { Route } from './+types/product-page';
import { isFeatureEnabled } from '~/lib/posthog.server';

export async function loader({ request, params }: Route.LoaderArgs) {
    const product = await prisma.product.findUnique({
        where: { id: params.id },
    });

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

#### Step 2: Use Flag in Component

```tsx
import type { Route } from './+types/product-page';
import { Container } from '~/components/Container';

export default function ProductPage({ loaderData }: Route.ComponentProps) {
    const { product, featureFlags } = loaderData;

    return (
        <>
            <title>{product.name} - Iridium</title>

            <Container>
                {featureFlags.showNewLayout ? (
                    <NewProductLayout product={product} />
                ) : (
                    <LegacyProductLayout product={product} />
                )}
            </Container>
        </>
    );
}
```

**Benefits:**

- ✅ No flicker - correct version renders immediately
- ✅ SEO-friendly - search engines see correct content
- ✅ Better user experience - no layout shift
- ✅ Type-safe with loader data

## Server-Side Feature Flag Implementation

The server-side PostHog client is configured in `app/lib/posthog.server.ts`.

### Available Server-Side Functions

```typescript
// Check if feature is enabled for current user
export async function isFeatureEnabled(
    flagName: string,
    request: Request,
): Promise<boolean>;

// Example usage in loader
const showNewFeature = await isFeatureEnabled('new-feature', request);
```

### Implementation Details

The `isFeatureEnabled` function:

1. Extracts user from session cookie
2. Returns `false` if no authenticated user
3. Initializes PostHog Node client
4. Evaluates flag for user's `distinct_id`
5. Shuts down client to prevent memory leaks
6. Returns boolean result

```typescript
// app/lib/posthog.server.ts
export async function isFeatureEnabled(flagName: string, request: Request) {
    const user = await getUserFromSession(request);

    if (!user) {
        return false;
    }

    const posthog = PostHogClient();
    const isEnabled = await posthog.isFeatureEnabled(flagName, user?.id);
    await posthog.shutdown();

    return isEnabled;
}
```

### Server-Side Loader Pattern

```typescript
import type { Route } from './+types/feature-page';
import { isFeatureEnabled } from '~/lib/posthog.server';
import { requireUser } from '~/lib/session.server';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    // Evaluate multiple flags server-side
    const [showBetaUI, enableAdvancedFeatures, useNewAPI] = await Promise.all([
        isFeatureEnabled('beta-ui', request),
        isFeatureEnabled('advanced-features', request),
        isFeatureEnabled('new-api-v2', request)
    ]);

    return {
        user,
        featureFlags: {
            showBetaUI,
            enableAdvancedFeatures,
            useNewAPI
        }
    };
}

export default function FeaturePage({ loaderData }: Route.ComponentProps) {
    const { user, featureFlags } = loaderData;

    return (
        <div>
            {featureFlags.showBetaUI ? <BetaUI /> : <StandardUI />}
            {featureFlags.enableAdvancedFeatures && <AdvancedTools />}
        </div>
    );
}
```

## A/B Testing & Experiments

Use feature flags with multiple variants to run controlled experiments.

### Creating an Experiment

In PostHog dashboard:

1. Create feature flag with variants: `control`, `test-a`, `test-b`
2. Set rollout percentage for each variant
3. Define success metrics (conversion events)
4. Launch experiment

### Basic Experiment Implementation

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function PricingExperiment() {
    const posthog = usePostHog();
    const [variant, setVariant] = useState<string>('control');

    useEffect(() => {
        if (posthog) {
            // Get experiment variant
            const experimentVariant = posthog.getFeatureFlag('pricing-test-q1');
            setVariant(experimentVariant as string);

            // PostHog automatically tracks exposure
            // Manual tracking if needed:
            posthog.capture('$feature_flag_called', {
                $feature_flag: 'pricing-test-q1',
                $feature_flag_response: experimentVariant,
            });
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

### Tracking Conversion Events

```tsx
import { usePostHog } from 'posthog-js/react';

export default function CheckoutButton() {
    const posthog = usePostHog();

    const handleCheckout = () => {
        // Track conversion event for experiment analysis
        posthog?.capture('checkout_initiated', {
            price: 99.99,
            plan: 'pro',
            currency: 'USD',
        });

        // Proceed with checkout
        window.location.href = '/checkout';
    };

    return (
        <button className="btn btn-primary" onClick={handleCheckout}>
            Start Checkout
        </button>
    );
}
```

### Holdout Groups

Create control groups that never see a feature to measure long-term impact.

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function RecommendationEngine() {
    const posthog = usePostHog();
    const [showRecommendations, setShowRecommendations] = useState(true);

    useEffect(() => {
        if (posthog) {
            // 95% see recommendations, 5% holdout group
            const holdoutFlag = posthog.getFeatureFlag(
                'recommendations-holdout',
            );
            const isInHoldout = holdoutFlag === 'holdout';
            setShowRecommendations(!isInHoldout);

            posthog.capture('recommendations_exposure', {
                group: isInHoldout ? 'holdout' : 'treatment',
                timestamp: new Date().toISOString(),
            });
        }
    }, [posthog]);

    return (
        <section>
            <h2 className="text-xl font-bold mb-4">For You</h2>
            {showRecommendations ? (
                <AIRecommendedItems />
            ) : (
                <TrendingItems /> // Holdout sees trending instead
            )}
        </section>
    );
}
```

## Best Practices

### 1. Naming Conventions

Use descriptive, hyphenated names:

```tsx
// ✅ Good - clear and descriptive
posthog.isFeatureEnabled('new-checkout-flow');
posthog.isFeatureEnabled('ai-assistant-beta');
posthog.isFeatureEnabled('regional-promo-us');

// ❌ Bad - vague or confusing
posthog.isFeatureEnabled('flag-123');
posthog.isFeatureEnabled('newFeature');
posthog.isFeatureEnabled('test');
```

### 2. Document Flags in PostHog Dashboard

Always add descriptions in PostHog:

- **Purpose**: What does this flag control?
- **Owner**: Who created/maintains it?
- **Rollout plan**: Timeline for increasing percentage
- **Removal date**: When to clean up after 100% rollout

### 3. Clean Up Old Flags

After a feature reaches 100% rollout:

1. Wait 1-2 weeks to ensure stability
2. Remove flag checks from code
3. Delete flag from PostHog dashboard
4. Document removal in changelog

### 4. Test Flags Locally

Override flags in development:

```tsx
// In browser console during development
posthog.featureFlags.override({
    'new-feature': true,
    'beta-ui': 'test-variant',
});

// Clear overrides
posthog.featureFlags.override({});
```

### 5. Gradual Rollout Strategy

**Recommended percentages:**

1. Start: 5-10% (early detection of issues)
2. After 24hrs: 25% (if no issues)
3. After 48hrs: 50%
4. After 72hrs: 75%
5. After 1 week: 100%

**Monitor between increases:**

- Error rates
- Performance metrics
- User feedback
- Conversion rates

### 6. Server-Side vs Client-Side Decision Tree

**Use server-side when:**

- Feature affects initial render (prevent flicker)
- SEO matters for the content
- Performance-critical (faster evaluation)
- Security-sensitive (don't expose flag logic)

**Use client-side when:**

- UI-only changes
- Flicker is acceptable
- Simpler implementation preferred
- Real-time flag updates needed

### 7. Feature Flag Hygiene

**Prevent flag sprawl:**

- Set expiration dates on all flags
- Review flags monthly
- Archive unused flags
- Document in code comments why flag exists

```tsx
// ✅ Good - documented
// TODO: Remove after Q1 2025 - new checkout fully rolled out
const showNewCheckout = posthog.isFeatureEnabled('new-checkout-v2');

// ❌ Bad - no context
const flag = posthog.isFeatureEnabled('checkout-test');
```

## Debugging Feature Flags

### Check Flag Status

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

export default function DebugFlags() {
    const posthog = usePostHog();

    useEffect(() => {
        if (posthog) {
            // Get all active flags for current user
            const activeFlags = posthog.featureFlags.getFlags();
            console.log('Active feature flags:', activeFlags);

            // Check specific flag
            const isEnabled = posthog.isFeatureEnabled('new-feature');
            console.log('new-feature enabled:', isEnabled);

            // Get user's distinct ID
            const distinctId = posthog.get_distinct_id();
            console.log('PostHog distinct ID:', distinctId);
        }
    }, [posthog]);

    return null;
}
```

### Common Issues

**Flag not evaluating correctly:**

1. Check flag exists in PostHog dashboard
2. Verify flag is enabled (not disabled/archived)
3. Check user properties match targeting rules
4. Confirm user is identified (call `posthog.identify()`)
5. Wait for flags to load (check `posthog.featureFlags.getFlags()`)

**Server-side flag always returns false:**

1. Verify user is authenticated (`getUserFromSession` returns user)
2. Check environment variables are set correctly
3. Ensure flag is enabled for user's cohort/properties
4. Verify PostHog API key has correct permissions

## Related Documentation

- PostHog Analytics: `.github/instructions/posthog.instructions.md`
- React Router Patterns: `.github/instructions/react-router.instructions.md`
- Component Patterns: `.github/instructions/component-patterns.instructions.md`

## Additional Resources

- **PostHog Feature Flags Docs**: https://posthog.com/docs/feature-flags
- **Feature Flag Best Practices**: https://posthog.com/docs/feature-flags/best-practices
- **A/B Testing Guide**: https://posthog.com/docs/experiments
- **PostHog Node SDK**: https://posthog.com/docs/libraries/node
