# Routing with React Router 7

Iridium uses React Router 7, which provides a modern, type-safe framework for building full-stack web applications.

## Overview

React Router 7 (formerly Remix v3) combines client-side routing with server-side rendering and provides data loading primitives that eliminate the need for separate state management libraries.

## Configuration

Routes are configured in `app/routes.ts` using config-based routing:

```typescript
import {
    type RouteConfig,
    index,
    layout,
    route,
} from '@react-router/dev/routes';

export default [
    index('routes/home.tsx'),
    route('login', 'routes/login.tsx'),
    route('signup', 'routes/signup.tsx'),

    layout('routes/app/layout.tsx', [
        route('dashboard', 'routes/app/dashboard.tsx'),
        route('profile', 'routes/app/profile.tsx'),
    ]),
] satisfies RouteConfig;
```

## Route Files

Each route file exports three main functions:

### Loader

The `loader` function runs on the server before rendering and provides data to the component:

```typescript
import { Route } from './+types/dashboard';

export async function loader({ request, params }: Route.LoaderArgs) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
        throw redirect('/login');
    }

    const user = await getUserById(session.user.id);

    return { user };
}
```

### Action

The `action` function handles form submissions and mutations:

```typescript
import { Route } from './+types/profile';

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();
    const name = formData.get('name');

    await updateUser(params.userId, { name });

    return { success: true };
}
```

### Component

The default export is the React component. Access loader data via props (not hooks):

```typescript
import { Route } from "./+types/dashboard";

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
    </div>
  );
}
```

## Type Safety

React Router 7 generates types for each route in the `+types` directory:

```typescript
// Automatically generated types for your route
import { Route } from './+types/dashboard';

// Use these types in your loader, action, and component
export async function loader({ request, params }: Route.LoaderArgs) {
    // params are typed based on your route definition
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
    // loaderData is typed based on your loader return type
}
```

## Data Loading Patterns

### Loading Data

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    const results = await searchDatabase(query);

    return { results, query };
}
```

### Handling Errors

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUser(request);

    if (!user) {
        throw new Response('Not Found', { status: 404 });
    }

    return { user };
}
```

### Parallel Data Loading

React Router 7 automatically parallelizes loader calls:

```typescript
// Both loaders run in parallel
export default [
    route('dashboard', 'routes/dashboard.tsx'), // loader runs
    layout('routes/layout.tsx', [
        // loader runs
        // nested routes
    ]),
] satisfies RouteConfig;
```

## Form Handling

### Basic Form

```typescript
import { Form } from "react-router";

export default function ContactForm({ loaderData }: Route.ComponentProps) {
  return (
    <Form method="post">
      <input type="text" name="name" />
      <input type="email" name="email" />
      <button type="submit">Submit</button>
    </Form>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  await createContact(data);

  return redirect("/success");
}
```

### Form Validation

Use Zod for validation in actions:

```typescript
import { z } from 'zod';

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = schema.safeParse(data);

    if (!result.success) {
        return { errors: result.error.flatten() };
    }

    await createUser(result.data);
    return redirect('/dashboard');
}
```

## Navigation

### Link Component

```typescript
import { Link } from "react-router";

function Navigation() {
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
}
```

### Programmatic Navigation

Use `redirect` in loaders and actions:

```typescript
export async function action({ request }: Route.ActionArgs) {
    await performAction();
    return redirect('/success');
}
```

For client-side navigation, use the `useNavigate` hook:

```typescript
import { useNavigate } from "react-router";

function MyComponent() {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/dashboard");
  }

  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

## Resource Routes (API Endpoints)

Create API endpoints using resource routes:

```typescript
// app/routes/api/users.ts
import { Route } from './+types/api.users';

export async function loader({ request }: Route.LoaderArgs) {
    const users = await getUsers();
    return Response.json(users);
}

export async function action({ request }: Route.ActionArgs) {
    if (request.method === 'POST') {
        const data = await request.json();
        const user = await createUser(data);
        return Response.json(user, { status: 201 });
    }

    if (request.method === 'PUT') {
        const data = await request.json();
        const user = await updateUser(data);
        return Response.json(user);
    }

    if (request.method === 'DELETE') {
        await deleteUser(request);
        return new Response(null, { status: 204 });
    }

    return new Response('Method Not Allowed', { status: 405 });
}
```

## Layouts

Use layouts to share UI across multiple routes:

```typescript
// app/routes/app/layout.tsx
import { Outlet } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  return { user: session?.user };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <header>
        <nav>{/* Navigation */}</nav>
      </header>
      <main>
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  );
}
```

## Meta Tags and SEO

Export a `meta` function to set page metadata:

```typescript
import { Route } from './+types/about';

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: 'About Us' },
        { name: 'description', content: 'Learn about our company' },
        { property: 'og:title', content: 'About Us' },
    ];
}
```

## Streaming and Suspense

React Router 7 supports streaming responses with Suspense:

```typescript
import { Suspense } from "react";
import { Await } from "react-router";

export async function loader() {
  return {
    criticalData: await getCriticalData(),
    slowData: getSlowData(), // Don't await - returns a promise
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>{loaderData.criticalData}</h1>

      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={loaderData.slowData}>
          {(data) => <div>{data}</div>}
        </Await>
      </Suspense>
    </div>
  );
}
```

## Error Boundaries

Handle errors with error boundaries:

```typescript
import { isRouteErrorResponse } from "react-router";
import { Route } from "./+types/dashboard";

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Unexpected Error</h1>
      <p>{error.message}</p>
    </div>
  );
}
```

## Best Practices

1. **Use config-based routing** - Defined in `app/routes.ts`
2. **Access data via props** - Use `loaderData` from props, not hooks
3. **Avoid useEffect** - Most use cases are handled by loaders and actions
4. **Keep loaders fast** - They block rendering, so optimize queries
5. **Validate in actions** - Use Zod for server-side validation
6. **Use resource routes for APIs** - Keep API logic separate from UI routes
7. **Leverage parallel loading** - React Router 7 automatically parallelizes loaders

## Common Patterns

### Protected Routes

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
        throw redirect('/login');
    }

    return { user: session.user };
}
```

### Conditional Redirects

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (session) {
        throw redirect('/dashboard');
    }

    return {};
}
```

### Search Parameters

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const results = await getPaginatedResults(page);

    return { results, page };
}
```

## Further Reading

- [React Router 7 Documentation](https://reactrouter.com/dev)
- [Architecture Decision: React Router 7](./decisions/001-react-router-7.md)
- [Forms Documentation](./forms.md)
- [Authentication Documentation](./authentication.md)
