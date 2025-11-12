# Iridium

A modern full-stack SaaS boilerplate built with React Router 7, featuring authentication, AI integration, and everything you need to ship quickly.

## 🚀 Features

- **React Router 7** - Config-based routing with SSR
- **React 19** - Latest React with native meta tag support
- **Authentication** - BetterAuth with Prisma adapter and session management
- **RBAC** - Role-based access control (USER/EDITOR/ADMIN) with hierarchical permissions
- **Multi-tenancy** - Organization and invitation system with team management
- **AI Integration** - OpenAI with Vercel AI SDK for streaming chat responses
- **E-commerce** - Shop functionality with product listings, checkout, and customer portal
- **Database** - PostgreSQL with Prisma ORM (custom output path)
- **Model Layer Pattern** - All database operations abstracted through `app/models/` functions
- **Styling** - DaisyUI 5 + TailwindCSS v4 with CVA for type-safe variants
- **TypeScript** - Strict mode with full type safety
- **Form Handling** - React Hook Form + Zod with server/client validation
- **Caching** - Three-tier caching strategy: client-side route caching, model layer caching, manual caching
- **Analytics** - PostHog integration for product analytics and feature flags
- **Billing** - Polar.sh integration via BetterAuth plugin with webhook support
- **Email** - Resend integration with React Email templates, BetterAuth email flows, and centralized API endpoint
- **Image Handling** - Cloudinary integration for image uploads and transformations
- **Testing** - Comprehensive testing setup with Vitest (unit) and Playwright (e2e)
- **Documentation** - Comprehensive patterns documented in `.github/instructions/`

## 🚀 Getting Started

**New to Iridium?** Start here: **[Getting Started Guide](./docs/GETTING_STARTED.md)**

The Getting Started guide provides a concise, single-page reference for:

- Initial setup steps (clone, install, environment variables, database)
- Common commands you'll use daily
- Post-feature development checklist
- Critical gotchas and troubleshooting tips

For detailed documentation on specific topics, see the sections below.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19, React Router 7, DaisyUI 5, TailwindCSS v4
- **Backend**: Prisma, PostgreSQL, BetterAuth
- **AI**: OpenAI with Vercel AI SDK
- **Analytics**: PostHog (product analytics, feature flags, error tracking)
- **Styling**: CVA (Class Variance Authority) for type-safe component variants
- **Forms**: React Hook Form + Zod validation
- **Caching**: FlatCache with TTL support (three-tier strategy)
- **Billing**: Polar.sh integration via BetterAuth plugin with webhooks
- **Email**: Resend with React Email templates
- **Images**: Cloudinary for uploads and transformations
- **Testing**: Vitest (unit/integration), Playwright (e2e)

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

> **Quick Start:** See **[GETTING_STARTED.md](./docs/GETTING_STARTED.md)** for a concise setup guide.

### Prerequisites

- Node.js 20+ (`.nvmrc` included - use `nvm use` to switch automatically)
- PostgreSQL database (see [GETTING_STARTED.md](./docs/GETTING_STARTED.md) for installation options)
- Resend API key (required for authentication emails - free tier available at [resend.com](https://resend.com))
- OpenAI API key (optional, only needed for AI features)
- Cloudinary account (optional, only needed for image upload features)

### Installation

1. **Clone and install dependencies**

    ```bash
    git clone <your-repo>
    cd <YOUR_PROJECT_NAME>
    npm install
    ```

2. **Set up environment variables**

    ```bash
    cp .env.example .env
    # Edit .env with your values
    ```

    **Required variables:**
    - `DATABASE_URL` - PostgreSQL connection string
    - `BETTER_AUTH_SECRET` - Generate with `openssl rand -base64 32` (min 32 chars)
    - `BETTER_AUTH_URL` - Your app URL (`http://localhost:5173` for dev)
    - `VITE_BETTER_AUTH_BASE_URL` - Frontend base URL (`http://localhost:5173` for dev)
    - `ADMIN_EMAIL` - Admin user email for seeding
    - `RESEND_API_KEY` - Resend API key for sending emails ([get free key](https://resend.com))
    - `RESEND_FROM_EMAIL` - Sender email (use `onboarding@resend.dev` for testing)

    **Optional variables:**
    - `OPENAI_API_KEY` - Your OpenAI API key (only if using AI features)
    - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Cloudinary image uploads
    - `POLAR_ACCESS_TOKEN`, `POLAR_ORGANIZATION_ID`, `POLAR_SERVER`, `POLAR_WEBHOOK_SECRET`, `POLAR_RETURN_URL`, `POLAR_SUCCESS_URL` - Polar.sh billing
    - `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID`, `VITE_POSTHOG_API_KEY`, `VITE_POSTHOG_HOST` - PostHog analytics

    See [`.env.example`](./.env.example) for full documentation.

3. **Set up the database**

    Create the database first:

    ```bash
    createdb iridium
    # Or use Docker: docker run --name iridium-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=iridium -p 5432:5432 -d postgres:16
    ```

    Then run migrations and seed data:

    ```bash
    npx prisma generate
    npx prisma migrate deploy
    npm run seed
    ```

    Login credentials: `admin@iridium.com` / `Admin123!` (see [GETTING_STARTED.md](./docs/GETTING_STARTED.md) for all test users)

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
│   ├── Card.tsx, Modal.tsx, ChatBubble.tsx
│   ├── Navbar.tsx, Footer.tsx, Header.tsx
│   ├── Drawer.tsx, FileInput.tsx, Spinner.tsx
│   └── ... (30+ components)
├── constants/
│   └── index.ts         # Path constants enum (all routes)
├── emails/              # React Email templates
│   ├── verification-email.tsx
│   ├── password-reset-email.tsx
│   ├── welcome-email.tsx
│   └── transactional-email.tsx
├── generated/
│   └── prisma/          # Prisma client (custom output path)
├── hooks/
│   ├── useAuthenticatedContext.ts
│   ├── useUserRole.ts        # RBAC hooks (client-side only)
│   ├── useDrawer.ts          # Drawer state management
│   └── useRootData.ts        # Root loader data access
├── lib/
│   ├── auth.server.ts             # BetterAuth configuration (with Polar plugin)
│   ├── auth-client.ts             # Client-side auth
│   ├── session.server.ts          # Session helpers (requireUser, requireRole, etc.)
│   ├── ai.ts                      # OpenAI client singleton
│   ├── cache.server.ts            # Server-side caching utilities
│   ├── cache.ts                   # FlatCache with three-tier caching
│   ├── polar.server.ts            # Polar SDK client singleton
│   ├── posthog.server.ts          # PostHog server-side client
│   ├── posthog.ts                 # PostHog client-side utilities
│   ├── resend.server.ts           # Resend SDK client singleton
│   ├── form-hooks.ts              # useValidatedForm hook
│   ├── form-validation.server.ts  # Server-side form validation
│   ├── validations.ts             # Zod schemas
│   └── formatters.ts              # Utility formatters
├── middleware/
│   ├── auth.ts               # Authentication middleware
│   ├── context.ts            # React Router contexts
│   └── logging.ts            # Request logging
├── models/                   # Model layer (data access layer)
│   ├── user.server.ts        # User CRUD operations
│   ├── organization.server.ts     # Organization operations
│   ├── invitation.server.ts       # Invitation operations
│   ├── email.server.ts            # Email operations (Resend)
│   └── feature-flags.server.ts    # PostHog feature flags with caching
├── routes/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── authenticate.ts      # Central auth endpoint
│   │   │   └── better-auth.ts       # BetterAuth handler
│   │   ├── posthog/
│   │   │   └── feature-flags.ts     # Feature flags API
│   │   ├── webhooks/
│   │   │   └── polar.ts             # Polar webhook handler
│   │   ├── chat.ts                  # AI chat endpoint
│   │   ├── cloudinary.ts            # Cloudinary upload endpoint
│   │   ├── email.ts                 # Email API (send from anywhere)
│   │   └── profile.ts               # Profile API (canonical CRUD example)
│   ├── profile/
│   │   ├── index.tsx            # Profile view page
│   │   └── edit.tsx             # Profile edit page
│   ├── shop/
│   │   ├── list.tsx             # Shop product listing
│   │   ├── detail.tsx           # Product detail page
│   │   ├── checkout.tsx         # Checkout page
│   │   └── portal.tsx           # Customer portal (protected)
│   ├── authenticated.tsx        # Protected layout with middleware
│   ├── dashboard.tsx            # User dashboard
│   ├── design.tsx               # Component showcase
│   ├── chat.tsx                 # AI chat interface
│   ├── success.tsx              # Success page (post-checkout)
│   ├── home.tsx                 # Landing page
│   ├── sign-in.tsx              # Sign in page
│   └── sign-out.tsx             # Sign out handler
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
    // Public routes
    index('routes/home.tsx'),
    route(Paths.SIGN_IN, 'routes/sign-in.tsx'),
    route(Paths.SIGN_OUT, 'routes/sign-out.tsx'),
    route(Paths.SHOP, 'routes/shop/list.tsx'),
    route(Paths.PRODUCT_DETAIL, 'routes/shop/detail.tsx'),
    route(Paths.CHECKOUT, 'routes/shop/checkout.tsx'),
    // Protected routes
    layout('routes/authenticated.tsx', [
        route(Paths.DASHBOARD, 'routes/dashboard.tsx'),
        route(Paths.PORTAL, 'routes/shop/portal.tsx'),
        route(Paths.SUCCESS, 'routes/success.tsx'),
        route(Paths.DESIGN, 'routes/design.tsx'),
        route(Paths.CHAT, 'routes/chat.tsx'),
        ...prefix(Paths.PROFILE, [
            index('routes/profile/index.tsx'),
            route(Paths.PROFILE_EDIT, 'routes/profile/edit.tsx'),
        ]),
    ]),
    // API routes
    ...prefix(Paths.API, [
        route(Paths.AUTHENTICATE, 'routes/api/auth/authenticate.ts'),
        route(Paths.CLOUDINARY, 'routes/api/cloudinary.ts'),
        route(Paths.BETTER_AUTH, 'routes/api/auth/better-auth.ts'),
        route(Paths.PROFILE, 'routes/api/profile.ts'),
        route(Paths.EMAIL, 'routes/api/email.ts'),
        route(Paths.CHAT, 'routes/api/chat.ts'),
        ...prefix(Paths.WEBHOOKS, [
            route(Paths.POLAR, 'routes/api/webhooks/polar.ts'),
        ]),
        ...prefix(Paths.POSTHOG, [
            route(Paths.FEATURE_FLAGS, 'routes/api/posthog/feature-flags.ts'),
        ]),
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

- **User model** - Email, name, profile fields (bio, website, location, phoneNumber), organization relationships
- **Organization model** - Multi-tenancy support with name, slug, and member management
- **Invitation model** - Organization invitation system with email and status tracking
- **BetterAuth models** - Account, Session, Verification
- **Polar models** - PolarCustomer, PolarSubscription (for billing integration)
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

- **`api-endpoints.instructions.md`** - RESTful API endpoint patterns
- **`caching-pattern.instructions.md`** - Three-tier caching strategy (client-side, model layer, manual)
- **`client-side-caching.instructions.md`** - Client-side caching with React Router
- **`crud-pattern.instructions.md`** - API-first CRUD implementation patterns
- **`error-boundaries.instructions.md`** - Error handling and boundaries
- **`error-tracking.instructions.md`** - Error tracking with PostHog
- **`feature-flags.instructions.md`** - Feature flag implementation patterns
- **`form-validation.instructions.md`** - Universal form validation with React Hook Form + Zod
- **`horizontal-slice.instructions.md`** - Horizontal code organization patterns
- **`vertical-slice.instructions.md`** - Vertical slice architecture patterns
- **`pure-functions.instructions.md`** - Pure function patterns and best practices
- **`role-based-access-control.instructions.md`** - RBAC patterns with hierarchical roles
- **`seo.instructions.md`** - SEO optimization with React 19 meta tags

### Framework-Specific

- **`better-auth.instructions.md`** - Authentication flows and session management
- **`react-router.instructions.md`** - Config-based routing patterns
- **`routing.instructions.md`** - Additional routing patterns and conventions
- **`prisma.instructions.md`** - Database patterns and custom Prisma configuration
- **`react-hook-form.instructions.md`** - Form handling with React Hook Form
- **`zod.instructions.md`** - Schema validation with Zod

### Component Development

- **`component-patterns.instructions.md`** - CVA-based component patterns with DaisyUI
- **`cva.instructions.md`** - Class Variance Authority usage
- **`daisyui.instructions.md`** - DaisyUI component library integration

### Testing

- **`unit-testing.instructions.md`** - Unit testing with Vitest
- **`playwright.instructions.md`** - E2E testing with Playwright

### Integrations

- **`polar.instructions.md`** - Polar billing integration via BetterAuth plugin
- **`posthog.instructions.md`** - PostHog analytics, feature flags, and error tracking
- **`resend.instructions.md`** - Resend email integration with React Email templates and BetterAuth

### Configuration

- **`env.instructions.md`** - Environment variable configuration and management

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
- [Polar.sh Docs](https://docs.polar.sh) - Billing integration
- [Resend Docs](https://resend.com/docs) - Email service integration
- [React Email Docs](https://react.email/docs) - Email template development
- [Cloudinary Docs](https://cloudinary.com/documentation) - Image upload and transformation
- [Vitest Docs](https://vitest.dev) - Unit testing framework
- [Playwright Docs](https://playwright.dev) - End-to-end testing

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
