# Vertical Slice Instructions

## Overview

A **vertical slice** is a small, self-contained, end-to-end implementation that cuts through all layers of the application stack, delivering a complete feature with high fidelity and a working user experience. Unlike horizontal development (which builds infrastructure first), vertical slicing delivers immediate value while testing the entire system integration.

### Key Characteristics

- ✅ **End-to-end** - Touches all layers: database, API, business logic, UI
- ✅ **Self-contained** - Can be developed, tested, and deployed independently
- ✅ **Production-ready** - Not a prototype; includes validation, error handling, styling
- ✅ **Value-focused** - Delivers working functionality users can interact with
- ✅ **Risk-revealing** - Exposes integration issues, bottlenecks, and missing patterns early
- ✅ **Estimation-enabling** - Provides data for estimating remaining work

This concept originated in the video game industry but is now widely applied in modern web development, particularly in agile methodologies and incremental delivery approaches.

## Why Use Vertical Slices?

### Benefits

**For Development:**

- Proves the full stack works together immediately
- Identifies architectural gaps and missing patterns early
- Establishes repeatable patterns for future features
- Reduces integration risk by testing connections continuously
- Enables parallel development once patterns are proven

**For Stakeholders:**

- Provides working demonstrations early and often
- Shows progress in tangible, testable functionality
- Allows for early feedback on UX and business logic
- Reduces "big bang" integration risk at the end

**For Estimation:**

- First slice reveals actual velocity vs. assumptions
- Exposes hidden complexity in tools, frameworks, or integrations
- Provides baseline for estimating remaining similar features
- Helps identify which layers need more time or expertise

### When to Use Vertical Slices

✅ **Start of a new project** - First feature proves the entire stack works
✅ **Adding major features** - Complete implementation from UI to database
✅ **Exploring new technology** - Tests integration across all layers
✅ **Proving architecture** - Validates patterns before scaling
✅ **Complex features** - Breaks down big features into deliverable increments

## Vertical Slice vs Horizontal Development

### ❌ Horizontal Development (Anti-Pattern)

```
Week 1: Design all database schemas
Week 2: Build all API endpoints
Week 3: Create all UI components
Week 4: Connect everything (integration hell)
```

**Problems:**

- No working feature until week 4
- Integration issues discovered late
- No user feedback until the end
- Impossible to demo progress
- High risk of rework

### ✅ Vertical Slice Development (Recommended)

```
Week 1: Complete user registration (DB → API → UI → deployed)
Week 2: Complete user profile management (DB → API → UI → deployed)
Week 3: Complete post creation (DB → API → UI → deployed)
Week 4: Complete post commenting (DB → API → UI → deployed)
```

**Benefits:**

- Working feature every week
- Continuous integration testing
- Early user feedback on each feature
- Demonstrable progress
- Low risk of surprises

## Application-Specific Vertical Slice Pattern

In this React Router 7 application, a vertical slice follows our established architectural patterns:

### Standard Vertical Slice Structure

```
1. Schema Layer (Validation)
   └── app/lib/validations.ts - Zod schema

2. Database Layer (Model)
   └── prisma/schema.prisma - Prisma model
   └── app/models/[feature].server.ts - Data access functions

3. API Layer (Business Logic)
   └── app/routes/api/[feature].ts - RESTful endpoint

4. UI Layer (Presentation)
   └── app/routes/[feature].tsx - User interface

5. Routing Configuration
   └── app/routes.ts - Route registration

6. Testing
   └── tests/[feature].test.ts - End-to-end tests
```

Each slice MUST include all layers to be considered complete.

## Step-by-Step: Implementing a Vertical Slice

### Example: "Add Favorites Feature"

Let's implement a feature where users can mark posts as favorites. This is a perfect vertical slice because it:

- Touches all layers (database, API, business logic, UI)
- Is self-contained (doesn't block other features)
- Delivers immediate value (users can save posts)
- Tests the full stack integration

### Step 1: Define the Schema (Validation Layer)

**Location:** `app/lib/validations.ts`

```typescript
import { z } from 'zod';

// Favorite toggle schema (simple on/off)
export const toggleFavoriteSchema = z.object({
    postId: z.string().cuid('Invalid post ID')
});

export type ToggleFavoriteData = z.infer<typeof toggleFavoriteSchema>;

// Optional: For listing favorites with filters
export const listFavoritesSchema = z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    sortBy: z.enum(['createdAt', 'title']).default('createdAt')
});

export type ListFavoritesData = z.infer<typeof listFavoritesSchema>;
```

### Step 2: Update Database Model (Data Layer)

**Location:** `prisma/schema.prisma`

```prisma
model User {
  id          String     @id @default(cuid())
  email       String     @unique
  name        String
  // ... other fields
  favorites   Favorite[] // Add relation

  @@map("user")
}

model Post {
  id          String     @id @default(cuid())
  title       String
  content     String
  // ... other fields
  favorites   Favorite[] // Add relation

  @@map("post")
}

// New model for favorites
model Favorite {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId]) // Prevent duplicate favorites
  @@index([userId])
  @@index([postId])
  @@map("favorite")
}
```

**Run migrations:**

```bash
npx prisma migrate dev --name add_favorites_feature
npx prisma generate
```

### Step 3: Create Model Functions (Data Access Layer)

**Location:** `app/models/favorite.server.ts`

```typescript
import { prisma } from '~/db.server';

/**
 * Check if a user has favorited a post
 */
export function isFavorited({
    userId,
    postId
}: {
    userId: string;
    postId: string;
}) {
    return prisma.favorite.findUnique({
        where: {
            userId_postId: {
                userId,
                postId
            }
        }
    });
}

/**
 * Add a post to user's favorites
 */
export function addFavorite({
    userId,
    postId
}: {
    userId: string;
    postId: string;
}) {
    return prisma.favorite.create({
        data: {
            userId,
            postId
        }
    });
}

/**
 * Remove a post from user's favorites
 */
export function removeFavorite({
    userId,
    postId
}: {
    userId: string;
    postId: string;
}) {
    return prisma.favorite.delete({
        where: {
            userId_postId: {
                userId,
                postId
            }
        }
    });
}

/**
 * Toggle favorite status (add if not exists, remove if exists)
 */
export async function toggleFavorite({
    userId,
    postId
}: {
    userId: string;
    postId: string;
}) {
    const existing = await isFavorited({ userId, postId });

    if (existing) {
        await removeFavorite({ userId, postId });
        return { favorited: false };
    } else {
        await addFavorite({ userId, postId });
        return { favorited: true };
    }
}

/**
 * Get all favorites for a user with post details
 */
export function getUserFavorites({
    userId,
    limit = 20,
    offset = 0,
    sortBy = 'createdAt' as const
}: {
    userId: string;
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'title';
}) {
    return prisma.favorite.findMany({
        where: { userId },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    content: true,
                    createdAt: true
                }
            }
        },
        orderBy:
            sortBy === 'createdAt'
                ? { createdAt: 'desc' }
                : { post: { title: 'asc' } },
        take: limit,
        skip: offset
    });
}

/**
 * Count user's total favorites
 */
export function countUserFavorites(userId: string) {
    return prisma.favorite.count({
        where: { userId }
    });
}
```

### Step 4: Create API Endpoint (Business Logic Layer)

**Location:** `app/routes/api/favorites.ts`

```typescript
import type { Route } from './+types/favorites';
import { json, data } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { getValidatedFormData } from '~/lib/form-validation.server';
import {
    toggleFavoriteSchema,
    type ToggleFavoriteData
} from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    getUserFavorites,
    countUserFavorites,
    toggleFavorite,
    isFavorited
} from '~/models/favorite.server';

// GET - List user's favorites
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    try {
        const [favorites, total] = await Promise.all([
            getUserFavorites({ userId: user.id }),
            countUserFavorites(user.id)
        ]);

        return data({ favorites, total });
    } catch (error) {
        return data({ error: 'Failed to fetch favorites' }, { status: 500 });
    }
}

// POST - Toggle favorite status
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    if (request.method === 'POST') {
        const { data: validatedData, errors } =
            await getValidatedFormData<ToggleFavoriteData>(
                request,
                zodResolver(toggleFavoriteSchema)
            );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        try {
            const result = await toggleFavorite({
                userId: user.id,
                postId: validatedData!.postId
            });

            return data({ success: true, favorited: result.favorited });
        } catch (error) {
            return data(
                { error: 'Failed to update favorite status' },
                { status: 500 }
            );
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
```

### Step 5: Register API Route

**Location:** `app/routes.ts`

```typescript
import {
    type RouteConfig,
    route,
    prefix,
    layout
} from '@react-router/dev/routes';

export default [
    // ... existing routes

    // Add favorites endpoint
    ...prefix('api', [route('favorites', 'routes/api/favorites.ts')])
] satisfies RouteConfig;
```

### Step 6: Create UI Components and Route (Presentation Layer)

**Location:** `app/routes/favorites.tsx`

```typescript
import { useFetcher } from 'react-router';
import type { Route } from './+types/favorites';
import { Container } from '~/components/Container';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { Alert } from '~/components/Alert';

// Loader: Fetch user's favorites
export async function loader({ request }: Route.LoaderArgs) {
  // Call our own API endpoint for consistent data fetching
  const url = new URL(request.url);
  const apiUrl = new URL('/api/favorites', url.origin);

  const response = await fetch(apiUrl, {
    headers: request.headers, // Pass auth cookies
  });

  if (!response.ok) {
    throw new Response('Failed to load favorites', { status: response.status });
  }

  return response.json();
}

export default function FavoritesPage({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <title>My Favorites - TWS Foundations</title>
      <meta name="description" content="View your favorite posts" />

      <Container className="pt-12">
        <h1 className="text-3xl font-bold mb-6">My Favorites</h1>

        {loaderData.total === 0 ? (
          <Card>
            <p className="text-base-content/70">You haven't favorited any posts yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {loaderData.favorites.map((favorite: any) => (
              <FavoriteCard key={favorite.id} favorite={favorite} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

// Favorite card component with toggle functionality
function FavoriteCard({ favorite }: { favorite: any }) {
  const fetcher = useFetcher();

  function handleToggle() {
    const formData = new FormData();
    formData.append('postId', favorite.post.id);

    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/favorites',
    });
  }

  const isLoading = fetcher.state === 'submitting';

  return (
    <Card>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">{favorite.post.title}</h2>
          <p className="text-base-content/70 line-clamp-2">{favorite.post.content}</p>
          <p className="text-sm text-base-content/50 mt-2">
            Favorited on {new Date(favorite.createdAt).toLocaleDateString()}
          </p>
        </div>

        <Button
          onClick={handleToggle}
          variant="ghost"
          size="sm"
          loading={isLoading}
          disabled={isLoading}
        >
          Remove
        </Button>
      </div>

      {fetcher.data?.success && (
        <Alert status="success" className="mt-4">
          Removed from favorites
        </Alert>
      )}

      {fetcher.data?.error && (
        <Alert status="error" className="mt-4">
          {fetcher.data.error}
        </Alert>
      )}
    </Card>
  );
}
```

**Location:** `app/components/FavoriteButton.tsx` (Reusable component for post pages)

```typescript
import { useFetcher } from 'react-router';
import { Button } from './Button';
import { useEffect, useState } from 'react';

interface FavoriteButtonProps {
  postId: string;
  initialFavorited: boolean;
}

export function FavoriteButton({ postId, initialFavorited }: FavoriteButtonProps) {
  const fetcher = useFetcher();
  const [favorited, setFavorited] = useState(initialFavorited);

  function handleToggle() {
    const formData = new FormData();
    formData.append('postId', postId);

    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/favorites',
    });
  }

  // Update local state when server responds
  useEffect(() => {
    if (fetcher.data?.success) {
      setFavorited(fetcher.data.favorited);
    }
  }, [fetcher.data]);

  const isLoading = fetcher.state === 'submitting';

  return (
    <Button
      onClick={handleToggle}
      variant={favorited ? 'outline' : 'ghost'}
      status={favorited ? 'primary' : undefined}
      loading={isLoading}
      disabled={isLoading}
    >
      {favorited ? '★ Favorited' : '☆ Add to Favorites'}
    </Button>
  );
}
```

### Step 7: Register UI Route

**Location:** `app/routes.ts`

```typescript
export default [
    // ... existing routes

    // Add to authenticated layout
    layout('routes/authenticated.tsx', [
        route('favorites', 'routes/favorites.tsx')
    ])
] satisfies RouteConfig;
```

### Step 8: Run Type Generation

```bash
npm run typecheck
```

This generates route types for type-safe loader/action data.

### Step 9: Add Analytics & Feature Flags (Optional but Recommended)

Track feature usage and implement feature flags for controlled rollouts.

**Location:** Route components

```typescript
// app/routes/favorites.tsx
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export default function FavoritesPage({ loaderData }: Route.ComponentProps) {
    const posthog = usePostHog();
    const [showNewLayout, setShowNewLayout] = useState(false);

    // Track page view with context
    useEffect(() => {
        if (posthog) {
            posthog.capture('favorites_page_viewed', {
                favoriteCount: loaderData.total,
                hasResults: loaderData.total > 0
            });
        }
    }, [posthog, loaderData.total]);

    // Feature flag for experimental UI
    useEffect(() => {
        if (posthog) {
            const isEnabled = posthog.isFeatureEnabled('favorites-new-layout');
            setShowNewLayout(isEnabled);
        }
    }, [posthog]);

    return (
        <>
            <title>My Favorites - TWS Foundations</title>
            <meta name="description" content="View your favorite posts" />

            <Container className="pt-12">
                <h1 className="text-3xl font-bold mb-6">My Favorites</h1>

                {loaderData.total === 0 ? (
                    <Card>
                        <p className="text-base-content/70">
                            You haven't favorited any posts yet.
                        </p>
                    </Card>
                ) : showNewLayout ? (
                    <NewFavoritesGrid favorites={loaderData.favorites} />
                ) : (
                    <div className="space-y-4">
                        {loaderData.favorites.map((favorite: any) => (
                            <FavoriteCard key={favorite.id} favorite={favorite} />
                        ))}
                    </div>
                )}
            </Container>
        </>
    );
}

// Track interactions
function FavoriteCard({ favorite }: { favorite: any }) {
    const fetcher = useFetcher();
    const posthog = usePostHog();

    function handleToggle() {
        // Track removal intent
        posthog?.capture('favorite_removed', {
            postId: favorite.post.id,
            postTitle: favorite.post.title
        });

        const formData = new FormData();
        formData.append('postId', favorite.post.id);

        fetcher.submit(formData, {
            method: 'POST',
            action: '/api/favorites'
        });
    }

    // ... rest of component
}
```

**See:** `.github/instructions/posthog.instructions.md` for complete analytics patterns.

### Step 10: Add Role-Based Access Control (If Authorization Required)

Protect features based on user roles beyond basic authentication.

**Location:** API route action/loader

```typescript
// app/routes/api/favorites.ts
import { requireRole, requireEditor, hasRole } from '~/lib/session.server';
import { Role } from '~/generated/prisma/client';

// Example: Only EDITOR and ADMIN can favorite posts
export async function action({ request }: Route.ActionArgs) {
    // Option 1: Require specific role(s)
    const user = await requireRole(request, [Role.EDITOR, Role.ADMIN]);

    // Option 2: Convenience wrapper for EDITOR+
    // const user = await requireEditor(request);

    if (request.method === 'POST') {
        const { data: validatedData, errors } =
            await getValidatedFormData<ToggleFavoriteData>(
                request,
                zodResolver(toggleFavoriteSchema)
            );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        try {
            const result = await toggleFavorite({
                userId: user.id,
                postId: validatedData!.postId
            });

            return data({ success: true, favorited: result.favorited });
        } catch (error) {
            return data(
                { error: 'Failed to update favorite status' },
                { status: 500 }
            );
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
```

**Client-side UI with role checks:**

```typescript
import { useHasRole } from '~/hooks/useUserRole';
import { Role } from '~/generated/prisma/client';

export function FavoriteButton({ postId, initialFavorited }: FavoriteButtonProps) {
    const canFavorite = useHasRole(Role.EDITOR);

    if (!canFavorite) {
        return (
            <Tooltip content="Upgrade to Editor to favorite posts">
                <Button disabled variant="ghost">
                    ☆ Add to Favorites
                </Button>
            </Tooltip>
        );
    }

    // ... rest of component with working favorite button
}
```

**See:** `.github/instructions/role-based-access.instructions.md` for complete RBAC patterns.

### Step 11: Implement Client-Side Caching (Performance Optimization)

Add caching to reduce server requests and improve navigation speed.

**Location:** API route file (add clientLoader and clientAction)

```typescript
// app/routes/api/favorites.ts
import {
    createCachedClientLoader,
    createCachedClientAction
} from '~/lib/cache';

// Cache configuration
const CACHE_KEY = 'user-favorites';
const CACHE_TTL = 600; // 10 minutes

// Server loader (unchanged)
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    try {
        const [favorites, total] = await Promise.all([
            getUserFavorites({ userId: user.id }),
            countUserFavorites(user.id)
        ]);

        return data({ favorites, total });
    } catch (error) {
        return data({ error: 'Failed to fetch favorites' }, { status: 500 });
    }
}

// Client loader with automatic caching
export const clientLoader = createCachedClientLoader({
    cacheKey: CACHE_KEY,
    ttl: CACHE_TTL
});

// Server action (unchanged)
export async function action({ request }: Route.ActionArgs) {
    // ... existing action code
}

// Client action with automatic cache invalidation
export const clientAction = createCachedClientAction({
    cacheKey: CACHE_KEY // Automatically clears cache on mutation
});
```

**Benefits:**

- First page load: Fetches from server, caches result
- Subsequent navigations: Instant load from cache (if not expired)
- After mutations: Cache cleared automatically, next load is fresh

**Alternative: Model layer caching for external APIs**

```typescript
// app/models/favorite.server.ts
import { withCache } from '~/lib/cache';

// Wrap expensive operations with caching
export const getFeaturedFavorites = withCache(
    async () => {
        const response = await fetch('https://api.example.com/featured');
        return response.json();
    },
    'favorites:featured',
    3600, // 1 hour TTL
    { results: [] } // Fallback on error
);
```

**See:** `.github/instructions/caching-pattern.instructions.md` for complete caching strategies.

### Step 12: Add Error Boundaries (Production Reliability)

Implement custom error handling for better user experience.

**Location:** Route file (optional - only if custom error handling needed)

```typescript
// app/routes/favorites.tsx
import { isRouteErrorResponse } from 'react-router';
import type { Route } from './+types/favorites';

// Most routes can use the root error boundary
// Only add custom error boundaries for specific UX requirements

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    // Handle intentional errors (404s, 403s)
    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return (
                <Container className="text-center py-12">
                    <h1 className="text-3xl font-bold mb-4">Not Found</h1>
                    <p className="text-base-content/70 mb-6">
                        The favorite you're looking for doesn't exist or has been removed.
                    </p>
                    <Link to="/favorites" className="btn btn-primary">
                        Back to Favorites
                    </Link>
                </Container>
            );
        }

        if (error.status === 403) {
            return (
                <Container className="text-center py-12">
                    <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
                    <p className="text-base-content/70 mb-6">
                        You don't have permission to view this content.
                    </p>
                    <Link to="/dashboard" className="btn btn-primary">
                        Back to Dashboard
                    </Link>
                </Container>
            );
        }
    }

    // Let other errors bubble to root error boundary
    throw error;
}
```

**Using `throw data()` for intentional errors:**

```typescript
// app/routes/api/favorites.ts
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const favoriteId = new URL(request.url).searchParams.get('id');

    const favorite = await prisma.favorite.findUnique({
        where: { id: favoriteId }
    });

    // Intentionally throw 404 to error boundary
    if (!favorite) {
        throw data('Favorite not found', { status: 404 });
    }

    // Authorization check
    if (favorite.userId !== user.id) {
        throw data('Unauthorized', { status: 403 });
    }

    return data({ favorite });
}
```

**See:** `.github/instructions/error-boundaries.instructions.md` for complete error handling patterns.

### Step 13: Add Billing Integration (If Monetization Required)

Integrate Polar.sh for subscriptions, checkouts, and payment webhooks.

**Location:** Create dedicated routes for billing

**Checkout Route:**

```typescript
// app/routes/api/billing/checkout.ts
import { Checkout } from '@polar-sh/remix';

export const loader = Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    successUrl: `${process.env.BETTER_AUTH_URL}/payment/success`,
    server: process.env.POLAR_SERVER as 'sandbox' | 'production' // From .env
});
```

**Usage in UI:**

```tsx
// Redirect to checkout with product ID
<Link
    to="/api/billing/checkout?products=prod_123&customerEmail=user@example.com"
    className="btn btn-primary"
>
    Upgrade to Premium
</Link>
```

**Webhook Handler:**

```typescript
// app/routes/api/billing/webhook.ts
import { Webhooks } from '@polar-sh/remix';
import { prisma } from '~/db.server';

export const action = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    onSubscriptionActive: async (payload) => {
        // Grant user access when subscription activates
        await prisma.user.update({
            where: { email: payload.data.customer_email },
            data: {
                role: 'EDITOR', // Upgrade role
                subscriptionId: payload.data.id,
                subscriptionStatus: 'active'
            }
        });
    },
    onSubscriptionCanceled: async (payload) => {
        // Revoke access when subscription cancels
        await prisma.user.update({
            where: { email: payload.data.customer_email },
            data: {
                role: 'USER', // Downgrade role
                subscriptionStatus: 'canceled'
            }
        });
    },
    onOrderPaid: async (payload) => {
        // Handle one-time purchases
        console.log('Order paid:', payload.data.id);
    }
});
```

**Gating features behind subscriptions:**

```typescript
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';

export default function PremiumFeature() {
    const { user } = useAuthenticatedContext();

    if (user.subscriptionStatus !== 'active') {
        return (
            <Card>
                <h2>Premium Feature</h2>
                <p>Upgrade to access this feature.</p>
                <Link
                    to="/api/billing/checkout?products=prod_123"
                    className="btn btn-primary"
                >
                    Upgrade Now
                </Link>
            </Card>
        );
    }

    return <PremiumFeatureContent />;
}
```

**See:** `.github/instructions/polar.instructions.md` for complete billing integration.

## Vertical Slice Checklist

Use this checklist to ensure your vertical slice is complete:

### ✅ Schema Layer

- [ ] Zod validation schema defined in `app/lib/validations.ts`
- [ ] TypeScript types inferred from schema
- [ ] Edge cases handled (optional fields, constraints)

### ✅ Database Layer

- [ ] Prisma model added/updated in `schema.prisma`
- [ ] Migrations created and run
- [ ] Relations defined correctly
- [ ] Indexes added for performance
- [ ] Model functions created in `app/models/[feature].server.ts`

### ✅ API Layer

- [ ] API endpoint created in `app/routes/api/[feature].ts`
- [ ] Authentication with `requireUser()`
- [ ] Authorization checks for owned resources
- [ ] Server-side validation with `getValidatedFormData()`
- [ ] Proper HTTP methods (GET/POST/PUT/DELETE)
- [ ] Error handling (400/403/404/500)
- [ ] Route registered in `app/routes.ts`

### ✅ UI Layer

- [ ] UI route created in `app/routes/[feature].tsx`
- [ ] Loader fetches initial data
- [ ] Form uses `useValidatedForm` + `useFetcher`
- [ ] Client-side validation (instant feedback)
- [ ] Loading states displayed
- [ ] Error messages shown (field-level + form-level)
- [ ] Success feedback provided
- [ ] Route registered in `app/routes.ts`

### ✅ Quality Checks

- [ ] Types generated (`npm run typecheck` runs cleanly)
- [ ] No TypeScript errors
- [ ] Follows established patterns (CRUD, form validation)
- [ ] DaisyUI + CVA styling applied
- [ ] Responsive design
- [ ] Accessibility attributes (ARIA, semantic HTML)
- [ ] Manual testing completed (happy path + error cases)

### ✅ Analytics & Monitoring (Optional but Recommended)

- [ ] PostHog event tracking added for key interactions
- [ ] Feature flags implemented (if needed for gradual rollout)
- [ ] Error tracking configured with context
- [ ] User identification in analytics (for authenticated features)

### ✅ Security & Authorization

- [ ] Authentication checks with `requireUser()` or middleware
- [ ] Role-based access implemented (if authorization needed)
- [ ] Authorization tested (unauthorized users properly blocked)
- [ ] Client-side role checks for conditional UI (`useHasRole`)
- [ ] No sensitive data exposed in client-side code

### ✅ Performance & Reliability

- [ ] Client-side caching implemented (if feature accessed frequently)
- [ ] Cache invalidation on mutations tested
- [ ] Error boundaries added (if custom error handling needed)
- [ ] 404 handling with `throw data()` for missing resources
- [ ] Loading states prevent UI janking
- [ ] No memory leaks (cleanup in useEffect)

### ✅ Billing Integration (If Monetization Required)

- [ ] Polar checkout route created
- [ ] Webhook handler implemented
- [ ] Subscription status checked in UI
- [ ] Payment success/failure pages created
- [ ] Webhook secret configured in environment

### ✅ Documentation

- [ ] Feature documented (if public API)
- [ ] Code comments for complex logic
- [ ] Examples provided (if reusable pattern)
- [ ] Environment variables added to `.env.example` (if new vars)

## Common Vertical Slice Pitfalls

### ❌ Incomplete Slice

**Problem:** Only implementing the UI layer without API or database.

**Why it's bad:** Not truly vertical; doesn't prove integration works.

**Solution:** Always implement all layers in the slice.

---

### ❌ Skipping Validation

**Problem:** "I'll add validation later."

**Why it's bad:** Exposes security vulnerabilities; breaks pattern consistency.

**Solution:** Always include Zod validation in first implementation.

---

### ❌ Manual Testing Only

**Problem:** No automated tests, relying on clicking through UI.

**Why it's bad:** Regressions go unnoticed; hard to verify edge cases.

**Solution:** Write at least smoke tests for critical paths.

---

### ❌ Hardcoded Values

**Problem:** Using test data or hardcoded IDs in production code.

**Why it's bad:** Breaks when deployed; not production-ready.

**Solution:** Use proper data flow from database through API to UI.

---

### ❌ Ignoring Error Cases

**Problem:** Only implementing happy path.

**Why it's bad:** Users will encounter errors; app crashes or shows broken state.

**Solution:** Handle errors at every layer (DB, API, UI).

---

### ❌ Styling Last

**Problem:** "I'll make it pretty later."

**Why it's bad:** Design changes often require refactoring logic; not truly "done."

**Solution:** Apply DaisyUI styling as you build each component.

## Vertical Slice Sizing Guidelines

### 🟢 Good Size (1-3 days)

- User can favorite a post
- User can update their profile
- User can create a basic post
- User can filter a list

### 🟡 Medium Size (3-5 days)

- Complete post CRUD with comments
- User dashboard with multiple widgets
- Search feature with filters and pagination
- File upload with preview and validation

### 🔴 Too Large (>5 days)

- Entire authentication system (break into: sign up, sign in, password reset)
- Complete blog platform (break into: posts, comments, tags, search)
- Full e-commerce checkout (break into: cart, payment, order confirmation)

**Rule of thumb:** If you can't demo a working feature in less than a week, the slice is too large.

## Testing Vertical Slices

### Manual Testing Checklist

**For every vertical slice, manually test:**

1. **Happy Path**
    - [ ] Feature works as expected with valid data
    - [ ] Success messages display correctly
    - [ ] Data persists in database
    - [ ] UI updates reflect changes

2. **Validation**
    - [ ] Required fields show errors when empty
    - [ ] Invalid data formats rejected with helpful messages
    - [ ] Server-side validation catches malicious inputs

3. **Error Handling**
    - [ ] Network errors show user-friendly messages
    - [ ] Database errors don't crash the app
    - [ ] 404/403 errors display appropriate pages

4. **Edge Cases**
    - [ ] Empty states render correctly
    - [ ] Long text truncates/wraps properly
    - [ ] Concurrent actions don't break state
    - [ ] Duplicate submissions prevented

5. **Performance**
    - [ ] Page loads in <2 seconds
    - [ ] No unnecessary re-renders
    - [ ] Forms remain responsive during submission

### Automated Testing (Optional but Recommended)

```typescript
// tests/favorites.test.ts
import { test, expect } from '@playwright/test';

test('user can favorite a post', async ({ page }) => {
    // Log in
    await page.goto('/sign-in');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Go to post
    await page.goto('/posts/clx123456789');

    // Favorite the post
    await page.click('text=Add to Favorites');
    await expect(page.locator('text=★ Favorited')).toBeVisible();

    // Verify it appears in favorites list
    await page.goto('/favorites');
    await expect(page.locator('text=Test Post Title')).toBeVisible();
});
```

## Real-World Example: Profile Feature

The profile feature in this application is a perfect example of a vertical slice:

**Files Involved:**

- `app/lib/validations.ts` - `profileUpdateSchema`
- `prisma/schema.prisma` - User model with profile fields
- `app/models/user.server.ts` - `getUserProfile()`, `updateUser()`
- `app/routes/api/profile.ts` - API endpoint (GET + PUT)
- `app/routes/profile.tsx` - UI with form
- `app/routes.ts` - Route registration

**What It Demonstrates:**

- Complete CRUD pattern (Read + Update)
- Form validation (client + server)
- Error handling (field errors + form errors)
- Loading states
- Success feedback
- DaisyUI styling
- Type-safe data flow

**Reference:** See these files for the canonical implementation.

## Vertical Slice Workflow

### 1. Planning Phase (15-30 min)

- Define user story ("As a user, I want to...")
- Sketch UI wireframe
- Identify database changes needed
- List validation rules
- Estimate complexity (S/M/L)

### 2. Implementation Phase (1-3 days)

- **Day 1 Morning:** Schema + Database layer
- **Day 1 Afternoon:** Model functions + API endpoint
- **Day 2 Morning:** UI components + forms
- **Day 2 Afternoon:** Styling + error handling
- **Day 3:** Testing + polish + documentation

### 3. Review Phase (30 min - 1 hour)

- Manual testing (happy path + edge cases)
- Code review (patterns followed?)
- Documentation updated
- Demo to stakeholder (if applicable)

### 4. Deploy Phase (15 min)

- Merge to main branch
- Deploy to staging/production
- Verify in production environment
- Monitor for errors

## Vertical Slice in Team Settings

### Solo Developer

- Implement slices sequentially
- Each slice proves patterns for next slice
- Adjust estimates based on first slice velocity

### Team of 2-3

- First slice: Pair program to establish patterns
- Subsequent slices: Divide and conquer similar features
- Daily check-ins to share learnings

### Larger Team

- First slice: Small group establishes patterns
- Document patterns in instructions (like this file!)
- Other team members follow established patterns
- Code reviews enforce consistency

## Related Patterns

This vertical slice pattern combines several architectural patterns:

- **CRUD Pattern** - See `.github/instructions/crud-pattern.instructions.md`
- **Form Validation** - See `.github/instructions/form-validation.instructions.md`
- **Component Patterns** - See `.github/instructions/component-patterns.instructions.md`
- **Caching** - See `.github/instructions/caching-pattern.instructions.md`
- **Role-Based Access** - See `.github/instructions/role-based-access.instructions.md`
- **Error Boundaries** - See `.github/instructions/error-boundaries.instructions.md`
- **PostHog Analytics** - See `.github/instructions/posthog.instructions.md`
- **Polar Billing** - See `.github/instructions/polar.instructions.md`
- **Model Layer** - See AGENTS.md "Model Layer Pattern"

## Migration: From Prototype to Vertical Slice

If you've built a quick prototype or POC, here's how to convert it to a production vertical slice:

### ❌ Prototype Code

```typescript
// API with no validation
export async function action({ request }) {
  const data = await request.formData();
  await prisma.post.create({ data: { title: data.get('title') } });
  return { ok: true };
}

// UI with no error handling
<Form method="post">
  <input name="title" />
  <button>Submit</button>
</Form>
```

### ✅ Production Vertical Slice

```typescript
// 1. Add Zod schema (app/lib/validations.ts)
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title required').max(200, 'Title too long'),
});

// 2. Add model function (app/models/post.server.ts)
export function createPost({ userId, title }: { userId: string; title: string }) {
  return prisma.post.create({
    data: { title, userId },
  });
}

// 3. Update API with validation (app/routes/api/posts.ts)
export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  const { data, errors } = await getValidatedFormData(
    request,
    zodResolver(createPostSchema)
  );
  if (errors) return data({ errors }, { status: 400 });

  try {
    const post = await createPost({ userId: user.id, title: data!.title });
    return data({ success: true, post });
  } catch (error) {
    return data({ error: 'Failed to create post' }, { status: 500 });
  }
}

// 4. Update UI with validation + error handling (app/routes/posts/new.tsx)
const { register, handleSubmit, formState: { errors } } = useValidatedForm({
  resolver: zodResolver(createPostSchema),
  errors: fetcher.data?.errors,
});

const onSubmit = (data: CreatePostData) => {
  const formData = new FormData();
  formData.append('title', data.title);
  fetcher.submit(formData, { method: 'POST', action: '/api/posts' });
};

<form onSubmit={handleSubmit(onSubmit)}>
  <TextInput
    {...register('title')}
    label="Title"
    error={errors.title?.message}
    required
  />
  <Button type="submit" loading={isLoading}>Create Post</Button>
</form>
```

## Summary

A vertical slice is NOT just "a feature." It's a **complete, production-ready implementation** that:

1. ✅ Spans all architectural layers
2. ✅ Follows established patterns
3. ✅ Includes validation and error handling
4. ✅ Has proper styling and UX
5. ✅ Is manually tested
6. ✅ Is deployable to production

**Golden Rule:** If you can't demo it to a user and have them use it successfully, it's not a complete vertical slice.

## Additional Resources

- **CRUD Pattern**: `.github/instructions/crud-pattern.instructions.md` - API-first architecture
- **Form Validation**: `.github/instructions/form-validation.instructions.md` - Client + server validation
- **Component Patterns**: `.github/instructions/component-patterns.instructions.md` - UI component standards
- **React Router 7**: `.github/instructions/react-router.instructions.md` - Routing patterns
- **Prisma**: `.github/instructions/prisma.instructions.md` - Database access patterns
