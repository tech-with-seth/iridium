# AGENTS.md

A comprehensive guide for AI coding agents working with the TWS Foundations codebase.

## Project Overview

TWS Foundations is a modern full-stack SaaS boilerplate built with:

- **React Router 7** (config-based routing, not v6 file-based)
- **React 19** (with native meta tags)
- **BetterAuth** (PostgreSQL adapter, 7-day sessions)
- **Prisma ORM** (custom output path to `app/generated/prisma`)
- **OpenAI SDK** + Vercel AI SDK (streaming responses)
- **DaisyUI 5** + **Tailwind CSS 4** (component library)
- **CVA (Class Variance Authority)** (type-safe component variants)
- **Polar.sh** (optional billing integration)
- **TypeScript** (strict mode)

### Key Architectural Patterns

1. **Config-Based Routing**: Routes defined in `app/routes.ts`, not file-based
2. **Middleware Architecture**: Auth, logging, and context middleware applied via layouts
3. **Singleton Services**: Database, auth, AI, and cache use singleton pattern
4. **CVA Component System**: All UI components use CVA for variants with DaisyUI classes
5. **Custom Prisma Output**: Client generated to `app/generated/prisma` (not default)

## Setup Commands

```bash
# Install dependencies
npm install

# Database setup (first time)
npx prisma generate
npx prisma migrate deploy
npm run seed

# Development
npm run dev              # Start dev server (auto-generates route types)
npm run typecheck        # Generate types + TypeScript check (run after route changes)

# Production
npm run build            # Production build
npm start                # Start production server

# Database operations
npx prisma generate                          # Regenerate Prisma client
npx prisma migrate dev --name <description>  # Create and apply migration
npx prisma migrate deploy                    # Production migrations
npx prisma studio                            # Open database GUI
```

## Environment Variables

Required `.env` file at repository root:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:5173"
OPENAI_API_KEY="sk-..."

# Optional - Polar.sh billing
POLAR_ACCESS_TOKEN="polar_at_..."
POLAR_SERVER="sandbox"  # or "production"
POLAR_WEBHOOK_SECRET="your-webhook-secret"
```

## Critical Development Rules

### React Router 7 - Config-Based Routing

**⚠️ CRITICAL**: Routes are NOT file-based. All routes defined in `app/routes.ts`.

```typescript
// app/routes.ts - Single source of truth
import { type RouteConfig, route, layout, prefix, index } from "@react-router/dev/routes";
import { Paths } from "./constants";

export default [
    index("routes/home.tsx"),
    route(Paths.SIGN_IN, "routes/sign-in.tsx"),
    layout("routes/authenticated.tsx", [
        route(Paths.DASHBOARD, "routes/dashboard.tsx"),
    ]),
    ...prefix("api", [
        route("endpoint", "routes/api/endpoint.ts")
    ])
] satisfies RouteConfig;
```

**After adding routes**:

1. Run `npm run typecheck` to generate route types
2. Import route types as `./+types/[routeName]` (relative import)
3. Restart dev server if types don't appear

### Meta Tags (React 19 Pattern)

**DO NOT** use legacy `meta()` export function. Use React 19's built-in elements:

```tsx
export default function MyRoute() {
    return (
        <>
            <title>Page Title - TWS Foundations</title>
            <meta name="description" content="Page description" />
            <Container>
                {/* Page content */}
            </Container>
        </>
    );
}
```

### Authentication Patterns

**Protected Routes** - Use middleware in layout:

```tsx
// app/routes/authenticated.tsx - Layout with middleware
import { authMiddleware } from "~/middleware/auth";

export async function loader(args: Route.LoaderArgs) {
    return authMiddleware(args);
}

export default function AuthenticatedLayout() {
    const { user } = useAuthenticatedContext();
    return <Outlet />;
}

// Child routes automatically protected
```

**API Routes** - Manually require auth:

```tsx
import { requireUser } from "~/lib/session.server";

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    // Handle authenticated request
    return json({ success: true });
}
```

**Session Helpers**:

- `requireUser(request)` - Throws redirect if not authenticated
- `getUserFromSession(request)` - Returns user or null
- `requireAnonymous(request)` - Redirects authenticated users (for sign-in/up pages)

### Prisma Database Pattern

**⚠️ CRITICAL**: Prisma client uses custom output path.

```typescript
// CORRECT - Use singleton from db.server.ts
import { prisma } from "~/db.server";
import type { User } from "~/generated/prisma/client";

// WRONG - Do not import from @prisma/client
// import { PrismaClient } from "@prisma/client";
```

**After schema changes**:

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Run `npx prisma generate`
4. Restart dev server
5. Import types from `~/generated/prisma/client`

**BetterAuth Requirements**: Models User, Account, Session, Verification must exist.

### Component Development (CVA + DaisyUI)

All UI components follow CVA-based pattern with DaisyUI classes.

**Canonical Pattern**:

```typescript
import type { VariantProps } from "cva";
import { cva, cx } from "~/cva.config";

// 1. Define CVA variants
export const componentVariants = cva({
    base: "btn",  // DaisyUI base class
    variants: {
        variant: {
            outline: "btn-outline",
            ghost: "btn-ghost",
            link: "btn-link"
        },
        status: {
            primary: "btn-primary",
            secondary: "btn-secondary",
            error: "btn-error"
        },
        size: {
            xs: "btn-xs",
            sm: "btn-sm",
            md: "btn-md",
            lg: "btn-lg"
        }
    },
    defaultVariants: {
        status: "primary",
        size: "md"
    }
});

// 2. Props interface extends HTML attributes + CVA variants
interface ComponentProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof componentVariants> {
    loading?: boolean;
}

// 3. Component implementation
export function Component({
    variant,
    status,
    size,
    loading,
    className,
    children,
    ...props
}: ComponentProps) {
    return (
        <button
            className={cx(
                componentVariants({ variant, status, size }),
                className
            )}
            disabled={loading}
            {...props}
        >
            {loading ? <span className="loading loading-spinner" /> : children}
        </button>
    );
}
```

**Form Components** - Additional requirements:

- Optional `label` prop with required indicator (`*`)
- `error` and `helperText` props for validation feedback
- Support DaisyUI size variants (xs, sm, md, lg, xl)
- Support DaisyUI color variants (primary, secondary, accent, success, warning, error)
- Accessibility: proper ARIA attributes, semantic HTML

**Reference**: See `app/components/Button.tsx` (canonical), `app/components/TextInput.tsx` (form pattern).

### Import Patterns

```typescript
// Prisma client (custom output path)
import { prisma } from "~/db.server";
import type { User, Session } from "~/generated/prisma/client";

// Route types (ALWAYS relative import)
import type { Route } from "./+types/dashboard";

// Auth helpers
import { requireUser, getUser, requireAnonymous } from "~/lib/session.server";
import { authClient } from "~/lib/auth-client";

// AI client
import { ai } from "~/lib/ai";

// CVA utilities
import { cx, cva, compose } from "~/cva.config";
import type { VariantProps } from "cva";

// Validation
import { signInSchema, signUpSchema } from "~/lib/validations";

// Constants
import { Paths } from "~/constants";

// Contexts (in protected routes)
import { useAuthenticatedContext } from "~/hooks/useAuthenticatedContext";
```

## Testing Instructions

```bash
# Type checking (generates route types)
npm run typecheck

# Build (catches production issues)
npm run build

# Run development server (auto-reloads)
npm run dev
```

**Before committing**:

1. Run `npm run typecheck` - Ensure no TypeScript errors
2. Run `npm run build` - Verify production build succeeds
3. Test route changes in browser
4. Verify auth flows work (sign in/out)
5. Check database migrations apply cleanly

**Common issues**:

- Route type errors → Run `npm run typecheck`
- Import errors → Check custom Prisma path (`~/generated/prisma/client`)
- Auth not working → Verify middleware in layout routes
- Styles not applying → Use `cx()` utility, check DaisyUI class names

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** - No implicit any
- **Explicit return types** for exported functions
- **Type imports** use `import type { ... }`
- **Interface over type** for object shapes
- **Zod for runtime validation** - Define schemas in `app/lib/validations.ts`

### React/JSX

- **Functional components** - No class components
- **Named exports** for components (not default except routes)
- **Props interface** defined above component
- **Destructure props** in function signature
- **React 19 patterns** - Use native `<title>` and `<meta>` elements

### Styling

- **DaisyUI classes** for components
- **CVA variants** for component variations
- **cx() utility** for className merging (not cn())
- **Tailwind utilities** for custom spacing/layout
- **No inline styles** unless absolutely necessary

### File Organization

- **Route files** in `app/routes/` (descriptive names, not IDs)
- **API routes** in `app/routes/api/`
- **Components** in `app/components/`
- **Utilities** in `app/lib/`
- **Middleware** in `app/middleware/`
- **Types** auto-generated in `.react-router/types/`

### Naming Conventions

- **Components**: PascalCase (`Button.tsx`, `TextInput.tsx`)
- **Routes**: kebab-case (`sign-in.tsx`, `dashboard.tsx`)
- **Utilities**: camelCase (`session.server.ts`, `validations.ts`)
- **Constants**: SCREAMING_SNAKE_CASE or PascalCase enum
- **Server files**: `.server.ts` suffix (not imported client-side)

## Common Workflows

### Adding a Protected Route

1. Add route to `app/routes.ts` under authenticated layout:

   ```typescript
   layout("routes/authenticated.tsx", [
       route("new-feature", "routes/new-feature.tsx")
   ])
   ```

2. Create route file `app/routes/new-feature.tsx`:

   ```tsx
   import type { Route } from "./+types/new-feature";
   import { useAuthenticatedContext } from "~/hooks/useAuthenticatedContext";
   import { Container } from "~/components/Container";

   export default function NewFeature() {
       const { user } = useAuthenticatedContext();
       return (
           <>
               <title>New Feature - TWS Foundations</title>
               <Container>
                   <h1>Welcome {user.email}</h1>
               </Container>
           </>
       );
   }
   ```

3. Run `npm run typecheck` to generate types

### Adding an API Endpoint

1. Add route to `api` prefix in `app/routes.ts`:

   ```typescript
   ...prefix("api", [
       route("new-endpoint", "routes/api/new-endpoint.ts")
   ])
   ```

2. Create API route `app/routes/api/new-endpoint.ts`:

   ```typescript
   import type { Route } from "./+types/new-endpoint";
   import { json } from "react-router";
   import { requireUser } from "~/lib/session.server";
   import { prisma } from "~/db.server";

   export async function action({ request }: Route.ActionArgs) {
       const user = await requireUser(request);
       
       if (request.method === "POST") {
           const data = await request.json();
           // Handle POST
           return json({ success: true });
       }
       
       return json({ error: "Method not allowed" }, { status: 405 });
   }
   ```

3. Run `npm run typecheck`

### Creating a New Component

1. Create file in `app/components/` (e.g., `Badge.tsx`)

2. Define CVA variants with DaisyUI classes:

   ```typescript
   import type { VariantProps } from "cva";
   import { cva, cx } from "~/cva.config";

   export const badgeVariants = cva({
       base: "badge",
       variants: {
           status: {
               primary: "badge-primary",
               secondary: "badge-secondary",
               accent: "badge-accent",
               neutral: "badge-neutral"
           },
           size: {
               sm: "badge-sm",
               md: "badge-md",
               lg: "badge-lg"
           }
       },
       defaultVariants: {
           status: "primary",
           size: "md"
       }
   });
   ```

3. Define props interface extending HTML attributes + CVA variants

4. Implement component with proper TypeScript types

5. Test in `/admin/design` route

### Modifying Database Schema

1. Edit `prisma/schema.prisma`:

   ```prisma
   model Post {
       id        String   @id @default(cuid())
       title     String
       content   String
       userId    String
       user      User     @relation(fields: [userId], references: [id])
       createdAt DateTime @default(now())
   }
   ```

2. Create migration:

   ```bash
   npx prisma migrate dev --name add_post_model
   ```

3. Regenerate client:

   ```bash
   npx prisma generate
   ```

4. Restart dev server

5. Import types:

   ```typescript
   import type { Post } from "~/generated/prisma/client";
   ```

### Using AI Features

```typescript
import { streamText } from "ai";
import { ai } from "~/lib/ai";

export async function action({ request }: Route.ActionArgs) {
    const { prompt } = await request.json();
    
    const result = streamText({
        model: ai("gpt-4"),
        prompt
    });
    
    return result.toDataStreamResponse();
}
```

**Client-side**:

```typescript
import { useChat } from "@ai-sdk/react";

const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat"
});
```

## Security Considerations

1. **Session Management**: 7-day sessions with secure HTTP-only cookies
2. **CSRF Protection**: BetterAuth handles CSRF tokens automatically
3. **SQL Injection**: Prisma parameterizes queries automatically
4. **XSS Prevention**: React escapes content by default
5. **Environment Variables**: Never commit `.env` file
6. **API Authentication**: Always use `requireUser()` for protected endpoints
7. **Database Access**: Only server-side files can import `~/db.server`

**Server-only imports**: Files ending in `.server.ts` are automatically excluded from client bundles.

## Deployment

```bash
# Build production assets
npm run build

# Start production server
npm start

# Run migrations in production
npx prisma migrate deploy

# Environment variables required in production
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL  # Your production domain
OPENAI_API_KEY
```

## Troubleshooting

### "Cannot find module './+types/...'"

→ Run `npm run typecheck` to generate route types

### "Module not found: ~/generated/prisma/client"

→ Run `npx prisma generate` to regenerate Prisma client

### Authentication not working

→ Check middleware applied in layout routes (e.g., `routes/authenticated.tsx`)

### Styles not applying

→ Verify using `cx()` utility and correct DaisyUI class names

### TypeScript errors in routes

→ Ensure route exists in `app/routes.ts` and types are generated

### Database connection errors

→ Check `DATABASE_URL` in `.env` and database is running

### Build fails

→ Run `npm run typecheck` first to catch errors early

## Additional Resources

- **Detailed Instructions**: See `.github/instructions/` for framework-specific patterns
  - `react-router.instructions.md` - React Router 7 patterns
  - `better-auth.instructions.md` - Authentication implementation
  - `component-patterns.instructions.md` - UI component standards
  - `polar.instructions.md` - Billing integration
  - `prisma.instructions.md` - Database patterns
  - `cva.instructions.md` - Component variant patterns
  - `daisyui.instructions.md` - DaisyUI component library
  - `zod.instructions.md` - Validation patterns
  - `react-hook-form.instructions.md` - Form handling

- **React Router 7 Docs**: <https://reactrouter.com/>
- **BetterAuth Docs**: <https://better-auth.com/>
- **Prisma Docs**: <https://www.prisma.io/docs>
- **DaisyUI Docs**: <https://daisyui.com/>
- **CVA Docs**: <https://cva.style/>
- **Vercel AI SDK**: <https://sdk.vercel.ai/>

## Notes for AI Coding Agents

- **Route types must be generated** - Always run `npm run typecheck` after route changes
- **Prisma uses custom output path** - Import from `~/generated/prisma/client`, not `@prisma/client`
- **Middleware applies in layouts** - Don't add auth checks to individual route files
- **React 19 meta pattern** - No `meta()` export, use JSX elements
- **CVA for all components** - Follow established Button/TextInput patterns
- **Server/client separation** - `.server.ts` files never imported client-side
- **Singleton services** - Always use existing instances (prisma, ai, authClient)
- **Type safety first** - Explicit types, no implicit any, use Zod for runtime validation
