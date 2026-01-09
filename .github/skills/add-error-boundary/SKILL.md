---
name: add-error-boundary
description: Add error boundaries to routes for handling 404s, 403s, and unexpected errors. Use when implementing error handling for routes or when asked to handle not found pages.
---

# Add Error Boundary

Adds React Router 7 error boundaries to routes for graceful error handling, preventing blank pages for users.

## When to Use

- Adding 404 handling for missing resources
- Adding 403 handling for unauthorized access
- Creating custom error pages for specific routes
- User asks to "add error handling" or "handle not found"

## Critical Patterns

### 1. Route Error Boundary Export

```tsx
import type { Route } from './+types/my-route';
import { isRouteErrorResponse, Link } from 'react-router';

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    // 1. Handle intentional HTTP errors (404, 403, etc.)
    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return (
                <div className="text-center py-8">
                    <h1 className="text-2xl font-bold">Not Found</h1>
                    <p className="mt-2">{error.data}</p>
                    <Link to="/" className="btn btn-primary mt-4">
                        Go Home
                    </Link>
                </div>
            );
        }

        if (error.status === 403) {
            return (
                <div className="text-center py-8">
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="mt-2">You don't have permission to view this.</p>
                </div>
            );
        }

        return (
            <div>
                <h1>{error.status} {error.statusText}</h1>
                <p>{error.data}</p>
            </div>
        );
    }

    // 2. Handle JavaScript errors
    if (error instanceof Error) {
        return (
            <div className="text-center py-8">
                <h1 className="text-2xl font-bold">Error</h1>
                <p className="mt-2">{error.message}</p>
                {process.env.NODE_ENV === 'development' && (
                    <pre className="mt-4 text-left text-sm overflow-auto">
                        {error.stack}
                    </pre>
                )}
            </div>
        );
    }

    // 3. Unknown errors
    return <h1>Unknown Error</h1>;
}
```

### 2. Throwing 404s in Loaders

```tsx
import type { Route } from './+types/product';
import { data } from 'react-router';
import { getProduct } from '~/models/product.server';

export async function loader({ params }: Route.LoaderArgs) {
    const product = await getProduct(params.id);

    if (!product) {
        throw data('Product not found', { status: 404 });
    }

    return { product };
}
```

### 3. Throwing 403s for Authorization

```tsx
import type { Route } from './+types/resource';
import { data } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { getResource } from '~/models/resource.server';

export async function loader({ request, params }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const resource = await getResource(params.id);

    if (!resource) {
        throw data('Resource not found', { status: 404 });
    }

    if (resource.userId !== user.id && user.role !== 'ADMIN') {
        throw data('Unauthorized', { status: 403 });
    }

    return { resource };
}
```

## Error Boundary Placement

| Error Source | Boundary Used |
|-------------|---------------|
| Root layout | `app/root.tsx` ErrorBoundary |
| Child route without boundary | Bubbles to parent |
| Route with own ErrorBoundary | Uses own ErrorBoundary |

**Most errors should bubble to root.** Only add route-specific boundaries when custom UX is needed.

## When to Use `throw data()`

- 404s when records don't exist
- 403s for unauthorized access
- 410s for deleted resources

## When NOT to Use Error Boundaries

- Form validation errors (use action error responses)
- Expected business logic (use normal returns)
- General control flow

## Anti-Patterns

- Using error boundaries for form validation
- Throwing `new Error()` for control flow (use `throw data()` with status)
- Adding ErrorBoundary to every route (over-engineering)
- Exposing stack traces in production
- Using `throw data()` for general control flow

## Root ErrorBoundary Required

Every app needs an ErrorBoundary in `app/root.tsx` - check it exists before adding route-specific ones.

## Full Reference

See `.github/instructions/error-boundaries.instructions.md` for comprehensive documentation.
