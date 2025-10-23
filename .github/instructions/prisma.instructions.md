# Prisma Instructions

## Overview

Prisma is a next-generation ORM for Node.js and TypeScript that provides type-safe database access, automated migrations, and intuitive data modeling. This project uses Prisma with **PostgreSQL**, **React Router 7**, and **BetterAuth** integration with a custom output path for the generated Prisma client.

## Project Configuration

### Custom Prisma Client Output

This project uses a **non-default Prisma client output location**:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../app/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Why custom output?**

- Keeps generated files within `app/` directory for better React Router 7 integration
- Simplifies imports with `~/generated/prisma/client` alias
- Follows project architecture pattern for generated code

### Database Singleton Pattern

**CRITICAL:** Always use the singleton Prisma client instance to prevent connection pool exhaustion:

```typescript
// app/db.server.ts
import { PrismaClient } from '~/generated/prisma/client';

declare global {
    var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.__prisma = prisma;
}
```

**Import pattern:**

```typescript
import { prisma } from '~/db.server';
import type { User, Post } from '~/generated/prisma/client';
```

**Anti-patterns:**

- ❌ `import { PrismaClient } from '@prisma/client'` (wrong path)
- ❌ `const prisma = new PrismaClient()` (creates new connection)
- ❌ Direct Prisma imports in components or routes

## React Router 7 Integration

### Data Loading with Loaders

Loaders are async functions that fetch data on the server before rendering:

```typescript
// app/routes/posts.tsx
import type { Route } from './+types/posts';
import { prisma } from '~/db.server';

export async function loader({ request }: Route.LoaderArgs) {
    const posts = await prisma.post.findMany({
        include: {
            author: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return { posts };
}

export default function Posts({ loaderData }: Route.ComponentProps) {
    const { posts } = loaderData;

    return (
        <div>
            {posts.map(post => (
                <article key={post.id}>
                    <h2>{post.title}</h2>
                    <p>{post.content}</p>
                    <span>By {post.author.name}</span>
                </article>
            ))}
        </div>
    );
}
```

### Dynamic Routes with Params

```typescript
// app/routes/posts/:postId.tsx
import type { Route } from './+types/posts.$postId';
import { prisma } from '~/db.server';

export async function loader({ params }: Route.LoaderArgs) {
    const post = await prisma.post.findUnique({
        where: { id: params.postId },
        include: {
            author: true,
            comments: {
                include: { author: true },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!post) {
        throw new Response('Not Found', { status: 404 });
    }

    return { post };
}

export default function PostDetail({ loaderData }: Route.ComponentProps) {
    const { post } = loaderData;

    return (
        <article>
            <h1>{post.title}</h1>
            <p>{post.content}</p>
            <div>
                <h3>Comments</h3>
                {post.comments.map(comment => (
                    <div key={comment.id}>
                        <p>{comment.content}</p>
                        <span>— {comment.author.name}</span>
                    </div>
                ))}
            </div>
        </article>
    );
}
```

### Data Mutations with Actions

Actions handle form submissions and data mutations:

```typescript
// app/routes/posts/new.tsx
import type { Route } from './+types/new';
import { prisma } from '~/db.server';
import { redirect } from 'react-router';
import { requireUser } from '~/lib/session.server';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const formData = await request.formData();

    const post = await prisma.post.create({
        data: {
            title: formData.get('title') as string,
            content: formData.get('content') as string,
            authorId: user.id
        }
    });

    throw redirect(`/posts/${post.id}`);
}

export default function NewPost() {
    return (
        <form method="post">
            <input type="text" name="title" placeholder="Title" required />
            <textarea name="content" placeholder="Content" required />
            <button type="submit">Create Post</button>
        </form>
    );
}
```

### Multiple HTTP Methods in Actions

```typescript
// app/routes/api/posts/:postId.ts
import type { Route } from './+types/posts.$postId';
import { prisma } from '~/db.server';
import { data } from 'react-router';
import { requireUser } from '~/lib/session.server';

export async function loader({ params }: Route.LoaderArgs) {
    const post = await prisma.post.findUnique({
        where: { id: params.postId },
    });

    return data({ post });
}

export async function action({ request, params }: Route.ActionArgs) {
    const user = await requireUser(request);

    if (request.method === 'PUT') {
        const body = await request.json();
        const post = await prisma.post.update({
            where: { id: params.postId },
            data: {
                title: body.title,
                content: body.content,
            },
        });
        return data({ post });
    }

    if (request.method === 'DELETE') {
        await prisma.post.delete({
            where: { id: params.postId },
        });
        return data({ success: true });
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
```

## Schema Design

### Required Models for BetterAuth

See `.github/instructions/better-auth.instructions.md` for complete BetterAuth schema requirements. Essential models:

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
  verifications Verification[]
  posts         Post[]
}

model Account {
  id           String    @id @default(cuid())
  userId       String
  accountId    String
  providerId   String
  accessToken  String?
  refreshToken String?
  idToken      String?
  expiresAt    DateTime?
  password     String?

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

  user User? @relation(fields: [userId], references: [id])
  userId String?

  @@unique([identifier, value])
}
```

### Common Schema Patterns

#### One-to-Many Relationships

```prisma
model User {
  id    String @id @default(cuid())
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  title    String
  content  String
  authorId String

  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

#### Many-to-Many Relationships

```prisma
model Post {
  id         String        @id @default(cuid())
  title      String
  categories CategoryPost[]
}

model Category {
  id    String        @id @default(cuid())
  name  String        @unique
  posts CategoryPost[]
}

model CategoryPost {
  post       Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId     String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId String
  assignedAt DateTime @default(now())

  @@id([postId, categoryId])
}
```

#### Enums

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  id   String @id @default(cuid())
  role Role   @default(USER)
}
```

#### Indexes for Performance

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  authorId  String
  createdAt DateTime @default(now())

  author User @relation(fields: [authorId], references: [id])

  // Single-column indexes
  @@index([authorId])
  @@index([createdAt])

  // Composite index for common queries
  @@index([published, createdAt(sort: Desc)])
}
```

## Database Operations

### Migrations Workflow

```bash
# Create a new migration (development)
npx prisma migrate dev --name add_post_model

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Generate Prisma Client after schema changes
npx prisma generate
```

**After schema changes:**

1. Create migration: `npx prisma migrate dev --name description`
2. Restart dev server (to pick up new Prisma client)
3. Run `npm run typecheck` to update TypeScript types

### Prisma Studio

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio
```

Access at `http://localhost:5555` to view and edit data visually.

### Seeding Database

```typescript
// prisma/seed.ts
import { PrismaClient } from '../app/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            posts: {
                create: [
                    {
                        title: 'First Post',
                        content: 'This is the first post',
                    },
                    {
                        title: 'Second Post',
                        content: 'This is the second post',
                    },
                ],
            },
        },
    });

    console.log({ user });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
```

**package.json:**

```json
{
    "scripts": {
        "seed": "tsx prisma/seed.ts"
    }
}
```

**Run seeding:**

```bash
npm run seed
```

## Query Patterns

### CRUD Operations

#### Create

```typescript
// Create single record
const user = await prisma.user.create({
    data: {
        email: 'user@example.com',
        name: 'John Doe',
    },
});

// Create with nested relations
const post = await prisma.post.create({
    data: {
        title: 'Hello World',
        content: 'This is my first post',
        author: {
            connect: { id: userId },
        },
    },
});

// Create many
await prisma.post.createMany({
    data: [
        { title: 'Post 1', content: 'Content 1', authorId: userId },
        { title: 'Post 2', content: 'Content 2', authorId: userId },
    ],
});
```

#### Read

```typescript
// Find unique
const user = await prisma.user.findUnique({
    where: { id: userId },
});

// Find unique or throw
const user = await prisma.user.findUniqueOrThrow({
    where: { email: 'user@example.com' },
});

// Find first matching
const post = await prisma.post.findFirst({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
});

// Find many with filters
const posts = await prisma.post.findMany({
    where: {
        published: true,
        author: {
            email: { contains: '@example.com' },
        },
    },
    include: {
        author: true,
        comments: true,
    },
    orderBy: {
        createdAt: 'desc',
    },
    take: 10,
    skip: 0,
});
```

#### Update

```typescript
// Update single
const user = await prisma.user.update({
    where: { id: userId },
    data: {
        name: 'New Name',
    },
});

// Update many
await prisma.post.updateMany({
    where: { authorId: userId },
    data: { published: false },
});

// Upsert (update or create)
const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: { name: 'Updated Name' },
    create: {
        email: 'user@example.com',
        name: 'New User',
    },
});
```

#### Delete

```typescript
// Delete single
await prisma.user.delete({
    where: { id: userId },
});

// Delete many
await prisma.post.deleteMany({
    where: { authorId: userId },
});
```

### Advanced Queries

#### Filtering

```typescript
// String filters
const users = await prisma.user.findMany({
    where: {
        email: { contains: '@example.com' },
        name: { startsWith: 'John' },
    },
});

// Number filters
const posts = await prisma.post.findMany({
    where: {
        views: { gte: 100 },
        likes: { lte: 50 },
    },
});

// Date filters
const recentPosts = await prisma.post.findMany({
    where: {
        createdAt: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-12-31'),
        },
    },
});

// Boolean logic
const posts = await prisma.post.findMany({
    where: {
        OR: [{ published: true }, { authorId: userId }],
        NOT: {
            status: 'DELETED',
        },
    },
});
```

#### Relations

```typescript
// Include related data
const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
        posts: true,
        comments: true,
    },
});

// Select specific fields
const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
        id: true,
        email: true,
        posts: {
            select: {
                id: true,
                title: true,
            },
        },
    },
});

// Nested includes
const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
        author: {
            include: {
                profile: true,
            },
        },
        comments: {
            include: {
                author: true,
            },
        },
    },
});
```

#### Aggregation

```typescript
// Count
const postCount = await prisma.post.count({
    where: { published: true },
});

// Aggregate
const stats = await prisma.post.aggregate({
    where: { published: true },
    _count: true,
    _avg: { views: true },
    _sum: { likes: true },
    _max: { createdAt: true },
});

// Group by
const userStats = await prisma.post.groupBy({
    by: ['authorId'],
    _count: true,
    _avg: { views: true },
});
```

#### Pagination

```typescript
// Offset-based pagination
export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 10;

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.post.count(),
    ]);

    return {
        posts,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        },
    };
}
```

#### Cursor-based Pagination

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const pageSize = 10;

    const posts = await prisma.post.findMany({
        take: pageSize,
        ...(cursor && {
            skip: 1,
            cursor: { id: cursor },
        }),
        orderBy: { createdAt: 'desc' },
    });

    return {
        posts,
        nextCursor: posts[posts.length - 1]?.id,
    };
}
```

### Transactions

```typescript
// Sequential operations in transaction
const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
        data: {
            email: 'user@example.com',
            name: 'John Doe',
        },
    });

    const post = await tx.post.create({
        data: {
            title: 'First Post',
            content: 'Hello World',
            authorId: user.id,
        },
    });

    return { user, post };
});

// Batch transactions
await prisma.$transaction([
    prisma.user.create({
        data: { email: 'user1@example.com', name: 'User 1' },
    }),
    prisma.user.create({
        data: { email: 'user2@example.com', name: 'User 2' },
    }),
    prisma.user.create({
        data: { email: 'user3@example.com', name: 'User 3' },
    }),
]);
```

### Raw Queries

```typescript
// Raw SQL query
const users = await prisma.$queryRaw`
    SELECT * FROM "User"
    WHERE "email" LIKE ${`%@example.com`}
`;

// Execute raw SQL (for mutations)
await prisma.$executeRaw`
    UPDATE "Post"
    SET "views" = "views" + 1
    WHERE "id" = ${postId}
`;

// Type-safe raw queries
import { Prisma } from '~/generated/prisma/client';

const users = await prisma.$queryRaw<User[]>`
    SELECT * FROM "User"
`;
```

## Performance Optimization

### Connection Pooling

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // For dev environments
}
```

**Database URL with pool settings:**

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?connection_limit=10&pool_timeout=20"
```

### Query Optimization

```typescript
// ❌ N+1 query problem
const users = await prisma.user.findMany();
for (const user of users) {
    const posts = await prisma.post.findMany({
        where: { authorId: user.id },
    });
}

// ✅ Use include to fetch related data
const users = await prisma.user.findMany({
    include: { posts: true },
});
```

### Indexes

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  authorId  String
  createdAt DateTime @default(now())

  @@index([authorId])
  @@index([createdAt(sort: Desc)])
  @@index([authorId, createdAt(sort: Desc)])
}
```

### Caching

```typescript
import { getCachedData, setCachedData, isCacheExpired } from '~/lib/cache';

export async function loader({ request }: Route.LoaderArgs) {
    const cacheKey = 'posts:recent';

    if (!isCacheExpired(cacheKey)) {
        const cached = getCachedData<Post[]>(cacheKey);
        if (cached) return { posts: cached };
    }

    const posts = await prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
    });

    setCachedData(cacheKey, posts, 60 * 5); // Cache for 5 minutes

    return { posts };
}
```

## Edge Runtime Considerations

Prisma Client doesn't work on edge runtimes (Cloudflare Workers, Vercel Edge). Use **Prisma Accelerate** for edge support:

```bash
npm install @prisma/extension-accelerate
```

```typescript
import { PrismaClient } from '~/generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

// Use as normal
const posts = await prisma.post.findMany({
    cacheStrategy: { ttl: 60, swr: 300 }, // Cache for 60s, stale-while-revalidate for 300s
});
```

**Configuration:**

```bash
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
```

## Error Handling

### Common Errors

```typescript
import { Prisma } from '~/generated/prisma/client';

try {
    await prisma.user.create({
        data: { email: 'duplicate@example.com', name: 'User' },
    });
} catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === 'P2002') {
            return data({ error: 'Email already exists' }, { status: 400 });
        }

        // Record not found
        if (error.code === 'P2025') {
            throw new Response('Not Found', { status: 404 });
        }
    }

    throw error;
}
```

### Error Codes

- `P2002`: Unique constraint violation
- `P2025`: Record not found
- `P2003`: Foreign key constraint failed
- `P2016`: Query interpretation error
- See full list: https://www.prisma.io/docs/reference/api-reference/error-reference

## Type Safety

### Inferring Types

```typescript
import { Prisma } from '~/generated/prisma/client';

// Infer type from model
type UserWithPosts = Prisma.UserGetPayload<{
    include: { posts: true };
}>;

// Infer create input type
type UserCreateInput = Prisma.UserCreateInput;

// Infer where input type
type UserWhereInput = Prisma.UserWhereInput;
```

### Custom Types

```typescript
import type { User, Post } from '~/generated/prisma/client';

// Extend model types
interface UserWithStats extends User {
    postCount: number;
    totalViews: number;
}

export async function loader({ request }: Route.LoaderArgs) {
    const users = await prisma.user.findMany();

    const usersWithStats: UserWithStats[] = await Promise.all(
        users.map(async (user) => {
            const posts = await prisma.post.findMany({
                where: { authorId: user.id },
            });

            return {
                ...user,
                postCount: posts.length,
                totalViews: posts.reduce((sum, post) => sum + post.views, 0),
            };
        }),
    );

    return { users: usersWithStats };
}
```

## Testing

### Mock Prisma Client

```typescript
// test/mocks/prisma.ts
import { PrismaClient } from '~/generated/prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export type MockPrisma = DeepMockProxy<PrismaClient>;

export const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
    mockReset(prismaMock);
});
```

### Test Example

```typescript
import { prismaMock } from './test/mocks/prisma';

test('should create user', async () => {
    const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    prismaMock.user.create.mockResolvedValue(user);

    const result = await prisma.user.create({
        data: { email: user.email, name: user.name },
    });

    expect(result).toEqual(user);
});
```

## Environment Variables

```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Shadow database for migrations (dev only)
SHADOW_DATABASE_URL="postgresql://user:password@localhost:5432/dbname_shadow"

# Direct URL (for connection pooling services)
DIRECT_URL="postgresql://user:password@localhost:5432/dbname"
```

## Best Practices

1. **Always use singleton** - Import from `~/db.server`, never create new instances
2. **Custom output path** - Remember Prisma client outputs to `app/generated/prisma`
3. **Type safety** - Use Prisma-generated types for all database operations
4. **Migrations** - Always create migrations for schema changes, never edit schema directly in production
5. **Transactions** - Use transactions for operations that must succeed or fail together
6. **Indexes** - Add indexes for frequently queried fields
7. **Avoid N+1** - Use `include` or `select` to fetch related data in single query
8. **Error handling** - Handle Prisma errors gracefully with proper error codes
9. **Seeding** - Use seed scripts for initial data and development
10. **Connection limits** - Configure appropriate connection pool size for your deployment

## Anti-Patterns

- ❌ Creating multiple Prisma client instances
- ❌ Importing from `@prisma/client` instead of `~/generated/prisma/client`
- ❌ N+1 queries (fetching relations in loops)
- ❌ Not using transactions for related operations
- ❌ Missing indexes on frequently queried fields
- ❌ Exposing sensitive data (use `select` to limit fields)
- ❌ Not handling unique constraint violations
- ❌ Forgetting to run `prisma generate` after schema changes

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [React Router 7 Guide](https://www.prisma.io/docs/guides/react-router-7)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- Project files:
    - Database singleton: `app/db.server.ts`
    - Schema: `prisma/schema.prisma`
    - Seed script: `prisma/seed.ts`
- Related instructions:
    - `.github/instructions/react-router.instructions.md`
    - `.github/instructions/better-auth.instructions.md`
