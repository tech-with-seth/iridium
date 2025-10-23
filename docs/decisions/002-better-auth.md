# 002: Better Auth

## Status

Accepted

## Context

We needed a robust authentication solution that:

- Works seamlessly with React Router 7
- Provides type-safe APIs
- Supports email/password authentication
- Handles session management securely
- Integrates with our PostgreSQL database
- Supports plugins for billing integration
- Offers good developer experience

Traditional solutions like Passport.js or custom implementations require significant boilerplate and maintenance. Modern alternatives like NextAuth.js are framework-specific.

## Decision

We chose Better Auth as our authentication solution.

### Key Features

**Type-Safe API**: Fully typed client and server APIs:

```typescript
const session = await auth.api.getSession({ headers: request.headers });
```

**Database Integration**: Native Prisma adapter:

```typescript
export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: 'postgresql',
    }),
});
```

**Plugin System**: Extensible architecture for additional features:

```typescript
plugins: [
    polar({
        // Billing integration
    }),
];
```

**React Integration**: Built-in React hooks:

```typescript
const { data: session } = authClient.useSession();
```

## Consequences

### Positive

- **Type Safety**: Full TypeScript support across client and server
- **Simple API**: Clean, intuitive authentication methods
- **Secure Defaults**: HTTP-only cookies, secure session management
- **Prisma Integration**: Works with our existing database setup
- **Plugin Ecosystem**: Easy to extend functionality
- **React Router Compatible**: Works seamlessly with loaders and actions
- **Active Development**: Regular updates and improvements
- **Good Documentation**: Clear guides and examples

### Negative

- **Newer Library**: Smaller community than established solutions
- **Limited OAuth Providers**: Fewer providers than NextAuth.js
- **Documentation Gaps**: Some advanced scenarios lack examples
- **Migration Path**: Custom migration needed from other auth systems

### Neutral

- **Database Tables**: Requires specific schema (User, Session, Account, Verification)
- **Plugin Dependency**: Billing features require Better Auth plugins
- **Configuration**: Needs careful setup for production

## Alternatives Considered

### NextAuth.js (Auth.js)

**Pros:**

- Large community and ecosystem
- Many OAuth providers
- Extensive documentation
- Battle-tested in production

**Cons:**

- Primarily Next.js focused
- Complex adapter system
- Less type-safe than Better Auth
- Heavier dependencies

**Why not chosen:** Framework-specific to Next.js with less clean integration for React Router 7. Better Auth offers better type safety.

### Passport.js

**Pros:**

- Mature and stable
- Large ecosystem of strategies
- Framework agnostic
- Well documented

**Cons:**

- Callback-based API
- Requires significant boilerplate
- No TypeScript-first design
- Manual session management
- No modern React integration

**Why not chosen:** Outdated API patterns and extensive boilerplate. Better Auth provides modern, type-safe alternatives.

### Clerk

**Pros:**

- Complete authentication UI
- Great developer experience
- Managed service
- Built-in user management

**Cons:**

- Third-party service (vendor lock-in)
- Costs money at scale
- Less control over data
- Cannot self-host
- External dependency

**Why not chosen:** Vendor lock-in and cost concerns. We want full control over authentication data.

### Custom Implementation

**Pros:**

- Complete control
- No external dependencies
- Tailored to exact needs

**Cons:**

- Time-consuming to build
- Security risks if done wrong
- Maintenance burden
- Need to handle edge cases
- Reinventing the wheel

**Why not chosen:** Significant development time and security risks. Better Auth provides battle-tested solution.

### Lucia

**Pros:**

- Lightweight
- Framework agnostic
- Type-safe
- Good documentation

**Cons:**

- More manual setup
- Less integrated with React
- Smaller community
- Fewer built-in features

**Why not chosen:** Better Auth offers more complete solution with React integration and plugin system.

## Implementation Details

### Server Configuration

```typescript
// app/lib/auth.server.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { db } from '~/db.server';

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
    },
});
```

### Client Configuration

```typescript
// app/lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
});
```

### Route Protection

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
        throw redirect('/login');
    }

    return { user: session.user };
}
```

## Security Considerations

- HTTP-only cookies prevent XSS attacks
- Secure session management with automatic expiration
- Password hashing with bcrypt
- CSRF protection built-in
- Regular security updates from maintainers

## Migration Path

If we need to migrate away:

1. Export user data from database
2. Implement new authentication provider
3. Migrate sessions gradually
4. Maintain backward compatibility during transition

## References

- [Better Auth Documentation](https://better-auth.com/docs)
- [Better Auth Remix Integration](https://better-auth.com/docs/integrations/remix)
- [Polar Plugin Documentation](https://better-auth.com/docs/plugins/polar)
- [Authentication Guide](../authentication.md)
