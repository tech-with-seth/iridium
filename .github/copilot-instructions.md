# GitHub Copilot Instructions for TWS Foundations

## Project Overview

This is a modern full-stack SaaS boilerplate built with **React Router 7** (not v6), **BetterAuth**, **Polar.sh billing**, and **OpenAI integration**. The architecture uses config-based routing, singleton patterns, and a credit-based billing system.

## Critical Architecture Patterns

### 🚨 React Router 7 - Config-Based Routing

- Routes are defined in `app/routes.ts` using `@react-router/dev/routes`
- **NEVER** use file-based routing patterns or React Router v6 syntax
- Always import route types as `./+types/[routeName]` (relative to route file)
- Run `npm run typecheck` after adding routes to generate types

```tsx
// app/routes.ts - Single source of truth for routing
export default [
    layout('routes/authenticated.tsx', [
        route('dashboard', 'routes/dashboard.tsx'),
        route('chat', 'routes/chat.tsx')
    ])
] satisfies RouteConfig;
```

### Authentication Flow

- **BetterAuth** with Prisma adapter handles all auth logic
- `requireUser()` for protected routes, `requireAnonymous()` for auth pages
- Session helpers in `app/lib/session.server.ts`
- Layout-based protection in `routes/authenticated.tsx`

### Singleton Pattern Usage

- **Database**: `app/db.server.ts` - Global Prisma client
- **Auth**: `app/lib/auth.server.ts` - BetterAuth instance with Polar integration
- **AI**: `app/lib/ai.ts` - OpenAI client singleton
- **Cache**: `app/lib/cache.ts` - FlatCache instance with TTL support

### Billing & Credits System

- **Polar.sh** integration with BetterAuth plugin
- Credit-based usage model (users start with 10 credits)
- Subscription tiers: starter (50), power (200), pro (500)
- Check `user.credits > 0` before AI operations

## Development Workflows

### Essential Commands

```bash
npm run dev           # Start dev server (auto-generates types)
npm run typecheck     # Generate types + run TypeScript check
npm run build         # Production build
npx prisma generate   # Regenerate Prisma client (after schema changes)
npx prisma migrate dev # Apply database migrations
```

### Adding New Features

#### 1. Protected Routes

```tsx
// 1. Add to app/routes.ts
layout('routes/authenticated.tsx', [
    route('new-feature', 'routes/new-feature.tsx')
]);

// 2. Create route file with loader protection
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    return { user, data: await fetchData() };
}
```

#### 2. API Endpoints

```tsx
// Add to api prefix in routes.ts
...prefix('api', [
  route('new-endpoint', 'routes/api/new-endpoint.ts')
])

// API route with authentication
export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  // Check credits for paid features
  if (user.credits <= 0) {
    return json({ error: "Insufficient credits" }, { status: 400 });
  }
}
```

### Database Changes

1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Run `npx prisma generate` to update client
4. Import from `~/generated/prisma/client` (custom output path)

## Key Integrations

### AI Features (OpenAI + Vercel AI SDK)

- Credit consumption required for all AI operations
- Streaming responses using `streamText()` from `ai` package
- Client-side integration with `useChat()` hook

### Caching Strategy

- File-based caching with TTL support via `flat-cache`
- User-scoped keys: `getUserScopedKey(userId, key)`
- Check expiration: `isCacheExpired(key)`

### Validation Pattern

- **Zod schemas** in `app/lib/validations.ts`
- Type inference with `z.infer<typeof schema>`
- Consistent error messaging

## File Organization

```
app/
├── lib/              # Singleton services & utilities
│   ├── auth.server.ts    # BetterAuth + Polar configuration
│   ├── session.server.ts # Session helpers (requireUser, getUser)
│   ├── ai.ts            # OpenAI client
│   ├── cache.ts         # FlatCache with TTL
│   └── validations.ts   # Zod schemas
├── routes/           # Route components (descriptive naming)
│   ├── authenticated.tsx # Layout with Outlet for protected routes
│   ├── api/             # API endpoints
└── generated/        # Prisma client output (never edit)
```

## Component Development Standards

### UI Component Paradigm (DaisyUI + TypeScript)

All UI components should follow the established `TextInput` paradigm:

#### Core Requirements

- **Comprehensive TypeScript Interface**: Define all props with proper types
- **DaisyUI Integration**: Use DaisyUI class names for consistent theming
- **className Merging**: Always use `cn()` utility from `~/lib/utils`
- **Accessibility First**: Proper labels, ARIA attributes, semantic HTML

#### Form Component Standards

- **Label with Required Indicator**: Optional label with `*` for required fields
- **Error/Helper States**: Error prop changes styling + shows error text
- **DaisyUI Variants**: Support size (xs-xl) and color variants
- **Disabled State**: Proper disabled styling and behavior
- **Custom Styling**: Accept `className` prop for additional styles

#### Component Template

```typescript
import { cn } from "~/lib/utils";

interface ComponentProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export function Component({
  size = 'md',
  required = false,
  disabled = false,
  className,
  ...rest
}: ComponentProps) {
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}

      <element
        className={cn(
          'base-daisyui-classes',
          size !== 'md' && `component-${size}`,
          error ? 'component-error' : color && `component-${color}`,
          className
        )}
        {...rest}
      />

      {(error || helperText) && (
        <label className="label">
          <span className={cn(
            'label-text-alt',
            error ? 'text-error' : 'text-base-content/70'
          )}>
            {error || helperText}
          </span>
        </label>
      )}
    </div>
  );
}
```

## Anti-Patterns to Avoid

- ❌ Using React Router v6 patterns or `react-router-dom`
- ❌ Manual session management (use session helpers)
- ❌ File-based routing assumptions (routes.ts is source of truth)
- ❌ Bypassing credit checks for AI features
- ❌ Direct Prisma imports (use singleton from `~/db.server`)
- ❌ Missing type generation (`npm run typecheck` after route changes)
- ❌ Components without proper TypeScript interfaces
- ❌ Hard-coded className strings (use `cn()` utility)
- ❌ Missing accessibility attributes in form components
- ❌ Inconsistent component prop patterns

## Environment Dependencies

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection
- `BETTER_AUTH_SECRET` - Session encryption
- `OPENAI_API_KEY` - AI features
- `POLAR_ACCESS_TOKEN` - Billing integration
- `POLAR_SERVER` - "sandbox" or "production"

## Testing Considerations

- Session-dependent routes require auth mocking
- Credit system affects AI endpoint behavior
- Database state affects user capabilities
- Types must be generated before testing routes
