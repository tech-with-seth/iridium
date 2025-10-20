---
mode: 'agent'
tools: ['githubRepo', 'search/codebase']
description: 'Generate a complete vertical slice feature across all application layers'
---

# Add Vertical Slice Feature

You are a Lead Web Developer implementing a **vertical slice** - a complete, production-ready feature that spans all layers of the application stack (database → API → UI). This is NOT a prototype; it's a fully functional, tested, and styled feature ready for production.

## What is a Vertical Slice?

A vertical slice is:

- ✅ **End-to-end** - Touches database, model layer, API, and UI
- ✅ **Self-contained** - Can be developed, tested, and deployed independently
- ✅ **Production-ready** - Includes validation, error handling, styling, and UX
- ✅ **Value-focused** - Delivers working functionality users can interact with
- ✅ **Pattern-proving** - Tests the full stack integration

**Reference:** See `.github/instructions/vertical-slice.instructions.md` for comprehensive documentation.

## Step 1: Define the Feature

Ask the user to clarify:

- **Feature purpose**: What should users be able to do? (e.g., "favorite posts", "create comments", "upload files")
- **User story**: Frame as "As a user, I want to [action] so that [benefit]"
- **Scope**: Is this Create, Read, Update, Delete, or a combination?
- **Authentication**: Does this require a logged-in user?
- **Data model**: What entities are involved? Any relations to existing models?

## Step 2: Plan the Vertical Slice

Based on the feature requirements, outline which layers will be affected:

### Layers Checklist

- [ ] **Schema Layer** - Zod validation schema
- [ ] **Database Layer** - Prisma model updates
- [ ] **Model Layer** - Data access functions
- [ ] **API Layer** - RESTful endpoint
- [ ] **UI Layer** - User interface route
- [ ] **Routing** - Route registration

Present this plan to the user and confirm before proceeding.

## Step 3: Implement Schema Layer (Validation)

**Location:** `app/lib/validations.ts`

Create Zod schema(s) for all data inputs:

```typescript
import { z } from 'zod';

// For creating/updating resources
export const createFeatureSchema = z.object({
    field1: z.string().min(1, 'Field is required').max(200, 'Too long'),
    field2: z.string().email('Invalid email').optional(),
    field3: z.number().min(0).max(100).default(50)
});

export type CreateFeatureData = z.infer<typeof createFeatureSchema>;

// For listing/filtering resources (if applicable)
export const listFeatureSchema = z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    sortBy: z.enum(['createdAt', 'name']).default('createdAt')
});

export type ListFeatureData = z.infer<typeof listFeatureSchema>;
```

**Key principles:**

- Descriptive error messages for users
- Sensible defaults where applicable
- Export TypeScript types with `z.infer`

## Step 4: Update Database Model (Data Layer)

**Location:** `prisma/schema.prisma`

Add or update Prisma models:

```prisma
model Feature {
  id          String   @id @default(cuid())
  field1      String
  field2      String?
  field3      Int      @default(50)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Indexes for performance
  @@index([userId])
  @@index([createdAt])
  @@map("feature")
}

// Update related models if needed
model User {
  // ... existing fields
  features    Feature[]  // Add relation
}
```

**After schema changes, run:**

```bash
npx prisma migrate dev --name add_feature_name
npx prisma generate
```

**Key principles:**

- Use semantic field names
- Add indexes for frequently queried fields
- Use `@map()` for table names (lowercase, snake_case)
- Define cascading deletes appropriately
- Include timestamps (`createdAt`, `updatedAt`)

## Step 5: Create Model Functions (Data Access Layer)

**Location:** `app/models/[feature].server.ts`

Create a new model file with all database operations for this feature:

```typescript
import { prisma } from '~/db.server';

/**
 * Get a single feature by ID
 */
export function getFeature(id: string) {
    return prisma.feature.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });
}

/**
 * Get all features for a user
 */
export function getUserFeatures({
    userId,
    limit = 20,
    offset = 0,
    sortBy = 'createdAt' as const
}: {
    userId: string;
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'name';
}) {
    return prisma.feature.findMany({
        where: { userId },
        orderBy: { [sortBy]: 'desc' },
        take: limit,
        skip: offset,
        include: {
            user: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
}

/**
 * Create a new feature
 */
export function createFeature({
    userId,
    data
}: {
    userId: string;
    data: {
        field1: string;
        field2?: string;
        field3?: number;
    };
}) {
    return prisma.feature.create({
        data: {
            ...data,
            userId
        }
    });
}

/**
 * Update a feature
 */
export function updateFeature({
    id,
    userId,
    data
}: {
    id: string;
    userId: string;
    data: {
        field1?: string;
        field2?: string;
        field3?: number;
    };
}) {
    return prisma.feature.updateMany({
        where: {
            id,
            userId // Authorization: only owner can update
        },
        data
    });
}

/**
 * Delete a feature
 */
export function deleteFeature({ id, userId }: { id: string; userId: string }) {
    return prisma.feature.deleteMany({
        where: {
            id,
            userId // Authorization: only owner can delete
        }
    });
}

/**
 * Count user's total features
 */
export function countUserFeatures(userId: string) {
    return prisma.feature.count({
        where: { userId }
    });
}
```

**Key principles:**

- One model file per entity
- JSDoc comments explaining each function
- Authorization checks in update/delete (via `where` clause)
- Use `updateMany`/`deleteMany` for authorization (returns count)
- Consistent naming: `getFeature`, `createFeature`, `updateFeature`, `deleteFeature`

## Step 6: Create API Endpoint (Business Logic Layer)

**Location:** `app/routes/api/[feature].ts`

Create RESTful API endpoint with loader (GET) and action (POST/PUT/DELETE):

```typescript
import type { Route } from './+types/[feature]';
import { json, data } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { getValidatedFormData } from '~/lib/form-validation.server';
import { createFeatureSchema, type CreateFeatureData } from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    getUserFeatures,
    countUserFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
    getFeature
} from '~/models/[feature].server';

// GET - List user's features
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    try {
        const [features, total] = await Promise.all([
            getUserFeatures({ userId: user.id }),
            countUserFeatures(user.id)
        ]);

        return data({ features, total });
    } catch (error) {
        console.error('Failed to fetch features:', error);
        return data({ error: 'Failed to fetch features' }, { status: 500 });
    }
}

// POST/PUT/DELETE - Create, Update, Delete
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    if (request.method === 'POST') {
        const { data: validatedData, errors } =
            await getValidatedFormData<CreateFeatureData>(
                request,
                zodResolver(createFeatureSchema)
            );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        try {
            const feature = await createFeature({
                userId: user.id,
                data: validatedData!
            });

            return data({ success: true, feature });
        } catch (error) {
            console.error('Failed to create feature:', error);
            return data({ error: 'Failed to create feature' }, { status: 500 });
        }
    }

    if (request.method === 'PUT') {
        const { data: validatedData, errors } =
            await getValidatedFormData<CreateFeatureData>(
                request,
                zodResolver(createFeatureSchema)
            );

        if (errors) {
            return data({ errors }, { status: 400 });
        }

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return data({ error: 'Feature ID required' }, { status: 400 });
        }

        try {
            const result = await updateFeature({
                id,
                userId: user.id,
                data: validatedData!
            });

            if (result.count === 0) {
                return data(
                    { error: 'Feature not found or unauthorized' },
                    { status: 404 }
                );
            }

            return data({ success: true });
        } catch (error) {
            console.error('Failed to update feature:', error);
            return data({ error: 'Failed to update feature' }, { status: 500 });
        }
    }

    if (request.method === 'DELETE') {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return data({ error: 'Feature ID required' }, { status: 400 });
        }

        try {
            const result = await deleteFeature({
                id,
                userId: user.id
            });

            if (result.count === 0) {
                return data(
                    { error: 'Feature not found or unauthorized' },
                    { status: 404 }
                );
            }

            return data({ success: true });
        } catch (error) {
            console.error('Failed to delete feature:', error);
            return data({ error: 'Failed to delete feature' }, { status: 500 });
        }
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
```

**Key principles:**

- `requireUser(request)` for authentication
- `getValidatedFormData()` for validation
- Call model functions (NEVER direct Prisma calls)
- Proper HTTP status codes (200, 400, 404, 500)
- Try-catch blocks for error handling
- Return `{ errors }` for validation errors
- Return `{ error }` for general errors
- Return `{ success: true }` on success

## Step 7: Register API Route

**Location:** `app/routes.ts`

Add route to `api` prefix:

```typescript
import { type RouteConfig, route, prefix } from '@react-router/dev/routes';

export default [
    // ... existing routes

    ...prefix('api', [
        // ... existing API routes
        route('[feature]', 'routes/api/[feature].ts')
    ])
] satisfies RouteConfig;
```

## Step 8: Create UI Route (Presentation Layer)

**Location:** `app/routes/[feature].tsx`

Create user-facing route with loader and component:

```typescript
import { useFetcher } from 'react-router';
import type { Route } from './+types/[feature]';
import { Container } from '~/components/Container';
import { Card } from '~/components/Card';
import { Button } from '~/components/Button';
import { TextInput } from '~/components/TextInput';
import { Alert } from '~/components/Alert';
import { useValidatedForm } from '~/lib/form-hooks';
import { createFeatureSchema, type CreateFeatureData } from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';

// Loader: Fetch initial data
export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const apiUrl = new URL('/api/[feature]', url.origin);

    const response = await fetch(apiUrl, {
        headers: request.headers, // Pass auth cookies
    });

    if (!response.ok) {
        throw new Response('Failed to load features', { status: response.status });
    }

    return response.json();
}

export default function FeaturePage({ loaderData }: Route.ComponentProps) {
    return (
        <>
            <title>Features - TWS Foundations</title>
            <meta name="description" content="Manage your features" />

            <Container className="pt-12">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Features</h1>
                </div>

                <div className="grid gap-6">
                    <CreateFeatureForm />

                    {loaderData.total === 0 ? (
                        <Card>
                            <p className="text-base-content/70">No features yet. Create your first one above!</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {loaderData.features.map((feature: any) => (
                                <FeatureCard key={feature.id} feature={feature} />
                            ))}
                        </div>
                    )}
                </div>
            </Container>
        </>
    );
}

// Create form component
function CreateFeatureForm() {
    const fetcher = useFetcher();

    const { register, handleSubmit, formState: { errors }, reset } = useValidatedForm({
        resolver: zodResolver(createFeatureSchema),
        errors: fetcher.data?.errors,
    });

    const onSubmit = (data: CreateFeatureData) => {
        const formData = new FormData();
        formData.append('field1', data.field1);
        if (data.field2) formData.append('field2', data.field2);
        formData.append('field3', String(data.field3 ?? 50));

        fetcher.submit(formData, {
            method: 'POST',
            action: '/api/[feature]',
        });
    };

    // Reset form on success
    if (fetcher.data?.success && fetcher.state === 'idle') {
        reset();
    }

    const isLoading = fetcher.state === 'submitting';

    return (
        <Card>
            <h2 className="text-xl font-semibold mb-4">Create New Feature</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextInput
                    {...register('field1')}
                    label="Field 1"
                    placeholder="Enter field 1"
                    error={errors.field1?.message}
                    required
                />

                <TextInput
                    {...register('field2')}
                    label="Field 2"
                    placeholder="Enter field 2 (optional)"
                    error={errors.field2?.message}
                />

                <TextInput
                    {...register('field3', { valueAsNumber: true })}
                    type="number"
                    label="Field 3"
                    placeholder="Enter a number"
                    error={errors.field3?.message}
                />

                {fetcher.data?.success && (
                    <Alert status="success">Feature created successfully!</Alert>
                )}

                {fetcher.data?.error && (
                    <Alert status="error">{fetcher.data.error}</Alert>
                )}

                <Button
                    type="submit"
                    status="primary"
                    loading={isLoading}
                    disabled={isLoading}
                >
                    Create Feature
                </Button>
            </form>
        </Card>
    );
}

// Feature card component with edit/delete
function FeatureCard({ feature }: { feature: any }) {
    const fetcher = useFetcher();

    function handleDelete() {
        if (!confirm('Are you sure you want to delete this feature?')) return;

        fetcher.submit(null, {
            method: 'DELETE',
            action: `/api/[feature]?id=${feature.id}`,
        });
    }

    const isDeleting = fetcher.state === 'submitting';

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold">{feature.field1}</h3>
                    {feature.field2 && (
                        <p className="text-base-content/70">{feature.field2}</p>
                    )}
                    <p className="text-sm text-base-content/50 mt-2">
                        Created {new Date(feature.createdAt).toLocaleDateString()}
                    </p>
                </div>

                <Button
                    onClick={handleDelete}
                    variant="ghost"
                    status="error"
                    size="sm"
                    loading={isDeleting}
                    disabled={isDeleting}
                >
                    Delete
                </Button>
            </div>

            {fetcher.data?.error && (
                <Alert status="error" className="mt-4">
                    {fetcher.data.error}
                </Alert>
            )}
        </Card>
    );
}
```

**Key principles:**

- Loader calls API endpoint (consistent data fetching)
- `useValidatedForm` for client-side validation
- `useFetcher` for API calls (no page reload)
- Loading states for better UX
- Success/error feedback with `Alert` component
- DaisyUI styling via existing components
- React 19 meta tags (`<title>`, `<meta>`)

## Step 9: Register UI Route

**Location:** `app/routes.ts`

Add route under appropriate layout:

```typescript
// For protected routes
layout('routes/authenticated.tsx', [
    // ... existing routes
    route('[feature]', 'routes/[feature].tsx'),
]),

// For public routes
route('[feature]', 'routes/[feature].tsx'),
```

## Step 10: Generate Types

Run type generation to create route types:

```bash
npm run typecheck
```

This generates types in `./+types/[feature]` for `Route.LoaderArgs`, `Route.ActionArgs`, `Route.ComponentProps`.

## Step 11: Manual Testing

Before marking the feature complete, manually test:

### ✅ Happy Path

- [ ] Feature loads without errors
- [ ] Can create new resources with valid data
- [ ] Can view list of resources
- [ ] Can update existing resources (if applicable)
- [ ] Can delete resources (if applicable)
- [ ] Success messages display correctly
- [ ] Data persists in database
- [ ] UI updates reflect changes

### ✅ Validation

- [ ] Required fields show errors when empty
- [ ] Invalid formats rejected with helpful messages
- [ ] Server-side validation catches malicious inputs
- [ ] Field-level errors display correctly
- [ ] Form-level errors display correctly

### ✅ Error Handling

- [ ] Network errors show user-friendly messages
- [ ] Database errors don't crash the app
- [ ] Unauthorized access returns 403/404
- [ ] Empty states render correctly

### ✅ UX & Styling

- [ ] Loading states display during async operations
- [ ] Buttons disabled during submission
- [ ] DaisyUI styling applied correctly
- [ ] Responsive design works on mobile
- [ ] Accessibility attributes present (ARIA, semantic HTML)

## Vertical Slice Checklist

Use this to verify completeness:

### ✅ Schema Layer

- [ ] Zod validation schema defined in `app/lib/validations.ts`
- [ ] TypeScript types exported with `z.infer`
- [ ] Validation messages are user-friendly

### ✅ Database Layer

- [ ] Prisma model added/updated in `schema.prisma`
- [ ] Migrations created and run (`npx prisma migrate dev`)
- [ ] Prisma client regenerated (`npx prisma generate`)
- [ ] Relations defined correctly
- [ ] Indexes added for performance

### ✅ Model Layer

- [ ] Model file created in `app/models/[feature].server.ts`
- [ ] CRUD functions implemented (get, create, update, delete)
- [ ] Authorization checks in update/delete functions
- [ ] JSDoc comments for all functions

### ✅ API Layer

- [ ] API endpoint created in `app/routes/api/[feature].ts`
- [ ] `loader` for GET requests
- [ ] `action` for POST/PUT/DELETE requests
- [ ] `requireUser(request)` for authentication
- [ ] `getValidatedFormData()` for validation
- [ ] Calls model functions (no direct Prisma)
- [ ] Proper error handling (try-catch)
- [ ] Correct HTTP status codes
- [ ] Route registered in `app/routes.ts`

### ✅ UI Layer

- [ ] UI route created in `app/routes/[feature].tsx`
- [ ] Loader fetches initial data from API
- [ ] Form uses `useValidatedForm` + `useFetcher`
- [ ] Client-side validation (instant feedback)
- [ ] Loading states displayed
- [ ] Error messages shown (field + form level)
- [ ] Success feedback provided
- [ ] DaisyUI styling applied
- [ ] Route registered in `app/routes.ts`

### ✅ Quality

- [ ] Types generated (`npm run typecheck` passes)
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Responsive design tested
- [ ] Manual testing completed (all paths)

## Common Pitfalls to Avoid

### ❌ Incomplete Slice

**Problem:** Only implementing UI without API or database.

**Solution:** Always implement ALL layers. A vertical slice is not done until it spans the full stack.

---

### ❌ Skipping Validation

**Problem:** "I'll add validation later."

**Solution:** Validation is non-negotiable. Add Zod schema and server-side validation from the start.

---

### ❌ Direct Prisma Calls in Routes

**Problem:** Calling `prisma.*` directly in route loaders/actions.

**Solution:** Always use model functions from `~/models/[feature].server.ts`.

---

### ❌ No Error Handling

**Problem:** Only implementing happy path.

**Solution:** Add try-catch blocks in API, display errors in UI, handle edge cases.

---

### ❌ Ignoring UX

**Problem:** No loading states, no feedback, broken forms.

**Solution:** Use `fetcher.state`, show loading spinners, display success/error messages.

---

### ❌ Styling Last

**Problem:** "I'll make it pretty later."

**Solution:** Apply DaisyUI styling as you build. Design often drives refactoring.

## Reference Implementations

See these files as canonical examples:

- **Validation Schema:** `app/lib/validations.ts` - `profileUpdateSchema`
- **Model Layer:** `app/models/user.server.ts` - User CRUD operations
- **API Endpoint:** `app/routes/api/profile.ts` - Profile API (GET + PUT + DELETE)
- **UI Route:** `app/routes/profile.tsx` - Profile page with form
- **Component Patterns:** `.github/instructions/component-patterns.instructions.md`
- **CRUD Pattern:** `.github/instructions/crud-pattern.instructions.md`
- **Form Validation:** `.github/instructions/form-validation.instructions.md`

## Summary

A vertical slice is complete when:

1. ✅ It spans all architectural layers (schema → database → model → API → UI)
2. ✅ It follows established patterns (CRUD, validation, auth, styling)
3. ✅ It includes error handling and validation
4. ✅ It has proper UX (loading states, feedback, styling)
5. ✅ It is manually tested (happy path + edge cases)
6. ✅ It is ready for production deployment

**Golden Rule:** If you can't demo it to a user and have them successfully use it, it's not a complete vertical slice.
