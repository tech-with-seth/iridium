---
applyTo: 'app/routes/api/**/*.ts,app/models/**/*.server.ts'
---

# CRUD Pattern Instructions

## Architecture: API-First

```
app/routes/api/[feature].ts          # API Endpoint (Business Logic)
  ↳ loader()  - GET    (Read)
  ↳ action()  - POST   (Create), PUT (Update), DELETE (Delete)

app/routes/[feature].tsx              # UI Route (Presentation)
  ↳ loader()   - Fetch initial data
  ↳ Component  - Render UI + forms via useFetcher
```

Reference implementation: `app/routes/api/profile.ts` + `app/routes/profile.tsx`

## Implementation Steps

### 1. Validation Schema (`app/lib/validations.ts`)

```typescript
export const featureSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    bio: z.string().max(500).optional(),
});
export type FeatureData = z.infer<typeof featureSchema>;
```

### 2. API Endpoint (`app/routes/api/[feature].ts`)

```typescript
import type { Route } from './+types/[feature]';
import { data } from 'react-router';
import { requireUser } from '~/lib/session.server';
import { validateFormData } from '~/lib/form-validation.server';
import { featureSchema, type FeatureData } from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { prisma } from '~/db.server';

export async function loader({ request, params }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const resource = await prisma.feature.findUnique({ where: { id: params.id } });
    if (!resource) throw new Response('Not Found', { status: 404 });
    if (resource.userId !== user.id) throw new Response('Forbidden', { status: 403 });
    return data({ resource });
}

export async function action({ request, params }: Route.ActionArgs) {
    const user = await requireUser(request);

    if (request.method === 'POST') {
        const formData = await request.formData();
        const { data: validated, errors } = await validateFormData<FeatureData>(
            formData, zodResolver(featureSchema)
        );
        if (errors) return data({ errors }, { status: 400 });
        const resource = await prisma.feature.create({
            data: { ...validated!, userId: user.id }
        });
        return data({ success: true, resource }, { status: 201 });
    }

    if (request.method === 'PUT') {
        const formData = await request.formData();
        const { data: validated, errors } = await validateFormData<FeatureData>(
            formData, zodResolver(featureSchema)
        );
        if (errors) return data({ errors }, { status: 400 });
        const existing = await prisma.feature.findUnique({ where: { id: params.id } });
        if (!existing || existing.userId !== user.id) throw new Response('Forbidden', { status: 403 });
        const resource = await prisma.feature.update({ where: { id: params.id }, data: validated! });
        return data({ success: true, resource });
    }

    if (request.method === 'DELETE') {
        const existing = await prisma.feature.findUnique({ where: { id: params.id } });
        if (!existing || existing.userId !== user.id) throw new Response('Forbidden', { status: 403 });
        await prisma.feature.delete({ where: { id: params.id } });
        return data({ success: true });
    }

    return data({ error: 'Method not allowed' }, { status: 405 });
}
```

### 3. Register Route (`app/routes.ts`)

```typescript
...prefix('api', [
    route('[feature]/:id', 'routes/api/[feature].ts'),
])
```

### 4. UI Route — consume via `useFetcher`

```typescript
const fetcher = useFetcher();
const { register, handleSubmit } = useValidatedForm<FeatureData>({
    resolver: zodResolver(featureSchema),
    errors: fetcher.data?.errors,
    defaultValues: loaderData.resource,
});

const onSubmit = (formData: FeatureData) => {
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => v != null && fd.append(k, String(v)));
    fetcher.submit(fd, { method: 'PUT', action: '/api/[feature]' });
};
```

## Intent-Based Routing

For multiple operations at a single endpoint (e.g., sign in vs sign up):

```typescript
export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get('intent') as string;

    if (intent === 'create') {
        const { data: validated, errors } = await validateFormData<CreateData>(
            formData, zodResolver(createSchema)
        );
        if (errors) return data({ errors }, { status: 400 });
        // handle creation...
    }

    if (intent === 'update') {
        const { data: validated, errors } = await validateFormData<UpdateData>(
            formData, zodResolver(updateSchema)
        );
        if (errors) return data({ errors }, { status: 400 });
        // handle update...
    }
}
```

## Security

- **Always** call `requireUser(request)` — API routes have no middleware protection
- Check resource ownership before update/delete: `if (resource.userId !== user.id) throw new Response('Forbidden', { status: 403 })`
- **Always** validate on server with `validateFormData()` — never trust client alone
- Return 400 (validation), 403 (authorization), 404 (not found), 500 (server error)

## Anti-Patterns

- ❌ Business logic in UI routes instead of API endpoints
- ❌ Skipping server-side validation
- ❌ Not checking authorization on protected resources
- ❌ Missing `requireUser()` on protected API endpoints
- ❌ Converting FormData to plain objects (use `validateFormData` directly)
- ❌ Bypassing API to access DB from UI routes (except loader initial data)
