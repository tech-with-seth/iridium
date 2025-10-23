# Client-Side Data Loading & Caching

## Overview

React Router 7 provides `clientLoader` and `clientAction` functions for fetching and mutating data directly in the browser. This enables advanced patterns like:

- **Client-side caching** - Reduce server requests with memory/localStorage caching
- **Hybrid data loading** - Combine server and client data sources
- **BFF bypass** - Communicate directly with backend APIs from the browser
- **SPA mode** - Full client-side data handling without SSR

**This guide focuses on SSR use cases. For complete SPA patterns, see React Router documentation.**

## Skip the Server Hop (BFF Pattern)

When using a Backend-For-Frontend (BFF) architecture, you can bypass the React Router server and communicate directly with your backend API from the browser.

**Requirements:**

- Proper authentication handling (cookies, tokens)
- No CORS restrictions
- Backend API is accessible from client

### Implementation

**Initial page load:** Server `loader` fetches data
**Client navigation:** `clientLoader` fetches directly from API

React Router will **not** call `clientLoader` on hydration—only on subsequent client-side navigations.

```tsx
// app/routes/products.tsx
import type { Route } from './+types/products';

// (1) Server-side: Initial page load
export async function loader({ request }: Route.LoaderArgs) {
    const data = await fetchApiFromServer({ request });
    return data;
}

// (2) Client-side: Subsequent navigations
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
    const data = await fetchApiFromClient({ request });
    return data;
}

export default function Products({ loaderData }: Route.ComponentProps) {
    return (
        <div>
            {loaderData.products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
```

**Note:** This pattern is uncommon in this project since we typically use server loaders with Prisma for database access.

## Hybrid Data Loading (Server + Client)

Combine data from both server and browser sources (like IndexedDB, browser SDKs, or localStorage) before rendering.

### Pattern Steps

1. **Server loader** - Load partial data from database on initial request
2. **HydrateFallback** - Export fallback component for SSR (before full data available)
3. **clientLoader.hydrate** - Set to `true` to run clientLoader during hydration
4. **Merge data** - Combine server and client data in `clientLoader`

### Implementation

```tsx
// app/routes/dashboard.tsx
import type { Route } from './+types/dashboard';
import { prisma } from '~/db.server';

// (1) Server: Load partial data from database
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const serverData = await prisma.dashboard.findUnique({
        where: { userId: user.id },
    });
    return { serverData };
}

// (4) Client: Merge server + client data
export async function clientLoader({
    request,
    serverLoader,
}: Route.ClientLoaderArgs) {
    const [serverData, clientData] = await Promise.all([
        serverLoader(),
        getClientData(request), // IndexedDB, localStorage, etc.
    ]);

    return {
        ...serverData,
        ...clientData,
    };
}

// (3) Enable clientLoader during hydration
clientLoader.hydrate = true as const;

// (2) Fallback during SSR (before client data available)
export function HydrateFallback() {
    return (
        <div className="skeleton">
            <p>Loading dashboard...</p>
        </div>
    );
}

// Component receives combined data
export default function Dashboard({ loaderData }: Route.ComponentProps) {
    // loaderData contains both server + client data
    return (
        <div>
            <h1>Dashboard</h1>
            <ServerSection data={loaderData.serverData} />
            <ClientSection data={loaderData.clientData} />
        </div>
    );
}
```

### Use Cases

✅ **Good for:**

- Combining database data with IndexedDB
- Merging API data with localStorage preferences
- Browser SDK data + server data

❌ **Not needed for:**

- Pure server data (just use `loader`)
- Pure client data (just use `clientLoader` without `loader`)

## Choosing Data Loading Strategy

Mix data loading strategies across your application on a per-route basis.

### Server-Only Data Loading (Standard)

**This is the default pattern for most routes in this project.**

```tsx
// app/routes/products.tsx
import type { Route } from './+types/products';
import { prisma } from '~/db.server';

export async function loader({ request }: Route.LoaderArgs) {
    const products = await prisma.product.findMany();
    return { products };
}

export default function Products({ loaderData }: Route.ComponentProps) {
    return (
        <div>
            {loaderData.products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
```

**Use when:**

- Fetching from database (Prisma)
- Requiring authentication checks
- SEO matters (pre-rendered content)
- Standard CRUD operations

### Client-Only Data Loading

**Rare in this project—only use when necessary.**

```tsx
// app/routes/browser-data.tsx
import type { Route } from './+types/browser-data';

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
    // Fetch from browser APIs, IndexedDB, localStorage, etc.
    const clientData = await getFromIndexedDB();
    return { clientData };
}

// Implied if no server loader exists
clientLoader.hydrate = true;

// Required for SSR support
export function HydrateFallback() {
    return <div className="skeleton">Loading...</div>;
}

export default function BrowserData({ loaderData }: Route.ComponentProps) {
    return <div>{loaderData.clientData}</div>;
}
```

**Use when:**

- Data only available in browser (IndexedDB, localStorage)
- No server-side rendering needed for that data
- Working with browser-specific APIs

### Comparison

| Pattern         | When to Use                      | SSR | SEO | Auth |
| --------------- | -------------------------------- | --- | --- | ---- |
| **Server-only** | Database, API calls, auth checks | ✅  | ✅  | ✅   |
| **Client-only** | Browser APIs, IndexedDB          | ❌  | ❌  | ⚠️   |
| **Hybrid**      | Combine server + client data     | ⚠️  | ⚠️  | ✅   |

## Client-Side Caching Pattern

Implement client-side caching to optimize server requests using memory, localStorage, or this project's built-in cache utility.

### Pattern Steps

1. **Server loader** - Load data from database on initial page load
2. **clientLoader.hydrate** - Prime the cache during hydration
3. **Cache lookups** - Serve subsequent navigations from cache
4. **Cache invalidation** - Clear cache on mutations via `clientAction`

**Important:** Without `HydrateFallback`, the route component is SSR'd and `clientLoader` runs on hydration. Your `loader` and `clientLoader` must return the same data on initial load to avoid hydration errors.

### Implementation

```tsx
// app/routes/products.tsx
import type { Route } from './+types/products';
import { prisma } from '~/db.server';
import { cache, getUserScopedKey } from '~/lib/cache';

// (1) Server: Initial page load
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const products = await prisma.product.findMany({
        where: { userId: user.id },
    });
    return { products };
}

// Server action for mutations
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const formData = await request.formData();

    await prisma.product.create({
        data: {
            name: formData.get('name') as string,
            userId: user.id,
        },
    });

    return { ok: true };
}

let isInitialRequest = true;

// (2) Client: Cache management
export async function clientLoader({
    request,
    serverLoader,
}: Route.ClientLoaderArgs) {
    const cacheKey = generateKey(request);

    // (2) Prime cache on first load
    if (isInitialRequest) {
        isInitialRequest = false;
        const serverData = await serverLoader();
        cache.set(cacheKey, serverData);
        return serverData;
    }

    // (3) Serve from cache if available
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    // Fallback to server and update cache
    const serverData = await serverLoader();
    cache.set(cacheKey, serverData);
    return serverData;
}

clientLoader.hydrate = true;

// (4) Invalidate cache on mutations
export async function clientAction({
    request,
    serverAction,
}: Route.ClientActionArgs) {
    const cacheKey = generateKey(request);

    // Clear cache before mutation
    cache.delete(cacheKey);

    // Execute server action
    const result = await serverAction();
    return result;
}

export default function Products({ loaderData }: Route.ComponentProps) {
    return (
        <div>
            {loaderData.products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}

// Helper: Generate cache key from request
function generateKey(request: Request): string {
    const url = new URL(request.url);
    return url.pathname + url.search;
}
```

### Using Project Cache Utility

This project includes a built-in caching utility in `app/lib/cache.ts`:

```tsx
import { cache, getUserScopedKey, isCacheExpired } from '~/lib/cache';

// User-scoped cache key
const cacheKey = getUserScopedKey(user.id, 'products');

// Set with TTL
cache.set(cacheKey, data, 3600); // 1 hour TTL

// Get from cache
const cachedData = cache.get(cacheKey);

// Check if expired
if (isCacheExpired(cacheKey)) {
    cache.delete(cacheKey);
}
```

### Cache Invalidation Strategies

**On mutation:**

```tsx
export async function clientAction({
    request,
    serverAction,
}: Route.ClientActionArgs) {
    const cacheKey = generateKey(request);
    cache.delete(cacheKey); // Clear before mutation
    return serverAction();
}
```

**On navigation away:**

```tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router';

useEffect(() => {
    return () => {
        // Clear cache when leaving route
        cache.delete(cacheKey);
    };
}, []);
```

**Time-based (TTL):**

```tsx
// Set with TTL (seconds)
cache.set(cacheKey, data, 3600); // Expires in 1 hour

// Check expiration
if (isCacheExpired(cacheKey)) {
    const freshData = await fetchData();
    cache.set(cacheKey, freshData, 3600);
}
```

## Best Practices

### ✅ Do

- Use server loaders by default (standard for this project)
- Implement client caching for expensive/frequent requests
- Invalidate cache on mutations
- Use user-scoped cache keys for privacy
- Set appropriate TTL values
- Handle cache misses gracefully

### ❌ Don't

- Use `clientLoader` when server `loader` is sufficient
- Cache sensitive data without encryption
- Forget to invalidate cache on updates
- Cache data that changes frequently
- Use client-only loading when SEO matters
- Overcomplicate with caching when not needed

## When to Use Client Data Loading

| Scenario                    | Use Client Loading? | Why                               |
| --------------------------- | ------------------- | --------------------------------- |
| Database queries            | ❌ No               | Use server loader with Prisma     |
| Authentication required     | ❌ No               | Use server loader with middleware |
| SEO important               | ❌ No               | Need SSR for search engines       |
| Browser APIs                | ✅ Yes              | Only available client-side        |
| Expensive repeated requests | ✅ Yes              | Cache to reduce server load       |
| User preferences            | ✅ Maybe            | Can use localStorage + cache      |
| Real-time data              | ❌ No               | Use WebSockets or polling         |

## Additional Resources

- **React Router 7 Patterns**: `.github/instructions/react-router.instructions.md`
- **Form Validation**: `.github/instructions/form-validation.instructions.md`
- **Authentication**: `.github/instructions/better-auth.instructions.md`
- **Cache Utility**: `app/lib/cache.ts` (project implementation)
