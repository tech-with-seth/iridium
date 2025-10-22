# 007: Flat-Cache

## Status

Accepted

## Context

We needed a server-side caching solution that:

- Reduces expensive computations
- Improves response times
- Works in development and production
- Requires minimal setup
- Persists across server restarts
- Has simple API
- Supports TTL (time-to-live)
- Works with Node.js

Many operations, like fetching feature flags or expensive calculations, benefit from caching to improve performance and reduce external API calls.

## Decision

We chose flat-cache for server-side caching.

Flat-cache is a simple, file-based caching library that persists data to disk, making it suitable for server-side caching in development and production.

### Key Features

**Simple API**:

```typescript
import { cache } from "~/lib/cache";

// Get cached value
const value = cache.getKey("my-key");

// Set cached value
cache.setKey("my-key", { data: "value" });

// Save to disk
cache.save();
```

**File-Based**: Data persists across server restarts

**Zero Configuration**: Works out of the box

**TTL Support**: Automatic expiration of cached values

**Fast**: In-memory reads with disk persistence

## Consequences

### Positive

- **Simple API**: Easy to use and understand
- **Persistence**: Survives server restarts
- **Fast**: In-memory access with background persistence
- **Zero Config**: No Redis or external service needed
- **Small Bundle**: Minimal dependencies
- **Type Safe**: Works well with TypeScript
- **Development Friendly**: No external services in development
- **Cost Effective**: No additional infrastructure cost

### Negative

- **Single Server**: Does not work across multiple servers
- **File System**: Requires disk access
- **Not Distributed**: No shared cache between instances
- **Limited Scale**: Not suitable for high-traffic distributed systems
- **Manual Management**: Need to handle invalidation
- **No Atomic Operations**: No locks or transactions

### Neutral

- **File Storage**: Cache stored in `.flat-cache` directory
- **Manual Save**: Must call `save()` to persist
- **Simple Features**: Fewer features than Redis

## Alternatives Considered

### Redis

**Pros:**

- Distributed caching
- Atomic operations
- Rich data structures
- Battle-tested at scale
- TTL built-in

**Cons:**

- External service required
- Additional infrastructure
- More complex setup
- Cost in production
- Overkill for simple use cases

**Why not chosen:** Too complex for our needs. Flat-cache is sufficient for single-server deployment.

### Node-cache

**Pros:**

- In-memory caching
- Simple API
- Fast
- No file system needed

**Cons:**

- Lost on server restart
- Not persisted
- Memory-only
- No distribution

**Why not chosen:** Lack of persistence means cache lost on restart. Flat-cache survives restarts.

### Memcached

**Pros:**

- Fast
- Distributed
- Simple protocol
- Widely supported

**Cons:**

- External service
- No persistence
- Additional infrastructure
- Setup complexity

**Why not chosen:** Requires external service. Flat-cache is simpler for single-server deployment.

### LRU-cache

**Pros:**

- Memory efficient
- Fast
- Built-in expiration
- Simple API

**Cons:**

- Memory-only
- No persistence
- Lost on restart

**Why not chosen:** No persistence. Flat-cache maintains data across restarts.

### Database Caching

**Pros:**

- Already have database
- Persistent
- Queryable
- ACID compliance

**Cons:**

- Slower than memory
- Database overhead
- More complex queries
- Not designed for caching

**Why not chosen:** Slower and more complex than needed for caching layer.

## Implementation Details

### Setup

```typescript
// app/lib/cache.ts
import flatCache from "flat-cache";
import path from "path";

const cacheDir = path.resolve(".flat-cache");
const cache = flatCache.create("app-cache", cacheDir);

// Helper to get with default
function getOrSet<T>(key: string, factory: () => T, ttl?: number): T {
  const cached = cache.getKey(key);

  if (cached !== undefined) {
    return cached as T;
  }

  const value = factory();
  cache.setKey(key, value);

  if (ttl) {
    setTimeout(() => cache.removeKey(key), ttl);
  }

  cache.save();
  return value;
}

export { cache, getOrSet };
```

### Basic Usage

```typescript
import { cache } from "~/lib/cache";

// Get value
const value = cache.getKey("feature-flags");

if (!value) {
  // Fetch and cache
  const flags = await fetchFeatureFlags();
  cache.setKey("feature-flags", flags);
  cache.save();
}
```

### With TTL

```typescript
function cacheWithTTL<T>(key: string, value: T, ttlMs: number): void {
  cache.setKey(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
  cache.save();
}

function getCached<T>(key: string): T | null {
  const cached = cache.getKey(key);

  if (!cached) return null;

  if (cached.expiresAt < Date.now()) {
    cache.removeKey(key);
    cache.save();
    return null;
  }

  return cached.value as T;
}
```

### Feature Flags Example

```typescript
// app/models/feature-flags.server.ts
import { cache } from "~/lib/cache";
import { posthog } from "~/lib/posthog.server";

const CACHE_KEY = "feature-flags";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getFeatureFlags(userId: string) {
  const cacheKey = `${CACHE_KEY}:${userId}`;
  const cached = cache.getKey(cacheKey);

  if (cached) {
    return cached;
  }

  const flags = await posthog.getFeatureFlags(userId);

  cache.setKey(cacheKey, flags);
  cache.save();

  // Auto-expire after 5 minutes
  setTimeout(() => {
    cache.removeKey(cacheKey);
    cache.save();
  }, CACHE_TTL);

  return flags;
}

export function invalidateFeatureFlags(userId: string) {
  const cacheKey = `${CACHE_KEY}:${userId}`;
  cache.removeKey(cacheKey);
  cache.save();
}
```

### Expensive Computation

```typescript
export async function getExpensiveData(params: string) {
  const cacheKey = `expensive:${params}`;
  const cached = cache.getKey(cacheKey);

  if (cached) {
    console.log("Cache hit");
    return cached;
  }

  console.log("Cache miss, computing...");
  const data = await expensiveOperation(params);

  cache.setKey(cacheKey, data);
  cache.save();

  return data;
}
```

## Cache Invalidation

### Manual Invalidation

```typescript
// Clear specific key
cache.removeKey("feature-flags");
cache.save();

// Clear all cache
cache.destroy();
```

### Automatic Invalidation

```typescript
// app/lib/cache.ts
export function clearExpiredCache() {
  const keys = cache.keys();

  keys.forEach((key) => {
    const value = cache.getKey(key);

    if (value?.expiresAt && value.expiresAt < Date.now()) {
      cache.removeKey(key);
    }
  });

  cache.save();
}

// Run periodically
setInterval(clearExpiredCache, 60 * 1000); // Every minute
```

### Event-Based Invalidation

```typescript
export async function updateUser(userId: string, data: UserData) {
  await db.user.update({ where: { id: userId }, data });

  // Invalidate user cache
  cache.removeKey(`user:${userId}`);
  cache.save();
}
```

## Best Practices

1. **Use Meaningful Keys**: Prefix keys by type (`user:123`, `flags:abc`)
2. **Set TTLs**: Prevent stale data with expiration
3. **Invalidate on Update**: Clear cache when data changes
4. **Handle Missing Keys**: Always check for `undefined`
5. **Save After Writes**: Call `save()` after modifications
6. **Monitor Size**: Clear old entries periodically
7. **Document Cache Keys**: Keep track of what is cached

## Performance Considerations

- In-memory reads are fast (microseconds)
- Disk writes are async and non-blocking
- Cache size grows over time (periodic cleanup needed)
- Not suitable for caching thousands of unique keys
- Works well for small to medium caches

## Deployment Considerations

- Ensure `.flat-cache` directory is writable
- Consider cache location in containerized environments
- May want to mount cache directory as volume
- Cache is per-server (not shared across instances)

## When to Use

- Feature flags
- Configuration data
- Expensive computations
- External API responses
- User preferences
- Static content

## When Not to Use

- User-specific data that must be real-time
- High-frequency updates
- Distributed systems (multiple servers)
- Large datasets
- Mission-critical data

## References

- [flat-cache GitHub](https://github.com/jaredwray/flat-cache)
- [Cache Implementation](../../app/lib/cache.ts)
- [Feature Flags Implementation](../../app/models/feature-flags.server.ts)
