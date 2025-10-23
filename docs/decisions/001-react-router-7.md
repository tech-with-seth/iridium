# 001: React Router 7

## Status

Accepted

## Context

We needed a full-stack React framework for building a modern web application with server-side rendering, data loading, and type safety. The framework choice impacts:

- Developer experience and productivity
- Application performance
- Type safety and maintainability
- Ecosystem and community support
- Learning curve for team members

Key requirements:

- Server-side rendering for performance and SEO
- Type-safe data loading
- File-based or config-based routing
- Built-in form handling
- Active development and maintenance
- Strong TypeScript support

## Decision

We chose React Router 7 (formerly Remix v3) as our full-stack framework.

### Key Features

**Config-Based Routing**: Routes defined in `routes.ts` for explicit control:

```typescript
export default [
    index('routes/home.tsx'),
    route('about', 'routes/about.tsx'),
] satisfies RouteConfig;
```

**Type-Safe Data Loading**: Generated types for each route:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    return { data: 'example' };
}

export default function MyRoute({ loaderData }: Route.ComponentProps) {
    // loaderData is fully typed
}
```

**Server Actions**: Handle mutations server-side:

```typescript
export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    // Handle form submission
}
```

**No Client State Management**: Loader data eliminates need for Redux, Zustand, etc.

## Consequences

### Positive

- **Excellent Developer Experience**: Type safety across client and server
- **Performance**: Server-side rendering and optimistic UI updates
- **Simplified Architecture**: No separate API layer needed
- **Modern Patterns**: Built-in support for progressive enhancement
- **Active Development**: Regular updates and improvements
- **Migration Path**: Easy upgrade from Remix
- **Reduced Boilerplate**: No need for separate state management
- **Built-in Form Handling**: Forms work without JavaScript

### Negative

- **Learning Curve**: Different mental model from traditional SPAs
- **Newer Framework**: Smaller community compared to Next.js
- **Documentation**: Still evolving as React Router 7 is relatively new
- **Deployment**: Requires Node.js server (not static-only)

### Neutral

- **Framework Lock-in**: Architecture is React Router-specific
- **Server Required**: Cannot deploy as static site
- **Migration Effort**: Moving away would require significant refactoring

## Alternatives Considered

### Next.js

**Pros:**

- Large community and ecosystem
- Extensive documentation
- Vercel deployment optimization
- App Router with React Server Components

**Cons:**

- More complex mental model with App Router
- Less straightforward data loading
- Heavy framework with many features we do not need
- Vercel-centric development

**Why not chosen:** React Router 7 provides better type safety and simpler data loading patterns without the complexity of Next.js App Router.

### Vite + React (SPA)

**Pros:**

- Simple architecture
- Fast development
- Can deploy statically
- Familiar patterns

**Cons:**

- No server-side rendering
- Worse SEO and performance
- Need separate API layer
- More complex state management

**Why not chosen:** Lack of SSR hurts performance and SEO. Separate API layer adds complexity.

### SvelteKit

**Pros:**

- Excellent DX
- Built-in features
- Great performance
- Simpler than React

**Cons:**

- Different framework (not React)
- Team lacks Svelte experience
- Smaller ecosystem
- Migration from existing React code

**Why not chosen:** Team expertise is in React. Migration cost too high.

### Astro

**Pros:**

- Great for content sites
- Island architecture
- Multi-framework support
- Excellent performance

**Cons:**

- Less suitable for dynamic apps
- Limited client-side interactivity
- Different mental model
- Not React-focused

**Why not chosen:** Better suited for content sites than interactive applications.

## Implementation Notes

### Route Structure

Routes are defined in `app/routes.ts`:

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
    layout('routes/app/layout.tsx', [
        route('dashboard', 'routes/app/dashboard.tsx'),
    ]),
] satisfies RouteConfig;
```

### Data Loading Pattern

Access data via props, not hooks:

```typescript
export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return <div>Welcome, {user.name}</div>;
}
```

### Avoid useEffect

Most use cases are handled by loaders and actions, eliminating need for useEffect.

## References

- [React Router 7 Documentation](https://reactrouter.com/dev)
- [Remix to React Router Migration Guide](https://reactrouter.com/dev/guides/migrating)
- [Type Safety Guide](https://reactrouter.com/dev/how-to/typing-routes)
- [Routing Guide](../routing.md)
