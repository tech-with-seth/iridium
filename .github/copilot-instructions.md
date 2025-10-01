# GitHub Copilot Instructions for TWS Foundations

## Project Overview

This is a modern full-stack SaaS boilerplate built with **React Router 7** (not v6), **BetterAuth**, **Polar.sh billing**, and **OpenAI integration**. The architecture uses config-based routing, middleware patterns, and singleton services.

## Critical Architecture Patterns

### 🚨 React Router 7 - Config-Based Routing

- Routes are defined in `app/routes.ts` using `@react-router/dev/routes`
- **NEVER** use file-based routing patterns or React Router v6 syntax
- Always import route types as `./+types/[routeName]` (relative to route file)
- Run `npm run typecheck` after adding routes to generate types

```tsx
// app/routes.ts - Single source of truth for routing
export default [
    index('routes/home.tsx'),
    route(Paths.SIGN_IN, 'routes/sign-in.tsx'),
    layout('routes/authenticated.tsx', [
        route('dashboard', 'routes/dashboard.tsx'),
        route('profile', 'routes/profile.tsx')
    ]),
    ...prefix('api', [route('auth/*', 'routes/api/auth/better-auth.ts')])
] satisfies RouteConfig;
```

### Middleware-Based Architecture

- **Authentication**: `app/middleware/auth.ts` - Protects routes using `authMiddleware`
- **Logging**: `app/middleware/logging.ts` - Request/response logging with unique IDs
- **Context**: `app/middleware/context.ts` - React Router contexts for user and request ID
- Applied in layout routes like `routes/authenticated.tsx`

### Singleton Pattern Usage

- **Database**: `app/db.server.ts` - Global Prisma client with custom output path
- **Auth**: `app/lib/auth.server.ts` - BetterAuth instance with PostgreSQL adapter
- **AI**: `app/lib/ai.ts` - OpenAI client singleton (renamed from `openai` to `ai`)
- **Cache**: `app/lib/cache.ts` - FlatCache instance with TTL and user-scoped keys

### Authentication & Session Management

- **BetterAuth** with Prisma adapter, 7-day sessions, no email verification required
- Session helpers in `app/lib/session.server.ts`: `requireUser()`, `getUser()`, `requireAnonymous()`
- Client-side: `authClient` from `app/lib/auth-client.ts` with Better Auth React
- Protected routes use middleware pattern in layout files

## Development Workflows

### Essential Commands

```bash
npm run dev           # Start dev server (auto-generates types)
npm run typecheck     # Generate types + run TypeScript check
npm run build         # Production build
npm start             # Start production server
npm run seed          # Seed database with initial data
npx prisma generate   # Regenerate Prisma client (after schema changes)
npx prisma migrate dev --name <description> # Apply database migrations
```

### Adding New Features

#### 1. Protected Routes

```tsx
// 1. Add to app/routes.ts using constants
import { Paths } from './constants';
layout('routes/authenticated.tsx', [
    route('new-feature', 'routes/new-feature.tsx')
]);

// 2. Create route file - middleware handles auth automatically
export default function NewFeature() {
    const { user } = useAuthenticatedContext();
    return <div>Welcome {user.email}</div>;
}
```

#### 2. API Endpoints

```tsx
// Add to api prefix in routes.ts
...prefix('api', [
  route('new-endpoint', 'routes/api/new-endpoint.ts')
])

// API route with manual auth (no middleware)
export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  return json({ data: "success" });
}
```

### Database Changes

1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Run `npx prisma generate` to update client
4. Import from `~/generated/prisma/client` (custom output path)
5. Restart dev server after schema changes

## Key Integrations

### AI Features (OpenAI + Vercel AI SDK)

- OpenAI client in `app/lib/ai.ts` (imported as `ai`, not `openai`)
- Streaming responses using `streamText()` from `ai` package
- Client-side integration with `useChat()` hook from `@ai-sdk/react`

### Caching Strategy

- File-based caching with TTL support via `flat-cache`
- User-scoped keys: `getUserScopedKey(userId, key)`
- Check expiration: `isCacheExpired(key)`
- Cache saved to file system automatically

### Validation Pattern

- **Zod schemas** in `app/lib/validations.ts`
- Type inference with `z.infer<typeof schema>`
- Consistent error messaging
- Pre-built schemas: `signInSchema`, `signUpSchema`, `chatMessageSchema`

## File Organization

```
app/
├── lib/              # Singleton services & utilities
│   ├── auth.server.ts    # BetterAuth configuration
│   ├── auth-client.ts    # Client-side auth
│   ├── session.server.ts # Session helpers (requireUser, getUser)
│   ├── ai.ts            # OpenAI client
│   ├── cache.ts         # FlatCache with TTL
│   └── validations.ts   # Zod schemas
├── middleware/       # Request middleware
│   ├── auth.ts          # Authentication middleware
│   ├── context.ts       # React Router contexts
│   └── logging.ts       # Request logging
├── routes/           # Route components (descriptive naming)
│   ├── authenticated.tsx # Layout with Outlet for protected routes
│   ├── api/             # API endpoints
├── constants/        # App constants (Paths enum)
├── components/       # UI components
├── hooks/           # Custom React hooks
└── generated/        # Prisma client output (never edit)
```

## Component Development Standards

### UI Component Paradigm (DaisyUI + TypeScript)

All UI components should follow the established `TextInput` paradigm:

#### Core Requirements

- **Comprehensive TypeScript Interface**: Define all props with proper types
- **DaisyUI Integration**: Use DaisyUI class names for consistent theming
- **className Merging**: Always use `cx()` utility from `~/cva.config`
- **Accessibility First**: Proper labels, ARIA attributes, semantic HTML

#### Form Component Standards

- **Label with Required Indicator**: Optional label with `*` for required fields
- **Error/Helper States**: Error prop changes styling + shows error text
- **DaisyUI Variants**: Support size (xs-xl) and color variants
- **Disabled State**: Proper disabled styling and behavior
- **Custom Styling**: Accept `className` prop for additional styles

#### Component Template

```typescript
import { cx } from "~/cva.config";

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
        className={cx(
          'base-daisyui-classes',
          size !== 'md' && `component-${size}`,
          error ? 'component-error' : color && `component-${color}`,
          className
        )}
        {...rest}
      />

      {(error || helperText) && (
        <label className="label">
          <span className={cx(
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
