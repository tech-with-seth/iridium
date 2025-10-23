# Caching Instructions

## Overview

This application uses **flat-cache** for file-based caching with TTL support. Three caching patterns are available depending on the use case:

1. **Client-side Route Caching** - Cache data in React Router clientLoader/clientAction
2. **Model Layer Caching** - Wrap async functions with caching logic
3. **Manual Caching** - Direct cache manipulation for custom scenarios

## Architecture

### Cache Singleton

Location: `app/lib/cache.ts`

```typescript
import { cache } from '~/lib/cache';

// Cache instance stored at: node_modules/.cache/.tws-cache
// Automatically handles file persistence and TTL expiration
```

### Core Functions

```typescript
// Get cached data (returns undefined if not found or expired)
getCachedData<T>(key: string): T | undefined

// Set cached data with TTL
setCachedData<T>(key: string, value: T, ttl: number): void

// Delete cached data
deleteCachedData(key: string): void

// Check if cache key has expired
isCacheExpired(key: string): boolean

// Create user-scoped cache key
getUserScopedKey(userId: string, key: string): string
```

## Pattern 1: Client-Side Route Caching

**Use when:** Caching data loaded in React Router routes (clientLoader/clientAction)

**Benefits:**

- Automatic cache priming on initial page load (hydration)
- Cache invalidation on mutations
- Zero boilerplate - just export the utilities
- Type-safe with TypeScript generics

### Implementation

**Step 1: Define cache configuration**

```typescript
// Cache configuration (top of route file)
const CACHE_KEY = 'user-profile';
const CACHE_TTL = 900; // 15 minutes
```

**Step 2: Export clientLoader**

```typescript
import { createCachedClientLoader } from '~/lib/cache';

export const clientLoader = createCachedClientLoader({
    cacheKey: CACHE_KEY,
    ttl: CACHE_TTL,
});
```

**Step 3: Export clientAction**

```typescript
import { createCachedClientAction } from '~/lib/cache';

export const clientAction = createCachedClientAction({
    cacheKey: CACHE_KEY,
});
```

### How It Works

**clientLoader Flow:**

1. **Initial request (hydration):** Fetches from server, caches result, returns data
2. **Subsequent requests:**
    - Cache hit (not expired) → Returns cached data instantly
    - Cache miss/expired → Fetches from server, updates cache, returns data

**clientAction Flow:**

1. Invalidates cache (deletes cached data)
2. Executes server action
3. Next clientLoader call will fetch fresh data from server

### Complete Example

**`app/routes/api/profile.server.ts`**

```typescript
import type { Route } from './+types/profile.server';
import { data } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { getUserProfile, updateUser } from '~/models/user.server';
import {
    createCachedClientLoader,
    createCachedClientAction,
} from '~/lib/cache';

// Cache configuration
const CACHE_KEY = 'current-user-profile';
const CACHE_TTL = 900; // 15 minutes

// Server loader
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const profile = await getUserProfile(user.id);
    return data({ profile });
}

// Client loader with caching
export const clientLoader = createCachedClientLoader({
    cacheKey: CACHE_KEY,
    ttl: CACHE_TTL,
});

// Server action
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    if (request.method === 'PUT') {
        const updatedUser = await updateUser({
            userId: user.id,
            data: {
                /* ... */
            },
        });
        return data({ success: true, user: updatedUser });
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}

// Client action with cache invalidation
export const clientAction = createCachedClientAction({
    cacheKey: CACHE_KEY,
});
```

## Pattern 2: Model Layer Caching

**Use when:** Wrapping external API calls or expensive database queries in model layer

**Benefits:**

- Encapsulates caching logic within model functions
- Automatic cache expiration handling
- Graceful error handling with fallback support
- Stale-while-revalidate pattern (returns stale cache on error)

### Implementation

**`app/models/feature-flags.server.ts`**

```typescript
import { withCache } from '~/lib/cache';
import type { FeatureFlagsResponse } from '~/types/posthog';

// Cache configuration
const CACHE_KEY = 'posthog:feature-flags';
const CACHE_TTL = 600; // 10 minutes

/**
 * Fetches feature flags from PostHog API with caching
 * Used by root.tsx loader for server-side rendering
 */
export const getFeatureFlags = withCache<FeatureFlagsResponse>(
    async () => {
        const response = await fetch(
            `https://us.posthog.com/api/projects/${process.env.POSTHOG_PROJECT_ID}/feature_flags/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
                },
            },
        );

        return response.json();
    },
    CACHE_KEY,
    CACHE_TTL,
    {
        // Fallback value on error
        count: 0,
        next: null,
        previous: null,
        results: [],
    },
);
```

### How It Works

1. **Cache hit (not expired):** Returns cached data instantly
2. **Cache miss/expired:**
    - Executes fetcher function
    - Caches result with TTL
    - Returns data
3. **Error handling:**
    - Returns stale cache if available (even if expired)
    - Returns fallback if provided and no cache
    - Re-throws error if no cache and no fallback

### Using in Routes

```typescript
import { getFeatureFlags } from '~/models/feature-flags.server';

export async function loader() {
    // Automatically cached, no additional logic needed
    const flags = await getFeatureFlags();

    return { flags };
}
```

## Pattern 3: Manual Caching

**Use when:** Custom caching scenarios requiring fine-grained control

### Example: User-Scoped Cache

```typescript
import {
    getCachedData,
    setCachedData,
    getUserScopedKey,
    isCacheExpired,
} from '~/lib/cache';

export async function getUserPreferences(userId: string) {
    const cacheKey = getUserScopedKey(userId, 'preferences');

    // Check cache
    const cached = getCachedData(cacheKey);
    if (cached && !isCacheExpired(cacheKey)) {
        return cached;
    }

    // Fetch fresh data
    const preferences = await fetchPreferencesFromDB(userId);

    // Update cache
    setCachedData(cacheKey, preferences, 3600); // 1 hour

    return preferences;
}
```

### Example: Conditional Caching

```typescript
export async function getAnalytics(userId: string, forceRefresh = false) {
    const cacheKey = `analytics:${userId}`;

    if (!forceRefresh) {
        const cached = getCachedData(cacheKey);
        if (cached && !isCacheExpired(cacheKey)) {
            return cached;
        }
    }

    const analytics = await computeExpensiveAnalytics(userId);
    setCachedData(cacheKey, analytics, 1800); // 30 minutes

    return analytics;
}
```

## Cache Key Naming Conventions

**Pattern:** `scope:entity[:identifier]`

### Examples

```typescript
// Global scope
'posthog:feature-flags';
'app:config';
'analytics:global-stats';

// User scope (use getUserScopedKey utility)
'user:123:profile'; // getUserScopedKey('123', 'profile')
'user:456:preferences'; // getUserScopedKey('456', 'preferences')
'user:789:notifications'; // getUserScopedKey('789', 'notifications')

// Feature scope
'profile:recent-activity';
'dashboard:widgets';
'search:results:trending';
```

## TTL Guidelines

**Recommended TTL values based on data volatility:**

```typescript
// Static/rarely changing data
const LONG_TTL = 3600; // 1 hour
const VERY_LONG_TTL = 86400; // 24 hours

// Moderate change frequency
const MEDIUM_TTL = 900; // 15 minutes
const DEFAULT_TTL = 600; // 10 minutes

// Frequently changing data
const SHORT_TTL = 300; // 5 minutes
const VERY_SHORT_TTL = 60; // 1 minute
```

### Examples by Data Type

```typescript
// User profile data (changes infrequently)
const PROFILE_CACHE_TTL = 900; // 15 minutes

// Feature flags (changes moderately)
const FEATURE_FLAGS_TTL = 600; // 10 minutes

// Analytics data (changes frequently)
const ANALYTICS_TTL = 300; // 5 minutes

// Real-time data (minimize staleness)
const REALTIME_TTL = 60; // 1 minute
```

## Best Practices

### 1. Always Use Cache Keys Constants

```typescript
// ✅ GOOD - Centralized configuration
const CACHE_KEY = 'user-profile';
const CACHE_TTL = 900;

export const clientLoader = createCachedClientLoader({
    cacheKey: CACHE_KEY,
    ttl: CACHE_TTL,
});

// ❌ BAD - Magic strings and numbers
export const clientLoader = createCachedClientLoader({
    cacheKey: 'user-profile',
    ttl: 900,
});
```

### 2. Match clientLoader and clientAction Cache Keys

```typescript
// ✅ GOOD - Same key for loader and action
const CACHE_KEY = 'user-profile';

export const clientLoader = createCachedClientLoader({
    cacheKey: CACHE_KEY,
});

export const clientAction = createCachedClientAction({
    cacheKey: CACHE_KEY,
});

// ❌ BAD - Mismatched keys
export const clientLoader = createCachedClientLoader({
    cacheKey: 'user-profile',
});

export const clientAction = createCachedClientAction({
    cacheKey: 'profile', // Won't invalidate loader cache!
});
```

### 3. Use Model Layer for External APIs

```typescript
// ✅ GOOD - Cached model function
// app/models/feature-flags.server.ts
export const getFeatureFlags = withCache(
    async () => {
        /* fetch logic */
    },
    'posthog:feature-flags',
    600,
);

// app/routes/dashboard.tsx
export async function loader() {
    const flags = await getFeatureFlags(); // Automatically cached
    return { flags };
}

// ❌ BAD - Caching in route
export async function loader() {
    const cached = getCachedData('flags');
    if (cached && !isCacheExpired('flags')) return cached;

    const flags = await fetch(/* ... */);
    setCachedData('flags', flags, 600);
    return flags;
}
```

### 4. Provide Fallbacks for Critical Data

```typescript
// ✅ GOOD - Graceful degradation
export const getFeatureFlags = withCache(
    async () => fetchFlags(),
    'posthog:feature-flags',
    600,
    { results: [] }, // Fallback prevents app crashes
);

// ❌ BAD - No fallback, errors crash app
export const getFeatureFlags = withCache(
    async () => fetchFlags(),
    'posthog:feature-flags',
    600,
    // Missing fallback!
);
```

### 5. Invalidate Cache on Mutations

```typescript
// ✅ GOOD - Cache invalidation on update
export const clientAction = createCachedClientAction({
    cacheKey: CACHE_KEY, // Automatically invalidates
});

// ❌ BAD - No invalidation, stale cache
export async function action({ request }: Route.ActionArgs) {
    await updateUser(/* ... */);
    // Cache still returns old data!
}
```

## Common Patterns

### Pattern: Hybrid Server + Client Caching

**Scenario:** Cache data server-side (external API) and client-side (route data)

```typescript
// Model layer - Server-side cache
export const getFeatureFlags = withCache(
    async () => fetchFromPostHog(),
    'posthog:feature-flags',
    600,
    { results: [] },
);

// Route file - Client-side cache
export async function loader() {
    const flags = await getFeatureFlags(); // Server cache
    return { flags };
}

export const clientLoader = createCachedClientLoader({
    cacheKey: 'feature-flags-page', // Client cache
    ttl: 600,
});
```

**Benefits:**

- Server cache reduces external API calls (saves quota/cost)
- Client cache reduces network requests (faster navigation)
- Two-layer caching for maximum performance

### Pattern: Cache Warming

**Scenario:** Pre-populate cache on application startup

```typescript
// app/lib/cache-warming.server.ts
import { getFeatureFlags } from '~/models/feature-flags.server';

export async function warmCache() {
    console.log('Warming cache...');

    // Fetch data to populate cache
    await getFeatureFlags();

    console.log('Cache warmed successfully');
}

// app/entry.server.tsx
import { warmCache } from '~/lib/cache-warming.server';

// Warm cache on server start
warmCache();
```

### Pattern: Scheduled Cache Refresh

**Scenario:** Refresh cache on interval to prevent cold cache hits

```typescript
// app/lib/cache-scheduler.server.ts
import { getFeatureFlags } from '~/models/feature-flags.server';

function startCacheScheduler() {
    // Refresh feature flags every 5 minutes
    setInterval(
        async () => {
            try {
                await getFeatureFlags();
                console.log('Cache refreshed:', new Date().toISOString());
            } catch (error) {
                console.error('Cache refresh failed:', error);
            }
        },
        5 * 60 * 1000,
    );
}

export { startCacheScheduler };
```

## Troubleshooting

### Issue: Cache Not Invalidating

**Symptoms:** Data still stale after mutation

**Solution:** Verify cache keys match

```typescript
// Check clientLoader and clientAction use same key
const CACHE_KEY = 'user-profile';

export const clientLoader = createCachedClientLoader({ cacheKey: CACHE_KEY });
export const clientAction = createCachedClientAction({ cacheKey: CACHE_KEY });
```

### Issue: Cache Persisting After Server Restart

**Symptoms:** Old data after server restart

**Explanation:** flat-cache persists to disk by default

**Solution:** Clear cache directory if needed

```bash
rm -rf node_modules/.cache/.tws-cache
```

### Issue: TypeScript Errors with Generic Types

**Symptoms:** `Type 'unknown' is not assignable to type 'T'`

**Solution:** Provide explicit type parameter

```typescript
// ✅ GOOD - Explicit type
const data = getCachedData<UserProfile>('user:123:profile');

// ❌ BAD - Inferred as unknown
const data = getCachedData('user:123:profile');
```

## Reference Implementations

**Client-side route caching:**

- `app/routes/api/profile.server.ts` (canonical)
- `app/routes/api/posthog/feature-flags.server.ts`

**Model layer caching:**

- `app/models/feature-flags.server.ts` (canonical)

**Manual caching:**

- See examples in this document

## Related Documentation

- [React Router 7 Client Loaders](https://reactrouter.com/dev/guides/client-loaders)
- [flat-cache Documentation](https://github.com/royriojas/flat-cache)
