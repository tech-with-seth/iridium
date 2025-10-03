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

This is a modern full-stack boilerplate using **React Router 7** (not v6) with BetterAuth authentication, OpenAI integration, and clean architecture patterns. The key architectural patterns are:

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
- **Auth**: `app/lib/auth.server.ts` - BetterAuth instance
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

# Optional - for Polar.sh billing integration
POLAR_ACCESS_TOKEN="polar_at_..."
POLAR_SERVER="sandbox"  # or "production"
POLAR_WEBHOOK_SECRET="your-polar-webhook-secret"
```

## Critical Anti-Patterns to Avoid

- ❌ Using React Router v6 patterns or `react-router-dom`
- ❌ File-based routing assumptions (routes.ts is source of truth)
- ❌ Using legacy `meta()` export function (use React 19 `<title>` and `<meta>` elements)
- ❌ Direct Prisma imports (use singleton from `~/db.server`)
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

### Validation Pattern

- Zod schemas in `app/lib/validations.ts`
- Type inference: `z.infer<typeof schema>`
- Pre-built schemas: `signInSchema`, `signUpSchema`, `chatMessageSchema`
- Consistent error messaging across forms

## Import Patterns

```typescript
// Prisma client (custom output path)
import { prisma } from "~/db.server";
import type { User } from "~/generated/prisma/client";

// Route types (ALWAYS relative import)
import { Route } from "./+types/dashboard";

// Auth helpers
import { requireUser, getUser, requireAnonymous } from "~/lib/session.server";
import { authClient } from "~/lib/auth-client";

// AI client
import { openai } from "~/lib/ai";

// Caching
import { getCachedData, setCachedData, getUserScopedKey } from "~/lib/cache";

// Validation
import { userSchema } from "~/lib/validations";

// CVA utilities
import { cx, cva, compose } from "~/cva.config";
import type { VariantProps } from "cva";

// Contexts (in protected routes)
import { useAuthenticatedContext } from "~/middleware/context";
```
