# Authentication

TWS Foundations uses [Better Auth](https://better-auth.com/) for authentication and session management, with the [Polar plugin](https://better-auth.com/docs/plugins/polar) for billing integration.

## Overview

Better Auth provides a flexible, type-safe authentication solution that works seamlessly with React Router 7. It handles user registration, login, session management, and integrates with external providers.

## Setup

### Server Configuration

The authentication server is configured in `app/lib/auth.server.ts`:

```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { polar } from '@polar-sh/better-auth';
import { db } from '~/db.server';

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        polar({
            // Polar configuration
        }),
    ],
});
```

### Client Configuration

The authentication client is configured in `app/lib/auth-client.ts` for browser-side operations:

```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
});
```

## Database Schema

Better Auth requires specific database tables. The schema is defined in your Prisma schema:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
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
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())

  @@unique([identifier, value])
}
```

## Authentication Patterns

### Protecting Routes

Use the authentication middleware to protect routes:

```typescript
import { Route } from './+types/home';
import { auth } from '~/lib/auth.server';

export async function loader({ request }: Route.LoaderArgs) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
        throw redirect('/login');
    }

    return { user: session.user };
}
```

### Getting the Current User

In server-side code (loaders, actions):

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const session = await auth.api.getSession({ headers: request.headers });

    return { user: session?.user ?? null };
}
```

In client-side code:

```typescript
import { authClient } from "~/lib/auth-client";

function MyComponent() {
  const { data: session } = authClient.useSession();

  return <div>Welcome, {session?.user.name}</div>;
}
```

### Sign Up

```typescript
import { authClient } from "~/lib/auth-client";

export default function SignUp() {
  async function handleSignUp(data: { email: string; password: string; name: string }) {
    await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleSignUp)}>
      {/* Form fields */}
    </form>
  );
}
```

### Sign In

```typescript
import { authClient } from "~/lib/auth-client";

export default function SignIn() {
  async function handleSignIn(data: { email: string; password: string }) {
    await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleSignIn)}>
      {/* Form fields */}
    </form>
  );
}
```

### Sign Out

```typescript
import { authClient } from "~/lib/auth-client";

function SignOutButton() {
  async function handleSignOut() {
    await authClient.signOut();
  }

  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

## Session Management

Better Auth automatically manages sessions using secure HTTP-only cookies. Sessions are:

- Automatically refreshed
- Securely stored with HTTP-only cookies
- Validated on each request
- Expired after inactivity

### Custom Session Data

You can extend session data by modifying the User model in your Prisma schema and updating the Better Auth configuration.

## Polar Integration

The Polar plugin adds billing and subscription capabilities:

```typescript
import { polar } from '@polar-sh/better-auth';

export const auth = betterAuth({
    plugins: [
        polar({
            // Polar configuration
        }),
    ],
});
```

This integration allows you to:

- Check subscription status
- Manage billing
- Handle webhook events
- Restrict features based on subscription tier

See the [Polar documentation](https://polar.sh/docs) for more details on billing integration.

## Environment Variables

Required environment variables:

```env
# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Polar (optional)
POLAR_ACCESS_TOKEN=your-polar-token
POLAR_ORGANIZATION_ID=your-org-id
```

## Testing Authentication

When writing tests, you can mock authentication:

```typescript
import { auth } from '~/lib/auth.server';

vi.mock('~/lib/auth.server', () => ({
    auth: {
        api: {
            getSession: vi.fn().mockResolvedValue({
                user: { id: 'test-user-id', email: 'test@example.com' },
            }),
        },
    },
}));
```

## Security Best Practices

1. **Never expose the Better Auth secret** - Keep `BETTER_AUTH_SECRET` secure
2. **Use HTTPS in production** - Required for secure cookies
3. **Validate user input** - Always validate before authentication operations
4. **Implement rate limiting** - Protect against brute force attacks
5. **Monitor failed login attempts** - Track and alert on suspicious activity

## Troubleshooting

### Session not persisting

Ensure cookies are configured correctly:

- HTTPS is enabled in production
- Cookie domain matches your application domain
- Browser is not blocking third-party cookies

### Authentication redirects not working

Check that:

- Your `BETTER_AUTH_URL` is correct
- Redirects use absolute URLs
- Session is being passed correctly in headers

## Further Reading

- [Better Auth Documentation](https://better-auth.com/docs)
- [Better Auth Remix Integration](https://better-auth.com/docs/integrations/remix) (compatible with React Router 7)
- [Polar Plugin Documentation](https://better-auth.com/docs/plugins/polar)
- [Architecture Decision: Better Auth](./decisions/002-better-auth.md)
