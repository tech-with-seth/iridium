# Three-Tier Caching Strategy

**Status**: Accepted

**Date**: 2025-01-15

## Context

A production SaaS application needs caching to:
- Reduce database load
- Speed up external API calls (PostHog, etc.)
- Improve user experience with faster page loads
- Reduce costs (fewer API calls)

Caching options:
- Redis (separate server, complex setup)
- In-memory (lost on restart)
- File-based (persistent, simple)
- CDN caching (for static assets)
- Database query caching (Prisma)

Different parts of the application have different caching needs:
1. Route-level caching (user profile, dashboard data)
2. External API caching (PostHog feature flags)
3. Computed data caching (expensive calculations)

## Decision

Implement a **Three-Tier Caching Strategy** using `flat-cache` with TTL support:

### Tier 1: Client-Side Route Caching
React Router's `clientLoader`/`clientAction` for automatic cache priming:
```typescript
export const clientLoader = createCachedClientLoader({
  cacheKey: 'user-profile',
  ttl: 900  // 15 minutes
});
```

### Tier 2: Model Layer Caching
`withCache()` wrapper for external APIs and expensive operations:
```typescript
export const getFeatureFlags = withCache(
  async () => fetchFromPostHog(),
  'posthog:feature-flags',
  600,  // 10 minutes
  { results: [] }  // Fallback on error
);
```

### Tier 3: Manual Caching
Fine-grained control for specific use cases:
```typescript
getCachedData<T>(key)
setCachedData<T>(key, value, ttl)
deleteCachedData(key)
```

All tiers use `flat-cache` (file-based, persistent, zero-config).

## Consequences

### Positive

- **Zero Infrastructure**: No Redis, Memcached, or external services
- **Persistent**: Survives server restarts (file-based)
- **Type-Safe**: Generic TypeScript support
- **TTL Support**: Automatic expiration
- **Graceful Degradation**: Stale-while-revalidate pattern
- **User-Scoped**: `getUserScopedKey()` for per-user caching
- **Simple**: No complex configuration
- **Cost Effective**: No additional hosting costs

### Negative

- **File I/O**: Slower than in-memory (Redis/Memcached)
- **Single Server**: Doesn't work across multiple servers (need Redis)
- **Disk Space**: Cache files consume disk space
- **No Clustering**: Can't share cache across instances
- **Manual Invalidation**: Must manually invalidate on mutations

### Neutral

- **File Location**: Cache stored in `.flat-cache/` directory
- **Serialization**: Uses JSON serialization (no complex objects)
- **Scope**: Designed for single-server deployments
- **Hybrid Approach**: Can later add Redis without changing API
