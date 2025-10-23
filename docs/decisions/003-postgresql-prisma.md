# 003: PostgreSQL and Prisma

## Status

Accepted

## Context

We needed a database solution that provides:

- Relational data modeling for complex relationships
- Strong data consistency and ACID compliance
- Type-safe database access
- Migration management
- Good performance at scale
- Wide deployment options
- Active ecosystem

The database and ORM choices impact data integrity, development velocity, and application performance.

## Decision

We chose PostgreSQL as our database and Prisma as our ORM.

### PostgreSQL

Open-source relational database with:

- ACID compliance
- Advanced features (JSON, full-text search, etc.)
- Excellent performance
- Wide hosting support

### Prisma

Type-safe ORM with:

- Schema-first development
- Automatic TypeScript types
- Migration management
- Intuitive query API

## Consequences

### Positive

**Type Safety**:

```typescript
const user = await db.user.findUnique({
    where: { id: '123' },
    include: { posts: true },
});
// user is fully typed
```

**Schema as Source of Truth**:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  posts     Post[]
}
```

**Migration Management**: Automatic migration generation and tracking

**Great Developer Experience**: Auto-completion and type checking

**Performance**: Efficient queries with built-in optimizations

**Ecosystem**: Large community and extensive documentation

### Negative

**Learning Curve**: Prisma has specific patterns to learn

**Query Limitations**: Some complex queries require raw SQL

**Bundle Size**: Prisma Client adds to bundle size

**Database Lock-in**: Switching databases requires schema changes

### Neutral

**Migration Strategy**: Need process for production migrations

**Connection Pooling**: Requires configuration for serverless

**Schema Changes**: Must be careful with production migrations

## Alternatives Considered

### MongoDB + Mongoose

**Pros:**

- Flexible schema
- Easy to get started
- Horizontal scaling
- JSON-like documents

**Cons:**

- No joins (need to denormalize)
- Weaker data consistency
- Less suitable for relational data
- More complex queries for relationships

**Why not chosen:** Our data is inherently relational (users, sessions, posts, etc.). PostgreSQL better fits our data model.

### MySQL + Prisma

**Pros:**

- Similar to PostgreSQL
- Wide hosting support
- Good performance
- Prisma support

**Cons:**

- Less advanced features than PostgreSQL
- Weaker JSON support
- Less suitable for complex queries

**Why not chosen:** PostgreSQL offers more features and better performance for our use cases.

### SQLite + Prisma

**Pros:**

- Simple setup
- No separate server needed
- Good for development
- Fast for small datasets

**Cons:**

- Limited concurrency
- Not suitable for production at scale
- Fewer features
- Single-file limitations

**Why not chosen:** Not suitable for production workloads. We need a database that scales.

### Drizzle ORM

**Pros:**

- Lighter than Prisma
- SQL-like query builder
- Good TypeScript support
- Faster in some benchmarks

**Cons:**

- Less mature than Prisma
- Smaller community
- Less tooling
- Manual migration management

**Why not chosen:** Prisma offers better DX with schema-first approach and automatic migrations.

### TypeORM

**Pros:**

- Mature and stable
- Decorator-based models
- Active Record pattern
- Good documentation

**Cons:**

- Decorator syntax less modern
- Less type-safe than Prisma
- More boilerplate
- Complex configuration

**Why not chosen:** Prisma provides better type safety and simpler API.

### Kysely

**Pros:**

- Type-safe SQL query builder
- Zero runtime overhead
- Full SQL control
- Lightweight

**Cons:**

- More verbose than Prisma
- Manual schema management
- No automatic migrations
- Lower-level API

**Why not chosen:** More manual work required. Prisma abstracts complexity while maintaining type safety.

## Implementation Details

### Schema Definition

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../app/generated/prisma"
}

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
```

### Database Client

```typescript
// app/db.server.ts
import { PrismaClient } from '~/generated/prisma';

const db = new PrismaClient();

export { db };
```

### Query Examples

```typescript
// Find user with relations
const user = await db.user.findUnique({
  where: { id: userId },
  include: {
    sessions: true,
    posts: {
      orderBy: { createdAt: "desc" },
      take: 10,
    },
  },
});

// Create with relations
const post = await db.post.create({
  data: {
    title: "Hello World",
    content: "...",
    author: {
      connect: { id: userId },
    },
  },
});

// Transaction
await db.$transaction([
  db.user.update({ where: { id }, data: { ... } }),
  db.post.create({ data: { ... } }),
]);
```

### Migrations

```bash
# Create migration
npx prisma migrate dev --name add_posts

# Apply in production
npx prisma migrate deploy

# Reset (development only)
npx prisma migrate reset
```

## Performance Considerations

**Connection Pooling**: Configure for production:

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10"
```

**Indexes**: Add for frequently queried fields:

```prisma
model User {
  email String @unique

  @@index([email])
}
```

**Query Optimization**: Use `include` and `select` wisely to avoid over-fetching.

## Backup and Recovery

- Regular database backups
- Point-in-time recovery with PostgreSQL
- Migration history in version control
- Database dump scripts for disaster recovery

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with React Router](https://www.prisma.io/docs/guides/react-router-7)
- [Database Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
