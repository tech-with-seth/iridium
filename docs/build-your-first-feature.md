# Build Your First Feature: Bookmarks

This tutorial walks you through building a complete CRUD feature in Iridium. In about 20 minutes, you'll create a Bookmarks feature with:

- ✅ Database schema and migration
- ✅ Model layer for data access
- ✅ RESTful API endpoint
- ✅ UI components with forms
- ✅ Form validation (Zod)
- ✅ Unit tests
- ✅ E2E test

This follows Iridium's **API-first CRUD pattern** - the same pattern used throughout the codebase.

---

## What We're Building

A bookmark manager where users can:

- Save bookmarks with URL, title, and description
- Tag bookmarks for organization
- View all their bookmarks
- Edit existing bookmarks
- Delete bookmarks

Each bookmark belongs to a user (authenticated access only).

---

## Step 1: Database Schema

### Add to Prisma Schema

Open `prisma/schema.prisma` and add the Bookmark model:

```prisma
model Bookmark {
  id          String   @id @default(cuid())
  url         String
  title       String
  description String?
  tags        String[] // Array of tag strings
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@map("bookmarks")
}
```

Add the relation to the User model (find the existing `model User` and add this field):

```prisma
model User {
  // ... existing fields ...
  bookmarks Bookmark[]
}
```

### Create Migration

```bash
npx prisma migrate dev --name add_bookmarks
npx prisma generate
```

**Restart your dev server** after generating the Prisma client.

---

## Step 2: Validation Schema

Open `app/lib/validations.ts` and add Bookmark validation schemas:

```typescript
// Add to the existing file
export const createBookmarkSchema = z.object({
    url: z.string().url('Must be a valid URL'),
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().max(500, 'Description too long').optional(),
    tags: z
        .string()
        .transform((str) => (str ? str.split(',').map((t) => t.trim()) : []))
        .pipe(z.array(z.string()).max(10, 'Maximum 10 tags'))
        .optional(),
});

export const updateBookmarkSchema = z.object({
    url: z.string().url('Must be a valid URL').optional(),
    title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
    description: z.string().max(500, 'Description too long').optional(),
    tags: z
        .string()
        .transform((str) => (str ? str.split(',').map((t) => t.trim()) : []))
        .pipe(z.array(z.string()).max(10, 'Maximum 10 tags'))
        .optional(),
});

export type CreateBookmarkData = z.infer<typeof createBookmarkSchema>;
export type UpdateBookmarkData = z.infer<typeof updateBookmarkSchema>;
```

**Note:** The `tags` field transforms comma-separated strings into arrays automatically.

---

## Step 3: Model Layer

Create `app/models/bookmark.server.ts`:

```typescript
import { prisma } from '~/db.server';
import type { CreateBookmarkData, UpdateBookmarkData } from '~/lib/validations';

/**
 * Get all bookmarks for a user
 */
export async function getUserBookmarks(userId: string) {
    return prisma.bookmark.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Get a single bookmark by ID
 */
export async function getBookmark(bookmarkId: string, userId: string) {
    return prisma.bookmark.findFirst({
        where: { id: bookmarkId, userId },
    });
}

/**
 * Create a new bookmark
 */
export async function createBookmark(
    userId: string,
    data: CreateBookmarkData,
) {
    return prisma.bookmark.create({
        data: {
            url: data.url,
            title: data.title,
            description: data.description,
            tags: data.tags || [],
            userId,
        },
    });
}

/**
 * Update an existing bookmark
 */
export async function updateBookmark(
    bookmarkId: string,
    userId: string,
    data: UpdateBookmarkData,
) {
    const updateData: any = {};

    if (data.url) updateData.url = data.url;
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tags !== undefined) updateData.tags = data.tags;

    return prisma.bookmark.update({
        where: { id: bookmarkId, userId },
        data: updateData,
    });
}

/**
 * Delete a bookmark
 */
export async function deleteBookmark(bookmarkId: string, userId: string) {
    return prisma.bookmark.delete({
        where: { id: bookmarkId, userId },
    });
}
```

---

## Step 4: API Endpoint

Create `app/routes/api/bookmarks.ts`:

```typescript
import type { Route } from './+types/bookmarks';
import { data } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { validateFormData } from '~/lib/form-validation.server';
import {
    createBookmarkSchema,
    updateBookmarkSchema,
} from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    getUserBookmarks,
    createBookmark,
    updateBookmark,
    deleteBookmark,
} from '~/models/bookmark.server';
import { logException } from '~/lib/posthog';

// GET - List all bookmarks for current user
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const bookmarks = await getUserBookmarks(user.id);
    return data({ bookmarks });
}

// POST/PUT/DELETE - Create, Update, or Delete bookmarks
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    // CREATE - POST
    if (request.method === 'POST') {
        const formData = await request.formData();

        const { data: validatedData, errors } = await validateFormData(
            formData,
            zodResolver(createBookmarkSchema),
        );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        try {
            const bookmark = await createBookmark(user.id, validatedData!);
            return data({
                success: true,
                bookmark,
                message: 'Bookmark created',
            });
        } catch (error: unknown) {
            logException(error as Error, {
                context: 'bookmark_create',
                userId: user.id,
            });
            return data(
                { error: 'Failed to create bookmark' },
                { status: 500 },
            );
        }
    }

    // UPDATE - PUT
    if (request.method === 'PUT') {
        const formData = await request.formData();
        const bookmarkId = String(formData.get('bookmarkId'));

        if (!bookmarkId) {
            return data({ error: 'Bookmark ID required' }, { status: 400 });
        }

        const { data: validatedData, errors } = await validateFormData(
            formData,
            zodResolver(updateBookmarkSchema),
        );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        try {
            const bookmark = await updateBookmark(
                bookmarkId,
                user.id,
                validatedData!,
            );
            return data({
                success: true,
                bookmark,
                message: 'Bookmark updated',
            });
        } catch (error: unknown) {
            logException(error as Error, {
                context: 'bookmark_update',
                userId: user.id,
                bookmarkId,
            });
            return data(
                { error: 'Failed to update bookmark' },
                { status: 500 },
            );
        }
    }

    // DELETE
    if (request.method === 'DELETE') {
        const formData = await request.formData();
        const bookmarkId = String(formData.get('bookmarkId'));

        if (!bookmarkId) {
            return data({ error: 'Bookmark ID required' }, { status: 400 });
        }

        try {
            await deleteBookmark(bookmarkId, user.id);
            return data({ success: true, message: 'Bookmark deleted' });
        } catch (error: unknown) {
            logException(error as Error, {
                context: 'bookmark_delete',
                userId: user.id,
                bookmarkId,
            });
            return data(
                { error: 'Failed to delete bookmark' },
                { status: 500 },
            );
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
```

---

## Step 5: Register API Route

Open `app/routes.ts` and add the bookmarks API route:

```typescript
import {
    type RouteConfig,
    route,
    prefix,
    layout,
    index,
} from '@react-router/dev/routes';

export default [
    // ... existing routes ...

    ...prefix('api', [
        // ... existing API routes ...
        route('bookmarks', 'routes/api/bookmarks.ts'), // Add this line
    ]),
] satisfies RouteConfig;
```

**Run typecheck** to generate route types:

```bash
npm run typecheck
```

---

## Step 6: UI Route

Create `app/routes/bookmarks.tsx`:

```typescript
import { useFetcher } from 'react-router';
import type { Route } from './+types/bookmarks';
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';
import { Container } from '~/components/Container';
import { Button } from '~/components/Button';
import { TextInput } from '~/components/TextInput';
import { Textarea } from '~/components/Textarea';
import { Card } from '~/components/Card';
import { Badge } from '~/components/Badge';
import { useState } from 'react';

export async function loader({ request }: Route.LoaderArgs) {
    const response = await fetch(new URL('/api/bookmarks', request.url));
    const { bookmarks } = await response.json();
    return { bookmarks };
}

export default function BookmarksRoute({
    loaderData,
}: Route.ComponentProps) {
    const { user } = useAuthenticatedContext();
    const { bookmarks } = loaderData;
    const fetcher = useFetcher();
    const [editingId, setEditingId] = useState<string | null>(null);

    return (
        <>
            <title>Bookmarks - Iridium</title>

            <Container>
                <h1 className="text-3xl font-bold mb-6">My Bookmarks</h1>

                {/* Create Bookmark Form */}
                <Card className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        Add Bookmark
                    </h2>
                    <fetcher.Form
                        method="post"
                        action="/api/bookmarks"
                        className="space-y-4"
                    >
                        <TextInput
                            name="url"
                            placeholder="https://example.com"
                            label="URL"
                            required
                        />
                        <TextInput
                            name="title"
                            placeholder="Bookmark title"
                            label="Title"
                            required
                        />
                        <Textarea
                            name="description"
                            placeholder="Optional description"
                            label="Description"
                            rows={3}
                        />
                        <TextInput
                            name="tags"
                            placeholder="tag1, tag2, tag3"
                            label="Tags (comma-separated)"
                        />
                        <Button type="submit" status="primary">
                            Save Bookmark
                        </Button>
                    </fetcher.Form>
                </Card>

                {/* Bookmarks List */}
                <div className="space-y-4">
                    {bookmarks.length === 0 ? (
                        <p className="text-gray-500">
                            No bookmarks yet. Add your first bookmark above!
                        </p>
                    ) : (
                        bookmarks.map((bookmark: any) => (
                            <Card key={bookmark.id}>
                                {editingId === bookmark.id ? (
                                    <fetcher.Form
                                        method="put"
                                        action="/api/bookmarks"
                                        className="space-y-4"
                                        onSubmit={() => setEditingId(null)}
                                    >
                                        <input
                                            type="hidden"
                                            name="bookmarkId"
                                            value={bookmark.id}
                                        />
                                        <TextInput
                                            name="url"
                                            label="URL"
                                            defaultValue={bookmark.url}
                                            required
                                        />
                                        <TextInput
                                            name="title"
                                            label="Title"
                                            defaultValue={bookmark.title}
                                            required
                                        />
                                        <Textarea
                                            name="description"
                                            label="Description"
                                            defaultValue={
                                                bookmark.description || ''
                                            }
                                            rows={3}
                                        />
                                        <TextInput
                                            name="tags"
                                            label="Tags"
                                            defaultValue={bookmark.tags.join(
                                                ', ',
                                            )}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                status="primary"
                                                size="sm"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                type="button"
                                                status="neutral"
                                                size="sm"
                                                onClick={() =>
                                                    setEditingId(null)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </fetcher.Form>
                                ) : (
                                    <>
                                        <div className="mb-2">
                                            <a
                                                href={bookmark.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xl font-semibold text-blue-600 hover:underline"
                                            >
                                                {bookmark.title}
                                            </a>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">
                                            {bookmark.url}
                                        </p>
                                        {bookmark.description && (
                                            <p className="text-gray-700 mb-3">
                                                {bookmark.description}
                                            </p>
                                        )}
                                        {bookmark.tags.length > 0 && (
                                            <div className="flex gap-2 mb-4">
                                                {bookmark.tags.map(
                                                    (tag: string) => (
                                                        <Badge
                                                            key={tag}
                                                            status="neutral"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                status="neutral"
                                                onClick={() =>
                                                    setEditingId(bookmark.id)
                                                }
                                            >
                                                Edit
                                            </Button>
                                            <fetcher.Form
                                                method="delete"
                                                action="/api/bookmarks"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="bookmarkId"
                                                    value={bookmark.id}
                                                />
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    status="error"
                                                >
                                                    Delete
                                                </Button>
                                            </fetcher.Form>
                                        </div>
                                    </>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </Container>
        </>
    );
}
```

---

## Step 7: Register UI Route

Add the bookmarks route to `app/routes.ts` inside the authenticated layout:

```typescript
export default [
    // ... existing routes ...

    layout('routes/authenticated.tsx', [
        // ... existing authenticated routes ...
        route('/bookmarks', 'routes/bookmarks.tsx'), // Add this line
    ]),
] satisfies RouteConfig;
```

Run typecheck again:

```bash
npm run typecheck
```

Restart your dev server and visit `http://localhost:5173/bookmarks`

---

## Step 8: Add Unit Tests

Create `app/models/bookmark.server.test.ts`:

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { prisma } from '~/db.server';
import {
    getUserBookmarks,
    getBookmark,
    createBookmark,
    updateBookmark,
    deleteBookmark,
} from './bookmark.server';

describe('Bookmark Model', () => {
    const userId = 'test-user-id';

    beforeEach(async () => {
        await prisma.bookmark.deleteMany({ where: { userId } });
    });

    test('createBookmark creates a bookmark', async () => {
        const bookmark = await createBookmark(userId, {
            url: 'https://example.com',
            title: 'Example Site',
            description: 'A test bookmark',
            tags: ['test', 'example'],
        });

        expect(bookmark.id).toBeDefined();
        expect(bookmark.url).toBe('https://example.com');
        expect(bookmark.title).toBe('Example Site');
        expect(bookmark.tags).toEqual(['test', 'example']);
    });

    test('getUserBookmarks returns user bookmarks', async () => {
        await createBookmark(userId, {
            url: 'https://one.com',
            title: 'One',
        });
        await createBookmark(userId, {
            url: 'https://two.com',
            title: 'Two',
        });

        const bookmarks = await getUserBookmarks(userId);

        expect(bookmarks).toHaveLength(2);
        expect(bookmarks[0].title).toBe('Two'); // Most recent first
    });

    test('getBookmark returns specific bookmark', async () => {
        const created = await createBookmark(userId, {
            url: 'https://test.com',
            title: 'Test',
        });

        const bookmark = await getBookmark(created.id, userId);

        expect(bookmark?.id).toBe(created.id);
        expect(bookmark?.url).toBe('https://test.com');
    });

    test('updateBookmark updates a bookmark', async () => {
        const created = await createBookmark(userId, {
            url: 'https://original.com',
            title: 'Original',
        });

        const updated = await updateBookmark(created.id, userId, {
            title: 'Updated',
            tags: ['new-tag'],
        });

        expect(updated.title).toBe('Updated');
        expect(updated.url).toBe('https://original.com'); // Unchanged
        expect(updated.tags).toEqual(['new-tag']);
    });

    test('deleteBookmark removes a bookmark', async () => {
        const created = await createBookmark(userId, {
            url: 'https://delete.com',
            title: 'To Delete',
        });

        await deleteBookmark(created.id, userId);

        const bookmark = await getBookmark(created.id, userId);
        expect(bookmark).toBeNull();
    });

    test('tags field handles empty array', async () => {
        const bookmark = await createBookmark(userId, {
            url: 'https://notags.com',
            title: 'No Tags',
        });

        expect(bookmark.tags).toEqual([]);
    });
});
```

Run tests:

```bash
npm test bookmark.server.test.ts
```

---

## Step 9: Add E2E Test

Create `tests/bookmarks.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Bookmarks Feature', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/sign-in');
        await page.fill('input[name="email"]', 'admin@iridium.com');
        await page.fill('input[name="password"]', 'Admin123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');
    });

    test('can create a bookmark', async ({ page }) => {
        await page.goto('/bookmarks');

        await page.fill('input[name="url"]', 'https://example.com');
        await page.fill('input[name="title"]', 'Example Website');
        await page.fill(
            'textarea[name="description"]',
            'A test bookmark',
        );
        await page.fill('input[name="tags"]', 'test, example');

        await page.click('button[type="submit"]');

        await expect(page.getByText('Example Website')).toBeVisible();
        await expect(page.getByText('https://example.com')).toBeVisible();
        await expect(page.getByText('test')).toBeVisible();
    });

    test('validates URL format', async ({ page }) => {
        await page.goto('/bookmarks');

        await page.fill('input[name="url"]', 'not-a-url');
        await page.fill('input[name="title"]', 'Invalid URL');
        await page.click('button[type="submit"]');

        // Should show validation error or not submit
        await expect(page.getByText('Invalid URL')).not.toBeVisible();
    });

    test('can edit a bookmark', async ({ page }) => {
        await page.goto('/bookmarks');

        // Create bookmark
        await page.fill('input[name="url"]', 'https://original.com');
        await page.fill('input[name="title"]', 'Original Title');
        await page.click('button[type="submit"]');
        await expect(page.getByText('Original Title')).toBeVisible();

        // Edit bookmark
        await page.click('button:has-text("Edit")');
        await page.fill('input[name="title"]', 'Updated Title');
        await page.click('button:has-text("Save")');

        await expect(page.getByText('Updated Title')).toBeVisible();
        await expect(page.getByText('Original Title')).not.toBeVisible();
    });

    test('can delete a bookmark', async ({ page }) => {
        await page.goto('/bookmarks');

        // Create bookmark
        await page.fill('input[name="url"]', 'https://delete.com');
        await page.fill('input[name="title"]', 'To Be Deleted');
        await page.click('button[type="submit"]');
        await expect(page.getByText('To Be Deleted')).toBeVisible();

        // Delete it
        await page.click('button:has-text("Delete")');

        await expect(page.getByText('To Be Deleted')).not.toBeVisible();
    });

    test('bookmark link opens in new tab', async ({ page }) => {
        await page.goto('/bookmarks');

        // Create bookmark
        await page.fill('input[name="url"]', 'https://newtab.com');
        await page.fill('input[name="title"]', 'New Tab Test');
        await page.click('button[type="submit"]');

        // Check link attributes
        const link = page.getByRole('link', { name: 'New Tab Test' });
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
});
```

Run e2e test:

```bash
npm run e2e tests/bookmarks.spec.ts
```

---

## Congratulations! 🎉

You've built a complete CRUD feature following Iridium's patterns:

✅ Database schema with Prisma (including array field)
✅ Validation with Zod (URL validation + tag transformation)
✅ Model layer for data access
✅ RESTful API endpoint
✅ React UI with forms
✅ Unit tests
✅ E2E test

---

## What You Learned

### Key Patterns

1. **API-First Architecture** - Business logic in `/api/*`, UI in `/routes/*`
2. **Model Layer** - All database operations go through `app/models/`
3. **Validation** - Shared Zod schemas for server + client
4. **Type Safety** - Generated types from React Router + Prisma
5. **Error Handling** - PostHog logging + user-friendly messages

### Advanced Features You Used

- **URL Validation** - Zod's `.url()` validator
- **Tag Transformation** - Convert comma-separated strings to arrays
- **Array Fields** - PostgreSQL array support via Prisma
- **External Links** - Security with `target="_blank"` and `rel="noopener noreferrer"`

---

## Next Steps

### Enhance Your Bookmarks Feature

Add these features to practice more patterns:

1. **Search & Filter**
   - Search by title/description
   - Filter by tags
   - Sort by date or title

2. **Caching**
   - Add `createCachedClientLoader` for faster loads
   - Invalidate cache on mutations

3. **Pagination**
   - Add pagination for large bookmark lists
   - See `.github/instructions/crud-pattern.instructions.md`

4. **Public Sharing**
   - Share bookmark collections via public links
   - Practice role-based access control

### Build Your Own Feature

Now apply this pattern to your SaaS idea:

1. **Copy the structure** - Use bookmarks as a template
2. **Replace the model** - Change Bookmark → YourFeature
3. **Customize validation** - Add your business rules
4. **Add your fields** - Modify the schema for your needs

### Deep Dive Documentation

- [`.github/instructions/crud-pattern.instructions.md`](.github/instructions/crud-pattern.instructions.md) - Comprehensive CRUD guide
- [`.github/instructions/form-validation.instructions.md`](.github/instructions/form-validation.instructions.md) - Advanced validation
- [`docs/testing.md`](docs/testing.md) - Testing strategies
- [`FORM_BUILDING.md`](FORM_BUILDING.md) - Form patterns and examples
- [`IMAGE_HANDLING.md`](IMAGE_HANDLING.md) - File upload with Cloudinary

**Pro tip:** Keep [app/routes/api/profile.ts](app/routes/api/profile.ts) open as a reference - it's another canonical example of this pattern in production.
