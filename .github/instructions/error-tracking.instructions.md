# Error Tracking Instructions

## Overview

This project uses a comprehensive error tracking strategy combining:

1. **React Router 7 Error Boundaries** - Catch and display errors at the route level
2. **PostHog Error Tracking** - Automatically capture and report errors with context
3. **Session Recordings** - Replay user sessions to reproduce issues

## Error Tracking Architecture

### 1. Client-Side Error Tracking (PostHog)

PostHog automatically captures JavaScript errors when configured properly.

#### PostHog Configuration

The PostHog provider in `app/components/PostHogProvider.tsx` handles client-side error tracking:

```tsx
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

export function PHProvider({ children }: { children: React.ReactNode }) {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
        const host = import.meta.env.VITE_POSTHOG_HOST;

        if (apiKey && host) {
            posthog.init(apiKey, {
                api_host: host,
                person_profiles: 'identified_only',
                capture_pageview: true,
                capture_pageleave: true,
                // Enable automatic exception capture
                autocapture: {
                    capture_copied_text: true,
                    capture_exceptions: true, // ⚠️ Add this for automatic error tracking
                },
            });
        }

        setHydrated(true);
    }, []);

    if (!hydrated) return <>{children}</>;

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
```

**Note**: Set `capture_exceptions: true` in the `autocapture` configuration to enable automatic error tracking.

### 2. React Router 7 Error Boundaries

Error boundaries catch errors at specific route levels and prevent the entire app from crashing.

#### Root Error Boundary (Required)

The root error boundary in `app/root.tsx` is the **last line of defense**:

```tsx
import type { Route } from './+types/root';
import { isRouteErrorResponse } from 'react-router';

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = 'Oops!';
    let details = 'An unexpected error occurred.';
    let stack: string | undefined;

    // Handle intentional route errors (404s, 403s, etc.)
    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? '404' : 'Error';
        details =
            error.status === 404
                ? 'The requested page could not be found.'
                : error.statusText || details;
    }
    // Handle JavaScript errors with stack traces (development only)
    else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <div className="mb-8">
                <FileQuestionIcon className="h-12 w-12 text-zinc-400" />
            </div>
            <h1 className="text-6xl font-bold">{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
```

**Security Note**: Stack traces are only shown in development mode (`import.meta.env.DEV`). Production errors are sanitized automatically by React Router.

#### Route-Specific Error Boundaries

Add error boundaries to specific routes only when custom error handling is needed:

```tsx
// app/routes/products/:id.tsx
import type { Route } from './+types/$id';
import { isRouteErrorResponse } from 'react-router';
import { Link } from 'react-router';

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
    }

    // Let other errors bubble to root error boundary
    throw error;
}
```

**Best Practice**: Most routes should NOT have error boundaries. Only add them for:

- Custom 404 pages with specific messaging
- Custom unauthorized access pages
- Routes requiring different error UX

## Where Errors Should Be Caught

### 1. Loader Errors (Server-Side)

Errors in `loader` functions are caught by error boundaries:

```tsx
import type { Route } from './+types/product-details';
import { data } from 'react-router';
import { prisma } from '~/db.server';

export async function loader({ params }: Route.LoaderArgs) {
    const product = await prisma.product.findUnique({
        where: { id: params.id },
    });

    // ✅ Intentional 404 - caught by error boundary
    if (!product) {
        throw data('Product Not Found', { status: 404 });
    }

    // ❌ Unhandled database error - caught by error boundary + PostHog
    // If prisma.product.findUnique throws, it bubbles up automatically

    return { product };
}
```

### 2. Action Errors (Form Submissions)

Errors in `action` functions are caught by error boundaries:

```tsx
import type { Route } from './+types/create-product';
import { redirect } from 'react-router';
import { prisma } from '~/db.server';
import { requireUser } from '~/lib/session.server';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const formData = await request.formData();

    try {
        const product = await prisma.product.create({
            data: {
                name: formData.get('name') as string,
                price: Number(formData.get('price')),
                userId: user.id,
            },
        });

        return redirect(`/products/${product.id}`);
    } catch (error) {
        // ✅ Manually track error with PostHog (client-side)
        // Or let it bubble to error boundary for automatic tracking
        throw error;
    }
}
```

**Note**: Form validation errors should NOT throw. Use the validation pattern in `.github/instructions/form-validation.instructions.md`.

### 3. Component Rendering Errors

React component errors are caught by the closest error boundary:

```tsx
export default function ProductDetails({ loaderData }: Route.ComponentProps) {
    const { product } = loaderData;

    // ❌ If this throws, error boundary catches it
    // const price = product.price.toFixed(2); // Throws if price is undefined

    // ✅ Better: Handle potential errors gracefully
    const price = product.price ? product.price.toFixed(2) : 'N/A';

    return (
        <div>
            <h1>{product.name}</h1>
            <p>${price}</p>
        </div>
    );
}
```

### 4. Client-Side Data Fetching Errors

Errors in `clientLoader` are caught by error boundaries:

```tsx
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const response = await fetch(`/api/products/${params.id}`);

    if (!response.ok) {
        // ✅ Throw intentional error
        throw data('Failed to load product', { status: response.status });
    }

    return response.json();
}
```

### 5. Async Operations in Components

Use try-catch for async operations inside components and manually track with PostHog:

```tsx
import { usePostHog } from 'posthog-js/react';
import { useState } from 'react';

export default function DataFetchingComponent() {
    const posthog = usePostHog();
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/data');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            // ✅ Manually capture error with PostHog
            posthog?.captureException(error, {
                context: 'data_fetching',
                endpoint: '/api/data',
                timestamp: new Date().toISOString(),
            });

            // Show user-friendly error
            setError('Failed to load data. Please try again.');
        }
    };

    return (
        <div>
            {error && <div className="alert alert-error">{error}</div>}
            <button onClick={fetchData}>Load Data</button>
        </div>
    );
}
```

## PostHog Error Tracking Patterns

### Automatic Error Capture

PostHog automatically captures:

- Unhandled JavaScript errors
- Unhandled promise rejections
- Errors in event handlers
- Network errors (when configured)

**No code required** - just enable `capture_exceptions: true` in PostHog config.

### Manual Error Tracking

Use `posthog.captureException()` for handled errors:

```tsx
import { usePostHog } from 'posthog-js/react';

export default function PaymentForm() {
    const posthog = usePostHog();

    const handlePayment = async (data: PaymentData) => {
        try {
            await processPayment(data);
        } catch (error) {
            // ✅ Track with rich context
            posthog?.captureException(error, {
                context: 'payment_processing',
                userId: user.id,
                amount: data.amount,
                paymentMethod: data.method,
                timestamp: new Date().toISOString(),
            });

            // Show user-friendly error
            toast.error('Payment failed. Please try again.');
        }
    };

    return <form onSubmit={handleSubmit(handlePayment)}>...</form>;
}
```

### Error Tracking with React Error Boundaries

Integrate PostHog with custom error boundaries:

```tsx
import { Component, ReactNode } from 'react';
import posthog from 'posthog-js';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class PostHogErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // ✅ Send error to PostHog with component stack
        posthog.captureException(error, {
            errorInfo: errorInfo.componentStack,
            errorBoundary: true,
            timestamp: new Date().toISOString(),
        });

        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="alert alert-error">
                        <h2>Something went wrong</h2>
                        <p>We've been notified and are looking into it.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => this.setState({ hasError: false })}
                        >
                            Try Again
                        </button>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

// Usage in specific route sections
export default function CriticalFeature() {
    return (
        <PostHogErrorBoundary>
            <ComplexComponent />
        </PostHogErrorBoundary>
    );
}
```

**Note**: Only use custom error boundaries when you need component-level error isolation. Most errors should bubble to route error boundaries.

### Form Validation Error Tracking

Track validation errors to identify problematic form fields:

```tsx
import { usePostHog } from 'posthog-js/react';
import { useValidatedForm } from '~/lib/form-hooks';
import { useEffect } from 'react';

export default function SignUpForm() {
    const posthog = usePostHog();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useValidatedForm({
        resolver: signUpSchema,
    });

    // ✅ Track validation errors (not exceptions)
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            posthog?.capture('form_validation_error', {
                form: 'sign_up',
                fields: Object.keys(errors),
                errorCount: Object.keys(errors).length,
            });
        }
    }, [errors, posthog]);

    return <form onSubmit={handleSubmit}>...</form>;
}
```

### API Error Tracking

Monitor API failures with timing data:

```tsx
import { usePostHog } from 'posthog-js/react';

export async function apiCall(endpoint: string, options?: RequestInit) {
    const posthog = usePostHog();
    const startTime = Date.now();

    try {
        const response = await fetch(endpoint, options);
        const duration = Date.now() - startTime;

        if (!response.ok) {
            // ✅ Track API errors
            posthog?.captureException(
                new Error(`API Error: ${response.status}`),
                {
                    endpoint,
                    status: response.status,
                    duration,
                    method: options?.method || 'GET',
                },
            );
        }

        // Track successful API calls
        posthog?.capture('api_call_completed', {
            endpoint,
            status: response.status,
            duration,
            success: response.ok,
        });

        return response;
    } catch (error) {
        const duration = Date.now() - startTime;

        // ✅ Track network errors
        posthog?.captureException(error, {
            endpoint,
            duration,
            type: 'network_error',
        });

        throw error;
    }
}
```

## Viewing Errors in PostHog

### Dashboard Navigation

1. Navigate to **"Error Tracking"** in PostHog dashboard
2. View exceptions grouped by fingerprint (stack trace similarity)
3. See associated session replays to reproduce issues
4. Track error trends over time
5. Assign issues to team members
6. Create alerts for critical errors

### Error Context

Each error captured by PostHog includes:

- **Stack trace** - Full error stack
- **User information** - User ID, email (if identified)
- **Session recording** - Watch what happened before the error
- **Custom properties** - Any metadata you pass to `captureException()`
- **Browser/device info** - Automatically captured
- **URL and route** - Where the error occurred

### Session Recordings for Error Reproduction

Link errors to session recordings for easy debugging:

```tsx
import { usePostHog } from 'posthog-js/react';

export default function SupportTicket() {
    const posthog = usePostHog();

    const handleSubmitTicket = (ticketData: TicketData) => {
        // ✅ Include session recording URL in support ticket
        const sessionRecordingUrl = posthog?.get_session_replay_url();

        submitTicket({
            ...ticketData,
            sessionRecordingUrl, // Support team can watch what happened
            posthogPersonId: posthog?.get_distinct_id(),
        });
    };

    return <TicketForm onSubmit={handleSubmitTicket} />;
}
```

## Best Practices

### ✅ Do

- **Enable PostHog exception capture** in `PostHogProvider.tsx`
- **Use root error boundary** for most error handling
- **Track errors with context** - Include user ID, route, relevant state
- **Use `throw data()`** for intentional 404s and 403s
- **Hide stack traces in production** - Use `import.meta.env.DEV` checks
- **Monitor error trends** in PostHog dashboard regularly
- **Set up alerts** for critical errors
- **Link session recordings** to error reports for debugging

### ❌ Don't

- **Don't use error boundaries for form validation** - Use action error responses
- **Don't track expected errors** - Only track unexpected issues
- **Don't expose sensitive data** in error messages (passwords, tokens, etc.)
- **Don't add error boundaries to every route** - Over-engineering
- **Don't use error tracking for control flow** - Use proper conditionals
- **Don't ignore PostHog errors** - Review and fix systematically

## Error Categories

### 1. Route Not Found (404)

```tsx
// In loader
throw data('Not Found', { status: 404 });
```

### 2. Unauthorized Access (403)

```tsx
// In loader
if (!hasPermission) {
    throw data('Unauthorized', { status: 403 });
}
```

### 3. Server Errors (500)

```tsx
// Automatically caught by error boundary
// Tracked by PostHog if unhandled
```

### 4. Network Errors

```tsx
// Manually track with PostHog
posthog?.captureException(error, { type: 'network_error' });
```

### 5. Validation Errors (Not Exceptions)

```tsx
// Track as events, not exceptions
posthog?.capture('validation_error', { fields: ['email', 'password'] });
```

## Testing Error Tracking

### Test in Development

```tsx
// Add a test route to trigger errors
export default function TestErrors() {
    const posthog = usePostHog();

    return (
        <div>
            <button
                onClick={() => {
                    throw new Error('Test error');
                }}
            >
                Throw Error
            </button>

            <button
                onClick={() => {
                    posthog?.captureException(new Error('Manual test error'), {
                        context: 'test',
                    });
                }}
            >
                Manual Error
            </button>
        </div>
    );
}
```

### Verify PostHog Capture

1. Open browser DevTools
2. Go to Network tab
3. Filter for requests to your PostHog host
4. Look for `/e/` endpoints with error data
5. Check PostHog dashboard for captured errors

## Production Error Sanitization

React Router automatically sanitizes server errors in production:

```tsx
// Development: Full error details sent to client
throw new Error('Database connection failed: postgres://localhost:5432/db');

// Production: Sanitized error sent to client
// "Internal Server Error"
```

**PostHog still captures the full error** on the server before sanitization, so you can debug production issues.

## Additional Resources

- **PostHog Error Tracking Docs**: https://posthog.com/docs/error-tracking
- **React Router Error Boundaries**: `.github/instructions/error-boundaries.instructions.md`
- **React Router Documentation**: `.github/instructions/react-router.instructions.md`
- **Form Validation**: `.github/instructions/form-validation.instructions.md`
