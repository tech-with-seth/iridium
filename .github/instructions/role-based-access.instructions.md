# Role-Based Access Control (RBAC)

This application implements a hierarchical role-based access control system with three role levels.

## Role Hierarchy

The system uses a hierarchical role model where higher roles inherit permissions from lower roles:

```
USER → EDITOR → ADMIN
```

### Role Definitions

| Role     | Level | Purpose                     | Intended Use                                                     |
| -------- | ----- | --------------------------- | ---------------------------------------------------------------- |
| `USER`   | 1     | Default authenticated users | All authenticated users start here                               |
| `EDITOR` | 2     | Content management          | Users who can create/edit content but not access system settings |
| `ADMIN`  | 3     | Full system access          | Users with complete administrative privileges                    |

### Role Assignment

- **New users** automatically receive the `USER` role upon sign-up (via Prisma schema default)
- **Role changes** must be performed by admins using `updateUserRole(userId, newRole)` from the model layer
- **Hierarchy enforcement**: Use `hasRole()` or `requireRole()` helpers that respect the hierarchy

## Database Schema

```prisma
enum Role {
  USER
  EDITOR
  ADMIN
}

model User {
  // ... other fields
  role Role @default(USER)
}
```

## Server-Side Authorization

**CRITICAL**: Always use server-side checks in loaders and actions. Client-side hooks are for UI only.

### Session Helpers (`app/lib/session.server.ts`)

#### `hasRole(user, role): boolean`

Checks if a user has a specific role or higher (respects hierarchy).

```typescript
import { hasRole } from '~/lib/session.server';
import { Role } from '~/generated/prisma/client';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    if (hasRole(user, Role.EDITOR)) {
        // User is EDITOR or ADMIN
    }
}
```

#### `requireRole(request, allowedRoles[]): Promise<User>`

Throws 403 if user doesn't have one of the allowed roles.

```typescript
import { requireRole } from '~/lib/session.server';
import { Role } from '~/generated/prisma/client';

export async function action({ request }: Route.ActionArgs) {
    // Only EDITOR and ADMIN can proceed
    const user = await requireRole(request, [Role.EDITOR, Role.ADMIN]);

    // ... perform action
}
```

#### `requireEditor(request): Promise<User>`

Convenience wrapper - requires EDITOR or ADMIN role.

```typescript
import { requireEditor } from '~/lib/session.server';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireEditor(request);

    // User is guaranteed to be EDITOR or ADMIN
}
```

#### `requireAdmin(request): Promise<User>`

Convenience wrapper - requires ADMIN role only.

```typescript
import { requireAdmin } from '~/lib/session.server';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireAdmin(request);

    // User is guaranteed to be ADMIN
}
```

## Model Layer Functions (`app/models/user.server.ts`)

### `getUserProfile(userId: string)`

Returns user profile including role field.

```typescript
import { getUserProfile } from '~/models/user.server';

const profile = await getUserProfile(userId);
console.log(profile.role); // "USER" | "EDITOR" | "ADMIN"
```

### `getUsersByRole(role: Role)`

Fetch all users with a specific role.

```typescript
import { getUsersByRole } from '~/models/user.server';
import { Role } from '~/generated/prisma/client';

const admins = await getUsersByRole(Role.ADMIN);
const editors = await getUsersByRole(Role.EDITOR);
```

### `updateUserRole(userId: string, newRole: Role)`

Change a user's role (admin operation only).

```typescript
import { updateUserRole } from '~/models/user.server';
import { Role } from '~/generated/prisma/client';

// In an admin action
export async function action({ request }: Route.ActionArgs) {
    await requireAdmin(request);

    const formData = await request.formData();
    const targetUserId = formData.get('userId') as string;

    const updatedUser = await updateUserRole(targetUserId, Role.EDITOR);

    return data({ success: true, user: updatedUser });
}
```

### `countUsersByRole()`

Get statistics on user counts by role.

```typescript
import { countUsersByRole } from '~/models/user.server';

const stats = await countUsersByRole();
// Returns: { USER: 45, EDITOR: 12, ADMIN: 3, total: 60 }
```

## Client-Side Hooks (`app/hooks/useUserRole.ts`)

**WARNING**: These hooks are for UI rendering only. Never rely on them for security.

### `useUserRole(): Role | null`

Get the current user's role.

```typescript
import { useUserRole } from '~/hooks/useUserRole';
import { Role } from '~/generated/prisma/client';

function MyComponent() {
    const role = useUserRole();

    return (
        <div>
            {role === Role.ADMIN && (
                <Button>Admin Panel</Button>
            )}
        </div>
    );
}
```

### `useHasRole(role: Role): boolean`

Check if user has a role or higher (respects hierarchy).

```typescript
import { useHasRole } from '~/hooks/useUserRole';
import { Role } from '~/generated/prisma/client';

function ContentEditor() {
    const canEdit = useHasRole(Role.EDITOR);

    return (
        <div>
            {canEdit && (
                <Button>Edit Content</Button>
            )}
        </div>
    );
}
```

## Route Protection Patterns

### API Routes (Manual Protection)

API routes don't have middleware, so use session helpers directly:

```typescript
// app/routes/api/admin/users.ts
import type { Route } from './+types/users';
import { requireAdmin } from '~/lib/session.server';
import { getUsersByRole } from '~/models/user.server';
import { Role } from '~/generated/prisma/client';

export async function loader({ request }: Route.LoaderArgs) {
    // Require admin access
    await requireAdmin(request);

    const users = await getUsersByRole(Role.USER);

    return data({ users });
}
```

### Layout Routes with Middleware

For protecting entire route trees, create layout routes with role middleware:

```typescript
// app/middleware/role.ts
import { redirect } from 'react-router';
import { getUser, hasRole } from '~/lib/session.server';
import { Role } from '~/generated/prisma/client';

export function roleMiddleware(requiredRole: Role) {
    return async function ({
        request,
        context
    }: {
        request: Request;
        context: any;
    }) {
        const user = await getUserFromSession(request);

        if (!user || !hasRole(user, requiredRole)) {
            throw redirect('/unauthorized');
        }

        // Optionally set in context
        // context.set(userContext, user);
    };
}
```

```typescript
// app/routes/admin-layout.tsx
import { Outlet } from 'react-router';
import type { Route } from './+types/admin-layout';
import { roleMiddleware } from '~/middleware/role';
import { Role } from '~/generated/prisma/client';

export const middleware: Route.MiddlewareFunction[] = [
    roleMiddleware(Role.ADMIN)
];

export default function AdminLayout() {
    return <Outlet />;
}
```

```typescript
// app/routes.ts
import { layout, route } from '@react-router/dev/routes';

export default [
    // ... other routes
    layout('routes/admin-layout.tsx', [
        route('/admin/users', 'routes/admin/users.tsx'),
        route('/admin/settings', 'routes/admin/settings.tsx')
    ])
];
```

## Common Patterns

### Mixed Role Access

Allow multiple roles to access a resource:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireRole(request, [Role.EDITOR, Role.ADMIN]);

    // Both editors and admins can access
}
```

### Role-Specific UI

Conditionally render UI based on role:

```typescript
import { useHasRole } from '~/hooks/useUserRole';
import { Role } from '~/generated/prisma/client';

function Dashboard() {
    const isEditor = useHasRole(Role.EDITOR);
    const isAdmin = useHasRole(Role.ADMIN);

    return (
        <div>
            <h1>Dashboard</h1>

            {isEditor && (
                <section>
                    <h2>Content Management</h2>
                    {/* Editor features */}
                </section>
            )}

            {isAdmin && (
                <section>
                    <h2>System Administration</h2>
                    {/* Admin features */}
                </section>
            )}
        </div>
    );
}
```

### Programmatic Role Checks

Check roles in component logic:

```typescript
import { useUserRole } from '~/hooks/useUserRole';
import { Role } from '~/generated/prisma/client';

function useCanDeleteContent() {
    const role = useUserRole();

    // Admins can delete anything, editors can delete their own content
    return role === Role.ADMIN || role === Role.EDITOR;
}
```

## Security Best Practices

1. **Server-side enforcement is mandatory**: Always use `requireRole()`, `requireEditor()`, or `requireAdmin()` in loaders and actions
2. **Client-side hooks are UI-only**: Never rely on `useUserRole()` or `useHasRole()` for security decisions
3. **Role changes must be audited**: Consider adding an audit log when roles are changed
4. **Principle of least privilege**: Start users with minimal permissions and grant higher roles as needed
5. **Middleware for route trees**: Use middleware on layout routes to protect entire sections
6. **Individual route protection**: Use session helpers for API routes and individual protected routes

## Migration Guide

If you have existing routes that need role protection:

### Before

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    // Anyone authenticated can access
}
```

### After (Editor+ only)

```typescript
import { requireEditor } from '~/lib/session.server';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireEditor(request);

    // Only EDITOR and ADMIN can access
}
```

### After (Admin only)

```typescript
import { requireAdmin } from '~/lib/session.server';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireAdmin(request);

    // Only ADMIN can access
}
```

## Import Reference

```typescript
// Types
import { Role } from '~/generated/prisma/client';

// Server-side helpers
import {
    hasRole,
    requireRole,
    requireEditor,
    requireAdmin
} from '~/lib/session.server';

// Model layer
import {
    getUserProfile,
    getUsersByRole,
    updateUserRole,
    countUsersByRole
} from '~/models/user.server';

// Client-side hooks (UI only)
import { useUserRole, useHasRole } from '~/hooks/useUserRole';
```
