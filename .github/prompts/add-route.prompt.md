---
mode: 'agent'
model: Claude Sonnet 4
tools: ['githubRepo', 'codebase']
description: 'Generate a new React Router 7 route with proper configuration'
---

# Add React Router 7 Route

You are a Lead Web Developer creating a new route in a React Router 7 application. Follow these steps:

## Step 1: Determine Route Type

Ask the user to clarify:
- **Route purpose**: Public page, protected page, or API endpoint?
- **Route path**: What URL path should this route use?
- **Dynamic params**: Does it need URL parameters (e.g., `:userId`)?

## Step 2: Add Path Constant (if applicable)

For user-facing routes, add the path to `app/constants/index.ts`:

```typescript
export enum Paths {
    DASHBOARD = '/dashboard',
    PROFILE = '/profile',
    NEW_ROUTE = '/new-route' // Add here
}
```

## Step 3: Create Route File

### Public Page Route
Create in `app/routes/[route-name].tsx`:

```typescript
import type { Route } from './+types/[route-name]';
import { Container } from '~/components/Container';

export async function loader({ request }: Route.LoaderArgs) {
    // Fetch data here
    return { data: 'example' };
}

export default function RouteName({ loaderData }: Route.ComponentProps) {
    return (
        <Container>
            <h1>Route Title</h1>
            <p>{loaderData.data}</p>
        </Container>
    );
}
```

### Protected Page Route (requires authentication)
Create in `app/routes/[route-name].tsx` - will be added under `authenticated` layout:

```typescript
import type { Route } from './+types/[route-name]';
import { Container } from '~/components/Container';
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';

export default function RouteName() {
    const { user } = useAuthenticatedContext();

    return (
        <Container>
            <h1>Welcome, {user.name}</h1>
        </Container>
    );
}
```

### API Endpoint Route
Create in `app/routes/api/[endpoint-name].ts`:

```typescript
import type { Route } from './+types/[endpoint-name]';
import { json } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { prisma } from '~/db.server';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    const data = await prisma.model.findMany({
        where: { userId: user.id }
    });

    return json({ data });
}

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    if (request.method === 'POST') {
        const body = await request.json();
        // Handle POST
        return json({ success: true });
    }

    if (request.method === 'PUT') {
        // Handle PUT
        return json({ success: true });
    }

    if (request.method === 'DELETE') {
        // Handle DELETE
        return json({ success: true });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
}
```

### Dynamic Route with Params
Create in `app/routes/posts.$postId.tsx`:

```typescript
import type { Route } from './+types/posts.$postId';
import { prisma } from '~/db.server';

export async function loader({ params }: Route.LoaderArgs) {
    const post = await prisma.post.findUnique({
        where: { id: params.postId }
    });

    if (!post) {
        throw new Response('Not Found', { status: 404 });
    }

    return { post };
}

export default function PostDetail({ loaderData }: Route.ComponentProps) {
    const { post } = loaderData;

    return (
        <article>
            <h1>{post.title}</h1>
            <p>{post.content}</p>
        </article>
    );
}
```

## Step 4: Register Route in app/routes.ts

### Public Route
```typescript
import { type RouteConfig, route } from '@react-router/dev/routes';
import { Paths } from './constants';

export default [
    route(Paths.NEW_ROUTE, 'routes/new-route.tsx') // Add here
] satisfies RouteConfig;
```

### Protected Route (under authenticated layout)
```typescript
layout('routes/authenticated.tsx', [
    route(Paths.DASHBOARD, 'routes/dashboard.tsx'),
    route(Paths.NEW_ROUTE, 'routes/new-route.tsx') // Add here
])
```

### API Route (under api prefix)
```typescript
...prefix('api', [
    route('auth/*', 'routes/api/auth/better-auth.ts'),
    route('endpoint-name', 'routes/api/endpoint-name.ts') // Add here
])
```

### Nested/Admin Routes
```typescript
...prefix('admin', [
    route('/design', 'routes/admin/design.tsx'),
    route('/new-admin-route', 'routes/admin/new-admin-route.tsx') // Add here
])
```

## Step 5: Generate Types

After adding the route, run:
```bash
npm run typecheck
```

This generates the route types in `./+types/[route-name]` for type-safe access to `loaderData`, `params`, etc.

## Important Patterns

### Authentication
- **Protected routes**: Add under `authenticated` layout - middleware handles auth automatically
- **API routes**: Manually call `requireUser(request)` in loader/action
- **Anonymous only**: Use `requireAnonymous(request)` for sign-in/sign-up pages

### Data Loading
- Use `loader` for GET requests (data fetching)
- Use `action` for POST/PUT/DELETE requests (mutations)
- Access loader data via `loaderData` prop (not `useLoaderData` hook)

### Type Safety
- Always import `Route` type from `./+types/[route-name]`
- Use `Route.LoaderArgs`, `Route.ActionArgs`, `Route.ComponentProps`
- Generate types with `npm run typecheck` after route changes

### File Naming
- Use `.tsx` for routes with JSX components
- Use `.ts` for API-only routes (no component)
- Dynamic params: Use `$paramName` (e.g., `posts.$postId.tsx`)

## Checklist

After creating the route:
- [ ] Path constant added to `app/constants/index.ts` (if applicable)
- [ ] Route file created in correct directory
- [ ] Route registered in `app/routes.ts`
- [ ] Types generated with `npm run typecheck`
- [ ] Route tested in browser
- [ ] Authentication working correctly (if protected)

## Reference

See these project files for examples:
- Public route: `app/routes/sign-in.tsx`
- Protected route: `app/routes/dashboard.tsx`
- API route: `app/routes/api/auth/better-auth.ts`
- Layout route: `app/routes/authenticated.tsx`
- Routes config: `app/routes.ts`

For detailed patterns, see:
- `.github/instructions/react-router.instructions.md`
- `.github/instructions/better-auth.instructions.md`
- `.github/instructions/prisma.instructions.md`
