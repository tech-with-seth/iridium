# TWS Foundations

A modern full-stack SaaS boilerplate built with React Router 7, featuring authentication, AI integration, and everything you need to ship quickly.

## 🚀 Features

- **React Router 7** - Config-based routing with SSR
- **React 19** - Latest React with native meta tag support
- **Authentication** - BetterAuth with Prisma adapter and session management
- **AI Integration** - OpenAI with Vercel AI SDK for streaming responses
- **Database** - PostgreSQL with Prisma ORM (custom output path)
- **Styling** - DaisyUI 5 + TailwindCSS v4 with CVA for type-safe variants
- **TypeScript** - Strict mode with full type safety
- **Form Handling** - React Hook Form + Zod with server/client validation
- **Caching** - FlatCache for efficient data caching
- **Billing** - Polar.sh integration (optional)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19, React Router 7, DaisyUI 5, TailwindCSS v4
- **Backend**: Prisma, PostgreSQL, BetterAuth
- **AI**: OpenAI with Vercel AI SDK
- **Styling**: CVA (Class Variance Authority) for type-safe component variants
- **Forms**: React Hook Form + Zod validation
- **Caching**: FlatCache with TTL support
- **Billing**: Polar.sh integration (optional)

### Key Patterns

- **Config-based routing** - All routes defined in `app/routes.ts` (not file-based)
- **Middleware architecture** - Auth, logging, and context via layout routes
- **Singleton services** - Database, auth, AI clients use singleton pattern
- **CVA components** - Type-safe variants with DaisyUI classes
- **Custom Prisma output** - Client generated to `app/generated/prisma`
- **Hybrid validation** - Server + client validation with shared Zod schemas
- **React 19 meta tags** - Native `<title>` and `<meta>` elements (no `meta()` export)

## 🛠️ Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone and install dependencies**

   ```bash
   git clone <your-repo>
   cd tws-foundations
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
   - `POLAR_ACCESS_TOKEN` - Polar.sh access token (optional, for billing)
   - `POLAR_SERVER` - "sandbox" or "production" (optional)
   - `POLAR_WEBHOOK_SECRET` - Polar webhook secret (optional)

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
├── generated/
│   └── prisma/          # Prisma client (custom output path)
├── hooks/
│   └── useAuthenticatedContext.ts
├── lib/
│   ├── auth.server.ts        # BetterAuth configuration
│   ├── auth-client.ts        # Client-side auth
│   ├── session.server.ts     # Session helpers (requireUser, getUser)
│   ├── ai.ts                 # OpenAI client singleton
│   ├── cache.ts              # FlatCache with TTL
│   ├── form-hooks.ts         # useValidatedForm hook
│   ├── form-validation.server.ts  # Server-side form validation
│   └── validations.ts        # Zod schemas
├── middleware/
│   ├── auth.ts               # Authentication middleware
│   ├── context.ts            # React Router contexts
│   └── logging.ts            # Request logging
├── routes/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── authenticate.ts   # Central auth endpoint
│   │   │   └── better-auth.ts    # BetterAuth handler
│   │   └── profile.ts            # Profile API
│   ├── admin/
│   │   └── design.tsx            # Component showcase
│   ├── authenticated.tsx         # Protected layout with middleware
│   ├── dashboard.tsx             # User dashboard
│   ├── profile.tsx               # User profile page
│   ├── home.tsx                  # Landing page
│   ├── about.tsx                 # About page
│   ├── sign-in.tsx               # Sign in page
│   └── sign-out.tsx              # Sign out handler
├── cva.config.ts         # CVA utilities (cx, cva, compose)
├── db.server.ts          # Prisma client singleton
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
  index("routes/home.tsx"),
  route(Paths.ABOUT, "routes/about.tsx"),
  route(Paths.SIGN_IN, "routes/sign-in.tsx"),
  layout("routes/authenticated.tsx", [
    route(Paths.DASHBOARD, "routes/dashboard.tsx"),
    route(Paths.PROFILE, "routes/profile.tsx"),
    ...prefix("admin", [route("/design", "routes/admin/design.tsx")])
  ]),
  ...prefix("api", [
    route("authenticate", "routes/api/auth/authenticate.ts"),
    route("auth/*", "routes/api/auth/better-auth.ts"),
    route("profile", "routes/api/profile.ts")
  ])
] satisfies RouteConfig;
```

**Important**: After adding/modifying routes, run `npm run typecheck` to generate route types.

### Authentication

BetterAuth is configured with:

- Email/password authentication
- Prisma adapter with PostgreSQL
- 7-day session expiry
- Session helpers: `requireUser()`, `getUser()`, `requireAnonymous()`
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
   layout("routes/authenticated.tsx", [
     route("new-feature", "routes/new-feature.tsx")
   ])
   ```

2. Create route file `app/routes/new-feature.tsx`:

   ```tsx
   import type { Route } from "./+types/new-feature";
   import { useAuthenticatedContext } from "~/hooks/useAuthenticatedContext";

   export default function NewFeature() {
     const { user } = useAuthenticatedContext();
     return (
       <>
         <title>New Feature - TWS Foundations</title>
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
   import type { Route } from "./+types/new-endpoint";
   import { json } from "react-router";
   import { requireUser } from "~/lib/session.server";

   export async function action({ request }: Route.ActionArgs) {
     const user = await requireUser(request);
     // Handle request
     return json({ success: true });
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

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Make sure to set all required environment variables in your production environment:

- `DATABASE_URL` - Production PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secure random secret (min 32 characters)
- `BETTER_AUTH_URL` - Your production domain URL
- `OPENAI_API_KEY` - OpenAI API key (if using AI features)
- Optional: Polar.sh credentials if using billing

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
- [DaisyUI Docs](https://daisyui.com) - Component library and theming
- [CVA Docs](https://cva.style) - Class variance authority patterns
- [Vercel AI SDK](https://sdk.vercel.ai) - AI integration and streaming
- [React Hook Form](https://react-hook-form.com) - Form validation patterns
- [Zod Docs](https://zod.dev) - Schema validation
- [Polar.sh Docs](https://docs.polar.sh) - Billing integration (optional)

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

- Follow the CVA + DaisyUI component pattern
- Use config-based routing in `app/routes.ts`
- Import Prisma types from `~/generated/prisma/client`
- Use middleware for route protection (not individual auth checks)
- Run `npm run typecheck` after route changes
- See `.github/instructions/` for detailed framework patterns

## 📄 License

MIT License - see LICENSE file for details
