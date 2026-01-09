---
name: add-caching
description: Add client-side caching with stale-while-revalidate strategy. Use when optimizing page load performance or reducing server requests.
---

# Add Caching

Adds client-side caching using remix-client-cache with a stale-while-revalidate (SWR) strategy.

## When to Use

- Improving page load performance
- Reducing server requests for frequently accessed data
- Caching loader data across navigations
- User asks to "add caching", "improve performance", or "cache data"

## How SWR Works

1. Returns cached (stale) data immediately
2. Refreshes data in the background
3. Hot-swaps updated data when available

## Step 1: Configure Global Storage

**Location:** `app/entry.client.tsx`

```tsx
import { configureGlobalCache } from "remix-client-cache";

// Use localStorage for persistent cache
configureGlobalCache(() => localStorage);

// Or sessionStorage (cleared when tab closes)
configureGlobalCache(() => sessionStorage);
```

## Step 2: Create Cached Client Loader

```tsx
import { createClientLoaderCache } from "remix-client-cache";
import type { Route } from "./+types/my-route";

export async function loader({ request }: Route.LoaderArgs) {
    const data = await fetchData();
    return { data };
}

// Generate cached client loader
export const clientLoader = createClientLoaderCache({
    loader,
    // Optional: custom cache key
    key: (args) => `products-${args.params.id}`,
});

// Enable client loader hydration
clientLoader.hydrate = true;
```

## Step 3: Use Cached Data in Component

### Option A: useCachedLoaderData Hook

```tsx
import { useCachedLoaderData } from "remix-client-cache";
import type { Route } from "./+types/my-route";

export default function MyRoute() {
    const data = useCachedLoaderData<typeof loader>();

    return (
        <div>
            <h1>{data.title}</h1>
        </div>
    );
}
```

### Option B: CacheRoute Wrapper

```tsx
import { CacheRoute } from "remix-client-cache";
import type { Route } from "./+types/my-route";

export default function MyRoute() {
    return (
        <CacheRoute>
            {(data) => (
                <div>
                    <h1>{data.title}</h1>
                </div>
            )}
        </CacheRoute>
    );
}
```

## Cache Invalidation

### After Mutations

```tsx
import { decacheClientLoader } from "remix-client-cache";
import type { Route } from "./+types/my-route";

export async function clientAction({ request }: Route.ClientActionArgs) {
    const result = await submitForm(request);

    // Clear the cache for this route
    await decacheClientLoader();

    return result;
}
```

### Manual Invalidation

```tsx
import { invalidateCache, useCacheInvalidator } from "remix-client-cache";

// Direct invalidation
await invalidateCache("my-cache-key");
await invalidateCache(["key1", "key2"]);

// Hook-based invalidation
function RefreshButton() {
    const invalidate = useCacheInvalidator();

    return (
        <button onClick={() => invalidate("my-cache-key")}>
            Refresh
        </button>
    );
}
```

## Manual Cache Wrapper

For more control:

```tsx
import { cacheClientLoader } from "remix-client-cache";
import type { Route } from "./+types/my-route";

export async function clientLoader(args: Route.ClientLoaderArgs) {
    return cacheClientLoader(args, {
        key: `user-${args.params.id}`,
        adapter: () => sessionStorage,
    });
}

clientLoader.hydrate = true;
```

## Storage Options

| Storage | Persistence | Use Case |
|---------|-------------|----------|
| localStorage | Persists across sessions | User preferences, stable data |
| sessionStorage | Cleared when tab closes | Sensitive or session-specific data |
| In-memory | Cleared on reload | Development, testing |

## Best Practices

1. **Configure storage early** - Set up in `entry.client.tsx` before hydration
2. **Use meaningful cache keys** - Include dynamic parameters: `products-${productId}`
3. **Invalidate after mutations** - Always clear cache in clientAction
4. **Set hydrate = true** - Enable proper hydration for cached data
5. **Consider data freshness** - Not all data should be cached

## When NOT to Cache

- Real-time data that changes frequently
- User-specific sensitive data (with localStorage)
- Data that must always be fresh
- Small, fast API responses

## Anti-Patterns

- Forgetting to invalidate cache after mutations
- Using localStorage for sensitive data
- Caching without considering data freshness
- Not setting `hydrate = true` on clientLoader

## Full Reference

See `.github/instructions/client-side-caching.instructions.md` for comprehensive documentation.
