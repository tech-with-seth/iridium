# BetterAuth Instructions

## Overview

BetterAuth is a framework-agnostic authentication library with built-in support for email/password, social providers, and extensive plugin ecosystem. This project uses BetterAuth with **Prisma adapter**, **PostgreSQL**, and **React Router 7** integration.

## Project Configuration

### Server Setup (`app/lib/auth.server.ts`)

```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '~/db.server';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        requireEmailVerification: false,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    plugins: [
        // Add plugins here as needed
    ],
});
```

### Client Setup (`app/lib/auth-client.ts`)

```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5173',
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### Session Helpers (`app/lib/session.server.ts`)

```typescript
import { redirect } from 'react-router';
import { auth } from './auth.server';

export async function getUserFromSession(request: Request) {
    const session = await auth.api.getSession({ headers: request.headers });
    return session?.user ?? null;
}

export async function requireUser(request: Request) {
    const user = await getUserFromSession(request);
    if (!user) {
        throw redirect('/sign-in');
    }
    return user;
}

export async function requireAnonymous(request: Request) {
    const user = await getUserFromSession(request);
    if (user) {
        throw redirect('/dashboard');
    }
}
```

## React Router 7 Integration

### API Route Handler

All BetterAuth endpoints are handled through a catch-all API route:

```typescript
// app/routes/api/auth/better-auth.ts
import type { Route } from './+types/better-auth';
import { auth } from '~/lib/auth.server';

export async function loader({ request }: Route.LoaderArgs) {
    return auth.handler(request);
}

export async function action({ request }: Route.ActionArgs) {
    return auth.handler(request);
}
```

```typescript
// app/routes.ts
import { type RouteConfig, route, prefix } from '@react-router/dev/routes';

export default [
    // ... other routes
    ...prefix('api', [route('auth/*', 'routes/api/auth/better-auth.ts')]),
] satisfies RouteConfig;
```

### Protected Routes with Middleware

Use middleware pattern in layout routes:

```typescript
// app/routes/authenticated.tsx
import type { Route } from './+types/authenticated';
import { Outlet } from 'react-router';
import { authMiddleware } from '~/middleware/auth';

export async function loader(args: Route.LoaderArgs) {
    return authMiddleware(args);
}

export default function AuthenticatedLayout({ loaderData }: Route.ComponentProps) {
    return (
        <div>
            <nav>{/* Navigation for authenticated users */}</nav>
            <Outlet />
        </div>
    );
}
```

### Accessing User in Components

```typescript
// In protected routes under authenticated layout
import { useAuthenticatedContext } from '~/middleware/context';

export default function Dashboard() {
    const { user } = useAuthenticatedContext();

    return <div>Welcome {user.email}</div>;
}
```

## Authentication Methods

### Email & Password

#### Sign Up

```typescript
import { authClient } from '~/lib/auth-client';

const { data, error } = await authClient.signUp.email(
    {
        email: 'user@example.com',
        password: 'securePassword123',
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg', // optional
        callbackURL: '/dashboard', // optional
    },
    {
        onRequest: () => {
            // Show loading state
        },
        onSuccess: (ctx) => {
            // Redirect to dashboard
            window.location.href = ctx.data.callbackURL || '/dashboard';
        },
        onError: (ctx) => {
            // Display error message
            console.error(ctx.error.message);
        },
    },
);
```

**Configuration Options:**

```typescript
emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Automatically sign in after sign up
    requireEmailVerification: false, // Require email verification before sign in
    minPasswordLength: 8, // Minimum password length
    maxPasswordLength: 128, // Maximum password length
    sendResetPassword: async ({ user, url }) => {
        // Custom email sending logic
    }
}
```

#### Sign In

```typescript
const { data, error } = await authClient.signIn.email(
    {
        email: 'user@example.com',
        password: 'securePassword123',
        callbackURL: '/dashboard', // optional
        rememberMe: true, // optional - keep session after browser close
    },
    {
        onSuccess: (ctx) => {
            window.location.href = ctx.data.callbackURL || '/dashboard';
        },
        onError: (ctx) => {
            console.error(ctx.error.message);
        },
    },
);
```

#### Sign Out

```typescript
await authClient.signOut({
    fetchOptions: {
        onSuccess: () => {
            window.location.href = '/sign-in';
        },
    },
});
```

#### Password Reset

```typescript
// Request reset
await authClient.forgetPassword({
    email: 'user@example.com',
    redirectTo: '/reset-password', // Where to redirect after clicking email link
});

// Reset password
await authClient.resetPassword({
    newPassword: 'newSecurePassword123',
});
```

### Social Providers

#### Server Configuration

```typescript
import { betterAuth } from 'better-auth';

export const auth = betterAuth({
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
        },
    },
});
```

#### Client Usage

```typescript
// Sign in with GitHub
await authClient.signIn.social({
    provider: 'github',
    callbackURL: '/dashboard',
});

// Sign in with Google
await authClient.signIn.social({
    provider: 'google',
    callbackURL: '/dashboard',
});
```

**Supported Providers:** GitHub, Google, Apple, Discord, Facebook, Microsoft, Twitter, GitLab, Spotify, Twitch, LinkedIn, and more. See [BetterAuth docs](https://www.better-auth.com/docs/authentication) for full list.

## Session Management

### useSession Hook

```typescript
import { useSession } from '~/lib/auth-client';

function Component() {
    const { data: session, isPending, error } = useSession();

    if (isPending) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!session) return <div>Not authenticated</div>;

    return (
        <div>
            <p>Email: {session.user.email}</p>
            <p>Name: {session.user.name}</p>
        </div>
    );
}
```

### Server-Side Session Access

```typescript
import type { Route } from './+types/profile';
import { auth } from '~/lib/auth.server';

export async function loader({ request }: Route.LoaderArgs) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
        throw redirect('/sign-in');
    }

    return { user: session.user };
}
```

### Session Configuration

```typescript
session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days (in seconds)
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
        enabled: true,
        maxAge: 60 * 5 // Cache session in cookie for 5 minutes
    }
}
```

## Database Schema

### Required Prisma Models

BetterAuth requires these models in `prisma/schema.prisma`:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
  verifications Verification[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  accountId         String
  providerId        String
  accessToken       String?
  refreshToken      String?
  idToken           String?
  expiresAt         DateTime?
  password          String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  ipAddress String?
  userAgent String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime

  @@unique([identifier, value])
}
```

### Running Migrations

```bash
# Generate migration
npx prisma migrate dev --name add_better_auth_models

# Generate Prisma client
npx prisma generate
```

### Using BetterAuth CLI

```bash
# Generate schema automatically
npx @better-auth/cli generate

# Run migrations
npx @better-auth/cli migrate
```

## Plugins

BetterAuth has a rich plugin ecosystem. Common plugins for SaaS applications:

### Two-Factor Authentication

```typescript
// Server
import { twoFactor } from 'better-auth/plugins';

export const auth = betterAuth({
    plugins: [
        twoFactor({
            issuer: 'YourApp',
            totpWindow: 1, // Allow 30 seconds before/after for clock drift
        }),
    ],
});

// Client
import { twoFactorClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
    plugins: [
        twoFactorClient({
            twoFactorPage: '/two-factor', // Redirect here for 2FA verification
        }),
    ],
});

// Usage
await authClient.twoFactor.enable({
    password: 'userPassword',
});

await authClient.twoFactor.verifyTotp({
    code: '123456',
});
```

### Username Support

```typescript
// Server
import { username } from 'better-auth/plugins';

export const auth = betterAuth({
    plugins: [username()],
});

// Client
import { usernameClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
    plugins: [usernameClient()],
});

// Sign up with username
await authClient.signUp.username({
    username: 'johndoe',
    password: 'securePassword123',
    email: 'john@example.com',
    name: 'John Doe',
});
```

### Email OTP (One-Time Password)

```typescript
// Server
import { emailOTP } from 'better-auth/plugins';

export const auth = betterAuth({
    plugins: [
        emailOTP({
            sendEmail: async (email, otp) => {
                // Send email with OTP code
                await sendEmail({
                    to: email,
                    subject: 'Your login code',
                    body: `Your code is: ${otp}`,
                });
            },
        }),
    ],
});

// Client usage
await authClient.signIn.emailOtp({
    email: 'user@example.com',
});

await authClient.verifyEmailOtp({
    email: 'user@example.com',
    otp: '123456',
});
```

### Organization/Multi-Tenancy

```typescript
// Server
import { organization } from 'better-auth/plugins';

export const auth = betterAuth({
    plugins: [
        organization({
            allowUserToCreateOrganization: true,
            organizationLimit: 5, // Max organizations per user
        }),
    ],
});

// Client
import { organizationClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
    plugins: [organizationClient()],
});

// Create organization
await authClient.organization.create({
    name: 'Acme Inc',
    slug: 'acme-inc',
});

// Invite member
await authClient.organization.inviteMember({
    organizationId: 'org_123',
    email: 'member@example.com',
    role: 'member',
});
```

### Passkey (WebAuthn)

```typescript
// Server
import { passkey } from 'better-auth/plugins';

export const auth = betterAuth({
    plugins: [
        passkey({
            rpID: 'yourdomain.com',
            rpName: 'Your App Name',
        }),
    ],
});

// Client
import { passkeyClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
    plugins: [passkeyClient()],
});

// Register passkey
await authClient.passkey.register();

// Sign in with passkey
await authClient.passkey.signIn();
```

### Admin Plugin

```typescript
// Server
import { admin } from 'better-auth/plugins';

export const auth = betterAuth({
    plugins: [admin()],
});

// Grant admin privileges
// In database, set user.role = 'admin'

// Client - admin actions
await authClient.admin.listUsers();
await authClient.admin.banUser({ userId: 'user_123' });
await authClient.admin.unbanUser({ userId: 'user_123' });
await authClient.admin.impersonateUser({ userId: 'user_123' });
```

### Polar Billing Integration

See `.github/instructions/polar.instructions.md` for Polar plugin setup and billing integration patterns.

## React Router 7 Form Integration

### Sign-In Form Example

```typescript
import type { Route } from './+types/sign-in';
import { Form, redirect } from 'react-router';
import { authClient } from '~/lib/auth-client';
import { requireAnonymous } from '~/lib/session.server';
import { Button } from '~/components/Button';
import { TextInput } from '~/components/TextInput';

export async function loader({ request }: Route.LoaderArgs) {
    await requireAnonymous(request);
    return {};
}

export default function SignIn() {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const { error } = await authClient.signIn.email({
            email: formData.get('email') as string,
            password: formData.get('password') as string
        });

        if (!error) {
            window.location.href = '/dashboard';
        } else {
            alert(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <TextInput
                name="email"
                type="email"
                label="Email"
                required
            />
            <TextInput
                name="password"
                type="password"
                label="Password"
                required
            />
            <Button type="submit">Sign In</Button>
        </form>
    );
}
```

### With React Hook Form + Zod

See `.github/instructions/react-hook-form.instructions.md` for complete React Hook Form integration patterns.

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema } from '~/lib/validations';
import { authClient } from '~/lib/auth-client';

export default function SignIn() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(signInSchema)
    });

    const onSubmit = async (data: { email: string; password: string }) => {
        const { error } = await authClient.signIn.email(data);

        if (!error) {
            window.location.href = '/dashboard';
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextInput
                {...register('email')}
                type="email"
                label="Email"
                error={errors.email?.message}
            />
            <TextInput
                {...register('password')}
                type="password"
                label="Password"
                error={errors.password?.message}
            />
            <Button type="submit" loading={isSubmitting}>
                Sign In
            </Button>
        </form>
    );
}
```

## User Management

### Update User Profile

```typescript
// Server
await auth.api.updateUser({
    userId: 'user_123',
    data: {
        name: 'New Name',
        image: 'https://example.com/new-avatar.jpg',
    },
});

// Client
await authClient.updateUser({
    name: 'New Name',
    image: 'https://example.com/new-avatar.jpg',
});
```

### Change Password

```typescript
await authClient.changePassword({
    currentPassword: 'oldPassword',
    newPassword: 'newPassword123',
    revokeOtherSessions: true, // Sign out other sessions
});
```

### Change Email

```typescript
await authClient.changeEmail({
    newEmail: 'newemail@example.com',
    callbackURL: '/verify-email',
});
```

### Delete User

```typescript
// Server-side only
await auth.api.deleteUser({
    userId: 'user_123',
});
```

## Middleware Pattern

### Authentication Middleware (`app/middleware/auth.ts`)

```typescript
import type { Route } from '../routes/+types/authenticated';
import { getUser } from '~/lib/session.server';
import { redirect } from 'react-router';

export async function authMiddleware({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);

    if (!user) {
        const url = new URL(request.url);
        throw redirect(
            `/sign-in?redirectTo=${encodeURIComponent(url.pathname)}`,
        );
    }

    return { user };
}
```

### Context Provider (`app/middleware/context.ts`)

```typescript
import { createContext, useContext } from 'react';
import type { User } from '~/generated/prisma/client';

interface AuthenticatedContext {
    user: User;
}

const AuthenticatedContext = createContext<AuthenticatedContext | null>(null);

export function useAuthenticatedContext() {
    const context = useContext(AuthenticatedContext);
    if (!context) {
        throw new Error(
            'useAuthenticatedContext must be used within AuthenticatedLayout',
        );
    }
    return context;
}

export { AuthenticatedContext };
```

## Error Handling

### Common Errors

```typescript
// Email already exists
{
    status: 400,
    message: 'User with this email already exists'
}

// Invalid credentials
{
    status: 401,
    message: 'Invalid email or password'
}

// Session expired
{
    status: 401,
    message: 'Session expired'
}

// Rate limited
{
    status: 429,
    message: 'Too many requests'
}
```

### Error Handling Pattern

```typescript
const { data, error } = await authClient.signIn.email({
    email,
    password,
});

if (error) {
    switch (error.status) {
        case 401:
            // Invalid credentials
            setErrorMessage('Invalid email or password');
            break;
        case 429:
            // Rate limited
            setErrorMessage('Too many attempts. Please try again later.');
            break;
        default:
            setErrorMessage('An error occurred. Please try again.');
    }
    return;
}

// Success
window.location.href = data.callbackURL || '/dashboard';
```

## Rate Limiting

```typescript
export const auth = betterAuth({
    rateLimit: {
        enabled: true,
        window: 60, // Time window in seconds
        max: 10, // Max requests per window
        storage: 'memory', // or 'database'
    },
});
```

## CORS Configuration

```typescript
export const auth = betterAuth({
    advanced: {
        crossSubDomainCookies: {
            enabled: true,
            domain: '.yourdomain.com',
        },
        generateId: () => {
            // Custom ID generation
            return crypto.randomUUID();
        },
    },
});
```

## Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# BetterAuth
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:5173"

# Social Providers (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Testing

### Mock Authentication for Tests

```typescript
// test-utils.ts
export function mockUser() {
    return {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: new Date(),
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

export function mockSession(user = mockUser()) {
    return {
        user,
        session: {
            id: 'test-session-id',
            userId: user.id,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
            ipAddress: '127.0.0.1',
            userAgent: 'test-agent',
        },
    };
}
```

## Best Practices

1. **Always use session helpers** (`requireUser`, `getUser`) instead of direct auth calls
2. **Middleware for layouts** - Apply auth middleware to layout routes, not individual routes
3. **Client-side redirects** - Use `window.location.href` after successful auth (full page reload)
4. **Secure cookies** - Set `BETTER_AUTH_SECRET` to a strong random string (min 32 chars)
5. **HTTPS in production** - BetterAuth requires HTTPS for secure cookies in production
6. **Database indexes** - Add indexes on frequently queried fields (email, userId)
7. **Rate limiting** - Enable rate limiting to prevent brute force attacks
8. **Error messages** - Use generic messages like "Invalid email or password" (don't reveal which field is wrong)

## Troubleshooting

### Session Not Persisting

- Check `BETTER_AUTH_SECRET` is set and consistent across deployments
- Verify cookies are being sent (check browser DevTools)
- Ensure `BETTER_AUTH_URL` matches your domain

### Social Login Not Working

- Verify redirect URIs match in provider settings
- Check client ID and secret are correct
- Ensure callback route is registered in `app/routes.ts`

### Database Errors

- Run migrations: `npx prisma migrate dev`
- Regenerate client: `npx prisma generate`
- Check database connection string

### TypeScript Errors

- Run `npm run typecheck` to generate route types
- Ensure Prisma client is generated
- Restart TypeScript server in IDE

## Additional Resources

- [BetterAuth Documentation](https://www.better-auth.com/docs)
- [Plugin Directory](https://www.better-auth.com/docs/plugins)
- [API Reference](https://www.better-auth.com/docs/api-reference)
- Project files:
    - Server config: `app/lib/auth.server.ts`
    - Client config: `app/lib/auth-client.ts`
    - Session helpers: `app/lib/session.server.ts`
    - Middleware: `app/middleware/auth.ts`
    - Validation schemas: `app/lib/validations.ts`
- Related instructions:
    - `.github/instructions/react-router.instructions.md`
    - `.github/instructions/react-hook-form.instructions.md`
    - `.github/instructions/polar.instructions.md`
