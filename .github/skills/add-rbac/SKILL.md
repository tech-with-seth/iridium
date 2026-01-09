---
name: add-rbac
description: Add role-based access control to routes and components. Use when protecting routes by role, implementing admin-only features, or checking user permissions.
---

# Add RBAC

Adds role-based access control following Iridium's hierarchical role system: USER → EDITOR → ADMIN.

## When to Use

- Protecting routes by role (admin-only, editor+, etc.)
- Adding role-based UI visibility
- Implementing permission checks in actions
- User asks to "add role protection", "admin only", or "check permissions"

## Role Hierarchy

```
USER → EDITOR → ADMIN
```

Higher roles inherit permissions from lower roles. An ADMIN has all EDITOR permissions.

| Role | Level | Purpose |
|------|-------|---------|
| `USER` | 1 | Default authenticated users |
| `EDITOR` | 2 | Content management |
| `ADMIN` | 3 | Full system access |

## Server-Side Protection (Required)

**Always use server-side checks. Client-side hooks are for UI only.**

### Require Admin Only

```typescript
import type { Route } from './+types/admin-page';
import { requireAdmin } from '~/lib/session.server';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireAdmin(request);
    // Only ADMIN can reach here
    return { user };
}
```

### Require Editor or Higher

```typescript
import type { Route } from './+types/content-page';
import { requireEditor } from '~/lib/session.server';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireEditor(request);
    // EDITOR or ADMIN can reach here
    return { user };
}
```

### Require Specific Roles

```typescript
import type { Route } from './+types/mixed-page';
import { requireRole } from '~/lib/session.server';
import { Role } from '~/generated/prisma/client';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireRole(request, [Role.EDITOR, Role.ADMIN]);
    // Only EDITOR or ADMIN
    return { user };
}
```

### Check Role Without Throwing

```typescript
import { hasRole } from '~/lib/session.server';
import { Role } from '~/generated/prisma/client';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    if (hasRole(user, Role.EDITOR)) {
        // User is EDITOR or ADMIN (respects hierarchy)
    }

    return { user, canEdit: hasRole(user, Role.EDITOR) };
}
```

## Client-Side UI (Display Only)

**Never rely on these for security.**

```tsx
import { useHasRole, useUserRole } from '~/hooks/useUserRole';
import { Role } from '~/generated/prisma/client';

export default function Dashboard({ loaderData }: Route.ComponentProps) {
    const isAdmin = useHasRole(Role.ADMIN);
    const isEditor = useHasRole(Role.EDITOR);

    return (
        <div>
            {isEditor && (
                <section>
                    <h2>Content Management</h2>
                    {/* Editor features */}
                </section>
            )}

            {isAdmin && (
                <section>
                    <h2>System Administration</h2>
                    {/* Admin-only features */}
                </section>
            )}
        </div>
    );
}
```

## Layout Middleware for Route Trees

Protect entire route sections with middleware:

```typescript
// app/routes/admin-layout.tsx
import type { Route } from './+types/admin-layout';
import { Outlet, redirect } from 'react-router';
import { getUserFromSession, hasRole } from '~/lib/session.server';
import { Role } from '~/generated/prisma/client';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);

    if (!user || !hasRole(user, Role.ADMIN)) {
        throw redirect('/unauthorized');
    }

    return { user };
}

export default function AdminLayout() {
    return <Outlet />;
}
```

Register in routes.ts:

```typescript
layout('routes/admin-layout.tsx', [
    route('/admin/users', 'routes/admin/users.tsx'),
    route('/admin/settings', 'routes/admin/settings.tsx'),
]),
```

## Model Layer Functions

```typescript
import {
    getUserProfile,
    getUsersByRole,
    updateUserRole,
    countUsersByRole,
} from '~/models/user.server';
import { Role } from '~/generated/prisma/client';

// Get users by role
const admins = await getUsersByRole(Role.ADMIN);

// Change a user's role (admin only)
await updateUserRole(targetUserId, Role.EDITOR);

// Get role statistics
const stats = await countUsersByRole();
// Returns: { USER: 45, EDITOR: 12, ADMIN: 3, total: 60 }
```

## Import Reference

```typescript
// Types
import { Role } from '~/generated/prisma/client';

// Server-side (use these for security)
import {
    hasRole,
    requireRole,
    requireEditor,
    requireAdmin,
} from '~/lib/session.server';

// Client-side (UI only)
import { useUserRole, useHasRole } from '~/hooks/useUserRole';
```

## Anti-Patterns

- Relying on client-side hooks for security
- Forgetting server-side checks in loaders/actions
- Not using hierarchy (manually checking all roles)
- Exposing admin routes without role protection

## Full Reference

See `.github/instructions/role-based-access-control.instructions.md` for comprehensive documentation.
