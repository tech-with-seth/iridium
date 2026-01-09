---
name: refactor-code
description: Simplify code, remove duplication, and improve readability following Iridium patterns. Use when cleaning up, simplifying, or restructuring code.
---

# Refactor Code

Simplifies and restructures code to improve maintainability, reduce duplication, and enhance readability while preserving functionality.

## When to Use

- Code has grown complex and hard to understand
- Duplicate logic exists across files
- User asks to "clean up", "simplify", or "refactor"
- After feature implementation to polish code

## Core Principles

1. **Simplify ruthlessly** - Remove unnecessary complexity
2. **Preserve behavior** - Refactoring shouldn't change functionality
3. **Make incremental changes** - One logical step at a time
4. **Follow patterns** - Match existing Iridium conventions

## Pre-Refactoring Checklist

- [ ] Tests exist for the code (write them if missing)
- [ ] Understand full context (related files, consumers)
- [ ] Identify specific issues to address
- [ ] TypeScript compiles cleanly (`npm run typecheck`)

## Refactoring Patterns

### 1. Remove Dead Code

```typescript
// ❌ Before: Unused imports and variables
import { useState, useEffect, useMemo } from 'react';
import { data, redirect, href } from 'react-router';

export function Component({ loaderData }: Route.ComponentProps) {
    const unusedState = useState(false);
    const { user, profile } = loaderData;
    return <div>{user.name}</div>;
}

// ✅ After: Only used imports remain
import type { Route } from './+types/component';

export function Component({ loaderData }: Route.ComponentProps) {
    const { user } = loaderData;
    return <div>{user.name}</div>;
}
```

### 2. Extract Reusable Logic

```typescript
// ❌ Before: Duplicated validation in multiple routes
export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const formData = await request.formData();
    const name = formData.get('name') as string;

    if (!name || name.length < 2) {
        return data({ error: 'Name too short' }, { status: 400 });
    }
    if (name.length > 100) {
        return data({ error: 'Name too long' }, { status: 400 });
    }
    // ... more validation
}

// ✅ After: Use shared validation with Zod
import { profileUpdateSchema } from '~/lib/validations';
import { validateFormData } from '~/lib/form-validation.server';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const formData = await request.formData();

    const { data: validData, errors } = await validateFormData(
        formData,
        zodResolver(profileUpdateSchema),
    );

    if (errors) {
        return data({ errors }, { status: 400 });
    }
    // ... proceed with validated data
}
```

### 3. Simplify Conditionals

```typescript
// ❌ Before: Nested conditionals
function getStatusBadge(user: User) {
    if (user.role === 'ADMIN') {
        if (user.verified) {
            return 'badge-success';
        } else {
            return 'badge-warning';
        }
    } else if (user.role === 'EDITOR') {
        return 'badge-info';
    } else {
        return 'badge-ghost';
    }
}

// ✅ After: Early returns and object lookup
const ROLE_BADGES: Record<Role, string> = {
    ADMIN: 'badge-success',
    EDITOR: 'badge-info',
    USER: 'badge-ghost',
};

function getStatusBadge(user: User) {
    if (user.role === 'ADMIN' && !user.verified) {
        return 'badge-warning';
    }
    return ROLE_BADGES[user.role];
}
```

### 4. Replace Magic Values

```typescript
// ❌ Before: Magic numbers and strings
if (password.length < 8) {
    return { error: 'Password too short' };
}
const maxRetries = 3;
const timeout = 5000;

// ✅ After: Named constants
const VALIDATION = {
    MIN_PASSWORD_LENGTH: 8,
    MAX_RETRIES: 3,
    REQUEST_TIMEOUT_MS: 5000,
} as const;

if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters` };
}
```

### 5. Extract Components

```typescript
// ❌ Before: Large component with embedded JSX
function Dashboard({ loaderData }: Route.ComponentProps) {
    const { user, stats, notifications } = loaderData;

    return (
        <div>
            <div className="card">
                <div className="card-body">
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <span className={`badge ${ROLE_BADGES[user.role]}`}>
                        {user.role}
                    </span>
                </div>
            </div>
            {/* ... 100 more lines ... */}
        </div>
    );
}

// ✅ After: Extracted sub-component
function UserCard({ user }: { user: User }) {
    return (
        <div className="card">
            <div className="card-body">
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                <RoleBadge role={user.role} />
            </div>
        </div>
    );
}

function Dashboard({ loaderData }: Route.ComponentProps) {
    const { user, stats, notifications } = loaderData;

    return (
        <div>
            <UserCard user={user} />
            <StatsGrid stats={stats} />
            <NotificationList items={notifications} />
        </div>
    );
}
```

### 6. Use TypeScript Discriminated Unions

```typescript
// ❌ Before: String checks and type assertions
type ApiResponse = {
    success: boolean;
    data?: any;
    error?: string;
};

function handleResponse(response: ApiResponse) {
    if (response.success) {
        console.log(response.data); // Type is any
    } else {
        console.error(response.error); // Might be undefined
    }
}

// ✅ After: Discriminated union
type ApiResponse =
    | { success: true; data: UserData }
    | { success: false; error: string };

function handleResponse(response: ApiResponse) {
    if (response.success) {
        console.log(response.data); // Type is UserData
    } else {
        console.error(response.error); // Type is string
    }
}
```

### 7. Consolidate Duplicate Types

```typescript
// ❌ Before: Same type defined in multiple places
// file1.ts
type User = { id: string; email: string; name: string };

// file2.ts
interface UserData { id: string; email: string; name: string };

// ✅ After: Single source of truth
// types/user.ts
export type { User } from '~/generated/prisma/client';

// Or for custom types:
export interface SafeUser {
    id: string;
    email: string;
    name: string | null;
}
```

## Critical Questions

Before refactoring, ask:

1. "Can this be done in fewer lines without sacrificing clarity?"
2. "Is there an existing utility or component that does this?"
3. "Would a junior developer understand this in 30 seconds?"
4. "Does this change preserve the existing behavior?"

## Post-Refactoring Checklist

- [ ] All tests still pass (`npm run test:run`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] No new linting errors
- [ ] Behavior is unchanged (manual verification)
- [ ] Code is more readable/maintainable
- [ ] No dead code or unused imports remain

## Iridium-Specific Refactoring

### Move Prisma Calls to Model Layer

```typescript
// ❌ Before: Prisma in route
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const items = await prisma.item.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
    });
    return data({ items });
}

// ✅ After: Use model layer
import { getItemsByUser } from '~/models/item.server';

export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);
    const items = await getItemsByUser(user.id);
    return data({ items });
}
```

### Fix Import Paths

```typescript
// ❌ Before: Wrong imports
import { PrismaClient } from '@prisma/client';
import type { Route } from '../+types/dashboard';
import { cn } from '~/lib/utils';

// ✅ After: Correct Iridium imports
import { prisma } from '~/db.server';
import type { Route } from './+types/dashboard';
import { cx } from '~/cva.config';
```

### Convert to CVA Pattern

```typescript
// ❌ Before: Inline class conditionals
function Badge({ type }: { type: 'success' | 'error' | 'info' }) {
    const className = `badge ${
        type === 'success' ? 'badge-success' :
        type === 'error' ? 'badge-error' : 'badge-info'
    }`;
    return <span className={className} />;
}

// ✅ After: CVA variant pattern
const badgeVariants = cva({
    base: 'badge',
    variants: {
        type: {
            success: 'badge-success',
            error: 'badge-error',
            info: 'badge-info',
        },
    },
    defaultVariants: {
        type: 'info',
    },
});

function Badge({ type, className }: BadgeProps) {
    return <span className={cx(badgeVariants({ type }), className)} />;
}
```

## Anti-Patterns to Fix

| Anti-Pattern | Refactoring |
|--------------|-------------|
| `any` type | Find or create proper types |
| `useEffect` for data | Use route loader |
| Direct Prisma in routes | Move to model layer |
| `../+types/` import | Change to `./+types/` |
| `@prisma/client` import | Use `~/generated/prisma/client` |
| `cn()` for classes | Use `cx()` from cva.config |
| `useLoaderData()` hook | Use `loaderData` prop |

## Full Reference

See `.claude/agents/iridium-pair-programmer.md` for comprehensive code quality guidelines.
