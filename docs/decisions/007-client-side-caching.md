# 007: Client-Side Caching

## Status

Accepted

## Context

We needed a client-side caching solution for React Router 7 that:

- Improves perceived performance with instant page loads
- Reduces server load by caching loader responses
- Works seamlessly with React Router 7 architecture
- Provides stale-while-revalidate (SWR) strategy
- Requires minimal setup
- Supports multiple storage backends
- Has a simple, intuitive API
- Works in development and production

Many routes fetch the same data repeatedly, and users benefit from instant navigation when cached data is available. A good caching strategy shows stale data immediately while fetching fresh data in the background.

## Decision

We chose remix-client-cache for client-side caching.

remix-client-cache is a lightweight library specifically designed for React Router v7 that manages server loader data on the client using a stale-while-revalidate strategy.

### Key Features

**Stale-While-Revalidate Strategy**:

The library automatically returns cached data immediately for fast page loads, then refreshes in the background and hot-swaps the updated data when available.

**Simple Integration**:

```typescript
import { createClientLoaderCache } from "remix-client-cache";
import type { Route } from "./+types/my-route";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const data = await fetchData();
  return { data };
};

export const clientLoader = createClientLoaderCache({ loader });
```

**Multiple Storage Adapters**: Supports localStorage, sessionStorage, or in-memory storage

**Automatic Hydration**: Handles server/client hydration automatically

**Cache Invalidation**: Simple utilities for clearing cache after mutations

**Hot-Swapping**: Components automatically update when fresh data arrives

## Consequences

### Positive

- **Instant Navigation**: Cached data provides immediate page loads
- **Better UX**: Users see content immediately, even if stale
- **Reduced Server Load**: Fewer requests to server loaders
- **Simple API**: Minimal code required to implement caching
- **React Router Native**: Built specifically for React Router v7
- **Flexible Storage**: Choose between persistent or session storage
- **Type Safe**: Full TypeScript support
- **Automatic Updates**: Components re-render when fresh data arrives
- **Zero Config**: Works out of the box with sensible defaults
- **Development Friendly**: Works seamlessly in dev and production

### Negative

- **Client-Side Only**: No server-side caching
- **Storage Limits**: localStorage has size constraints (~5-10MB)
- **Single Tab**: Cache per browser tab (not shared across tabs)
- **Stale Data**: Users briefly see outdated information
- **Manual Invalidation**: Must clear cache after mutations
- **Browser-Dependent**: Relies on browser storage APIs

### Neutral

- **SWR Strategy**: Always shows something, but might be stale
- **Per-Route Caching**: Each route manages its own cache
- **Client Bundle**: Adds small dependency to client bundle
- **Storage Choice**: Must choose storage adapter for persistence

## Alternatives Considered

### TanStack Query (React Query)

**Pros:**

- Comprehensive caching solution
- Advanced features (refetch on focus, polling, etc.)
- Large community and ecosystem
- Built-in devtools
- Mutation management

**Cons:**

- Larger bundle size
- More complex setup
- Not designed specifically for React Router
- Requires wrapper components
- Overkill for simple caching needs

**Why not chosen:** Too complex for our needs. remix-client-cache provides exactly what we need with minimal overhead.

### SWR (Vercel)

**Pros:**

- Popular and well-maintained
- Simple API
- Good documentation
- Automatic revalidation
- Focus detection

**Cons:**

- Not designed for React Router loaders
- Requires custom integration
- Manages its own fetch logic
- Less control over cache keys
- Additional abstraction layer

**Why not chosen:** Not built for React Router. remix-client-cache is purpose-built for our framework.

### Custom localStorage Solution

**Pros:**

- Full control
- No dependencies
- Exactly what we need
- Small footprint

**Cons:**

- Manual implementation
- Need to handle edge cases
- Serialization/deserialization
- Cache invalidation logic
- Hot-swapping mechanism
- Maintenance burden

**Why not chosen:** remix-client-cache provides all this functionality tested and ready to use.

### No Caching

**Pros:**

- Always fresh data
- No stale content
- Simpler architecture
- No cache invalidation

**Cons:**

- Slower page loads
- Higher server load
- Poor user experience
- Network dependency
- Increased latency

**Why not chosen:** Unacceptable UX. Users expect instant navigation in modern web apps.

## Implementation Details

### Setup

Configure global storage in `app/entry.client.tsx`:

```typescript
import { HydratedRouter } from "react-router/dom";
import { configureGlobalCache } from "remix-client-cache";

// Configure before hydration
configureGlobalCache(() => localStorage);

export default function App() {
  return <HydratedRouter />;
}
```

### Basic Usage

Create a cached loader:

```typescript
import { createClientLoaderCache } from "remix-client-cache";
import type { Route } from "./+types/products";

export async function loader({ request }: Route.LoaderArgs) {
  const products = await db.product.findMany();
  return { products };
}

export const clientLoader = createClientLoaderCache({
  loader,
  key: () => 'products-list',
});
```

### Using Cached Data

Access cached data in components:

```typescript
import { useCachedLoaderData } from "remix-client-cache";
import type { Route } from "./+types/products";

export default function ProductsRoute({ loaderData }: Route.ComponentProps) {
  const data = useCachedLoaderData<typeof loader>();

  return (
    <div>
      {data.products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Cache Invalidation

Clear cache after mutations:

```typescript
import { decacheClientLoader } from "remix-client-cache";
import type { Route } from "./+types/products";

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const result = await createProduct(formData);

  // Clear cache to force refresh
  await decacheClientLoader();

  return result;
}
```

### Custom Cache Keys

Use dynamic cache keys for parameterized routes:

```typescript
export const clientLoader = createClientLoaderCache({
  loader,
  key: (args) => `product-${args.params.id}`,
});
```

### Custom Storage Adapter

Implement custom storage for special needs:

```typescript
const customAdapter = {
  async getItem(key: string): Promise<string | null> {
    return await myCustomStorage.get(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await myCustomStorage.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await myCustomStorage.remove(key);
  },
};

export const clientLoader = createClientLoaderCache({
  loader,
  adapter: () => customAdapter,
});
```

## Cache Invalidation Strategies

### Automatic (After Actions)

```typescript
import { decacheClientLoader } from "remix-client-cache";

export async function clientAction({ request }: Route.ClientActionArgs) {
  await submitForm(request);
  await decacheClientLoader(); // Clear this route's cache
  return { success: true };
}
```

### Manual (From Components)

```typescript
import { useCacheInvalidator } from "remix-client-cache";

function RefreshButton() {
  const invalidate = useCacheInvalidator();

  return (
    <button onClick={() => invalidate("products-list")}>
      Refresh
    </button>
  );
}
```

### Programmatic

```typescript
import { invalidateCache } from "remix-client-cache";

// Clear single cache
await invalidateCache("products-list");

// Clear multiple caches
await invalidateCache(["products-list", "featured-products"]);
```

## Best Practices

1. **Configure Storage Early**: Set up `configureGlobalCache` in entry.client.tsx
2. **Use Meaningful Keys**: Make cache keys descriptive and unique
3. **Invalidate After Mutations**: Always clear cache in actions
4. **Choose Appropriate Storage**:
   - localStorage: Persistent across sessions
   - sessionStorage: Cleared when tab closes
   - In-memory: Cleared on page reload
5. **Handle Stale Data**: Design UI to handle brief stale states
6. **Document Cache Keys**: Keep track of what keys are used where
7. **Test Cache Behavior**: Verify invalidation works correctly

## Performance Considerations

- Instant page loads from cached data
- Background refresh keeps data current
- Reduces server load and bandwidth
- localStorage operations are synchronous but fast
- Cache size limited by browser (~5-10MB for localStorage)
- Consider cache key strategy to avoid bloat

## When to Use

- Product listings
- User profiles
- Dashboard data
- Static content
- Configuration data
- Feature flags (client-side)
- Slow-loading data
- Frequently accessed routes

## When Not to Use

- Real-time data (use WebSockets instead)
- Sensitive/private information
- Large datasets (consider pagination)
- Server-side rendering critical data
- Data that must always be fresh

## Migration from Server-Side Caching

If migrating from server-side caching (like flat-cache):

1. Remove server-side cache dependencies
2. Install remix-client-cache
3. Move caching from server loaders to client loaders
4. Update invalidation logic to use client-side utilities
5. Choose appropriate storage backend
6. Test stale-while-revalidate behavior

## References

- [remix-client-cache GitHub](https://github.com/forge-42/remix-client-cache)
- [React Router 7 Documentation](https://reactrouter.com/en/main)
- [Implementation Guide](../../.github/instructions/client-side-caching.instructions.md)
