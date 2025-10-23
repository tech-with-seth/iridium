# 008: PostHog Analytics

## Status

Accepted

## Context

We needed an analytics solution that:

- Tracks user behavior and events
- Provides feature flags
- Supports A/B testing
- Works on client and server
- Respects user privacy
- Offers good developer experience
- Can be self-hosted
- Has reasonable pricing

Understanding user behavior and running experiments is crucial for product development. We need analytics that integrate well with our tech stack.

## Decision

We chose PostHog as our product analytics platform.

PostHog is an open-source product analytics platform that provides event tracking, feature flags, session recording, and A/B testing.

### Key Features

**Event Tracking**:

```typescript
posthog.capture('button_clicked', {
    button_name: 'sign_up',
    location: 'homepage',
});
```

**Feature Flags**:

```typescript
const isEnabled = await posthog.isFeatureEnabled('new-dashboard', userId);
```

**User Identification**:

```typescript
posthog.identify(userId, {
    email: user.email,
    plan: 'pro',
});
```

**Server-Side and Client-Side**: Works on both client and server

## Consequences

### Positive

- **Open Source**: Can self-host if needed
- **Complete Platform**: Analytics, feature flags, experiments in one
- **Privacy Focused**: GDPR compliant, data ownership
- **Developer Friendly**: Great API and documentation
- **Real-Time**: Events appear immediately
- **Feature Flags**: No separate service needed
- **Session Recording**: Understand user behavior visually
- **A/B Testing**: Built-in experimentation platform
- **Generous Free Tier**: 1M events per month free

### Negative

- **Newer Platform**: Less mature than Google Analytics
- **Learning Curve**: Need to understand PostHog concepts
- **Cost at Scale**: Can get expensive with high event volume
- **Self-Hosting Complexity**: Requires infrastructure if self-hosted
- **Limited Integrations**: Fewer than established platforms

### Neutral

- **Data Ownership**: Can export all data
- **Cloud or Self-Hosted**: Flexibility in deployment
- **Event-Based Pricing**: Pay for what you use

## Alternatives Considered

### Google Analytics

**Pros:**

- Industry standard
- Free for most use cases
- Extensive documentation
- Wide adoption
- Many integrations

**Cons:**

- Privacy concerns
- Complex interface
- No feature flags
- Third-party data ownership
- Limited developer tools

**Why not chosen:** Privacy concerns and lack of feature flags. PostHog offers more developer-friendly tools.

### Mixpanel

**Pros:**

- Mature platform
- Great analytics
- Good user interface
- Strong retention analysis

**Cons:**

- Expensive at scale
- No feature flags
- Closed source
- No self-hosting option

**Why not chosen:** More expensive and lacks feature flags. PostHog provides more complete solution.

### Amplitude

**Pros:**

- Powerful analytics
- Enterprise features
- Good documentation
- Strong behavioral analysis

**Cons:**

- Expensive
- Complex pricing
- No feature flags
- Closed source

**Why not chosen:** Too expensive for our scale. PostHog offers better value.

### Plausible

**Pros:**

- Privacy-focused
- Simple interface
- Open source
- Lightweight

**Cons:**

- No feature flags
- Basic analytics only
- No user tracking
- Limited events

**Why not chosen:** Too basic. We need feature flags and detailed analytics.

### LaunchDarkly (Feature Flags)

**Pros:**

- Best-in-class feature flags
- Enterprise ready
- Great reliability
- Excellent API

**Cons:**

- Expensive
- Feature flags only
- Need separate analytics
- Closed source

**Why not chosen:** PostHog provides feature flags plus analytics in one platform.

### Split.io (Feature Flags)

**Pros:**

- Strong feature flag platform
- Good experimentation
- Analytics included

**Cons:**

- Expensive
- Closed source
- Complex setup

**Why not chosen:** PostHog offers similar features at better price point.

## Implementation Details

### Server-Side Setup

```typescript
// app/lib/posthog.server.ts
import { PostHog } from 'posthog-node';

const posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
    host: process.env.POSTHOG_HOST,
});

export { posthog };
```

### Client-Side Setup

```typescript
// app/lib/posthog.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
    posthog.init(process.env.POSTHOG_API_KEY!, {
        api_host: process.env.POSTHOG_HOST,
        loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
                posthog.opt_out_capturing();
            }
        },
    });
}

export { posthog };
```

### Tracking Events

```typescript
// Client-side
posthog.capture('page_view', {
    page: '/dashboard',
    referrer: document.referrer,
});

// Server-side
import { posthog } from '~/lib/posthog.server';

export async function action({ request }: Route.ActionArgs) {
    posthog.capture({
        distinctId: userId,
        event: 'form_submitted',
        properties: {
            form: 'contact',
        },
    });
}
```

### Feature Flags

```typescript
// app/models/feature-flags.server.ts
import { posthog } from '~/lib/posthog.server';
import { cache } from '~/lib/cache';

export async function getFeatureFlags(userId: string) {
    const cacheKey = `feature-flags:${userId}`;
    const cached = cache.getKey(cacheKey);

    if (cached) return cached;

    const flags = await posthog.getAllFlags(userId);

    cache.setKey(cacheKey, flags);
    cache.save();

    return flags;
}

export async function isFeatureEnabled(
    flag: string,
    userId: string,
): Promise<boolean> {
    return posthog.isFeatureEnabled(flag, userId);
}
```

### User Identification

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (session) {
        posthog.identify({
            distinctId: session.user.id,
            properties: {
                email: session.user.email,
                name: session.user.name,
            },
        });
    }
}
```

### A/B Testing

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);

  const variant = await posthog.getFeatureFlag("new-homepage", userId);

  return {
    showNewHomepage: variant === "test",
  };
}

export default function Homepage({ loaderData }: Route.ComponentProps) {
  if (loaderData.showNewHomepage) {
    return <NewHomepage />;
  }

  return <OldHomepage />;
}
```

## Privacy Considerations

- **Opt-Out**: Respect user preferences
- **Anonymization**: Can track without identifying users
- **GDPR Compliant**: Built-in compliance features
- **Data Retention**: Configure retention policies
- **Cookie Consent**: Integrate with consent management

### Respecting Privacy

```typescript
// Disable in development
if (process.env.NODE_ENV === 'development') {
    posthog.opt_out_capturing();
}

// Allow user to opt out
function handleOptOut() {
    posthog.opt_out_capturing();
    posthog.set_config({ persistence: 'memory' });
}
```

## Feature Flag Patterns

### Progressive Rollout

```typescript
// Roll out to 10% of users
// Configure in PostHog dashboard: 10% rollout
const enabled = await posthog.isFeatureEnabled('new-feature', userId);
```

### User-Based Flags

```typescript
// Enable for specific users
// Configure in PostHog: Add user to flag in dashboard
const enabled = await posthog.isFeatureEnabled('beta-features', userId);
```

### Environment-Based Flags

```typescript
// Different flags per environment
const flag =
    process.env.NODE_ENV === 'production'
        ? 'production-feature'
        : 'development-feature';

const enabled = await posthog.isFeatureEnabled(flag, userId);
```

## Monitoring and Debugging

### Event Verification

Check events in PostHog dashboard:

1. Go to Activity
2. View recent events
3. Verify properties are correct

### Feature Flag Debugging

```typescript
const flags = await posthog.getAllFlags(userId);
console.log('Active flags:', flags);
```

### Error Tracking

```typescript
try {
    await riskyOperation();
} catch (error) {
    posthog.capture({
        distinctId: userId,
        event: 'error_occurred',
        properties: {
            error: error.message,
            stack: error.stack,
        },
    });
}
```

## Best Practices

1. **Meaningful Event Names**: Use clear, consistent naming
2. **Include Context**: Add relevant properties to events
3. **Identify Users**: Call identify after authentication
4. **Cache Feature Flags**: Reduce API calls (see ADR 007)
5. **Respect Privacy**: Implement opt-out
6. **Monitor Costs**: Track event volume
7. **Test Events**: Verify in development

## Performance Considerations

- Cache feature flags (5-minute TTL recommended)
- Batch events when possible
- Use async capture on server
- Lazy-load client SDK
- Monitor API quota

## Cost Management

- Free tier: 1M events/month
- Cache feature flags to reduce API calls
- Filter development events
- Monitor event volume
- Consider self-hosting for high volume

## References

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog Node.js](https://posthog.com/docs/libraries/node)
- [PostHog JavaScript](https://posthog.com/docs/libraries/js)
- [Feature Flags Guide](https://posthog.com/docs/feature-flags)
- [Flat-Cache Decision](./007-flat-cache.md)
