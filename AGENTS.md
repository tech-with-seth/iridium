# AGENTS.md

A comprehensive guide for AI coding agents working with the Iridium codebase.

## Project Overview

Iridium is a small, opinionated starter for React Router 7 apps built with:

**Core Stack:**

- **React Router 7** (config-based routing, not v6 file-based)
- **React 19** (with native meta tags)
- **BetterAuth** (PostgreSQL adapter, 7-day sessions)
- **Prisma ORM** (custom output path to `app/generated/prisma`)
- **OpenAI SDK** + Vercel AI SDK (streaming responses)
- **DaisyUI 5** + **Tailwind CSS 4** (component library)
- **CVA (Class Variance Authority)** (type-safe component variants)
- **TypeScript** (strict mode)

**Optional Integrations:**

- **PostHog** (analytics, feature flags, LLM analytics)
- **Resend** (transactional email + React Email templates)
- **Polar** (billing/checkout/portal/webhooks via BetterAuth plugin)
- **OAuth providers** (GitHub, Google)

**Not Included (Scoped Out):**

- Multi-tenancy/organizations
- E-commerce/shop flows (beyond the Polar demo routes)

### Key Architectural Patterns

1. **Config-Based Routing**: Routes defined in `app/routes.ts`, not file-based
2. **Middleware Architecture**: Auth, logging, and context middleware applied via layouts
3. **Singleton Services**: Database, auth, AI, PostHog, Resend, Polar clients use singleton pattern
4. **CVA Component System**: All UI components use CVA for variants with DaisyUI classes
5. **Custom Prisma Output**: Client generated to `app/generated/prisma` (not default)
6. **Model Helpers**: Prefer `app/models/*` for domain logic when available

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

> Seed data is intended for initializing fresh databases (local dev, new staging instances, or after a deliberate reset). Do not run `npm run seed` as part of every deploy—production data should evolve through the app itself.

## 📋 Critical Pattern Library

**Before implementing features**, familiarize yourself with the instruction files in `.github/instructions/`:

**Must Read First:**

1. `react-router.instructions.md` - Route type imports (prevents most common errors)
2. `form-validation.instructions.md` - Hybrid client+server validation
3. `better-auth.instructions.md` - Authentication patterns
4. `crud-pattern.instructions.md` - API-first CRUD operations

**Component Development:**

- `component-patterns.instructions.md` - CVA + DaisyUI patterns
- `cva.instructions.md` - Class Variance Authority
- `daisyui.instructions.md` - DaisyUI component library

**Data & Database:**

- `prisma.instructions.md` - Database patterns
- `zod.instructions.md` - Schema validation

**See [Additional Resources](#additional-resources) section below for complete list of 32 guides.**

## Ralph Automation (Optional)

Iridium includes a lightweight autonomous loop called Ralph for working through PRDs.

- Entry point: `plans/ralph.sh` (runs the loop with Claude Code CLI)
- Instructions: `.github/instructions/ralph.instructions.md`
- Prompt files (VS Code): `.github/prompts/ralph.prompt.md`, `.github/prompts/prd.prompt.md`
- Data files: `plans/prd.json` and `plans/progress.txt`
- Archives: `plans/archive/` (previous runs, auto-created)

Run it with:
```bash
./plans/ralph.sh [max_iterations]
```

By default the loop calls Claude Code as:
```bash
claude --dangerously-skip-permissions --model opus
```

## Environment Variables

Required `.env` file at repository root (see `.env.example` for full list):

```bash
# Required (core app)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:5173"
VITE_BETTER_AUTH_BASE_URL="http://localhost:5173"

# Optional - App defaults
DEFAULT_THEME="emerald"
ADMIN_EMAIL="admin@yourdomain.com"

# Optional - OAuth providers (BetterAuth)
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Optional - OpenAI (chat demo)
OPENAI_API_KEY="sk-..."

# Optional - PostHog (client-side analytics)
VITE_POSTHOG_API_KEY="phc_your-posthog-api-key"
VITE_POSTHOG_API_HOST="https://us.i.posthog.com"
VITE_POSTHOG_UI_HOST="https://us.posthog.com"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
VITE_POSTHOG_PROJECT_ID="12345"

# Optional - PostHog (server-side analytics + feature flags)
POSTHOG_API_KEY="phc_your-posthog-project-api-key"
POSTHOG_HOST="https://us.i.posthog.com"
POSTHOG_PROJECT_ID="12345"
POSTHOG_PERSONAL_API_KEY="phx_..."

# Optional - Resend email
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Optional - Polar billing
POLAR_ACCESS_TOKEN="polar_..."
POLAR_ORGANIZATION_ID="org_..."
POLAR_PRODUCT_ID="prod_..."
POLAR_SERVER="sandbox"
POLAR_SUCCESS_URL="/success"
POLAR_RETURN_URL="/"
POLAR_WEBHOOK_SECRET="whsec_..."
```

## Critical Development Rules

### React Router 7 - Config-Based Routing

**⚠️ CRITICAL**: Routes are NOT file-based. All routes defined in `app/routes.ts`.

```typescript
// app/routes.ts - Single source of truth
import {
    type RouteConfig,
    route,
    layout,
    prefix,
    index,
} from '@react-router/dev/routes';
import { Paths } from './constants';

export default [
    layout('routes/site-layout.tsx', [
        index('routes/landing.tsx'),
        layout('routes/authenticated.tsx', [
            route(Paths.DASHBOARD, 'routes/dashboard.tsx', [
                index('routes/dashboard-index.tsx'),
                route(Paths.THREAD, 'routes/thread.tsx'),
            ]),
            route(Paths.DESIGN, 'routes/design.tsx'),
            route(Paths.FORMS, 'routes/forms.tsx'),
            route(Paths.PORTAL, 'routes/portal.tsx'),
        ]),
    ]),
    route(Paths.CHECKOUT, 'routes/checkout.tsx'),
    ...prefix(Paths.API, [
        route(Paths.AUTHENTICATE, 'routes/api/auth/authenticate.ts'),
        route(Paths.BETTER_AUTH, 'routes/api/auth/better-auth.ts'),
        route(Paths.CHAT, 'routes/api/chat.ts'),
        ...prefix(Paths.WEBHOOKS, [
            route(Paths.POLAR, 'routes/api/webhooks/polar.ts'),
        ]),
    ]),
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
            <title>Page Title - Iridium</title>
            <meta name="description" content="Page description" />
            <Container>{/* Page content */}</Container>
        </>
    );
}
```

### Authentication Patterns

**Protected Routes** - Use middleware in layout:

```tsx
// app/routes/authenticated.tsx - Layout with middleware
import { authMiddleware } from '~/middleware/auth';
import { loggingMiddleware } from '~/middleware/logging';
import { userContext } from '~/middleware/context';

export const middleware: Route.MiddlewareFunction[] = [
    authMiddleware,
    loggingMiddleware,
];

export async function loader({ context }: Route.LoaderArgs) {
    return { user: context.get(userContext) };
}

export default function AuthenticatedLayout({
    loaderData,
}: Route.ComponentProps) {
    return <Outlet context={{ user: loaderData.user }} />;
}

// Child routes automatically protected
```

**API Routes** - Manually require auth:

```tsx
import { requireUser } from '~/lib/session.server';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    // Handle authenticated request
    return data({ success: true });
}
```

**Session Helpers**:

- `requireUser(request)` - Throws 401 response if not authenticated
- `getUserFromSession(request)` - Returns user or null
- `requireAnonymous(request)` - Redirects authenticated users (for sign-in/up pages)
- `requireAdmin(request)` / `requireEditor(request)` / `requireRole(request, roles)` - Role-based access control

### Prisma Database Pattern

**⚠️ CRITICAL**: Prisma client uses custom output path.

```typescript
// CORRECT - Use singleton from db.server.ts
import { prisma } from '~/db.server';
import type { User } from '~/generated/prisma/client';

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

**Reference**: See `app/components/actions/Button.tsx` (canonical), `app/components/data-input/TextInput.tsx` (form pattern).

### Import Patterns

```typescript
// Prisma client (custom output path)
import { prisma } from '~/db.server';
import type { User, Session } from '~/generated/prisma/client';

// Route types (ALWAYS relative import)
import type { Route } from './+types/dashboard';

// Auth helpers
import {
    getUserFromSession,
    requireAdmin,
    requireAnonymous,
    requireEditor,
    requireRole,
    requireUser,
} from '~/lib/session.server';
import { authClient } from '~/lib/auth-client';

// AI client
import { ai } from '~/lib/ai';

// CVA utilities
import { cx, cva, compose } from '~/cva.config';
import type { VariantProps } from 'cva';

// Validation
import { signInSchema, signUpSchema } from '~/lib/validations';

// Constants
import { Paths } from '~/constants';

// Contexts (in protected routes)
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';
```

## Testing Instructions

```bash
# Type checking (generates route types)
npm run typecheck

# Build (catches production issues)
npm run build

# Run development server (auto-reloads)
npm run dev

# Unit tests
npm run test

# E2E tests
npm run e2e
```

## VS Code Tasks Reference

The repo ships with predefined VS Code tasks in `.vscode/tasks.json` so common workflows stay consistent:

- `prisma:generate`, `prisma:migrate`, `prisma:studio`
- `railway:migrate`, `railway:seed`, `railway:shell`
- Polar maintenance scripts (`Archive all products`, `Delete all customers`, `Get all customers`, `Reset database & Polar`)
- GitHub helpers (`Create GitHub pull request`, `Create GitHub issue`, `List GitHub issues`)
- `Promote DEV to MAIN` (fast-forward merge helper)

Use these tasks from the VS Code command palette (`Run Task…`) when you need a one-click way to apply migrations, seed data, or open Railway shells.

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
- **Routes**: kebab-case (`landing.tsx`, `dashboard-index.tsx`, `thread.tsx`)
- **Utilities**: camelCase (`session.server.ts`, `validations.ts`)
- **Constants**: SCREAMING_SNAKE_CASE or PascalCase enum
- **Server files**: `.server.ts` suffix (not imported client-side)

## Common Workflows

### Adding a Protected Route

1. Add route to `app/routes.ts` under authenticated layout:

    ```typescript
    layout('routes/authenticated.tsx', [
        route('new-feature', 'routes/new-feature.tsx'),
    ]);
    ```

2. Create route file `app/routes/new-feature.tsx`:

    ```tsx
    import type { Route } from './+types/new-feature';
    import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';
    import { Container } from '~/components/Container';

    export default function NewFeature() {
        const { user } = useAuthenticatedContext();
        return (
            <>
                <title>New Feature - Iridium</title>
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
    ...prefix(Paths.API, [
        route('/new-endpoint', 'routes/api/new-endpoint.ts'),
    ])
    ```

2. Create API route `app/routes/api/new-endpoint.ts`:

    ```typescript
    import type { Route } from './+types/new-endpoint';
    import { data } from 'react-router';
    import { requireUser } from '~/lib/session.server';
    import { prisma } from '~/db.server';

    export async function action({ request }: Route.ActionArgs) {
        const user = await requireUser(request);

        if (request.method === 'POST') {
            const data = await request.json();
            // Handle POST
            return data({ success: true });
        }

        return data({ error: 'Method not allowed' }, { status: 405 });
    }
    ```

3. Run `npm run typecheck`

### Creating a New Component

1. Create file in `app/components/` (e.g., `Badge.tsx`)

2. Define CVA variants with DaisyUI classes:

    ```typescript
    import type { VariantProps } from 'cva';
    import { cva, cx } from '~/cva.config';

    export const badgeVariants = cva({
        base: 'badge',
        variants: {
            status: {
                primary: 'badge-primary',
                secondary: 'badge-secondary',
                accent: 'badge-accent',
                neutral: 'badge-neutral',
            },
            size: {
                sm: 'badge-sm',
                md: 'badge-md',
                lg: 'badge-lg',
            },
        },
        defaultVariants: {
            status: 'primary',
            size: 'md',
        },
    });
    ```

3. Define props interface extending HTML attributes + CVA variants

4. Implement component with proper TypeScript types

5. Test in `/design` route

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
    import type { Post } from '~/generated/prisma/client';
    ```

### Using AI Features

Iridium ships with a streaming chat endpoint powered by the Vercel AI SDK and OpenAI. The server action accepts `UIMessage[]` payloads, converts them into model friendly messages, and returns a streaming UI response that the client hook can consume.

#### LLM Analytics with PostHog

All AI calls are automatically tracked with PostHog's LLM analytics via `@posthog/ai`. The chat endpoint wraps the OpenAI client with tracing:

```typescript
import type { Route } from './+types/chat';
import { createOpenAI } from '@ai-sdk/openai';
import {
    convertToModelMessages,
    stepCountIs,
    streamText,
    type UIMessage,
} from 'ai';
import { withTracing } from '@posthog/ai';
import { chatTools } from '~/lib/chat-tools.server';
import { getPostHogClient } from '~/lib/posthog';
import { getUserFromSession } from '~/lib/session.server';

export async function action({ request }: Route.ActionArgs) {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const { messages } = (await request.json()) as { messages: UIMessage[] };
    const user = await getUserFromSession(request);

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const openAIClient = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
    });

    const baseModel = openAIClient('gpt-5-mini');
    const postHogClient = getPostHogClient();
    const model = postHogClient
        ? withTracing(baseModel, postHogClient, {
              posthogDistinctId: user.id,
          })
        : baseModel;

    const result = streamText({
        model,
        messages: convertToModelMessages(messages),
        stopWhen: stepCountIs(5),
        tools: chatTools,
    });

    return result.toUIMessageStreamResponse();
}
```

**LLM Analytics Captured**:

- `$ai_model` - Model used (e.g., "gpt-5-mini")
- `$ai_latency` - Response time in seconds
- `$ai_input_tokens` - Prompt tokens
- `$ai_output_tokens` - Completion tokens
- `$ai_total_cost_usd` - Estimated cost
- `$ai_tools` - Tools available to model
- Custom properties (feature, userPlan, etc.)

**Key Points**:

- Use `convertToModelMessages()` whenever the client sends `UIMessage[]` payloads
- Apply `stepCountIs()` (currently capped at five reasoning steps) to constrain tool loops
- Use `chatTools` from `~/lib/chat-tools.server` (Polar metrics + analytics), and extend it with `tool({ description, inputSchema, execute })` as needed
- Return `result.toUIMessageStreamResponse()` so the client receives incremental updates that match the Vercel AI SDK expectations
- Wrap the model with `withTracing()` to automatically capture LLM analytics in PostHog
- Add custom properties via `posthogProperties` for better filtering and insights
- Enable `posthogPrivacyMode: true` to exclude sensitive prompt/response data

**Environment Variables for LLM Analytics**:

```bash
# Server-side PostHog (required for LLM analytics)
POSTHOG_API_KEY="phc_your-posthog-project-api-key"
POSTHOG_HOST="https://us.i.posthog.com"

# OpenAI (required for AI features)
OPENAI_API_KEY="sk-proj-your-openai-api-key"
```

**Client-side**:

```typescript
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

const transport = new DefaultChatTransport({ api: '/api/chat' });

const { messages, sendMessage, status, stop } = useChat({
    transport,
});
```

`DefaultChatTransport` targets `/api/chat` and streams `UIMessage` payloads as the assistant responds. Supply custom `api` paths or callbacks to tune the behaviour for other endpoints.

**See Also**:

- `docs/ai.md` - Comprehensive AI integration guide
- `docs/llm-analytics.md` - Detailed LLM analytics documentation
- `.github/instructions/posthog.instructions.md` - PostHog LLM analytics patterns

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
VITE_BETTER_AUTH_BASE_URL

# Optional integrations
OPENAI_API_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
POSTHOG_API_KEY
POSTHOG_HOST
POSTHOG_PROJECT_ID
POSTHOG_PERSONAL_API_KEY
VITE_POSTHOG_API_KEY
VITE_POSTHOG_API_HOST
VITE_POSTHOG_UI_HOST
POLAR_ACCESS_TOKEN
POLAR_ORGANIZATION_ID
POLAR_PRODUCT_ID
POLAR_SERVER
POLAR_SUCCESS_URL
POLAR_RETURN_URL
POLAR_WEBHOOK_SECRET
DEFAULT_THEME
ADMIN_EMAIL
```

> ℹ️ Railway deployments (and any environment using the provided Docker image) automatically execute `npx prisma migrate deploy` on container startup. Use the manual command above when running outside that image or when you need to reapply migrations explicitly.

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

### Project Documentation

**Primary Guides:**

- [CLAUDE.md](CLAUDE.md) - Architecture patterns and conventions (pattern-focused)
- `.github/instructions/` - 25+ detailed implementation guides (hands-on)

**Critical Patterns (Consult Before Implementing):**

| File | Purpose | Priority |
|------|---------|----------|
| `react-router.instructions.md` | React Router 7 patterns | 🔴 Critical |
| `form-validation.instructions.md` | Hybrid validation | 🔴 Critical |
| `better-auth.instructions.md` | Authentication | 🟡 High |
| `component-patterns.instructions.md` | UI standards | 🟡 High |
| `prisma.instructions.md` | Database patterns | 🟡 High |
| `crud-pattern.instructions.md` | API design | 🟢 Medium |

**Framework-Specific:**

- `cva.instructions.md` - Component variant patterns
- `daisyui.instructions.md` - DaisyUI component library
- `zod.instructions.md` - Validation patterns
- `react-hook-form.instructions.md` - Form handling

**Optional Integrations:**

- `posthog.instructions.md` - Analytics and feature flags
- `resend.instructions.md` - Email integration
- `polar.instructions.md` - Billing integration (not included by default)

### External Documentation

- **React Router 7**: <https://reactrouter.com/>
- **BetterAuth**: <https://better-auth.com/>
- **Prisma**: <https://www.prisma.io/docs>
- **DaisyUI**: <https://daisyui.com/>
- **CVA**: <https://cva.style/>
- **Vercel AI SDK**: <https://sdk.vercel.ai/>

## AI Skills Library

The `.github/skills/` directory contains 20 specialized skills that VS Code Copilot and Claude Code use automatically when relevant tasks are detected.

### Core Development Skills

| Skill | Purpose | Triggered By |
|-------|---------|--------------|
| `create-component` | CVA + DaisyUI components | "create button", "add modal" |
| `create-route` | React Router 7 routes | "add page", "create route" |
| `create-crud-api` | API endpoints with validation | "create API", "add endpoint" |
| `create-form` | Hybrid validated forms | "add form", "create form" |
| `create-ai-tool` | AI chat tools with Vercel AI SDK | "add AI tool", "chat tool" |

### Database & Auth Skills

| Skill | Purpose | Triggered By |
|-------|---------|--------------|
| `create-model` | Prisma model layer functions | "add database", "create model" |
| `add-auth` | BetterAuth route protection | "protect route", "add auth" |
| `add-rbac` | Role-based access control | "add role check", "admin only" |

### Testing Skills

| Skill | Purpose | Triggered By |
|-------|---------|--------------|
| `create-unit-test` | Vitest unit tests | "add tests", "write test" |
| `create-e2e-test` | Playwright E2E tests | "add E2E test", "integration test" |

### Quality Skills

| Skill | Purpose | Triggered By |
|-------|---------|--------------|
| `add-docs` | JSDoc and inline documentation | "document this", "add JSDoc" |
| `refactor-code` | Simplification and cleanup | "clean up", "simplify", "refactor" |
| `add-error-boundary` | Error handling for routes | "add error handling", "404 page" |

### Integration Skills

| Skill | Purpose | Triggered By |
|-------|---------|--------------|
| `create-email` | React Email + Resend templates | "send email", "email template" |
| `add-feature-flag` | PostHog feature flags | "feature flag", "A/B test" |
| `add-billing` | Polar subscriptions/payments | "add billing", "checkout" |
| `add-chart` | visx data visualizations | "add chart", "visualize data" |
| `add-caching` | Client-side SWR caching | "add caching", "improve performance" |
| `add-seo` | Meta tags, Open Graph, JSON-LD | "add SEO", "meta tags" |
| `ship` | Railway deployment & debugging | "deploy", "ship", "debug deployment" |

Skills include templates, examples, and reference the full instruction files in `.github/instructions/`.

## Notes for AI Coding Agents

- **Route types must be generated** - Always run `npm run typecheck` after route changes
- **Prisma uses custom output path** - Import from `~/generated/prisma/client`, not `@prisma/client`
- **Middleware applies in layouts** - UI routes under `routes/authenticated.tsx` are protected via middleware; API routes still call `requireUser()`/`requireRole()`
- **React 19 meta pattern** - No `meta()` export, use JSX elements
- **CVA for all components** - Follow established Button/TextInput patterns
- **Server/client separation** - `.server.ts` files never imported client-side
- **Singleton services** - Always use existing instances (prisma, ai, authClient, posthog, resend, polarClient)
- **Model layer usage** - Prefer `app/models/*` helpers where they exist; some routes still call Prisma directly (e.g., `/api/interest`)
- **Type safety first** - Explicit types, no implicit any, use Zod for runtime validation
