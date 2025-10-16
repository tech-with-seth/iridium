# Model Layer Pattern (Data Access Layer)

**Status**: Accepted

**Date**: 2025-01-15

## Context

In a typical React Router 7 (or Remix) application, developers often call Prisma directly in route loaders and actions. While this works, it creates several issues:
- Database logic scattered across route files
- Difficult to test business logic
- Hard to reuse database queries
- Tight coupling between routes and database schema
- No single place to understand data access patterns

Options considered:
- Direct Prisma calls in routes
- Repository pattern (class-based)
- Service layer (business logic + data access)
- Model functions (lightweight data access layer)

## Decision

Implement a **Model Layer Pattern** where all database operations are abstracted into model functions in `app/models/[entity].server.ts`.

Rules:
1. **NEVER** import `prisma` directly in route files
2. All database operations go through model functions
3. Model functions are simple, focused, and composable
4. Routes call model functions, never Prisma directly

Example structure:
```typescript
// app/models/user.server.ts
import { prisma } from '~/db.server';

export function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true }
  });
}

// app/routes/profile.tsx
import { getUserProfile } from '~/models/user.server';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const profile = await getUserProfile(user.id);
  return json({ profile });
}
```

## Consequences

### Positive

- **Testability**: Model functions can be tested in isolation
- **Reusability**: Database queries reused across multiple routes
- **Single Source of Truth**: One place to see all database operations for an entity
- **Type Safety**: Model functions provide additional type safety layer
- **Refactoring**: Easy to change database queries without touching routes
- **Performance**: Can optimize queries in one place
- **Documentation**: Model file serves as documentation for data access

### Negative

- **Extra Files**: More files to maintain (one per entity)
- **Indirection**: One more layer between routes and database
- **Learning Curve**: Team must learn and follow pattern
- **Boilerplate**: Simple CRUD operations require extra code

### Neutral

- **Not ORM Agnostic**: Still tightly coupled to Prisma (but that's okay)
- **Function-Based**: Uses functions instead of classes (simpler but less structured)
- **No Business Logic**: Model layer is purely data access, not business logic
