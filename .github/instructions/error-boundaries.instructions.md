---
applyTo: 'app/routes/**/*.tsx,app/root.tsx'
---

# Error Boundaries

## Overview

React Router 7 automatically catches errors in your code and renders the closest `ErrorBoundary` to **avoid showing blank pages to users**. When an error occurs in any route module (loader, action, component, etc.), the closest error boundary will render instead of the route's normal UI.

**Error boundaries are for catching unexpected errors, not for:**

- Form validation errors → See `.github/instructions/form-validation.instructions.md`
- Error reporting/logging → See error reporting documentation

## Root Error Boundary (Required)

All applications **must** export a root error boundary in `app/root.tsx`. This handles three main error types:

1. **Route error responses** - Thrown with `throw data()` (e.g., 404s)
2. **Error instances** - JavaScript Error objects with stack traces
3. **Unknown errors** - Other thrown values

### Standard Pattern

```tsx
// app/root.tsx
import type { Route } from './+types/root';
import { isRouteErrorResponse } from 'react-router';

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    // 1. Handle intentional route errors (404s, 403s, etc.)
    if (isRouteErrorResponse(error)) {
        return (
            <div>
                <h1>
                    {error.status} {error.statusText}
                </h1>
                <p>{error.data}</p>
            </div>
        );
    }

    // 2. Handle JavaScript errors with stack traces
    if (error instanceof Error) {
        return (
            <div>
                <h1>Error</h1>
                <p>{error.message}</p>
                {process.env.NODE_ENV === 'development' && (
                    <>
                        <p>The stack trace is:</p>
                        <pre>{error.stack}</pre>
                    </>
                )}
            </div>
        );
    }

    // 3. Handle unknown error types
    return <h1>Unknown Error</h1>;
}
```

## Intentional Error Throwing (404s)

Use `throw data()` to intentionally trigger error boundaries when data isn't found. This is the **recommended pattern for 404s**.

```tsx
import type { Route } from './+types/product-details';
import { data } from 'react-router';
import { prisma } from '~/db.server';

export async function loader({ params }: Route.LoaderArgs) {
    const product = await prisma.product.findUnique({
        where: { id: params.id },
    });

    if (!product) {
        throw data('Product Not Found', { status: 404 });
    }

    return { product };
}
```

**This throws to the closest error boundary and renders the `isRouteErrorResponse` branch.**

### When to Use `throw data()`

✅ **Good use cases:**

- 404s when records don't exist
- 403s for unauthorized access
- 410s for deleted resources

❌ **Don't use for:**

- Form validation errors (use action error responses)
- Expected business logic (use normal returns)
- General control flow

## Nested Error Boundaries

Errors bubble up to the **closest error boundary**. You can add error boundaries at any route level for granular error handling.

When an error is thrown in a route, React Router will render the closest `ErrorBoundary` export found in the route hierarchy. This allows you to provide contextual error UI at different levels of your application.

### Example Route Structure

```tsx
// app/routes.ts
import { route, layout } from '@react-router/dev/routes';

export default [
    // ✅ Root layout has error boundary
    layout('routes/app-layout.tsx', [
        // ❌ No error boundary
        route('invoices', 'routes/invoices-list.tsx'),

        // ✅ Has error boundary
        route('invoices/:id', 'routes/invoice-details.tsx', [
            // ❌ No error boundary
            route('payments', 'routes/invoice-payments.tsx'),
        ]),
    ]),
] satisfies RouteConfig;
```

### Error Boundary Resolution Table

| Error Origin           | Rendered Boundary     |
| ---------------------- | --------------------- |
| `app-layout.tsx`       | Root (`root.tsx`)     |
| `invoices-list.tsx`    | Root (`root.tsx`)     |
| `invoice-details.tsx`  | `invoice-details.tsx` |
| `invoice-payments.tsx` | `invoice-details.tsx` |

**Errors bubble up until they find an `ErrorBoundary` export.** If a route doesn't have an error boundary, the error continues up the route tree until it finds one.

## Adding Route-Specific Error Boundaries

**Only add route-specific error boundaries when explicitly needed.** Most errors should bubble to the root error boundary.

```tsx
// app/routes/invoice-details.tsx
import type { Route } from './+types/invoice-details';
import { isRouteErrorResponse } from 'react-router';

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    if (isRouteErrorResponse(error) && error.status === 404) {
        return (
            <div className="error-container">
                <h1>Invoice Not Found</h1>
                <p>The invoice you're looking for doesn't exist.</p>
                <Link to="/invoices">Back to Invoices</Link>
            </div>
        );
    }

    // Let other errors bubble up
    throw error;
}
```

**Note:** In this project, most routes use the root error boundary. Only add route-specific boundaries when the user explicitly requests custom error handling.

## Error Boundary Scope

Error boundaries catch errors in **all route module APIs**:

✅ **Loaders** - Server data loading (`loader`, `clientLoader`)
✅ **Actions** - Form submissions and mutations (`action`, `clientAction`)
✅ **Components** - React component rendering errors
✅ **Headers** - HTTP header generation
✅ **Links** - Link preloading logic
✅ **Meta** - Meta tag generation

**Any error thrown in these route module APIs will be caught by the closest error boundary.**

### Unintentional vs Intentional Errors

**Error boundaries are primarily for catching unintentional errors in your code.**

❌ **Don't use error boundaries as control flow:**

```tsx
// BAD: Using errors for control flow
export async function loader() {
    if (someCondition) {
        throw new Error('This is bad practice');
    }
}
```

✅ **Do use `throw data()` for intentional HTTP errors:**

```tsx
// GOOD: Intentional 404 with proper status code
export async function loader({ params }: Route.LoaderArgs) {
    const record = await db.getRecord(params.id);
    if (!record) {
        throw data('Record Not Found', { status: 404 });
    }
    return record;
}
```

**Exception**: 404s, 403s, and similar HTTP errors are acceptable to throw intentionally using `throw data()` with proper status codes.

## Error Sanitization (Production)

In production mode, server errors are **automatically sanitized** before being sent to the browser to prevent leaking sensitive information.

### What Gets Sanitized

- **Error messages** → Generic "Internal Server Error"
- **Stack traces** → Completely removed
- **Server details** → Not exposed to client

### What Doesn't Get Sanitized

- Data thrown with `throw data()` → **Intentionally public**
- Custom error messages you explicitly return
- Status codes

```tsx
// ✅ This data is NOT sanitized (intentional)
throw data('User not found', { status: 404 });

// ❌ This error IS sanitized in production
throw new Error('Database connection failed: postgres://...');
// Client sees: "Internal Server Error"
```

## TypeScript Types

Use generated route types for error boundaries:

```tsx
import type { Route } from './+types/product-details';

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    // error is properly typed
}
```

## Best Practices

### ✅ Do

- Export a root error boundary in `app/root.tsx`
- Use `throw data()` for 404s and authorization errors
- Let most errors bubble to the root error boundary
- Use `isRouteErrorResponse()` to check for intentional errors
- Hide stack traces in production

### ❌ Don't

- Use error boundaries for form validation (use action errors)
- Use `throw data()` for general control flow
- Add error boundaries to every route (over-engineering)
- Expose sensitive server information in error messages
- Show stack traces to users in production

## Real-World Example

```tsx
// app/routes/products/:id.tsx
import type { Route } from './+types/$id';
import { data } from 'react-router';
import { prisma } from '~/db.server';
import { requireUser } from '~/lib/session.server';

export async function loader({ request, params }: Route.LoaderArgs) {
    // Authentication check (throws redirect if not authenticated)
    const user = await requireUser(request);

    // Load data
    const product = await prisma.product.findUnique({
        where: { id: params.id },
    });

    // 404 if not found
    if (!product) {
        throw data('Product not found', { status: 404 });
    }

    // 403 if user doesn't have access
    if (product.userId !== user.id && user.role !== 'ADMIN') {
        throw data('Unauthorized', { status: 403 });
    }

    return { product };
}

export default function ProductDetails({ loaderData }: Route.ComponentProps) {
    return (
        <div>
            <h1>{loaderData.product.name}</h1>
            {/* Product details */}
        </div>
    );
}

// Optional: Custom error boundary for better UX
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return (
                <div className="text-center py-8">
                    <h1 className="text-2xl font-bold">Product Not Found</h1>
                    <p className="mt-2">
                        This product doesn't exist or has been deleted.
                    </p>
                    <Link to="/products" className="btn btn-primary mt-4">
                        Browse Products
                    </Link>
                </div>
            );
        }

        if (error.status === 403) {
            return (
                <div className="text-center py-8">
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="mt-2">
                        You don't have permission to view this product.
                    </p>
                </div>
            );
        }
    }

    // Let other errors bubble to root
    throw error;
}
```

## Additional Resources

- **React Router 7 Routing**: `.github/instructions/react-router.instructions.md`
- **Form Validation**: `.github/instructions/form-validation.instructions.md`
- **Authentication**: `.github/instructions/better-auth.instructions.md`
