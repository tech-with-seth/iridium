---
applyTo: 'app/lib/cache*.ts,app/routes/**/*.tsx'
---

# Client-Side Caching with remix-client-cache

This project uses `remix-client-cache` for managing client-side caching in React Router 7.

## Overview

remix-client-cache is a lightweight caching library that manages server loader data on the client side. It implements a **"stale while revalidate"** (SWR) strategy by default:

- Returns cached (stale) data immediately for fast page loads
- Refreshes data in the background
- Hot-swaps updated data when available

## Installation

```bash
npm install remix-client-cache
```

## Global Configuration

Configure the global cache storage adapter in `app/entry.client.tsx`:

```tsx
import { configureGlobalCache } from "remix-client-cache";

// Use localStorage as the default storage
configureGlobalCache(() => localStorage);

// Or use sessionStorage
configureGlobalCache(() => sessionStorage);

// Or use in-memory storage (default if not configured)
configureGlobalCache(() => null);
```

## Core Usage Patterns

### 1. Creating a Cached Client Loader

Use `createClientLoaderCache` to generate a clientLoader with built-in caching:

```tsx
import { createClientLoaderCache } from "remix-client-cache";
import type { Route } from "./+types/my-route";

export const loader = async ({ request }: Route.LoaderArgs) => {
  // Your server loader logic
  const data = await fetchData();
  return { data };
};

// Generate cached client loader
export const clientLoader = createClientLoaderCache({
  loader,
  // Optional: customize cache key
  key: (args) => `custom-key-${args.params.id}`,
  // Optional: use custom storage adapter
  adapter: () => localStorage,
});
```

### 2. Manual Cache Wrapper

Use `cacheClientLoader` to manually wrap loader function arguments:

```tsx
import { cacheClientLoader } from "remix-client-cache";
import type { Route } from "./+types/my-route";

export async function clientLoader(args: Route.ClientLoaderArgs) {
  return cacheClientLoader(args, {
    key: `my-custom-key-${args.params.id}`,
    adapter: () => sessionStorage,
  });
}
```

### 3. Using Cached Data in Components

**Option A: CacheRoute Component Wrapper**

```tsx
import { CacheRoute } from "remix-client-cache";
import type { Route } from "./+types/my-route";

export default function MyRoute({ loaderData }: Route.ComponentProps) {
  return (
    <CacheRoute>
      {(data) => (
        <div>
          {/* Data automatically hot-swaps when refreshed */}
          <h1>{data.title}</h1>
        </div>
      )}
    </CacheRoute>
  );
}
```

**Option B: useCachedLoaderData Hook**

```tsx
import { useCachedLoaderData } from "remix-client-cache";
import type { Route } from "./+types/my-route";

export default function MyRoute({ loaderData }: Route.ComponentProps) {
  const data = useCachedLoaderData<typeof loader>();

  return (
    <div>
      <h1>{data.title}</h1>
    </div>
  );
}
```

**Option C: useSwrData Hook (Render Props)**

```tsx
import { useSwrData } from "remix-client-cache";
import type { Route } from "./+types/my-route";

export default function MyRoute({ loaderData }: Route.ComponentProps) {
  const SwrData = useSwrData<typeof loader>();

  return (
    <SwrData>
      {(data) => (
        <div>
          <h1>{data.title}</h1>
        </div>
      )}
    </SwrData>
  );
}
```

## Cache Invalidation

### Manual Invalidation

Use `invalidateCache` to clear cached entries (client-side only):

```tsx
import { invalidateCache } from "remix-client-cache";

// Invalidate a single key
await invalidateCache("my-cache-key");

// Invalidate multiple keys
await invalidateCache(["key1", "key2", "key3"]);
```

### Hook-based Invalidation

Use `useCacheInvalidator` in components:

```tsx
import { useCacheInvalidator } from "remix-client-cache";

function MyComponent() {
  const invalidate = useCacheInvalidator();

  function handleRefresh() {
    invalidate("my-cache-key");
  }

  return <button onClick={handleRefresh}>Refresh</button>;
}
```

### Invalidation After Actions

Use `decacheClientLoader` in clientAction to clear cache after mutations:

```tsx
import { decacheClientLoader } from "remix-client-cache";
import type { Route } from "./+types/my-route";

export async function clientAction({ request }: Route.ClientActionArgs) {
  // Perform the mutation
  const result = await submitForm(request);

  // Clear the cache for this route
  await decacheClientLoader();

  return result;
}
```

## Custom Storage Adapters

Create custom storage adapters by implementing the `CacheAdapter` interface:

```tsx
import { configureGlobalCache, createCacheAdapter } from "remix-client-cache";

// Custom adapter implementation
const customAdapter = {
  async getItem(key: string): Promise<string | null> {
    // Custom get logic
    return await myStorage.get(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    // Custom set logic
    await myStorage.set(key, value);
  },

  async removeItem(key: string): Promise<void> {
    // Custom remove logic
    await myStorage.remove(key);
  },
};

// Use globally
configureGlobalCache(() => customAdapter);

// Or use for specific routes
export const clientLoader = createClientLoaderCache({
  loader,
  adapter: () => customAdapter,
});
```

## Best Practices

1. **Configure Global Storage Early**: Set up `configureGlobalCache` in `entry.client.tsx` before hydration
2. **Use Appropriate Storage**:
   - localStorage: Persistent across sessions
   - sessionStorage: Cleared when tab closes
   - In-memory: Cleared on page reload (default)
3. **Invalidate After Mutations**: Always clear cache in `clientAction` after successful data mutations
4. **Custom Cache Keys**: Use meaningful cache keys that include dynamic parameters (e.g., `user-${userId}`)
5. **Client-Side Only**: Remember that cache invalidation only works on the client side

## Migration from flat-cache

If migrating from `flat-cache`:

1. Remove `flat-cache` dependency
2. Install `remix-client-cache`
3. Replace cache initialization with `configureGlobalCache`
4. Convert loader caching to use `createClientLoaderCache` or `cacheClientLoader`
5. Update cache invalidation calls to use `invalidateCache` or `decacheClientLoader`
6. Replace data access patterns with `useCachedLoaderData` or `CacheRoute`

## Additional Resources

- [remix-client-cache GitHub](https://github.com/forge-42/remix-client-cache)
- [React Router 7 Documentation](https://reactrouter.com/en/main)
