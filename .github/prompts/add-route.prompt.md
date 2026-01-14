---
agent: 'agent'
tools:
    [
        'vscode',
        'execute',
        'read',
        'edit',
        'search',
        'web',
        'context7/*',
        'agent',
        'todo',
    ]
description: 'Generate a new React Router 7 route with proper configuration'
---

# Add React Router 7 Route

You are creating a new route in a React Router 7 application.

## Core Workflow

Follow the route creation pattern documented in:

📚 **`.github/instructions/react-router.instructions.md`**
🛠️ **`.github/skills/create-route/SKILL.md`**

These files contain complete patterns for routes, loaders, actions, and type generation.

## Quick Reference

### Step 1: Determine Route Type
Ask the user:
- **Route purpose**: Public page, protected page, or API endpoint?
- **Route path**: What URL path? (e.g., `/dashboard`, `/api/profile`)
- **Dynamic params**: Need URL parameters like `:userId`?

### Step 2: Add Path Constant
For user-facing routes, add to `app/constants/index.ts`:
```typescript
export enum Paths {
    NEW_ROUTE = '/new-route',
}
```

### Step 3: Create Route File
Choose the appropriate template:

**Public Page** → `app/routes/[route-name].tsx`
```tsx
import type { Route } from './+types/[route-name]';
import { Container } from '~/components/Container';

export async function loader({ request }: Route.LoaderArgs) {
    return { data: 'example' };
}

export default function RouteName({ loaderData }: Route.ComponentProps) {
    return (
        <>
            <title>Page Title - Iridium</title>
            <Container>Content here</Container>
        </>
    );
}
```

**Protected Page** → Add under `authenticated` layout in routes.ts

**API Endpoint** → `app/routes/api/[endpoint].ts`
```typescript
import type { Route } from './+types/[endpoint]';
import { data } from 'react-router';
import { requireUser } from '~/lib/session.server';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    // Return JSON data
    return data({ data: [] });
}

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    if (request.method === 'POST') { /* handle POST */ }
    if (request.method === 'PUT') { /* handle PUT */ }
    if (request.method === 'DELETE') { /* handle DELETE */ }
}
```

### Step 4: Register in app/routes.ts
```typescript
// Public route
route(Paths.NEW_ROUTE, 'routes/new-route.tsx')

// Protected route (under authenticated layout)
layout('routes/authenticated.tsx', [
    route(Paths.NEW_ROUTE, 'routes/new-route.tsx')
])

// API route (under api prefix)
...prefix('api', [
    route('endpoint', 'routes/api/endpoint.ts')
])
```

### Step 5: Generate Types
```bash
npm run typecheck
```

## Critical Rules

1. **Route Type Imports**: ALWAYS use `./+types/[routeName]`
```tsx
// ✅ CORRECT
import type { Route } from './+types/my-route';

// ❌ WRONG
import type { Route } from '../+types/my-route';
```

2. **Access Data via Props**: Use `loaderData` prop, NOT `useLoaderData()` hook
```tsx
export default function MyPage({ loaderData }: Route.ComponentProps) {
    // Access loaderData.user, etc.
}
```

3. **Destructure Directly**: In function signatures
```tsx
// ✅ CORRECT
export async function action({ request, params }: Route.ActionArgs) {}

// ❌ WRONG
export async function action(args: Route.ActionArgs) {
    const { request } = args;
}
```

## Checklist
- [ ] Path constant added (if applicable)
- [ ] Route file created with correct type imports
- [ ] Route registered in `app/routes.ts`
- [ ] Types generated with `npm run typecheck`
- [ ] Route tested in browser

## Full Reference
See `react-router.instructions.md` for comprehensive documentation on:
- Nested routes & layouts
- Dynamic segments
- Streaming with Suspense
- Error boundaries
- Navigation patterns
