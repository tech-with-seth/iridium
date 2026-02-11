---
applyTo: 'app/lib/auth*.ts,app/lib/session*.ts,app/routes/api/auth/**/*'
---

# BetterAuth Instructions

BetterAuth with **Prisma adapter**, **PostgreSQL**, and **React Router 7** integration.

## Server Setup (`app/lib/auth.server.ts`)

```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '~/db.server';

export const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        requireEmailVerification: false,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24,       // 1 day
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    plugins: [/* admin(), polar() */],
});
```

## Client Setup (`app/lib/auth-client.ts`)

```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5173',
});
```

## Session Helpers (`app/lib/session.server.ts`)

```typescript
export async function getUserFromSession(request: Request) {
    const session = await auth.api.getSession({ headers: request.headers });
    return session?.user ?? null;
}

export async function requireUser(request: Request) {
    const user = await getUserFromSession(request);
    if (!user) throw redirect('/sign-in');
    return user;
}

export async function requireAnonymous(request: Request) {
    const user = await getUserFromSession(request);
    if (user) throw redirect('/dashboard');
}
```

## API Route Handler

All BetterAuth endpoints via catch-all route:

```typescript
// app/routes/api/auth/better-auth.ts
export async function loader({ request }: Route.LoaderArgs) {
    return auth.handler(request);
}
export async function action({ request }: Route.ActionArgs) {
    return auth.handler(request);
}
```

Register in `routes.ts`: `route('auth/*', 'routes/api/auth/better-auth.ts')`

## Protected Routes (Middleware)

```typescript
// app/routes/authenticated.tsx
import { authMiddleware } from '~/middleware/auth';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export default function AuthenticatedLayout({ loaderData }: Route.ComponentProps) {
    return <Outlet />;
}
```

Child routes access user via `useAuthenticatedContext()` hook.

## Authentication Methods

### Email & Password

```typescript
// Sign up
const { error } = await authClient.signUp.email({
    email, password, name,
    callbackURL: '/dashboard',
});

// Sign in
const { error } = await authClient.signIn.email({
    email, password,
    callbackURL: '/dashboard',
});

// Sign out
await authClient.signOut({
    fetchOptions: { onSuccess: () => { window.location.href = '/'; } },
});

// Password reset
await authClient.forgetPassword({ email, redirectTo: '/reset-password' });
await authClient.resetPassword({ newPassword });
```

### Social Providers

```typescript
await authClient.signIn.social({ provider: 'github', callbackURL: '/dashboard' });
await authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' });
```

Use `window.location.href` after auth success (full page reload ensures session cookie is set).

## Required Prisma Models

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id           String   @id @default(cuid())
  userId       String
  accountId    String
  providerId   String
  accessToken  String?
  refreshToken String?
  idToken      String?
  expiresAt    DateTime?
  password     String?
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([providerId, accountId])
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  @@unique([identifier, value])
}
```

## Plugins

- **Admin**: `admin()` — user management, ban/unban, impersonation. Set `user.role = 'admin'` in DB.
- **Polar**: See `polar.instructions.md` for billing integration.
- **2FA, Username, Email OTP, Organization, Passkey**: See [BetterAuth plugin docs](https://www.better-auth.com/docs/plugins).

## Error Handling

```typescript
const { data, error } = await authClient.signIn.email({ email, password });
if (error) {
    if (error.status === 401) setError('Invalid email or password');
    else if (error.status === 429) setError('Too many attempts');
    else setError('An error occurred');
    return;
}
```

Always use generic messages — don't reveal which field is wrong.

## Environment Variables

```bash
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"  # Required
BETTER_AUTH_URL="http://localhost:5173"              # Required
GITHUB_CLIENT_ID="..."                              # Optional
GITHUB_CLIENT_SECRET="..."                          # Optional
GOOGLE_CLIENT_ID="..."                              # Optional
GOOGLE_CLIENT_SECRET="..."                          # Optional
```

## Best Practices

1. Use session helpers (`requireUser`, `getUserFromSession`) — not direct auth API calls
2. Apply auth via middleware in layout routes, not individual routes
3. Use `window.location.href` after auth success (full page reload)
4. Set `BETTER_AUTH_SECRET` to a strong random string (min 32 chars)
5. Use generic error messages ("Invalid email or password")
6. Enable rate limiting in production

## Troubleshooting

- **Session not persisting** → Check `BETTER_AUTH_SECRET` is set and consistent
- **Social login failing** → Verify redirect URIs match provider settings
- **Database errors** → Run `npx prisma migrate dev` then `npx prisma generate`

## Reference

- **Server:** `app/lib/auth.server.ts`
- **Client:** `app/lib/auth-client.ts`
- **Session:** `app/lib/session.server.ts`
- **Middleware:** `app/middleware/auth.ts`
- **Docs:** https://www.better-auth.com/docs
