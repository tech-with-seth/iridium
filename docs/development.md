# Development Workflow

This guide covers day-to-day development practices for working on Iridium.

## Getting Started

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd tws-foundations

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

The seed script primes your local database with demo users and organizations. Run it when setting up a fresh database or after dropping data; routine development workflows usually do not need repeated seeding.

Visit `http://localhost:5173` to see your application.

## Development Commands

### Essential Commands

```bash
# Start development server
npm run dev

# Run type checking
npm run typecheck

# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run end-to-end tests
npm run e2e

# Build for production
npm run build

# Start production server
npm run start
```

### VS Code Tasks

If you prefer running commands via VS Code, open the command palette and choose **Run Task…**. The `.vscode/tasks.json` file exposes the npm scripts above plus:

- `prisma:*` helpers for schema work (`generate`, `migrate dev`, `studio`).
- `railway:migrate` and `railway:seed` which wrap `railway run -- bash -lc "cd /app && …"` to execute Prisma deploys or the seed script inside your Railway service.
- `railway:shell` to launch a subshell with the project’s Railway variables preloaded.

These tasks assume you have the Railway CLI linked to the correct project/service; add `--service`/`--environment` flags in the task definition if you need to target something else.

### Database Commands

```bash
# Create a new migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset database (caution!)
npx prisma migrate reset

# Seed database
npm run seed

# Open Prisma Studio
npx prisma studio
```

## Development Workflow

### Creating a New Feature

1. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

2. Make your changes

3. Write tests for your changes

4. Run tests and type checking:

```bash
npm run typecheck
npm run test:run
```

5. Commit your changes:

```bash
git add .
git commit -m "feat: add your feature"
```

6. Push and create pull request:

```bash
git push origin feature/your-feature
```

### Adding a New Route

1. Create route file in `app/routes/`:

```typescript
// app/routes/about.tsx
import { Route } from "./+types/about";

export async function loader({ request }: Route.LoaderArgs) {
  return { title: "About Us" };
}

export default function About({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>{loaderData.title}</h1>
      <p>Welcome to our about page.</p>
    </div>
  );
}
```

2. Register route in `app/routes.ts`:

```typescript
import { type RouteConfig, route } from '@react-router/dev/routes';

export default [
    // ... existing routes
    route('about', 'routes/about.tsx'),
] satisfies RouteConfig;
```

### Adding a New Component

1. Create component file:

```typescript
// app/components/greeting.tsx
type GreetingProps = {
  name: string;
};

export default function Greeting({ name }: GreetingProps) {
  return <div>Hello, {name}!</div>;
}
```

2. Create test file:

```typescript
// app/components/greeting.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Greeting from "./greeting";

describe("Greeting", () => {
  test("renders greeting message", () => {
    render(<Greeting name="World" />);
    expect(screen.getByText("Hello, World!")).toBeInTheDocument();
  });
});
```

3. Use in your routes:

```typescript
import Greeting from "~/components/greeting";

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Greeting name={loaderData.user.name} />;
}
```

### Working with the Database

#### Creating a Migration

1. Update your Prisma schema:

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. Create migration:

```bash
npx prisma migrate dev --name add-post-model
```

3. Prisma Client is automatically regenerated

#### Querying the Database

```typescript
import { db } from '~/db.server';

export async function getPosts() {
    return db.post.findMany({
        include: {
            author: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}

export async function getPost(id: string) {
    return db.post.findUnique({
        where: { id },
        include: {
            author: true,
        },
    });
}

export async function createPost(data: {
    title: string;
    content: string;
    authorId: string;
}) {
    return db.post.create({
        data,
    });
}
```

### Working with Forms

1. Create validation schema:

```typescript
import { z } from 'zod';

const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(10, 'Content must be at least 10 characters'),
});
```

2. Create form component:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function PostForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data) {
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title")} />
      {errors.title && <span>{errors.title.message}</span>}

      <textarea {...register("content")} />
      {errors.content && <span>{errors.content.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Adding Authentication

1. Protect a route:

```typescript
import { auth } from '~/lib/auth.server';
import { redirect } from 'react-router';

export async function loader({ request }: Route.LoaderArgs) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
        throw redirect('/login');
    }

    return { user: session.user };
}
```

2. Check user in component:

```typescript
import { authClient } from "~/lib/auth-client";

export default function Profile() {
  const { data: session } = authClient.useSession();

  if (!session) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

## Debugging

### Server-Side Debugging

Add console logs in loaders and actions:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    console.log('Request URL:', request.url);

    const data = await getData();
    console.log('Data:', data);

    return data;
}
```

### Client-Side Debugging

Use browser DevTools:

- Console for logs
- Network tab for requests
- React DevTools for component state

### Database Debugging

Use Prisma Studio:

```bash
npx prisma studio
```

Enable query logging in Prisma:

```typescript
const db = new PrismaClient({
    log: ['query', 'error', 'warn'],
});
```

## Hot Reload

React Router 7 supports hot module replacement. Changes to:

- Routes: Auto-reload
- Components: Hot reload
- Loaders/Actions: Auto-reload
- Styles: Hot reload

If hot reload is not working, restart the dev server.

## Environment Variables

### Development

Create `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
BETTER_AUTH_SECRET=development-secret
BETTER_AUTH_URL=http://localhost:5173
```

### Production

Set environment variables in your hosting platform.

### Accessing Variables

Server-side:

```typescript
const apiKey = process.env.API_KEY;
```

Client-side (must be prefixed with `VITE_`):

```typescript
const publicKey = import.meta.env.VITE_PUBLIC_KEY;
```

## Code Quality

### Type Checking

Run type checking before committing:

```bash
npm run typecheck
```

### Linting

Configure ESLint for consistent code style:

```bash
npx eslint app/
```

### Formatting

Use Prettier for code formatting:

```bash
npx prettier --write app/
```

## Performance Tips

### Optimize Loaders

Keep loaders fast:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    // Parallel requests
    const [user, posts] = await Promise.all([getUser(request), getPosts()]);

    return { user, posts };
}
```

### Database Optimization

Use database indexes:

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique

  @@index([email])
}
```

### Caching

Use flat-cache for server-side caching:

```typescript
import { cache } from '~/lib/cache';

export async function getExpensiveData() {
    const cached = cache.getKey('expensive-data');
    if (cached) return cached;

    const data = await fetchExpensiveData();
    cache.setKey('expensive-data', data);

    return data;
}
```

## Common Workflows

### Reset Development Database

```bash
npx prisma migrate reset
npm run seed
```

### Update Dependencies

```bash
npm update
npm run typecheck
npm run test:run
```

### Debug Production Build

```bash
npm run build
npm run start
```

## Troubleshooting

See the [Troubleshooting Guide](./troubleshooting.md) for common issues and solutions.

## Further Reading

- [React Router 7 Documentation](https://reactrouter.com/dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vitest Documentation](https://vitest.dev)
- [Testing Guide](./testing.md)
- [Contributing Guide](./contributing.md)
