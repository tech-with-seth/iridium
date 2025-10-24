# Iridium

A modern full-stack SaaS boilerplate built with React Router 7, featuring authentication, AI integration, and everything you need to ship quickly.

## 🚀 Features

- **React Router 7** - Config-based routing with SSR
- **React 19** - Latest React with native meta tag support
- **Authentication** - BetterAuth with Prisma adapter and session management
- **RBAC** - Role-based access control (USER/EDITOR/ADMIN) with hierarchical permissions
- **AI Integration** - OpenAI with Vercel AI SDK for streaming responses
- **Database** - PostgreSQL with Prisma ORM (custom output path)
- **Model Layer Pattern** - All database operations abstracted through `app/models/` functions
- **Styling** - DaisyUI 5 + TailwindCSS v4 with CVA for type-safe variants
- **TypeScript** - Strict mode with full type safety
- **Form Handling** - React Hook Form + Zod with server/client validation
- **Caching** - Three-tier caching strategy: client-side route caching, model layer caching, manual caching
- **Analytics** - PostHog integration for product analytics and feature flags
- **Billing** - Polar.sh integration via BetterAuth plugin (optional)
- **Email** - Resend integration with React Email templates, BetterAuth email flows, and centralized API endpoint
- **Documentation** - Comprehensive patterns documented in `.github/instructions/`

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19, React Router 7, DaisyUI 5, TailwindCSS v4
- **Backend**: Prisma, PostgreSQL, BetterAuth
- **AI**: OpenAI with Vercel AI SDK
- **Analytics**: PostHog (product analytics, feature flags, error tracking)
- **Styling**: CVA (Class Variance Authority) for type-safe component variants
- **Forms**: React Hook Form + Zod validation
- **Caching**: FlatCache with TTL support (three-tier strategy)
- **Billing**: Polar.sh integration via BetterAuth plugin (optional)
- **Email**: Resend with React Email templates

### Key Patterns

- **Config-based routing** - All routes defined in `app/routes.ts` (not file-based)
- **Model layer pattern** - All database operations abstracted through `app/models/` functions (never call Prisma directly in routes)
- **API-first CRUD** - RESTful endpoints with loaders (GET) and actions (POST/PUT/DELETE)
- **Middleware architecture** - Auth, logging, and context via layout routes
- **Singleton services** - Database, auth, AI, cache clients use singleton pattern
- **Three-tier caching** - Client-side route caching, model layer caching, manual caching with TTL support
- **RBAC system** - Hierarchical role-based access (USER → EDITOR → ADMIN) with server-side enforcement
- **CVA components** - Type-safe variants with DaisyUI classes
- **Custom Prisma output** - Client generated to `app/generated/prisma`
- **Hybrid validation** - Server + client validation with shared Zod schemas
- **React 19 meta tags** - Native `<title>` and `<meta>` elements (no `meta()` export)
- **Comprehensive docs** - All patterns documented in `.github/instructions/*.instructions.md`

## 🛠️ Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone and install dependencies**

    ```bash
    git clone <your-repo>
    cd iridium
    npm install
    ```

2. **Set up environment variables**

    ```bash
    cp .env.example .env
    ```

    Edit `.env` with your values:
    - `DATABASE_URL` - PostgreSQL connection string
    - `BETTER_AUTH_SECRET` - Random secret (min 32 characters) for session encryption
    - `BETTER_AUTH_URL` - Your app URL (`http://localhost:5173` for dev)
    - `OPENAI_API_KEY` - Your OpenAI API key (optional)
    - `POSTHOG_API_KEY` - PostHog API key for client-side analytics (optional)
    - `POSTHOG_PROJECT_ID` - PostHog project ID (optional)
    - `POSTHOG_PERSONAL_API_KEY` - PostHog personal API key for server-side operations (optional)
    - `POLAR_ACCESS_TOKEN` - Polar.sh access token (optional, for billing)
    - `POLAR_SERVER` - "sandbox" or "production" (optional)
    - `POLAR_SUCCESS_URL` - Checkout success redirect URL (optional)
    - `POLAR_WEBHOOK_SECRET` - Polar webhook secret (optional)
    - `RESEND_API_KEY` - Resend API key for sending emails (required)
    - `RESEND_FROM_EMAIL` - Default sender email address (optional, defaults to `onboarding@resend.dev`)

3. **Set up the database**

    ```bash
    npx prisma generate
    npx prisma migrate deploy
    npm run seed
    ```

4. **Start development server**

    ```bash
    npm run dev
    ```

    The app will be available at `http://localhost:5173`

## 📁 Project Structure

```text
app/
├── components/           # UI components (CVA-based with DaisyUI)
│   ├── Button.tsx       # Canonical CVA component example
│   ├── TextInput.tsx    # Form input pattern
│   ├── Card.tsx, Modal.tsx, etc.
├── constants/
│   └── index.ts         # Path constants enum
├── emails/              # React Email templates
│   ├── verification-email.tsx
│   ├── password-reset-email.tsx
│   ├── welcome-email.tsx
│   └── transactional-email.tsx
├── generated/
│   └── prisma/          # Prisma client (custom output path)
├── hooks/
│   ├── useAuthenticatedContext.ts
│   └── useUserRole.ts   # RBAC hooks (client-side only)
├── lib/
│   ├── auth.server.ts        # BetterAuth configuration (with Polar plugin)
│   ├── auth-client.ts        # Client-side auth
│   ├── session.server.ts     # Session helpers (requireUser, requireRole, etc.)
│   ├── ai.ts                 # OpenAI client singleton
│   ├── cache.ts              # FlatCache with three-tier caching utilities
│   ├── polar.server.ts       # Polar SDK client singleton
│   ├── resend.server.ts      # Resend SDK client singleton
│   ├── form-hooks.ts         # useValidatedForm hook
│   ├── form-validation.server.ts  # Server-side form validation
│   └── validations.ts        # Zod schemas
├── middleware/
│   ├── auth.ts               # Authentication middleware
│   ├── context.ts            # React Router contexts
│   └── logging.ts            # Request logging
├── models/                   # Model layer (data access layer)
│   ├── user.server.ts        # User CRUD operations
│   ├── email.server.ts       # Email operations (Resend)
│   └── feature-flags.server.ts  # PostHog feature flags with caching
├── routes/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── authenticate.ts   # Central auth endpoint
│   │   │   └── better-auth.ts    # BetterAuth handler
│   │   ├── posthog/
│   │   │   └── feature-flags.server.ts  # Feature flags API
│   │   ├── email.server.ts       # Email API (send from anywhere)
│   │   └── profile.server.ts     # Profile API (canonical CRUD example)
│   ├── admin/
│   │   └── design.tsx            # Component showcase
│   ├── authenticated.tsx         # Protected layout with middleware
│   ├── dashboard.tsx             # User dashboard
│   ├── profile.tsx               # User profile page
│   ├── home.tsx                  # Landing page
│   ├── about.tsx                 # About page
│   ├── sign-in.tsx               # Sign in page
│   └── sign-out.tsx              # Sign out handler
├── types/
│   └── posthog.ts        # PostHog type definitions
├── cva.config.ts         # CVA utilities (cx, cva, compose)
├── db.server.ts          # Prisma client singleton
├── env.d.ts              # TypeScript environment types
└── routes.ts             # Config-based routing (single source of truth)

prisma/
├── schema.prisma         # Database schema
├── seed.ts              # Database seeding
└── migrations/          # Migration history
```

## 🔧 Configuration

### Routing

Routes are configured in `app/routes.ts` using React Router 7's config-based approach:

```typescript
export default [
    index('routes/home.tsx'),
    route(Paths.ABOUT, 'routes/about.tsx'),
    route(Paths.SIGN_IN, 'routes/sign-in.tsx'),
    layout('routes/authenticated.tsx', [
        route(Paths.DASHBOARD, 'routes/dashboard.tsx'),
        route(Paths.PROFILE, 'routes/profile.tsx'),
        ...prefix('admin', [route('/design', 'routes/admin/design.tsx')]),
    ]),
    ...prefix('api', [
        route('authenticate', 'routes/api/auth/authenticate.ts'),
        route('auth/*', 'routes/api/auth/better-auth.ts'),
        route('profile', 'routes/api/profile.ts'),
    ]),
] satisfies RouteConfig;
```

**Important**: After adding/modifying routes, run `npm run typecheck` to generate route types.

### Authentication

BetterAuth is configured with:

- Email/password authentication
- Prisma adapter with PostgreSQL
- 7-day session expiry
- Session helpers: `requireUser()`, `getUserFromSession()`, `requireAnonymous()`
- Middleware-based route protection via layout files
- Central authentication endpoint at `/api/authenticate`

### Database Schema

The Prisma schema includes:

- **User model** - Email, name, profile fields (bio, website, location, phoneNumber)
- **BetterAuth models** - Account, Session, Verification
- **Custom output path** - Client generated to `app/generated/prisma` (not default location)

## 🎯 Usage Examples

### Adding a New Protected Route

1. Add route to authenticated layout in `app/routes.ts`:

    ```typescript
    layout('routes/authenticated.tsx', [
        route('new-feature', 'routes/new-feature.tsx'),
    ]);
    ```

2. Create route file `app/routes/new-feature.tsx`:

    ```tsx
    import type { Route } from './+types/new-feature';
    import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';

    export default function NewFeature() {
        const { user } = useAuthenticatedContext();
        return (
            <>
                <title>New Feature - Iridium</title>
                <h1>Welcome {user.email}</h1>
            </>
        );
    }
    ```

3. Run `npm run typecheck` to generate route types

### Adding API Endpoints

1. Add route to `api` prefix in `app/routes.ts`:

    ```typescript
    ...prefix("api", [
      route("new-endpoint", "routes/api/new-endpoint.ts")
    ])
    ```

2. Create handler in `app/routes/api/new-endpoint.ts`:

    ```typescript
    import type { Route } from './+types/new-endpoint';
    import { data } from 'react-router';
    import { requireUser } from '~/lib/session.server';

    export async function action({ request }: Route.ActionArgs) {
        const user = await requireUser(request);
        // Handle request
        return data({ success: true });
    }
    ```

### Creating UI Components

Follow the CVA + DaisyUI pattern (see `app/components/Button.tsx`):

```typescript
import type { VariantProps } from "cva";
import { cva, cx } from "~/cva.config";

export const buttonVariants = cva({
  base: "btn",
  variants: {
    status: {
      primary: "btn-primary",
      secondary: "btn-secondary"
    },
    size: { sm: "btn-sm", md: "btn-md", lg: "btn-lg" }
  },
  defaultVariants: { status: "primary", size: "md" }
});

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ status, size, className, ...props }: ButtonProps) {
  return <button className={cx(buttonVariants({ status, size }), className)} {...props} />;
}
```

### Using Form Validation

Use the hybrid validation pattern with React Hook Form + Zod:

```typescript
import { useValidatedForm } from "~/lib/form-hooks";
import { signInSchema } from "~/lib/validations";

export default function SignIn() {
  const fetcher = useFetcher();
  const { register, handleSubmit, formState: { errors } } = useValidatedForm({
    resolver: zodResolver(signInSchema),
    fetcher
  });

  return (
    <fetcher.Form method="post" onSubmit={handleSubmit}>
      <TextInput {...register("email")} error={errors.email?.message} />
      <Button type="submit">Sign In</Button>
    </fetcher.Form>
  );
}
```

## 📖 Documentation

This project includes comprehensive pattern documentation in `.github/instructions/`:

### Core Patterns

- **`caching-pattern.instructions.md`** - Three-tier caching strategy (client-side, model layer, manual)
- **`crud-pattern.instructions.md`** - API-first CRUD implementation patterns
- **`form-validation.instructions.md`** - Universal form validation with React Hook Form + Zod
- **`role-based-access.instructions.md`** - RBAC patterns with hierarchical roles

### Framework-Specific

- **`better-auth.instructions.md`** - Authentication flows and session management
- **`react-router.instructions.md`** - Config-based routing patterns
- **`prisma.instructions.md`** - Database patterns and custom Prisma configuration

### Component Development

- **`component-patterns.instructions.md`** - CVA-based component patterns with DaisyUI
- **`cva.instructions.md`** - Class Variance Authority usage
- **`daisyui.instructions.md`** - DaisyUI component library integration

### Integrations

- **`polar.instructions.md`** - Polar billing integration via BetterAuth plugin
- **`posthog.instructions.md`** - PostHog analytics, feature flags, and error tracking
- **`resend.instructions.md`** - Resend email integration with React Email templates and BetterAuth

All patterns include:

- Complete code examples
- Best practices and anti-patterns
- Reference implementations
- Troubleshooting guides

## 🚀 Deployment

**Ready to deploy?** Choose your path:

### ⚡ Quick Start (5 Minutes)

Follow the [Deployment Quick Start](./docs/deployment-quick-start.md) for Railway:

```bash
railway login && railway init && railway add --plugin postgresql
railway variables set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
railway variables set RESEND_API_KEY=your_key
railway up && railway run npx prisma migrate deploy
```

### 📖 Comprehensive Guide

See the full [Deployment Guide](./docs/deployment.md) for:

- **Railway** - Recommended for beginners (PostgreSQL included, automatic SSL)
- **Docker** - Self-hosted or custom infrastructure
- **Vercel** - Serverless deployment (with limitations)

### Essential Environment Variables

```env
DATABASE_URL=postgresql://...              # Your PostgreSQL connection
BETTER_AUTH_SECRET=<min-32-chars>         # Generate: openssl rand -base64 32
BETTER_AUTH_URL=https://yourdomain.com    # Your production URL
RESEND_API_KEY=re_...                     # From resend.com (required)
RESEND_FROM_EMAIL=noreply@yourdomain.com  # Verified sender (required)
```

**Optional variables** for AI, analytics, and billing - see [Environment Variables Reference](./docs/deployment.md#environment-variables-reference).

### Post-Deployment

After deploying, verify:

- ✅ App loads without errors
- ✅ Sign up/sign in works
- ✅ Email verification sends
- ✅ Protected routes require auth
- ✅ Database migrations applied

Full checklist: [Post-Deployment Checklist](./docs/deployment.md#post-deployment-checklist)

### Database Migrations

```bash
npx prisma migrate deploy
```

### Important Notes

- Run `npx prisma generate` after deploying if schema changed
- Ensure custom Prisma output path (`app/generated/prisma`) is included in build
- Set `NODE_ENV=production` for optimal performance

## 📚 Learn More

- [React Router 7 Docs](https://reactrouter.com) - Config-based routing documentation
- [BetterAuth Docs](https://better-auth.com) - Authentication setup and configuration
- [Prisma Docs](https://prisma.io/docs) - Database and ORM documentation
- [PostHog Docs](https://posthog.com/docs) - Analytics, feature flags, and error tracking
- [DaisyUI Docs](https://daisyui.com) - Component library and theming
- [CVA Docs](https://cva.style) - Class variance authority patterns
- [Vercel AI SDK](https://sdk.vercel.ai) - AI integration and streaming
- [React Hook Form](https://react-hook-form.com) - Form validation patterns
- [Zod Docs](https://zod.dev) - Schema validation
- [Polar.sh Docs](https://docs.polar.sh) - Billing integration (optional)
- [Resend Docs](https://resend.com/docs) - Email service integration
- [React Email Docs](https://react.email/docs) - Email template development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the established patterns
4. Run `npm run typecheck` to ensure no errors
5. Run `npm run build` to verify production build
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- **Never** call Prisma directly in routes - use model layer functions from `app/models/`
- Follow the API-first CRUD pattern for all data operations
- Use config-based routing in `app/routes.ts` (never file-based routing)
- Follow the CVA + DaisyUI component pattern for all UI components
- Use server-side role checks (`requireRole`, `requireEditor`, `requireAdmin`) for authorization
- Implement three-tier caching where appropriate (client-side, model layer, or manual)
- Use middleware for layout-level route protection (not individual auth checks)
- Run `npm run typecheck` after route changes to generate types
- Import Prisma types from `~/generated/prisma/client`
- Reference `.github/instructions/*.instructions.md` for comprehensive patterns and best practices

## 📄 License

MIT License - see LICENSE file for details
