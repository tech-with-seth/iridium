---
applyTo: 'app/routes/api/**/*.ts'
---

# API Endpoint Creation in React Router 7

## Overview

This guide covers the **canonical pattern for creating API endpoints** in React Router 7. API endpoints are server-only routes that return JSON responses and handle programmatic data operations.

## When to Create API Endpoints

### ✅ Use API Endpoints For:

- **CRUD operations** that can be called from multiple places in the UI
- **Programmatic data access** (called via `useFetcher()` or `fetch()`)
- **Third-party integrations** or webhooks
- **Mobile app backends** or external API consumers
- **Background operations** triggered by client-side logic
- **Reusable data operations** that don't need SSR

### ❌ Don't Use API Endpoints For:

- **Initial page data** - Use route `loader()` functions instead
- **Form submissions** - Use route `action()` functions with `useFetcher()` unless you need the API pattern
- **Server-rendered pages** - Use regular routes with loaders and components

### API vs Route Pattern Comparison

| Feature            | API Endpoint             | Regular Route        |
| ------------------ | ------------------------ | -------------------- |
| **Returns**        | JSON data only           | HTML (JSX component) |
| **SSR**            | No                       | Yes                  |
| **Has component**  | No (resource route)      | Yes                  |
| **Authentication** | Manual (`requireUser()`) | Middleware or manual |
| **Best for**       | Programmatic access      | User-facing pages    |

## Architecture Pattern

```
app/routes/api/[feature].ts          # API Endpoint (Resource Route)
  ↳ loader()  - GET    (Read)
  ↳ action()  - POST   (Create)
                PUT    (Update)
                PATCH  (Partial update)
                DELETE (Delete)

app/models/[entity].server.ts        # Model Layer (Database)
  ↳ Database operations (Prisma)
  ↳ Business logic functions
  ↳ Data validation

app/lib/validations.ts                # Validation Schemas (Zod)
  ↳ Shared validation rules
  ↳ Type inference
```

## Creating an API Endpoint

### Step 1: Register the API Route

**Location:** `app/routes.ts`

All API endpoints must be registered under the `api` prefix:

```typescript
import { type RouteConfig, route, prefix } from '@react-router/dev/routes';

export default [
    // ... other routes
    ...prefix('api', [
        // Simple endpoint
        route('posts', 'routes/api/posts.ts'),

        // With parameters
        route('posts/:id', 'routes/api/posts.$id.ts'),

        // Nested resources
        route('posts/:postId/comments', 'routes/api/comments.ts'),
        route('posts/:postId/comments/:id', 'routes/api/comments.$id.ts'),
    ]),
] satisfies RouteConfig;
```

**After adding routes, run `npm run typecheck` to generate types.**

### Step 2: Define Validation Schema

**Location:** `app/lib/validations.ts`

Always define Zod schemas for request validation:

```typescript
import { z } from 'zod';

export const createPostSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: z.string().min(10, 'Content must be at least 10 characters'),
    published: z.boolean().default(false),
    tags: z.array(z.string()).max(5, 'Maximum 5 tags').optional(),
});

export type CreatePostData = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title too long')
        .optional(),
    content: z
        .string()
        .min(10, 'Content must be at least 10 characters')
        .optional(),
    published: z.boolean().optional(),
    tags: z.array(z.string()).max(5, 'Maximum 5 tags').optional(),
});

export type UpdatePostData = z.infer<typeof updatePostSchema>;
```

### Step 3: Create Model Functions

**Location:** `app/models/post.server.ts`

**NEVER call Prisma directly in route files.** Always create model functions:

```typescript
import { prisma } from '~/db.server';
import type { Post } from '~/generated/prisma/client';

export function getPost(id: string) {
    return prisma.post.findUnique({
        where: { id },
        include: {
            author: {
                select: { id: true, name: true, email: true },
            },
            tags: true,
        },
    });
}

export function getPosts({
    userId,
    published,
    limit = 20,
    offset = 0,
}: {
    userId?: string;
    published?: boolean;
    limit?: number;
    offset?: number;
}) {
    return prisma.post.findMany({
        where: {
            ...(userId && { authorId: userId }),
            ...(published !== undefined && { published }),
        },
        include: {
            author: {
                select: { id: true, name: true },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
    });
}

export function createPost({
    data,
    authorId,
}: {
    data: {
        title: string;
        content: string;
        published: boolean;
        tags?: string[];
    };
    authorId: string;
}) {
    return prisma.post.create({
        data: {
            ...data,
            authorId,
            tags: data.tags
                ? {
                      create: data.tags.map((name) => ({ name })),
                  }
                : undefined,
        },
        include: {
            author: {
                select: { id: true, name: true },
            },
            tags: true,
        },
    });
}

export function updatePost({
    id,
    data,
}: {
    id: string;
    data: {
        title?: string;
        content?: string;
        published?: boolean;
        tags?: string[];
    };
}) {
    return prisma.post.update({
        where: { id },
        data: {
            ...data,
            tags: data.tags
                ? {
                      deleteMany: {},
                      create: data.tags.map((name) => ({ name })),
                  }
                : undefined,
        },
        include: {
            author: {
                select: { id: true, name: true },
            },
            tags: true,
        },
    });
}

export function deletePost(id: string) {
    return prisma.post.delete({
        where: { id },
    });
}

export async function getPostCount(where?: {
    userId?: string;
    published?: boolean;
}) {
    return prisma.post.count({ where });
}
```

### Step 4: Create the API Endpoint

**Location:** `app/routes/api/posts.ts`

This is a **resource route** (no component, only loader and/or action):

```typescript
import type { Route } from './+types/posts';
import { data } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { getValidatedFormData } from '~/lib/form-validation.server';
import { createPostSchema, type CreatePostData } from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { getPosts, createPost, getPostCount } from '~/models/post.server';

// GET /api/posts - List posts with pagination and filtering
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const published = url.searchParams.get('published');
    const userId = url.searchParams.get('userId');

    const offset = (page - 1) * limit;

    const [posts, total] = await Promise.all([
        getPosts({
            userId: userId || undefined,
            published: published ? published === 'true' : undefined,
            limit,
            offset,
        }),
        getPostCount({
            userId: userId || undefined,
            published: published ? published === 'true' : undefined,
        }),
    ]);

    return data({
        posts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}

// POST /api/posts - Create a new post
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    if (request.method === 'POST') {
        const { data: validatedData, errors } =
            await getValidatedFormData<CreatePostData>(
                request,
                zodResolver(createPostSchema),
            );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        try {
            const post = await createPost({
                data: validatedData!,
                authorId: user.id,
            });

            return data({ success: true, post }, { status: 201 });
        } catch (error) {
            console.error('Failed to create post:', error);
            return data({ error: 'Failed to create post' }, { status: 500 });
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
```

### Step 5: Create Individual Resource Endpoint

**Location:** `app/routes/api/posts.$id.ts`

Handle individual post operations (read, update, delete):

```typescript
import type { Route } from './+types/posts.$id';
import { data } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { getValidatedFormData } from '~/lib/form-validation.server';
import { updatePostSchema, type UpdatePostData } from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { getPost, updatePost, deletePost } from '~/models/post.server';

// GET /api/posts/:id - Get single post
export async function loader({ request, params }: Route.LoaderArgs) {
    await requireUser(request);

    const post = await getPost(params.id);

    if (!post) {
        throw data('Post not found', { status: 404 });
    }

    return data({ post });
}

// PUT/PATCH/DELETE /api/posts/:id
export async function action({ request, params }: Route.ActionArgs) {
    const user = await requireUser(request);

    // Verify post exists and check authorization
    const post = await getPost(params.id);

    if (!post) {
        throw data('Post not found', { status: 404 });
    }

    // Only the author can modify the post
    if (post.authorId !== user.id) {
        throw data('You do not have permission to modify this post', {
            status: 403,
        });
    }

    // UPDATE - PUT or PATCH
    if (request.method === 'PUT' || request.method === 'PATCH') {
        const { data: validatedData, errors } =
            await getValidatedFormData<UpdatePostData>(
                request,
                zodResolver(updatePostSchema),
            );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        try {
            const updatedPost = await updatePost({
                id: params.id,
                data: validatedData!,
            });

            return data({ success: true, post: updatedPost });
        } catch (error) {
            console.error('Failed to update post:', error);
            return data({ error: 'Failed to update post' }, { status: 500 });
        }
    }

    // DELETE
    if (request.method === 'DELETE') {
        try {
            await deletePost(params.id);
            return data({ success: true });
        } catch (error) {
            console.error('Failed to delete post:', error);
            return data({ error: 'Failed to delete post' }, { status: 500 });
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
```

## HTTP Method Patterns

### GET - Read Data (Loader)

Use `loader()` function for all GET requests:

```typescript
export async function loader({ request, params }: Route.LoaderArgs) {
    // Authentication
    const user = await requireUser(request);

    // Parse query parameters
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter');

    // Fetch data via model layer
    const data = await getResourceFromModel({ filter });

    // Return JSON
    return data({ data });
}
```

### POST - Create Resource (Action)

```typescript
export async function action({ request }: Route.ActionArgs) {
    if (request.method === 'POST') {
        const user = await requireUser(request);

        // Validate
        const { data: validatedData, errors } = await getValidatedFormData(
            request,
            zodResolver(createSchema),
        );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        // Create via model layer
        const resource = await createResource({
            data: validatedData!,
            userId: user.id,
        });

        // Return 201 Created
        return data({ success: true, resource }, { status: 201 });
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
```

### PUT/PATCH - Update Resource (Action)

```typescript
if (request.method === 'PUT' || request.method === 'PATCH') {
    const user = await requireUser(request);

    // Authorization check
    const existing = await getResource(params.id);
    if (!existing || existing.userId !== user.id) {
        throw data('Forbidden', { status: 403 });
    }

    // Validate
    const { data: validatedData, errors } = await getValidatedFormData(
        request,
        zodResolver(updateSchema),
    );

    if (errors) {
        return data({ errors }, { status: 400 });
    }

    // Update via model layer
    const updated = await updateResource({
        id: params.id,
        data: validatedData!,
    });

    return data({ success: true, resource: updated });
}
```

### DELETE - Delete Resource (Action)

```typescript
if (request.method === 'DELETE') {
    const user = await requireUser(request);

    // Authorization check
    const existing = await getResource(params.id);
    if (!existing || existing.userId !== user.id) {
        throw data('Forbidden', { status: 403 });
    }

    // Delete via model layer
    await deleteResource(params.id);

    return data({ success: true });
}
```

## Authentication & Authorization

### Always Require Authentication

API endpoints don't have middleware, so **always** call `requireUser()`:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request); // ✅ REQUIRED

    // ... rest of loader
}
```

### Role-Based Access Control

For admin or editor-only endpoints, use role helpers:

```typescript
import { requireAdmin, requireEditor } from '~/lib/session.server';

export async function action({ request }: Route.ActionArgs) {
    // Only admins can perform this action
    const user = await requireAdmin(request);

    // ... rest of action
}
```

See `.github/instructions/role-based-access.instructions.md` for complete RBAC patterns.

### Resource Authorization

Check ownership before allowing modifications:

```typescript
export async function action({ request, params }: Route.ActionArgs) {
    const user = await requireUser(request);

    const resource = await getResource(params.id);

    // Authorization check
    if (!resource) {
        throw data('Not found', { status: 404 });
    }

    if (resource.userId !== user.id) {
        throw data('You do not have permission to modify this resource', {
            status: 403,
        });
    }

    // Proceed with modification
}
```

## Validation Pattern

### Always Validate with getValidatedFormData

**NEVER trust client data.** Always validate on the server:

```typescript
import { getValidatedFormData } from '~/lib/form-validation.server';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSchema, type CreateData } from '~/lib/validations';

export async function action({ request }: Route.ActionArgs) {
    const { data: validatedData, errors } =
        await getValidatedFormData<CreateData>(
            request,
            zodResolver(createSchema),
        );

    if (errors) {
        // Return field-level errors
        return data({ errors }, { status: 400 });
    }

    // validatedData is now type-safe and validated
    const resource = await createResource(validatedData!);

    return data({ success: true, resource });
}
```

### Validating Query Parameters (GET)

```typescript
const querySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sort: z.enum(['asc', 'desc']).default('desc'),
    filter: z.string().optional(),
});

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);

    // Convert URLSearchParams to object
    const params = Object.fromEntries(url.searchParams);

    // Validate
    const result = querySchema.safeParse(params);

    if (!result.success) {
        return data(
            { error: 'Invalid query parameters', issues: result.error.issues },
            { status: 400 },
        );
    }

    const { page, limit, sort, filter } = result.data;

    // Use validated params
    const results = await getResources({ page, limit, sort, filter });

    return data({ results });
}
```

## Error Handling

### HTTP Status Codes

Use appropriate status codes for different scenarios:

| Code  | Usage                     | Example                                                         |
| ----- | ------------------------- | --------------------------------------------------------------- |
| `200` | Success (GET, PUT, PATCH) | `return data({ data })`                                         |
| `201` | Resource created (POST)   | `return data({ resource }, { status: 201 })`                    |
| `400` | Validation error          | `return data({ errors }, { status: 400 })`                      |
| `401` | Not authenticated         | Handled by `requireUser()`                                      |
| `403` | Not authorized            | `throw data('Forbidden', { status: 403 })`                      |
| `404` | Not found                 | `throw data('Not found', { status: 404 })`                      |
| `405` | Method not allowed        | `return data({ error: 'Method not allowed' }, { status: 405 })` |
| `409` | Conflict (duplicate)      | `return data({ error: 'Already exists' }, { status: 409 })`     |
| `500` | Server error              | `return data({ error: 'Internal error' }, { status: 500 })`     |

### Error Response Pattern

**Validation Errors (400):**

```typescript
return data(
    {
        errors: {
            email: { type: 'validation', message: 'Invalid email' },
        },
    },
    { status: 400 },
);
```

**Not Found (404):**

```typescript
throw data('Post not found', { status: 404 });
// or with more detail
throw data({ error: 'Post not found', id: params.id }, { status: 404 });
```

**Forbidden (403):**

```typescript
throw data('You do not have permission to perform this action', {
    status: 403,
});
```

**Server Error (500):**

```typescript
try {
    await riskyOperation();
} catch (error) {
    console.error('Operation failed:', error);
    return data(
        { error: 'Failed to complete operation. Please try again.' },
        { status: 500 },
    );
}
```

### Try-Catch for Database Operations

Always wrap database operations in try-catch:

```typescript
try {
    const resource = await createResourceInDatabase(data);
    return data({ success: true, resource }, { status: 201 });
} catch (error) {
    console.error('Database error:', error);

    // Check for specific errors
    if (error.code === 'P2002') {
        // Unique constraint violation
        return data(
            { error: 'A resource with this identifier already exists' },
            { status: 409 },
        );
    }

    return data({ error: 'Failed to create resource' }, { status: 500 });
}
```

## Common Patterns

### Pagination

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
        getItems({ limit, offset }),
        getItemCount(),
    ]);

    return data({
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
    });
}
```

### Filtering & Sorting

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);

    const filters = {
        status: url.searchParams.get('status'),
        category: url.searchParams.get('category'),
        search: url.searchParams.get('search'),
    };

    const sort = url.searchParams.get('sort') || 'createdAt';
    const order = url.searchParams.get('order') || 'desc';

    const items = await getItems({
        where: {
            ...(filters.status && { status: filters.status }),
            ...(filters.category && { category: filters.category }),
            ...(filters.search && {
                OR: [
                    {
                        title: {
                            contains: filters.search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        content: {
                            contains: filters.search,
                            mode: 'insensitive',
                        },
                    },
                ],
            }),
        },
        orderBy: { [sort]: order },
    });

    return data({ items });
}
```

### Bulk Operations

```typescript
export async function action({ request }: Route.ActionArgs) {
    if (request.method === 'POST') {
        const user = await requireUser(request);
        const formData = await request.formData();
        const intent = formData.get('intent');

        if (intent === 'bulk-delete') {
            const ids = JSON.parse(formData.get('ids') as string);

            // Validate IDs
            if (!Array.isArray(ids) || ids.length === 0) {
                return data({ error: 'Invalid IDs' }, { status: 400 });
            }

            // Verify ownership for all items
            const items = await getItemsByIds(ids);
            const unauthorized = items.filter(
                (item) => item.userId !== user.id,
            );

            if (unauthorized.length > 0) {
                return data(
                    { error: 'Not authorized to delete some items' },
                    { status: 403 },
                );
            }

            // Perform bulk delete
            await bulkDeleteItems(ids);

            return data({ success: true, deleted: ids.length });
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
```

### File Uploads

```typescript
export async function action({ request }: Route.ActionArgs) {
    if (request.method === 'POST') {
        const user = await requireUser(request);
        const formData = await request.formData();

        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            return data({ error: 'File is required' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return data({ error: 'Invalid file type' }, { status: 400 });
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return data({ error: 'File too large (max 5MB)' }, { status: 400 });
        }

        try {
            // Upload to storage service
            const url = await uploadFile(file);

            // Save to database
            const resource = await createResource({
                userId: user.id,
                fileUrl: url,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
            });

            return data({ success: true, resource }, { status: 201 });
        } catch (error) {
            console.error('Upload failed:', error);
            return data({ error: 'Upload failed' }, { status: 500 });
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
```

### Rate Limiting

```typescript
// Simple in-memory rate limiting (use Redis in production)
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const userLimit = rateLimit.get(userId);

    if (!userLimit || now > userLimit.resetAt) {
        rateLimit.set(userId, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (userLimit.count >= maxRequests) {
        return false;
    }

    userLimit.count++;
    return true;
}

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    if (!checkRateLimit(user.id)) {
        return data(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 },
        );
    }

    // ... rest of action
}
```

## Client-Side Consumption

### Using useFetcher (Recommended)

```typescript
import { useFetcher } from 'react-router';
import { useEffect } from 'react';

function CreatePostForm() {
    const fetcher = useFetcher();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        fetcher.submit(formData, {
            method: 'POST',
            action: '/api/posts'
        });
    };

    useEffect(() => {
        if (fetcher.state === 'idle' && fetcher.data?.success) {
            console.log('Post created:', fetcher.data.post);
            // Reset form, show success message, etc.
        }
    }, [fetcher.state, fetcher.data]);

    return (
        <form onSubmit={handleSubmit}>
            <input name="title" placeholder="Title" required />
            <textarea name="content" placeholder="Content" required />

            {fetcher.data?.errors && (
                <div>Validation errors: {JSON.stringify(fetcher.data.errors)}</div>
            )}

            <button type="submit" disabled={fetcher.state !== 'idle'}>
                {fetcher.state === 'submitting' ? 'Creating...' : 'Create Post'}
            </button>
        </form>
    );
}
```

### Using fetch() Directly

```typescript
async function deletePost(postId: string) {
    const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete post');
    }

    return response.json();
}

async function getPosts({ page = 1, limit = 20 }) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    const response = await fetch(`/api/posts?${params}`);

    if (!response.ok) {
        throw new Error('Failed to fetch posts');
    }

    return response.json();
}
```

### With React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFetcher } from 'react-router';
import { createPostSchema, type CreatePostData } from '~/lib/validations';

function CreatePost() {
    const fetcher = useFetcher();
    const { register, handleSubmit, formState: { errors } } = useForm<CreatePostData>({
        resolver: zodResolver(createPostSchema)
    });

    const onSubmit = (data: CreatePostData) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('content', data.content);
        formData.append('published', data.published.toString());

        fetcher.submit(formData, {
            method: 'POST',
            action: '/api/posts'
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('title')} />
            {errors.title && <span>{errors.title.message}</span>}

            <textarea {...register('content')} />
            {errors.content && <span>{errors.content.message}</span>}

            <button type="submit">Create</button>
        </form>
    );
}
```

## Testing API Endpoints

### Unit Testing Loaders

```typescript
import { loader } from './routes/api/posts';

test('GET /api/posts returns paginated posts', async () => {
    const request = new Request('http://localhost/api/posts?page=1&limit=10');

    // Mock requireUser
    vi.mock('~/lib/session.server', () => ({
        requireUser: vi.fn().mockResolvedValue({ id: 'user-123' }),
    }));

    const response = await loader({ request, params: {}, context: {} });
    const data = await response.json();

    expect(data.posts).toBeDefined();
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(10);
});
```

### Integration Testing with Fetch

```typescript
test('POST /api/posts creates a post', async () => {
    const formData = new FormData();
    formData.append('title', 'Test Post');
    formData.append('content', 'This is a test post');
    formData.append('published', 'false');

    const response = await fetch('http://localhost:5173/api/posts', {
        method: 'POST',
        body: formData,
        headers: {
            Cookie: sessionCookie, // Authenticated session
        },
    });

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.post.title).toBe('Test Post');
});

test('DELETE /api/posts/:id deletes a post', async () => {
    const response = await fetch(`http://localhost:5173/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
            Cookie: sessionCookie,
        },
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
});
```

## Security Best Practices

1. **Always authenticate** - Call `requireUser()` in every loader and action
2. **Always authorize** - Verify ownership before modifying resources
3. **Always validate** - Use `getValidatedFormData()` for all inputs
4. **Never expose sensitive data** - Filter fields before returning JSON
5. **Use appropriate status codes** - Help clients handle errors correctly
6. **Rate limit** - Prevent abuse with rate limiting
7. **Log errors** - Use `console.error()` for debugging, but don't expose stack traces
8. **Sanitize inputs** - Validate and sanitize all user inputs
9. **Use HTTPS** - Ensure secure transmission in production
10. **Check file uploads** - Validate type, size, and content

### Filtering Sensitive Data

```typescript
export async function loader({ request, params }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const profile = await getUserFromSession(params.id);

    // ❌ BAD - Exposes password hash
    return data({ user: profile });

    // ✅ GOOD - Filter sensitive fields
    return data({
        user: {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            // Don't include: password, resetToken, etc.
        },
    });
}
```

## Best Practices

1. **API-first for CRUD** - Use API endpoints for reusable data operations
2. **Model layer abstraction** - Never call Prisma directly in routes
3. **Consistent error responses** - Use standard format across all endpoints
4. **Type-safe everything** - Use generated Route types for all functions
5. **Document with comments** - Add JSDoc comments for complex endpoints
6. **Version your API** - Consider `/api/v1/posts` for future compatibility
7. **Use proper HTTP methods** - GET for reads, POST for creates, PUT/PATCH for updates, DELETE for deletes
8. **Return appropriate data** - Only return what the client needs
9. **Parallel operations** - Use `Promise.all()` for independent operations
10. **Graceful error handling** - Always catch and handle errors properly

## Anti-Patterns to Avoid

❌ **Direct Prisma in routes**

```typescript
// BAD
export async function loader() {
    const posts = await prisma.post.findMany(); // ❌ Never do this
}

// GOOD
export async function loader() {
    const posts = await getPosts(); // ✅ Use model function
}
```

❌ **No authentication**

```typescript
// BAD - Missing authentication
export async function action({ request }) {
    const data = await request.formData();
    await createResource(data); // ❌ Anyone can call this
}

// GOOD
export async function action({ request }) {
    const user = await requireUser(request); // ✅ Requires authentication
    const data = await request.formData();
    await createResource(data);
}
```

❌ **No validation**

```typescript
// BAD - Trusting client data
export async function action({ request }) {
    const data = await request.formData();
    await saveToDatabase(data); // ❌ Dangerous!
}

// GOOD - Always validate
export async function action({ request }) {
    const { data, errors } = await getValidatedFormData(
        request,
        zodResolver(schema),
    );
    if (errors) return data({ errors }, { status: 400 });
    await saveToDatabase(data!); // ✅ Safe
}
```

❌ **Exposing sensitive data**

```typescript
// BAD - Returns password hash
return data({ user }); // ❌ Includes all fields

// GOOD - Explicit selection
return data({
    user: {
        id: user.id,
        name: user.name,
        email: user.email,
    },
}); // ✅ Only safe fields
```

❌ **Unclear error messages**

```typescript
// BAD
return data({ error: 'Error' }, { status: 500 }); // ❌ Not helpful

// GOOD
return data(
    { error: 'Failed to create post. Please try again.' },
    { status: 500 },
); // ✅ Clear and actionable
```

❌ **Missing error handling**

```typescript
// BAD
await riskyDatabaseOperation(); // ❌ No error handling

// GOOD
try {
    await riskyDatabaseOperation();
} catch (error) {
    console.error('Operation failed:', error);
    return data({ error: 'Operation failed' }, { status: 500 });
} // ✅ Graceful error handling
```

## Related Documentation

- **CRUD Pattern**: `.github/instructions/crud-pattern.instructions.md`
- **Form Validation**: `.github/instructions/form-validation.instructions.md`
- **React Router 7**: `.github/instructions/react-router.instructions.md`
- **Role-Based Access**: `.github/instructions/role-based-access.instructions.md`
- **Prisma Models**: `.github/instructions/prisma.instructions.md`

## Reference Implementation

See `app/routes/api/profile.ts` for the canonical example of a well-structured API endpoint.
