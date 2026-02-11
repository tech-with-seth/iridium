---
applyTo: 'prisma/**/*,app/models/**/*.server.ts,app/db.server.ts'
---

# Prisma Instructions

## Custom Output Path

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../app/generated/prisma"
}
```

## Import Patterns

```typescript
// ✅ CORRECT
import { prisma } from '~/db.server';
import type { User, Post } from '~/generated/prisma/client';
import { Prisma } from '~/generated/prisma/client';

// ❌ WRONG
import { PrismaClient } from '@prisma/client';  // Wrong path
const prisma = new PrismaClient();               // Creates new connection
```

Always use the singleton from `~/db.server` — never create new instances.

## Migrations Workflow

```bash
npx prisma migrate dev --name description   # Create + apply migration (dev)
npx prisma migrate deploy                   # Apply migrations (production)
npx prisma generate                         # Regenerate client after schema changes
npx prisma studio                           # GUI at localhost:5555
npm run seed                                # Seed database (fresh DBs only)
```

**After schema changes:** migrate → generate → restart dev server → `npm run typecheck`.

## BetterAuth Required Models

User, Account, Session, Verification must exist. See `better-auth.instructions.md` for full schema.

## Schema Patterns

### Relationships

```prisma
// One-to-many
model User {
  id    String @id @default(cuid())
  posts Post[]
}
model Post {
  id       String @id @default(cuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
}

// Enums
enum Role {
  USER
  ADMIN
}
```

### Indexes

```prisma
model Post {
  id        String   @id @default(cuid())
  authorId  String
  createdAt DateTime @default(now())

  @@index([authorId])
  @@index([createdAt(sort: Desc)])
}
```

## Error Handling

```typescript
import { Prisma } from '~/generated/prisma/client';

try {
    await prisma.user.create({ data: { email, name } });
} catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') return data({ error: 'Email already exists' }, { status: 400 });
        if (error.code === 'P2025') throw new Response('Not Found', { status: 404 });
    }
    throw error;
}
```

Key codes: `P2002` (unique violation), `P2025` (not found), `P2003` (foreign key failed).

## Type Inference

```typescript
import { Prisma } from '~/generated/prisma/client';

type UserWithPosts = Prisma.UserGetPayload<{ include: { posts: true } }>;
type UserCreateInput = Prisma.UserCreateInput;
```

## Best Practices

1. Always use singleton from `~/db.server`
2. Import types from `~/generated/prisma/client` (not `@prisma/client`)
3. Use `include` or `select` to avoid N+1 queries
4. Add indexes for frequently queried fields
5. Use transactions for operations that must succeed/fail together
6. Handle P2002 and P2025 errors gracefully
7. Always create migrations for schema changes
8. Run `prisma generate` after schema changes

## Anti-Patterns

- ❌ Creating multiple Prisma client instances
- ❌ Importing from `@prisma/client` instead of `~/generated/prisma/client`
- ❌ N+1 queries (fetching relations in loops)
- ❌ Missing indexes on frequently queried fields
- ❌ Not handling unique constraint violations
- ❌ Forgetting `prisma generate` after schema changes

## Reference

- **Singleton:** `app/db.server.ts`
- **Schema:** `prisma/schema.prisma`
- **Seed:** `prisma/seed.ts`
- **Prisma Docs:** https://www.prisma.io/docs
