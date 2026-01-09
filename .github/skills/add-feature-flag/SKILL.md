---
name: add-feature-flag
description: Add PostHog feature flags for gradual rollouts, A/B tests, or beta features. Use when implementing feature toggles, experiments, or canary releases.
---

# Add Feature Flag

## When to Use

- Gradual feature rollouts (canary releases)
- A/B testing and experiments
- Beta feature gating
- Quick feature kill switches

## Server vs Client

| Use Server-Side When | Use Client-Side When |
|---------------------|---------------------|
| SEO-critical content | UI-only changes |
| No flicker required | Flicker acceptable |
| Performance critical | Simpler implementation |

## Server-Side (Flicker-Free)

```typescript
import type { Route } from './+types/product-page';
import { isFeatureEnabled } from '~/lib/posthog.server';

export async function loader({ request }: Route.LoaderArgs) {
    const showNewLayout = await isFeatureEnabled('new-product-layout', request);

    return {
        featureFlags: { showNewLayout },
    };
}
```

```tsx
export default function ProductPage({ loaderData }: Route.ComponentProps) {
    const { featureFlags } = loaderData;

    return featureFlags.showNewLayout ? <NewLayout /> : <LegacyLayout />;
}
```

## Client-Side (Simpler)

```tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function FeatureComponent() {
    const posthog = usePostHog();
    const [showFeature, setShowFeature] = useState(false);

    useEffect(() => {
        if (posthog) {
            setShowFeature(posthog.isFeatureEnabled('new-feature') ?? false);
        }
    }, [posthog]);

    return showFeature ? <NewFeature /> : <LegacyFeature />;
}
```

## Naming

```tsx
// Good
'new-checkout-flow'
'ai-assistant-beta'

// Bad
'flag-123'
'test'
```

## Checklist

1. [ ] Choose server or client-side based on requirements
2. [ ] Use descriptive flag name
3. [ ] Add TODO comment for cleanup date
4. [ ] Track conversion events if A/B testing

## Full Reference

See `.github/instructions/feature-flags.instructions.md` for:
- A/B testing with variants
- Gradual rollout strategy
- Debug locally
- Tracking conversion events
