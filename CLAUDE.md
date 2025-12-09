# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Iridium is now a **small, opinionated starter** for React Router 7 apps.

**Core Features (Included):**

- ✅ BetterAuth email/password authentication
- ✅ Simple dashboard and profile editor
- ✅ AI chat demo (Vercel AI SDK + OpenAI)
- ✅ PostgreSQL + Prisma ORM
- ✅ Config-based routing, middleware patterns, model-layer architecture
- ✅ Hybrid form validation (client + server)

**Optional Integrations:**

- 🔌 PostHog analytics and feature flags
- 🔌 Resend email integration

**Explicitly Scoped Out (Not Included):**

- ❌ Billing/payments (Polar)
- ❌ Multi-tenancy/organizations
- ❌ E-commerce/shop flows

If you need billing integration, see `.github/instructions/polar.instructions.md` for guidance on adding Polar.

## Essential Commands

```bash
# Development
npm run dev              # Start dev server (auto-generates route types)
npm run typecheck        # Generate route types + run TypeScript check
npm run build            # Production build

# Database
npx prisma generate      # Regenerate Prisma client after schema changes
npx prisma migrate dev --name <description>  # Create migration
npx prisma migrate deploy  # Apply migrations (production)
npm run seed             # Seed database with test users

# Testing
npm run test             # Vitest unit tests
npm run test:ui          # Vitest UI mode
npm run e2e              # Playwright E2E tests
npm run e2e:ui           # Playwright UI mode

# Formatting
npm run format           # Run Prettier
```

**Test Credentials:** `admin@iridium.com` / `Admin123!` (see `prisma/seed.ts` for all users)

## 📚 Pattern Library Quick Start

**Before implementing features**, consult the comprehensive pattern library in `.github/instructions/`:

**Critical First Reads:**

- `react-router.instructions.md` - Route type imports (prevents most common errors)
- `form-validation.instructions.md` - Client+server validation pattern
- `crud-pattern.instructions.md` - API-first CRUD operations
- `better-auth.instructions.md` - Authentication flows
- `git-workflow.instructions.md` - Git branching strategy (prevents branch divergence)

**See [Comprehensive Documentation](#comprehensive-documentation) section below for all 26+ guides organized by category.**

## Critical Architecture Patterns

### 1. Config-Based Routing (NOT File-Based)

Routes are defined in `app/routes.ts` - this is the single source of truth.

```typescript
// app/routes.ts
import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";
import { Paths } from './constants';

export default [
    index('routes/home.tsx'),

    // Protected routes with middleware
    layout('routes/authenticated.tsx', [
        route(Paths.DASHBOARD, 'routes/dashboard.tsx'),
    ]),

    // API routes
    ...prefix(Paths.API, [
        route(Paths.PROFILE, 'routes/api/profile.ts'),
    ]),
] satisfies RouteConfig;
```

**ALWAYS run `npm run typecheck` after adding/modifying routes to generate types.**

### 2. Route Type Imports - THE MOST IMPORTANT RULE

```tsx
// ✅ CORRECT - ALWAYS use this exact pattern:
import type { Route } from "./+types/dashboard";

// ❌ NEVER use relative paths like this:
import type { Route } from "../+types/dashboard";  // WRONG!
import type { Route } from "../../+types/product"; // WRONG!
```

**If you see TypeScript errors about missing `./+types/[routeName]` modules:**

1. IMMEDIATELY run `npm run typecheck` to generate types
2. NEVER try to "fix" it by changing the import path

### 3. Model Layer Pattern - NEVER Call Prisma Directly in Routes

All database operations MUST go through `app/models/` functions.

```typescript
// ❌ NEVER do this in routes:
const user = await prisma.user.findUnique({ where: { id } });

// ✅ ALWAYS do this:
import { getUserProfile } from '~/models/user.server';
const user = await getUserProfile(userId);
```

**Model Layer Files (core):**

- `app/models/user.server.ts` - User CRUD
- `app/models/email.server.ts` - Email operations (Resend optional)
- `app/models/feature-flags.server.ts` - PostHog feature flags with caching (optional)
- `app/models/message.server.ts` / `app/models/thread.ts` - Chat messages/threads

Legacy multi-tenant or billing helpers (e.g., organizations, Polar) are out of scope for the lean starter—avoid reintroducing them unless explicitly required.

### 4. Custom Prisma Output Path

This project uses a non-default Prisma client location:

```typescript
// ✅ CORRECT imports:
import { prisma } from '~/db.server';
import type { User, Role } from '~/generated/prisma/client';

// ❌ NEVER import from:
import { PrismaClient } from '@prisma/client';  // Wrong path!
```

**After schema changes:**

1. Run `npx prisma migrate dev --name description`
2. Run `npx prisma generate`
3. Restart dev server

### 5. Route Module Pattern

```tsx
import type { Route } from './+types/dashboard';
import { data, redirect } from 'react-router';
import { requireUser } from '~/lib/session.server';

// Server data loading (GET)
export async function loader({ request, params }: Route.LoaderArgs) {
    const user = await requireUser(request);
    return data({ user });
}

// Form handling (POST/PUT/PATCH/DELETE)
export async function action({ request, params }: Route.ActionArgs) {
    if (request.method === 'POST') { /* create */ }
    if (request.method === 'PUT') { /* update */ }
    if (request.method === 'DELETE') { /* delete */ }
    return redirect('/success');
}

// Component - access data via props (NOT hooks)
export default function Dashboard({ loaderData }: Route.ComponentProps) {
    return <div>{loaderData.user.name}</div>;
}
```

**Key Points:**

- Access loader data via `loaderData` prop (NOT `useLoaderData()` hook)
- Destructure params directly in function signature: `({ request, params }: Route.ActionArgs)`
- DO NOT create intermediate variables: ❌ `const { request } = args`

### 6. Form Validation Pattern - Hybrid Client + Server

Use the SAME Zod schema on both client and server.

**1. Define schema in `app/lib/validations.ts`:**

```typescript
export const profileUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    bio: z.string().max(500).optional(),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
```

**2. Server action:**

```typescript
import { validateFormData } from '~/lib/form-validation.server';
import { zodResolver } from '@hookform/resolvers/zod';

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const { data, errors } = await validateFormData<ProfileUpdateData>(
        formData,
        zodResolver(profileUpdateSchema)
    );

    if (errors) {
        return data({ errors }, { status: 400 });
    }

    await updateUser(data!);
    return redirect('/profile');
}
```

**3. Client component (use `<form>` NOT `<fetcher.Form>` when using React Hook Form):**

```tsx
const fetcher = useFetcher();
const { register, handleSubmit, formState: { errors } } = useValidatedForm({
    resolver: zodResolver(profileUpdateSchema),
    errors: fetcher.data?.errors,  // Auto-syncs server errors
});

const onSubmit = (data: ProfileUpdateData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    fetcher.submit(formData, { method: 'PUT', action: '/api/profile' });
};

// ✅ CORRECT - Use <form> with manual fetcher.submit()
<form onSubmit={handleSubmit(onSubmit)}>
    <TextInput {...register('name')} error={errors.name?.message} />
    <Button type="submit">Save</Button>
</form>

// ❌ WRONG - Don't use <fetcher.Form> with handleSubmit
<fetcher.Form onSubmit={handleSubmit(onSubmit)}>  // Causes conflicts!
```

### 7. Middleware Architecture

Middleware is applied via layout routes, NOT individual route checks.

```tsx
// app/routes/authenticated.tsx
import type { Route } from './+types/authenticated';
import { Outlet } from 'react-router';
import { authMiddleware } from '~/middleware/auth';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export default function AuthenticatedLayout() {
    return (
        <div>
            <Navbar />
            <Outlet /> {/* Child routes render here */}
        </div>
    );
}
```

**Access user in child routes:**

```tsx
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';

export default function Dashboard() {
    const { user } = useAuthenticatedContext();
    return <h1>Welcome {user.email}</h1>;
}
```

### 8. Authentication Patterns

**BetterAuth** is configured at `app/lib/auth.server.ts` with:

- Email/password authentication
- Prisma adapter with PostgreSQL
- 7-day sessions, 1-day update age
- NO email verification required

**Server-side auth checks:**

```typescript
import { requireUser, requireRole, requireAdmin } from '~/lib/session.server';

// Require any authenticated user
const user = await requireUser(request);

// Require specific role (hierarchical: USER → EDITOR → ADMIN)
const user = await requireRole(request, ['ADMIN', 'EDITOR']);

// Require admin only
const user = await requireAdmin(request);
```

**Client-side (for UI only - NEVER rely on this for security):**

```tsx
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';
import { useUserRole } from '~/hooks/useUserRole';

const { user } = useAuthenticatedContext();
const { isAdmin, isEditor } = useUserRole();
```

**Authentication forms** use client-side `authClient` (NOT server actions):

```tsx
import { authClient } from '~/lib/auth-client';
import { useNavigate } from 'react-router';

const navigate = useNavigate();

const onSubmit = async (data: SignInData) => {
    const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
    });

    if (!error) {
        navigate('/dashboard');
    }
};
```

See `.github/instructions/better-auth.instructions.md` for complete authentication patterns.

### 9. Component Development (CVA + DaisyUI)

All UI components follow the CVA (Class Variance Authority) + DaisyUI pattern.

```typescript
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

// Define variants
export const buttonVariants = cva({
    base: 'btn',
    variants: {
        status: {
            primary: 'btn-primary',
            secondary: 'btn-secondary',
        },
        size: {
            sm: 'btn-sm',
            md: 'btn-md',
            lg: 'btn-lg',
        },
    },
    defaultVariants: {
        status: 'primary',
        size: 'md',
    },
});

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {}

export function Button({ status, size, className, ...props }: ButtonProps) {
    return (
        <button
            className={cx(buttonVariants({ status, size }), className)}
            {...props}
        />
    );
}
```

**Use `cx()` NOT `cn()` for className merging.**

### 10. React 19 Meta Tags

Use native `<title>` and `<meta>` elements directly in JSX (NO `meta()` export).

```tsx
export default function MyRoute() {
    return (
        <>
            <title>Page Title - Iridium</title>
            <meta name="description" content="Page description" />
            <Container>
                {/* Page content */}
            </Container>
        </>
    );
}
```

### 11. API-First CRUD Pattern

**File structure:**

- `app/routes/api/[feature].ts` - Business logic (loader for GET, action for POST/PUT/DELETE)
- `app/routes/[feature].tsx` - Presentation layer (calls API via fetcher)

**Example API endpoint:**

```typescript
// app/routes/api/profile.ts
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const profile = await getUserProfile(user.id);
    return data({ profile });
}

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    if (request.method === 'PUT') {
        const formData = await request.formData();
        const { data, errors } = await validateFormData(/* ... */);
        if (errors) return data({ errors }, { status: 400 });

        await updateUser(data!);
        return data({ success: true });
    }

    if (request.method === 'DELETE') {
        await deleteUser(user.id);
        return data({ success: true });
    }
}
```

**Register in routes.ts:**

```typescript
...prefix(Paths.API, [
    route(Paths.PROFILE, 'routes/api/profile.ts'),
]),
```

See `.github/instructions/crud-pattern.instructions.md` for complete CRUD patterns.

## Key Integrations

### OpenAI + Vercel AI SDK (chat demo)

**Streaming chat endpoint** (`app/routes/api/chat.ts`):

```typescript
import { ai } from '~/lib/ai';
import { streamText } from 'ai';

export async function action({ request }: Route.ActionArgs) {
    const { messages } = await request.json();

    const result = streamText({
        model: ai('gpt-4o'),
        messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}
```

**Client-side:**

```tsx
import { useChat } from '@ai-sdk/react';

const { messages, input, handleInputChange, handleSubmit } = useChat();
```

### PostHog (optional analytics/feature flags)

```typescript
import { getPostHogClient } from '~/lib/posthog.ts';
import { captureException } from '~/models/posthog.server';

// Track events
posthog.capture('event_name', { property: 'value' });

// Error tracking
await captureException(error, { context: 'additional-info' });
```

### Resend Email (optional)

```typescript
import { sendEmail } from '~/models/email.server';

await sendEmail({
    to: 'user@example.com',
    subject: 'Welcome',
    react: <WelcomeEmail name="User" />,
});
```

Email templates live in `app/emails/` using React Email. Polar/billing flows are not part of the lean starter.

## Critical Import Patterns

```typescript
// Route types (ALWAYS relative import)
import type { Route } from './+types/dashboard';

// Prisma (custom output path)
import { prisma } from '~/db.server';
import type { User, Role } from '~/generated/prisma/client';

// React Router (NOT react-router-dom)
import { Link, Form, Outlet, useFetcher, redirect, data, href } from 'react-router';
import { type RouteConfig, index, route, layout, prefix } from '@react-router/dev/routes';

// Auth
import { requireUser, requireRole, requireAdmin } from '~/lib/session.server';
import { authClient } from '~/lib/auth-client';

// CVA utilities
import { cx, cva } from '~/cva.config';
import type { VariantProps } from 'cva';

// Validation
import { zodResolver } from '@hookform/resolvers/zod';
import { validateFormData } from '~/lib/form-validation.server';
import { useValidatedForm } from '~/lib/form-hooks';

// Constants
import { Paths } from '~/constants';
```

## Environment Variables

**Required:**

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Min 32 chars (`openssl rand -base64 32`)
- `BETTER_AUTH_URL` - App URL (`http://localhost:5173` for dev)

**Optional:**

- `OPENAI_API_KEY` - AI chat demo
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` - Transactional emails
- `POSTHOG_*` - Analytics & feature flags

Billing (Polar) and other legacy variables are out of scope for the lean starter.

## Development Conventions

### ALWAYS

- Use model layer for ALL database operations
- Run `npm run typecheck` after route changes
- Use middleware for layout-level route protection
- Validate forms with Zod on both client AND server
- Use `Paths` enum for route references
- Access loader data via `loaderData` prop (not hooks)
- Use `<form>` with manual `fetcher.submit()` for React Hook Form
- Import route types as `./+types/[routeName]`
- Keep scope lean (auth/profile/dashboard/chat + optional analytics/email); do not add billing or multi-tenancy unless explicitly requested

### NEVER

- Call Prisma directly in routes (use model layer)
- Use file-based routing (use config-based `routes.ts`)
- Use `useLoaderData` or `useActionData` hooks (use route props)
- Use React Router v6 patterns or `react-router-dom` package
- Import route types with `../+types/` (always `./+types/`)
- Import from `@prisma/client` (use `~/generated/prisma/client`)
- Use `useEffect` in React Router 7 (usually unnecessary)
- Skip server-side validation (never trust client only)
- Use `<fetcher.Form>` with `handleSubmit` (causes conflicts)

## File Naming Conventions

**DO NOT use flat route naming with `$` for parameters:**

```text
❌ BAD:
organizations.$slug.invitations.ts
organizations.$slug.settings.general.tsx

✅ GOOD:
organizations/invitations.ts
organizations/settings/general.tsx
```

Use directories for organization, kebab-case for file names.

## Comprehensive Documentation

The `.github/instructions/` folder contains 25+ detailed pattern guides. **Consult these BEFORE implementing features** to maintain consistency.

### Core Patterns (Read First)

| File | Purpose | When to Use |
|------|---------|-------------|
| `react-router.instructions.md` | React Router 7 patterns | Every route you create |
| `form-validation.instructions.md` | Hybrid validation | Every form |
| `crud-pattern.instructions.md` | API-first CRUD | CRUD operations |
| `component-patterns.instructions.md` | CVA + DaisyUI | New components |
| `role-based-access-control.instructions.md` | RBAC implementation | Role-based features |

### Development Workflow

- `git-workflow.instructions.md` - Git branching, merging, and release strategy

### Framework-Specific

- `better-auth.instructions.md` - Authentication implementation
- `prisma.instructions.md` - Database patterns
- `cva.instructions.md` - Component variants
- `daisyui.instructions.md` - DaisyUI components
- `zod.instructions.md` - Schema validation
- `react-hook-form.instructions.md` - Form handling

### Optional Integrations

- `posthog.instructions.md` - Analytics & feature flags
- `resend.instructions.md` - Email integration
- `polar.instructions.md` - Billing integration (not included, but documented if needed)

### Advanced Patterns

- `error-boundaries.instructions.md` - Error handling
- `error-tracking.instructions.md` - Error monitoring
- `feature-flags.instructions.md` - Feature flag patterns
- `client-side-caching.instructions.md` - Caching strategy
- `api-endpoints.instructions.md` - API design patterns

All patterns include code examples, anti-patterns, and troubleshooting.

## Common Troubleshooting

**Missing route types?**
→ Run `npm run typecheck`

**Auth not working?**
→ Check middleware in `routes/authenticated.tsx`

**Database errors?**
→ Verify import from `~/db.server` and custom Prisma path

**Form not redirecting after submit?**
→ Use `<form>` NOT `<fetcher.Form>` with React Hook Form

**Route changes not reflected?**
→ Run `npm run typecheck` after modifying `app/routes.ts`

**Validation not working?**
→ Ensure both client (`useValidatedForm`) and server (`validateFormData`) use same Zod schema
