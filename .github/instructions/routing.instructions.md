# Routing

## Overview

**This project uses React Router 7's config-based routing system.** All routes are defined in `app/routes.ts` as a single source of truth, not through file naming conventions.

Routes are configured with two required parts:

1. **URL pattern** - The path to match against the URL
2. **Module file path** - The route module that defines behavior

**Critical:** After adding or modifying routes, run `npm run typecheck` to generate route types.

## Basic Route Configuration

### Simple Routes

```ts
// app/routes.ts
import { type RouteConfig, route } from '@react-router/dev/routes';

export default [
    route('some/path', './some/file.tsx')
    // pattern ^           ^ module file
] satisfies RouteConfig;
```

### Complete Example

```ts
// app/routes.ts
import {
    type RouteConfig,
    route,
    index,
    layout,
    prefix
} from '@react-router/dev/routes';

export default [
    index('./home.tsx'),
    route('about', './about.tsx'),

    layout('./auth/layout.tsx', [
        route('login', './auth/login.tsx'),
        route('register', './auth/register.tsx')
    ]),

    ...prefix('concerts', [
        index('./concerts/home.tsx'),
        route(':city', './concerts/city.tsx'),
        route('trending', './concerts/trending.tsx')
    ])
] satisfies RouteConfig;
```

### File System Routes (Not Used in This Project)

**Note:** This project uses explicit configuration in `app/routes.ts`. File system routing conventions via `@react-router/fs-routes` are available but not the standard pattern here.

```ts
// Alternative approach (not standard for this project)
import { type RouteConfig, route } from '@react-router/dev/routes';
import { flatRoutes } from '@react-router/fs-routes';

export default [
    route('/', './home.tsx'),
    ...(await flatRoutes())
] satisfies RouteConfig;
```

## Route Modules

The files referenced in `routes.ts` define each route's behavior through exports like `loader`, `action`, and the default component export.

```tsx
// app/routes.ts
route("teams/:teamId", "./team.tsx"),
//           route module ^^^^^^^^
```

### Standard Route Module Pattern

```tsx
// app/team.tsx
import type { Route } from './+types/team';
import { prisma } from '~/db.server';

// Loads data before rendering (server-side)
export async function loader({ params }: Route.LoaderArgs) {
    const team = await prisma.team.findUnique({
        where: { id: params.teamId }
    });
    return { team };
}

// Renders the component with loaded data
export default function Component({ loaderData }: Route.ComponentProps) {
    return <h1>{loaderData.team.name}</h1>;
}
```

**Key Features:**

- **Type safety** - Use `./+types/[routeName]` for automatic type inference
- **Data loading** - `loader` provides data to components
- **Actions** - Handle form submissions and mutations
- **Error boundaries** - Catch and handle errors gracefully

**For complete route module patterns, see:**

- `.github/instructions/react-router.instructions.md` - Full React Router 7 patterns
- `.github/instructions/form-validation.instructions.md` - Form handling with actions
- `.github/instructions/error-boundaries.instructions.md` - Error handling

## Nested Routes

Routes can be nested inside parent routes. The parent's path is automatically included in child paths.

```ts
// app/routes.ts
import { type RouteConfig, route, index } from '@react-router/dev/routes';

export default [
    // Parent route
    route('dashboard', './dashboard.tsx', [
        // Child routes
        index('./home.tsx'), // Matches /dashboard
        route('settings', './settings.tsx') // Matches /dashboard/settings
    ])
] satisfies RouteConfig;
```

### Rendering Child Routes with Outlet

**Critical:** Parent routes must use `<Outlet />` to render their children.

```tsx
// app/dashboard.tsx
import { Outlet } from 'react-router';

export default function Dashboard() {
    return (
        <div>
            <h1>Dashboard</h1>
            {/* Renders matched child route (home.tsx or settings.tsx) */}
            <Outlet />
        </div>
    );
}
```

**Common mistake:** Forgetting `<Outlet />` means child routes won't render.

### Root Route

Every route in `routes.ts` is automatically nested inside `app/root.tsx`, which serves as the application shell.

## Layout Routes

Layout routes create nesting for their children **without adding URL segments**. They provide shared UI and logic (like authentication middleware) without affecting paths.

```tsx
// app/routes.ts
import {
    type RouteConfig,
    route,
    layout,
    index,
    prefix
} from '@react-router/dev/routes';

export default [
    // Marketing layout (no URL segment added)
    layout('./marketing/layout.tsx', [
        index('./marketing/home.tsx'), // Matches /
        route('contact', './marketing/contact.tsx') // Matches /contact
    ]),

    // Projects with nested layout
    ...prefix('projects', [
        index('./projects/home.tsx'), // Matches /projects
        layout('./projects/project-layout.tsx', [
            route(':pid', './projects/project.tsx'), // Matches /projects/:pid
            route(':pid/edit', './projects/edit-project.tsx') // Matches /projects/:pid/edit
        ])
    ])
] satisfies RouteConfig;
```

### Layout Route Behavior

- **No path added** - Layouts don't modify URLs, only provide nesting
- **Middleware pattern** - Perfect for authentication, logging, context providers
- **Shared UI** - Common headers, sidebars, or wrappers

### Real-World Example (Authentication)

```tsx
// app/routes.ts
import { Paths } from './constants';

export default [
    // Public routes
    route(Paths.SIGN_IN, 'routes/sign-in.tsx'),

    // Protected routes with auth middleware
    layout('routes/authenticated.tsx', [
        route(Paths.DASHBOARD, 'routes/dashboard.tsx'),
        route(Paths.PROFILE, 'routes/profile.tsx')
    ])
] satisfies RouteConfig;
```

```tsx
// app/routes/authenticated.tsx
import type { Route } from './+types/authenticated';
import { Outlet } from 'react-router';
import { authMiddleware } from '~/middleware/auth';

// Middleware runs for all children
export async function loader(args: Route.LoaderArgs) {
    return authMiddleware(args);
}

export default function AuthenticatedLayout() {
    return <Outlet />;
}
```

**See `.github/instructions/better-auth.instructions.md` for complete authentication patterns.**

## Index Routes

Index routes render at their parent's URL path, acting as the "default" child route.

```ts
// app/routes.ts
import { type RouteConfig, route, index } from '@react-router/dev/routes';

export default [
    // Renders into root.tsx <Outlet /> at /
    index('./home.tsx'),

    route('dashboard', './dashboard.tsx', [
        // Renders into dashboard.tsx <Outlet /> at /dashboard
        index('./dashboard-home.tsx'),
        route('settings', './dashboard-settings.tsx') // /dashboard/settings
    ])
] satisfies RouteConfig;
```

### Index Route Rules

✅ **Use index routes for:**

- Default child content
- Home pages within sections
- Overview/summary pages

❌ **Index routes cannot:**

- Have children (they're leaf nodes)
- Have their own path segments

### URL Mapping

| Route Configuration             | URL Path              | Renders Into    |
| ------------------------------- | --------------------- | --------------- |
| `index('./home.tsx')`           | `/`                   | `root.tsx`      |
| `index('./dashboard-home.tsx')` | `/dashboard`          | `dashboard.tsx` |
| `route('settings', ...)`        | `/dashboard/settings` | `dashboard.tsx` |

## Route Prefixes

The `prefix()` helper adds a path prefix to multiple routes **without creating a parent route**. It's purely a path modification utility.

```tsx
// app/routes.ts
import {
    type RouteConfig,
    route,
    layout,
    index,
    prefix
} from '@react-router/dev/routes';

export default [
    layout('./marketing/layout.tsx', [
        index('./marketing/home.tsx'),
        route('contact', './marketing/contact.tsx')
    ]),

    // Prefix all routes with 'projects'
    ...prefix('projects', [
        index('./projects/home.tsx'), // /projects
        layout('./projects/project-layout.tsx', [
            route(':pid', './projects/project.tsx'), // /projects/:pid
            route(':pid/edit', './projects/edit-project.tsx') // /projects/:pid/edit
        ])
    ])
] satisfies RouteConfig;
```

### How Prefix Works

**Prefix is a path transformation, not a route.** It doesn't create a new route component or loader.

```ts
// These are equivalent:

// Using prefix
...prefix("parent", [
  route("child1", "./child1.tsx"),
  route("child2", "./child2.tsx"),
])

// Without prefix (manual path construction)
route("parent/child1", "./child1.tsx"),
route("parent/child2", "./child2.tsx"),
```

### When to Use Prefix

✅ **Use `prefix()` when:**

- Grouping routes under a common path segment
- Organizing API routes (e.g., `...prefix('api', [...])`)
- No shared layout or logic needed

❌ **Use `layout()` instead when:**

- Need shared UI components
- Applying middleware (auth, logging)
- Shared data loading logic

## Dynamic Segments

Path segments starting with `:` are dynamic segments that capture URL values and provide them as typed `params`.

```ts
// app/routes.ts
route("teams/:teamId", "./team.tsx"),
```

```tsx
// app/team.tsx
import type { Route } from './+types/team';
import { prisma } from '~/db.server';

export async function loader({ params }: Route.LoaderArgs) {
    // params is typed: { teamId: string }
    const team = await prisma.team.findUnique({
        where: { id: params.teamId }
    });
    return { team };
}

export default function Component({ loaderData }: Route.ComponentProps) {
    return <h1>{loaderData.team.name}</h1>;
}
```

### Multiple Dynamic Segments

Routes can have multiple dynamic segments, all automatically typed.

```ts
// app/routes.ts
route("c/:categoryId/p/:productId", "./product.tsx"),
```

```tsx
// app/product.tsx
import type { Route } from './+types/product';

export async function loader({ params }: Route.LoaderArgs) {
    // params is typed: { categoryId: string; productId: string }
    const product = await prisma.product.findUnique({
        where: {
            id: params.productId,
            categoryId: params.categoryId
        }
    });
    return { product };
}
```

### Type Safety

**Dynamic segments are automatically typed** when using generated route types from `./+types/[routeName]`.

```tsx
// ✅ CORRECT - Automatic type safety
import type { Route } from './+types/product';

export async function loader({ params }: Route.LoaderArgs) {
    params.productId; // ✅ TypeScript knows this exists
    params.invalid; // ❌ TypeScript error
}
```

## Optional Segments

Add `?` to make route segments optional. Works with both dynamic and static segments.

### Optional Dynamic Segments

```ts
// app/routes.ts
route(":lang?/categories", "./categories.tsx"),
```

```tsx
// app/categories.tsx
import type { Route } from './+types/categories';

export async function loader({ params }: Route.LoaderArgs) {
    // params.lang is string | undefined
    const lang = params.lang || 'en';
    return { categories: await getCategories(lang) };
}
```

### Optional Static Segments

```ts
// app/routes.ts
route('users/:userId/edit?', './user.tsx');
```

**This route matches both:**

- `/users/123` - View mode
- `/users/123/edit` - Edit mode

```tsx
// app/user.tsx
import { useLocation } from 'react-router';

export default function User({ loaderData }: Route.ComponentProps) {
    const location = useLocation();
    const isEditMode = location.pathname.endsWith('/edit');

    return isEditMode ? <EditForm /> : <ViewProfile />;
}
```

## Splat Routes (Catchall)

Also known as "catchall" or "star" segments. The `/*` pattern matches any characters following the `/`, including additional `/` characters.

### File Path Matching

```ts
// app/routes.ts
route("files/*", "./files.tsx"),
```

```tsx
// app/files.tsx
import type { Route } from './+types/files';

export async function loader({ params }: Route.LoaderArgs) {
    // params["*"] contains everything after /files/
    // Example: /files/documents/2024/report.pdf
    // params["*"] = "documents/2024/report.pdf"

    const filePath = params['*'];
    return { file: await getFile(filePath) };
}
```

### Destructuring Splat Parameters

You must rename `*` when destructuring:

```tsx
export async function loader({ params }: Route.LoaderArgs) {
    const { '*': splat } = params;
    // Now use 'splat' instead of params["*"]
    return { path: splat };
}
```

### 404 Catchall Route

Use a splat route to handle unmatched URLs:

```ts
// app/routes.ts
export default [
    // ... your other routes

    // Must be last - catches everything not matched above
    route('*', './catchall.tsx')
] satisfies RouteConfig;
```

```tsx
// app/catchall.tsx
import { data } from 'react-router';

export function loader() {
    throw data('Page Not Found', { status: 404 });
}
```

**Note:** This triggers the error boundary. See `.github/instructions/error-boundaries.instructions.md` for error handling patterns.

## Component Routes (Limited Use)

You can define routes using `<Routes>` and `<Route>` components anywhere in your component tree for UI-only routing.

```tsx
import { Routes, Route } from 'react-router';

function Wizard() {
    return (
        <div>
            <h1>Multi-Step Wizard</h1>
            <Routes>
                <Route index element={<StepOne />} />
                <Route path="step-2" element={<StepTwo />} />
                <Route path="step-3" element={<StepThree />} />
            </Routes>
        </div>
    );
}
```

### Limitations

Component routes **do not** support:

- ❌ Data loading (loaders)
- ❌ Form actions
- ❌ Code splitting
- ❌ Type-safe params
- ❌ Error boundaries
- ❌ Meta tags

### When to Use

✅ **Use component routes for:**

- Multi-step wizards/forms within a single route
- Tab/modal navigation that doesn't need URLs
- Pure UI state routing

✅ **Use config-based routes (`app/routes.ts`) for:**

- Data loading requirements
- Server actions
- Shareable URLs
- SEO concerns
- Most application routing

**In this project, prefer config-based routes in `app/routes.ts` for almost all cases.**

## Best Practices

### ✅ Do

- Define all main routes in `app/routes.ts`
- Use `layout()` for shared UI and middleware
- Use `prefix()` for path organization without layouts
- Run `npm run typecheck` after route changes
- Import route types as `./+types/[routeName]`
- Use `<Outlet />` in parent/layout routes
- Use `throw data()` for 404s in loaders

### ❌ Don't

- Use file-based routing conventions (not standard here)
- Forget `<Outlet />` in layout routes
- Skip type generation after adding routes
- Use component routes when you need data loading
- Manually construct dynamic URLs (use `href()` helper)

## Real-World Route Structure

```ts
// app/routes.ts - This project's pattern
import {
    type RouteConfig,
    route,
    layout,
    index,
    prefix
} from '@react-router/dev/routes';
import { Paths } from './constants';

export default [
    // Public routes
    index('routes/home.tsx'),
    route(Paths.SIGN_IN, 'routes/sign-in.tsx'),
    route(Paths.SIGN_OUT, 'routes/sign-out.tsx'),

    // Protected routes with auth middleware
    layout('routes/authenticated.tsx', [
        route(Paths.DASHBOARD, 'routes/dashboard.tsx'),
        route(Paths.PROFILE, 'routes/profile.tsx'),

        // Admin section
        ...prefix('admin', [route('/design', 'routes/admin/design.tsx')])
    ]),

    // API routes
    ...prefix('api', [
        route('profile', 'routes/api/profile.ts'),
        route('auth/*', 'routes/api/auth/better-auth.ts')
    ]),

    // Payment routes
    ...prefix('payment', [route('success', 'routes/payment/success.tsx')])
] satisfies RouteConfig;
```

## Additional Resources

- **React Router 7 Complete Guide**: `.github/instructions/react-router.instructions.md`
- **Authentication Patterns**: `.github/instructions/better-auth.instructions.md`
- **Form Handling**: `.github/instructions/form-validation.instructions.md`
- **Error Boundaries**: `.github/instructions/error-boundaries.instructions.md`
- **API Endpoints**: `.github/instructions/api-endpoints.instructions.md`
