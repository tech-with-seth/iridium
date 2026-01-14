---
applyTo: 'app/routes/api/**/*.ts,app/models/**/*.server.ts'
---

# CRUD Pattern Instructions

## Overview

This document establishes the **canonical pattern for implementing CRUD operations** in this application. All features requiring Create, Read, Update, and Delete functionality MUST follow this API-first pattern.

## When to Use This Pattern

Use this pattern when implementing features that require:

- ✅ User profile management
- ✅ Content creation and editing (posts, comments, etc.)
- ✅ Settings and preferences management
- ✅ Any resource that requires full CRUD operations
- ✅ Features that might need programmatic access in the future

## Architecture: API-First Pattern

### Why API-First?

The API-first pattern provides:

- **RESTful architecture** - Standard HTTP methods for predictable behavior
- **Modular design** - Separation of business logic (API) from presentation (UI)
- **Reusability** - API endpoints callable from anywhere in the application
- **Programmatic access** - Easy integration with external tools or services
- **Consistency** - Follows the established pattern of `/api/profile` (reference implementation)
- **Type safety** - Full TypeScript support throughout the stack

### File Structure

```
app/routes/api/[feature].ts          # API Endpoint (Business Logic)
  ↳ loader()  - GET    (Read data)
  ↳ action()  - POST   (Create)
                PUT    (Update)
                DELETE (Delete)

app/routes/[feature].tsx              # UI Route (Presentation)
  ↳ loader()   - Fetch initial data
  ↳ Component  - Render UI + forms
```

## Implementation Steps

### Step 1: Define Validation Schema

**Location:** `app/lib/validations.ts`

All validation schemas must be defined here using Zod for both client and server validation.

```typescript
import { z } from 'zod';

// Example: Profile update schema
export const profileUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    location: z.string().max(100, 'Location too long').optional(),
    phoneNumber: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
        .optional(),
});

// Type inference
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

// Example: Post creation schema
export const createPostSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: z.string().min(10, 'Content must be at least 10 characters'),
    published: z.boolean().default(false),
    tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed').optional(),
});

export type CreatePostData = z.infer<typeof createPostSchema>;
```

### Step 2: Create Database Model

**Location:** `prisma/schema.prisma`

Update or create the necessary Prisma models for your feature.

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  bio         String?  // Add new fields
  website     String?
  location    String?
  phoneNumber String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([email])
  @@map("user")
}
```

**After schema changes:**

1. Run `npx prisma migrate dev --name add_[feature]_fields`
2. Run `npx prisma generate`
3. Restart dev server

### Step 3: Create API Endpoint

**Location:** `app/routes/api/[feature].ts`

This is the core business logic layer.

```typescript
import type { Route } from './+types/[feature]';
import { data } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { validateFormData } from '~/lib/form-validation.server';
import { [feature]Schema, type [Feature]Data } from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { prisma } from '~/db.server';

// GET - Read operation
export async function loader({ request, params }: Route.LoaderArgs) {
    const user = await requireUser(request);

    // Example: Fetch resource
    const resource = await prisma.[model].findUnique({
        where: { id: params.id }
    });

    if (!resource) {
        throw new Response('Not Found', { status: 404 });
    }

    // Authorization check (if needed)
    if (resource.userId !== user.id) {
        throw new Response('Forbidden', { status: 403 });
    }

    return data({ resource });
}

// POST/PUT/DELETE - Create, Update, Delete operations
export async function action({ request, params }: Route.ActionArgs) {
    const user = await requireUser(request);

    // CREATE - POST
    if (request.method === 'POST') {
        const formData = await request.formData();
        const { data: validatedData, errors } = await validateFormData<[Feature]Data>(
            formData,
            zodResolver([feature]CreateSchema)
        );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        try {
            const newResource = await prisma.[model].create({
                data: {
                    ...validatedData!,
                    userId: user.id
                }
            });

            return data({ success: true, resource: newResource }, { status: 201 });
        } catch (error) {
            return data(
                { error: 'Failed to create resource' },
                { status: 500 }
            );
        }
    }

    // UPDATE - PUT
    if (request.method === 'PUT') {
        const formData = await request.formData();
        const { data: validatedData, errors } = await validateFormData<[Feature]Data>(
            formData,
            zodResolver([feature]UpdateSchema)
        );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        // Authorization check
        const existing = await prisma.[model].findUnique({
            where: { id: params.id }
        });

        if (!existing || existing.userId !== user.id) {
            throw new Response('Forbidden', { status: 403 });
        }

        try {
            const updated = await prisma.[model].update({
                where: { id: params.id },
                data: validatedData!
            });

            return data({ success: true, resource: updated });
        } catch (error) {
            return data(
                { error: 'Failed to update resource' },
                { status: 500 }
            );
        }
    }

    // DELETE
    if (request.method === 'DELETE') {
        // Authorization check
        const existing = await prisma.[model].findUnique({
            where: { id: params.id }
        });

        if (!existing || existing.userId !== user.id) {
            throw new Response('Forbidden', { status: 403 });
        }

        try {
            await prisma.[model].delete({
                where: { id: params.id }
            });

            return data({ success: true });
        } catch (error) {
            return data(
                { error: 'Failed to delete resource' },
                { status: 500 }
            );
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
```

### Step 4: Register API Route

**Location:** `app/routes.ts`

Add the API route under the `api` prefix.

```typescript
import {
    type RouteConfig,
    index,
    route,
    prefix,
} from '@react-router/dev/routes';

export default [
    // ... existing routes
    ...prefix('api', [
        route('[feature]', 'routes/api/[feature].ts'),
        // With params: route('[feature]/:id', 'routes/api/[feature].$id.ts')
    ]),
] satisfies RouteConfig;
```

### Step 5: Create UI Route

**Location:** `app/routes/[feature].tsx`

This is the presentation layer that consumes the API.

```typescript
import { useFetcher } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Route } from './+types/[feature]';
import { useValidatedForm } from '~/lib/form-hooks';
import { [feature]Schema, type [Feature]Data } from '~/lib/validations';
import { Container } from '~/components/Container';
import { Card } from '~/components/Card';
import { TextInput } from '~/components/TextInput';
import { Textarea } from '~/components/Textarea';
import { Button } from '~/components/Button';
import { Alert } from '~/components/Alert';
import { Modal } from '~/components/Modal';
import { useState } from 'react';

// Loader: Fetch initial data
export async function loader({ request, params }: Route.LoaderArgs) {
    // Option 1: Fetch directly from DB
    const user = await requireUser(request);
    const resource = await prisma.[model].findUnique({ where: { id: params.id } });

    // Option 2: Call your own API (if you need consistent access pattern)
    // const response = await fetch(new URL('/api/[feature]', request.url));
    // const data = await response.json();

    return { resource };
}

export default function FeaturePage({ loaderData }: Route.ComponentProps) {
    const fetcher = useFetcher();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useValidatedForm<[Feature]Data>({
        resolver: zodResolver([feature]Schema),
        errors: fetcher.data?.errors,
        defaultValues: loaderData.resource
    });

    const onSubmit = (formData: [Feature]Data) => {
        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formDataObj.append(key, value.toString());
            }
        });

        fetcher.submit(formDataObj, {
            method: 'PUT',
            action: '/api/[feature]'
        });
    };

    const handleDelete = () => {
        fetcher.submit(null, {
            method: 'DELETE',
            action: '/api/[feature]'
        });
        setShowDeleteModal(false);
    };

    const isLoading = fetcher.state === 'submitting' || fetcher.state === 'loading';

    // Reset edit mode on success
    if (fetcher.state === 'idle' && fetcher.data?.success && isEditing) {
        setIsEditing(false);
        reset(fetcher.data.resource);
    }

    return (
        <>
            <title>[Feature] - Iridium</title>
            <meta name="description" content="Manage your [feature]" />

            <Container className="pt-12">
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Your [Feature]</h1>
                        {!isEditing && (
                            <Button onClick={() => setIsEditing(true)} size="sm">
                                Edit
                            </Button>
                        )}
                    </div>

                    {/* Success/Error Alerts */}
                    {fetcher.data?.success && (
                        <Alert status="success" className="mb-4">
                            Changes saved successfully!
                        </Alert>
                    )}

                    {fetcher.data?.error && (
                        <Alert status="error" className="mb-4">
                            {fetcher.data.error}
                        </Alert>
                    )}

                    {isEditing ? (
                        <fetcher.Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <TextInput
                                {...register('name')}
                                label="Name"
                                error={errors.name?.message}
                                required
                            />

                            <Textarea
                                {...register('bio')}
                                label="Bio"
                                error={errors.bio?.message}
                                rows={4}
                            />

                            <TextInput
                                {...register('website')}
                                label="Website"
                                type="url"
                                error={errors.website?.message}
                            />

                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsEditing(false);
                                        reset();
                                    }}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" loading={isLoading}>
                                    Save Changes
                                </Button>
                            </div>
                        </fetcher.Form>
                    ) : (
                        <div className="space-y-4">
                            {/* Display-only view */}
                            <div>
                                <p className="text-sm font-medium text-base-content/70">Name</p>
                                <p className="text-base">{loaderData.resource?.name}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-base-content/70">Bio</p>
                                <p className="text-base">{loaderData.resource?.bio || 'Not provided'}</p>
                            </div>

                            {/* Delete button */}
                            <div className="pt-4 border-t border-base-300">
                                <Button
                                    status="error"
                                    variant="outline"
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </Container>

            {/* Delete Confirmation Modal */}
            <Modal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Account"
            >
                <p className="mb-4">
                    Are you sure you want to delete your account? This action cannot be undone.
                </p>
                <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button status="error" onClick={handleDelete} loading={isLoading}>
                        Delete
                    </Button>
                </div>
            </Modal>
        </>
    );
}
```

## HTTP Method Patterns

### GET (Read)

- **Use:** `loader()` function
- **Purpose:** Fetch and return data
- **Response:** `return data({ data })`

### POST (Create)

- **Use:** `action()` with `request.method === 'POST'`
- **Purpose:** Create new resources
- **Response:** `return data({ success: true, resource }, { status: 201 })`

### PUT (Update)

- **Use:** `action()` with `request.method === 'PUT'`
- **Purpose:** Update existing resources
- **Response:** `return data({ success: true, resource })`

### DELETE (Delete)

- **Use:** `action()` with `request.method === 'DELETE'`
- **Purpose:** Delete resources
- **Response:** `return data({ success: true })`

## Security Considerations

### Authentication

- **Always** call `requireUser(request)` at the start of loader/action
- API endpoints don't have middleware protection - must manually authenticate

### Authorization

- Check resource ownership before operations:
    ```typescript
    if (resource.userId !== user.id) {
        throw new Response('Forbidden', { status: 403 });
    }
    ```

### Validation

- **Always** validate on server with `getValidatedFormData`
- Never trust client-side validation alone
- Return proper error codes (400 for validation, 403 for authorization, 500 for server errors)

## Error Handling

### Validation Errors (400)

```typescript
if (errors) {
    return data({ errors }, { status: 400 });
}
```

### Not Found (404)

```typescript
if (!resource) {
    throw new Response('Not Found', { status: 404 });
}
```

### Forbidden (403)

```typescript
if (resource.userId !== user.id) {
    throw new Response('Forbidden', { status: 403 });
}
```

### Server Errors (500)

```typescript
try {
    // operation
} catch (error) {
    return data({ error: 'Failed to perform operation' }, { status: 500 });
}
```

## Testing Pattern

### API Endpoint Testing

```typescript
// Test GET
const response = await fetch('/api/[feature]', {
    headers: { Cookie: sessionCookie },
});
expect(response.status).toBe(200);

// Test PUT
const response = await fetch('/api/[feature]', {
    method: 'PUT',
    headers: { Cookie: sessionCookie },
    body: formData,
});
expect(response.status).toBe(200);
expect(await response.json()).toHaveProperty('success', true);

// Test DELETE
const response = await fetch('/api/[feature]', {
    method: 'DELETE',
    headers: { Cookie: sessionCookie },
});
expect(response.status).toBe(200);
```

## Reference Implementation

**See `app/routes/api/profile.ts` and `app/routes/profile.tsx`** for the canonical implementation of this pattern.

## Intent-Based Routing Pattern

When handling multiple related operations at a single endpoint (like sign in vs sign up), use the intent pattern:

```typescript
import { validateFormData } from '~/lib/form-validation.server';

export async function action({ request }: Route.ActionArgs) {
    // 1. Read FormData once
    const formData = await request.formData();
    const intent = formData.get('intent') as string;

    // 2. Route based on intent, validate with the SAME FormData
    if (intent === 'create') {
        const { data, errors } = await validateFormData<CreateData>(
            formData,
            zodResolver(createSchema),
        );
        if (errors) return data({ errors }, { status: 400 });
        // ... handle creation
    }

    if (intent === 'update') {
        const { data, errors } = await validateFormData<UpdateData>(
            formData,
            zodResolver(updateSchema),
        );
        if (errors) return data({ errors }, { status: 400 });
        // ... handle update
    }
}
```

**The React Router 7 Way:**

1. Always call `request.formData()` first
2. Read any routing fields (like `intent`) from FormData
3. Pass the same FormData to `validateFormData()`
4. Simple, clean, no double-reading errors

## Anti-Patterns to Avoid

- ❌ Putting business logic in UI routes instead of API endpoints
- ❌ Skipping server-side validation
- ❌ Not checking authorization on protected resources
- ❌ Returning sensitive data without filtering
- ❌ Missing error handling for database operations
- ❌ Not using `requireUser()` for protected API endpoints
- ❌ Inconsistent HTTP method usage
- ❌ Bypassing the API and accessing DB directly from UI routes (except for initial loader data)
- ❌ Converting FormData to plain objects unnecessarily (use `validateFormData`)

## Related Documentation

- Form Validation: `.github/instructions/form-validation.instructions.md`
- React Router: `.github/instructions/react-router.instructions.md`
- Prisma: `.github/instructions/prisma.instructions.md`
- Component Patterns: `.github/instructions/component-patterns.instructions.md`
