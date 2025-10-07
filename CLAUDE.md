# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
npm run dev           # Start development server (auto-generates types)
npm run build         # Production build
npm run typecheck     # Generate types + run TypeScript checks
npm start             # Start production server
npm run seed          # Seed database with initial data

# Database operations
npx prisma generate   # Regenerate Prisma client (after schema changes)
npx prisma migrate dev --name <description>  # Apply database migrations
npx prisma migrate deploy  # Production migrations
```

## Architecture Overview

This is a modern full-stack boilerplate using **React Router 7** (not v6) with BetterAuth authentication, OpenAI integration, and clean architecture patterns.

**📋 Important: Reference `.github/instructions/form-validation.instructions.md` for the universal form validation pattern used throughout this application.**

The key architectural patterns are:

### Config-Based Routing (React Router 7)

- Routes are defined in `app/routes.ts` using `@react-router/dev/routes`
- **NEVER** use file-based routing patterns or React Router v6 syntax
- Always import route types as `./+types/[routeName]` (relative to route file)
- Run `npm run typecheck` after adding routes to generate types

#### Meta Tags (React 19 Pattern)

- Use React 19's built-in `<title>` and `<meta>` elements directly in component JSX
- **DO NOT** use the legacy `meta()` export function
- Place meta elements at the top of component return, wrapped in a fragment if needed
- Meta elements automatically render in document `<head>`

```tsx
export default function MyRoute() {
    return (
        <>
            <title>Page Title - TWS Foundations</title>
            <meta name="description" content="Page description here" />
            <Container>
                {/* Page content */}
            </Container>
        </>
    );
}
```

### Singleton Pattern Services

- **Database**: `app/db.server.ts` - Global Prisma client
- **Auth**: `app/lib/auth.server.ts` - BetterAuth instance with Polar plugin
- **Polar**: `app/lib/polar.server.ts` - Polar SDK client singleton
- **AI**: `app/lib/ai.ts` - OpenAI client singleton
- **Cache**: `app/lib/cache.ts` - FlatCache instance with TTL support

### Custom Prisma Configuration

- Prisma client outputs to `app/generated/prisma` (not default location)
- Database singleton pattern prevents connection pooling issues
- BetterAuth adapter configured for PostgreSQL

### Middleware Architecture

- **Authentication**: `app/middleware/auth.ts` - Protects routes using `authMiddleware`
- **Logging**: `app/middleware/logging.ts` - Request/response logging with unique IDs
- **Context**: `app/middleware/context.ts` - React Router contexts for user and request ID
- Applied in layout routes (e.g., `routes/authenticated.tsx`) not individual routes

### Model Layer Pattern (Data Access Layer)

- **NEVER** call Prisma directly in route files (loaders/actions)
- All database operations must be abstracted into model functions in `app/models/[entity].server.ts`
- Model files encapsulate all database logic for a specific entity (e.g., User, Post, Comment)
- Routes import and call model functions instead of using `prisma.*` directly
- Benefits: Better testability, reusability, and separation of concerns

**Example: `app/models/user.server.ts`**

```typescript
import { prisma } from '~/db.server';

export function getUserProfile(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            bio: true,
            // ... other fields
        }
    });
}

export function updateUser({
    userId,
    data
}: {
    userId: string;
    data: {
        name: string;
        bio?: string | null;
        // ... other fields
    };
}) {
    return prisma.user.update({
        where: { id: userId },
        data
    });
}

export function deleteUser(userId: string) {
    return prisma.user.delete({
        where: { id: userId }
    });
}
```

**Usage in routes:**

```typescript
// ✅ CORRECT - Use model functions
import { getUserProfile, updateUser } from '~/models/user.server';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const profile = await getUserProfile(user.id);
    return json({ profile });
}

// ❌ WRONG - Direct Prisma calls in routes
import { prisma } from '~/db.server';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const profile = await prisma.user.findUnique({ where: { id: user.id } });
    return json({ profile });
}
```

**Reference Implementation:** See `app/models/user.server.ts` and `app/routes/api/profile.ts` for the canonical example.

### CVA Configuration for Styling

- **CVA (Class Variance Authority)** configured in `app/cva.config.ts` with `tailwind-merge` integration
- Use `cx()` for className merging (replaces traditional `cn()` utility)
- Use `cva()` for creating component variants with type-safe props
- Use `compose()` for composing multiple CVA variants together
- **DaisyUI 5** CSS component library integrated with Tailwind CSS 4
- Reference comprehensive patterns in `.github/instructions/component-patterns.instructions.md`

## Key Development Patterns

### Adding Protected Routes

1. Add route under authenticated layout in `app/routes.ts`:

   ```typescript
   layout('routes/authenticated.tsx', [
       route('new-feature', 'routes/new-feature.tsx')
   ])
   ```

2. Middleware in `routes/authenticated.tsx` automatically protects all child routes
3. Access user via context: `const { user } = useAuthenticatedContext()`
4. Run `npm run typecheck` to generate types
5. For API routes (no middleware), manually call `requireUser(request)` in loader/action

### Creating API Endpoints

1. Add route to `api` prefix in `app/routes.ts`:

   ```typescript
   ...prefix('api', [
       route('new-endpoint', 'routes/api/new-endpoint.ts')
   ])
   ```

2. Create handler in `app/routes/api/` with loader (GET) and/or action (POST/PUT/DELETE)
3. Use `requireUser(request)` for authentication (no middleware on API routes)
4. Handle multiple HTTP methods in action by checking `request.method`
5. Return JSON responses: `return json({ data })`

### Creating Feature CRUD Operations

**📋 Important: Reference `.github/instructions/crud-pattern.instructions.md` for comprehensive CRUD implementation patterns.**

For any feature requiring Create, Read, Update, Delete operations, follow the **API-first pattern**:

**Why API-first?**
- ✅ RESTful and modular architecture
- ✅ Reusable from anywhere in the application
- ✅ Better separation of concerns (API vs UI)
- ✅ Supports programmatic access and future integrations
- ✅ Follows established auth endpoint pattern

**Structure:**

```
app/models/[entity].server.ts        # Model layer (database operations)
  ↳ CRUD functions that encapsulate Prisma calls
  ↳ Example: getUserProfile(), updateUser(), deleteUser()

app/routes/api/[feature].ts          # API endpoint (business logic)
  ↳ loader()  - GET (read data)
  ↳ action()  - POST (create), PUT (update), DELETE (delete)
  ↳ requireUser() for authentication
  ↳ getValidatedFormData() for validation
  ↳ Call model functions (NOT direct Prisma)

app/routes/[feature].tsx              # UI route (presentation)
  ↳ loader()   - Fetch initial data for page render
  ↳ Component  - useFetcher() to call API endpoint
  ↳ Form validation and UX
```

**Example: Profile CRUD** (`app/routes/api/profile.ts`)

```typescript
import type { Route } from './+types/profile';
import { data, json } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { getValidatedFormData } from '~/lib/form-validation.server';
import { profileUpdateSchema } from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { getUserProfile, updateUser, deleteUser } from '~/models/user.server';

// GET - Read profile
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    const profile = await getUserProfile(user.id);

    return json({ profile });
}

// POST/PUT/DELETE - Create, Update, Delete
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    if (request.method === 'PUT') {
        const { data: validatedData, errors } = await getValidatedFormData(
            request,
            zodResolver(profileUpdateSchema)
        );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        const updatedUser = await updateUser({
            userId: user.id,
            data: validatedData!
        });

        return json({ success: true, user: updatedUser });
    }

    if (request.method === 'DELETE') {
        await deleteUser(user.id);

        return json({ success: true });
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
```

**Reference Implementation:** See `app/routes/api/profile.ts` and `app/models/user.server.ts` as the canonical example.

### Database Schema Management

- Prisma client outputs to `app/generated/prisma` (not default location)
- BetterAuth requires specific models: User, Account, Session, Verification
- After schema changes:
  1. Run `npx prisma migrate dev --name description` to create migration
  2. Run `npx prisma generate` to update Prisma client
  3. Restart dev server
- Import Prisma types from `~/generated/prisma/client`
- Always use singleton: `import { prisma } from '~/db.server'`

### Authentication Flow

- BetterAuth with Prisma adapter handles all auth logic
- Session helpers in `app/lib/session.server.ts`:
  - `requireUser()` for protected routes (throws redirect if not authenticated)
  - `requireAnonymous()` for auth pages (redirects authenticated users)
  - `getUser()` for optional user context (returns null if not authenticated)
- Middleware-based protection in `app/middleware/auth.ts` for layout routes
- Client-side auth via `authClient` from `app/lib/auth-client.ts` (Better Auth React)

### Polar Integration (Payments & Billing)

**📋 Important: Reference `.github/instructions/polar.instructions.md` for Polar integration patterns.**

Polar is integrated via the BetterAuth plugin system for seamless auth + payments flow:

- **Server config**: `app/lib/auth.server.ts` - Polar plugin with checkout, portal, usage, webhooks
- **Client config**: `app/lib/auth-client.ts` - `polarClient()` plugin enables `authClient.checkout()`, `authClient.customer.*` methods
- **Polar client**: `app/lib/polar.server.ts` - Singleton Polar SDK instance
- **Auto customer creation**: When `createCustomerOnSignUp: true`, new users automatically get Polar customers with `externalId` = user ID

#### Available Client Methods

```typescript
// Checkout - Redirect to Polar checkout
await authClient.checkout({
    products: ["product-id"],
    slug: "pro" // If configured in checkout.products
});

// Customer Portal - Manage orders & subscriptions
await authClient.customer.portal();

// Customer State - All customer data, subscriptions, benefits, meters
const { data: customerState } = await authClient.customer.state();

// List benefits, orders, subscriptions
const { data: benefits } = await authClient.customer.benefits.list();
const { data: orders } = await authClient.customer.orders.list();
const { data: subscriptions } = await authClient.customer.subscriptions.list();

// Usage-based billing
await authClient.usage.ingest({ event: "api-call", metadata: { count: 1 } });
const { data: meters } = await authClient.usage.meters.list();
```

#### Webhook Handling

Webhooks are handled by BetterAuth plugin at `/api/auth/*` endpoints (configured in `auth.server.ts`):
- Automatic signature verification using `POLAR_WEBHOOK_SECRET`
- Granular event handlers: `onOrderPaid`, `onCustomerStateChanged`, etc.
- Catch-all: `onPayload` for all events

Configure webhook endpoint in Polar Organization Settings: `https://your-domain.com/api/auth/polar/webhooks`

### AI Integration

- OpenAI client singleton in `app/lib/ai.ts`
- Streaming responses using `streamText()` from `ai` package
- Client-side integration with `useChat()` hook from `@ai-sdk/react`

### Caching Strategy

- File-based caching with TTL support via `flat-cache`
- User-scoped keys: `getUserScopedKey(userId, key)`
- Check expiration: `isCacheExpired(key)`

## Required Environment Variables

```bash
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:5173"
OPENAI_API_KEY="sk-..."

# Polar.sh billing integration
POLAR_ACCESS_TOKEN="polar_at_..."           # Get from Polar Organization Settings
POLAR_SERVER="sandbox"                      # or "production"
POLAR_SUCCESS_URL="http://localhost:5173/payment/success"
POLAR_WEBHOOK_SECRET="your-webhook-secret"  # Get from Polar webhook configuration
```

## Critical Anti-Patterns to Avoid

- ❌ Using React Router v6 patterns or `react-router-dom`
- ❌ File-based routing assumptions (routes.ts is source of truth)
- ❌ Using legacy `meta()` export function (use React 19 `<title>` and `<meta>` elements)
- ❌ Direct Prisma calls in route files (use model functions from `~/models/`)
- ❌ Direct Prisma imports in routes (use singleton from `~/db.server` only in model files)
- ❌ Missing type generation (`npm run typecheck` after route changes)
- ❌ Manual session management (use session helpers)
- ❌ Bypassing auth middleware for protected routes
- ❌ Using `cn()` instead of `cx()` for className merging
- ❌ Creating components without CVA variants
- ❌ Not extending native HTML attributes in component interfaces

## Component Development Patterns

### UI Component Standards (DaisyUI + CVA + TypeScript)

All UI components follow a canonical CVA-based pattern. See `.github/instructions/component-patterns.instructions.md` for comprehensive documentation. Reference implementations: `Button.tsx` (canonical), `TextInput.tsx` (form components).

#### CVA-Based Component Pattern

```typescript
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

// 1. Define CVA variants with DaisyUI classes
export const componentVariants = cva({
    base: 'btn',  // DaisyUI base class
    variants: {
        variant: {
            outline: 'btn-outline',
            ghost: 'btn-ghost',
            // ... other DaisyUI variants
        },
        status: {
            primary: 'btn-primary',
            error: 'btn-error',
            // ... semantic colors
        },
        size: {
            xs: 'btn-xs',
            md: 'btn-md',
            // ... sizes
        }
    },
    defaultVariants: {
        status: 'primary',
        size: 'md'
    }
});

// 2. Props interface extends HTML attributes + CVA variants
interface ComponentProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof componentVariants> {}

// 3. Component implementation with variant destructuring
export function Component({
    variant,
    status,
    size,
    className,
    ...props
}: ComponentProps) {
    return (
        <button
            className={cx(
                componentVariants({ variant, status, size }),
                className
            )}
            {...props}
        />
    );
}
```

#### Form Components - Additional Requirements

- Label with required indicator (`*`)
- Error/helper text with proper styling
- Accessibility: ARIA attributes, semantic HTML
- Standalone or wrapped rendering based on props

### Form Validation Pattern (Server + Client)

This project uses a hybrid validation approach with Zod schemas validated on both client and server:

**Server-side utilities** (`app/lib/form-validation.server.ts`):
- `parseFormData(request)` - Extract FormData from POST body or GET params
- `getValidatedFormData(request, resolver)` - Validate with Zod, return `{ errors, data, receivedValues }`

**Client-side hook** (`app/lib/form-hooks.ts`):
- `useValidatedForm(options)` - Wraps React Hook Form's `useForm`
- Automatically syncs server errors with form state via `errors` option
- Maintains full React Hook Form API

**Authentication pattern** (special case - uses client-side Better Auth):
- Authentication uses `authClient` from `app/lib/auth-client.ts` directly on the client
- Client validates with React Hook Form + Zod, then calls `authClient.signIn.email()` or `authClient.signUp.email()`
- Better Auth automatically handles session cookies via `/api/auth/*` endpoints
- Use `useNavigate()` in `onSuccess` callback for post-auth redirects
- Server-side sign-out handled by `/api/auth/authenticate` (DELETE method only)
- See `.github/instructions/better-auth.instructions.md` for complete auth patterns

**Standard form pattern** (for CRUD operations):
1. Client validates with React Hook Form + Zod (instant feedback)
2. Form submits to server via `useFetcher()`
3. Server validates with same Zod schema (security)
4. Server errors automatically populate form fields
5. Server executes business logic and returns success/redirect

**Zod schemas** in `app/lib/validations.ts`:
- Type inference: `z.infer<typeof schema>`
- Pre-built schemas: `signInSchema`, `signUpSchema`, `chatMessageSchema`
- Consistent error messaging across client and server

## Import Patterns

```typescript
// Model layer (use in routes - NEVER import prisma directly in routes)
import { getUserProfile, updateUser, deleteUser } from "~/models/user.server";

// Prisma client (ONLY use in model files, NOT in routes)
import { prisma } from "~/db.server";
import type { User } from "~/generated/prisma/client";

// Route types (ALWAYS relative import)
import { Route } from "./+types/dashboard";

// Auth helpers
import { requireUser, getUser, requireAnonymous } from "~/lib/session.server";
import { authClient } from "~/lib/auth-client";

// Polar client (server-side only)
import { polarClient } from "~/lib/polar.server";

// AI client
import { openai } from "~/lib/ai";

// Caching
import { getCachedData, setCachedData, getUserScopedKey } from "~/lib/cache";

// Validation
import { signInSchema, signUpSchema } from "~/lib/validations";
import { getValidatedFormData } from "~/lib/form-validation.server";
import { useValidatedForm } from "~/lib/form-hooks";

// CVA utilities
import { cx, cva, compose } from "~/cva.config";
import type { VariantProps } from "cva";

// Contexts (in protected routes)
import { useAuthenticatedContext } from "~/middleware/context";

// React Hook Form
import { zodResolver } from "@hookform/resolvers/zod";
```
