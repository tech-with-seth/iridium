# Refactoring Checklist

Use this checklist when refactoring code in the Iridium codebase.

## Pre-Refactoring

- [ ] Tests exist for the code being refactored
- [ ] I understand the full context (consumers, related files)
- [ ] TypeScript compiles cleanly (`npm run typecheck`)
- [ ] I have identified specific issues to address

## Code Quality Checks

### Imports & Dependencies

- [ ] No unused imports
- [ ] Route types use `./+types/` (never `../+types/`)
- [ ] Prisma types from `~/generated/prisma/client`
- [ ] Prisma client from `~/db.server`
- [ ] Using `cx()` from `~/cva.config` (not `cn()`)

### Patterns

- [ ] No Prisma calls in routes (use model layer)
- [ ] No `useLoaderData()` hook (use `loaderData` prop)
- [ ] No `useEffect` for data fetching (use loader)
- [ ] No `any` types (create proper types)
- [ ] CVA pattern for component variants

### Simplification

- [ ] No dead code or unused variables
- [ ] No magic numbers/strings (use constants)
- [ ] No deeply nested conditionals
- [ ] No duplicate logic (extract utilities)
- [ ] Early returns instead of nested if/else

### Documentation

- [ ] JSDoc on exported functions
- [ ] Inline comments explain "why", not "what"
- [ ] No outdated comments

## Post-Refactoring

- [ ] All tests pass (`npm run test:run`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] E2E tests pass (`npm run e2e`)
- [ ] No new linting errors
- [ ] Behavior is unchanged
- [ ] Code is more readable

## Common Refactoring Patterns

### Extract to Constant

```typescript
// Before
if (password.length < 8) { ... }

// After
const MIN_PASSWORD_LENGTH = 8;
if (password.length < MIN_PASSWORD_LENGTH) { ... }
```

### Extract to Function

```typescript
// Before (in multiple places)
const fullName = user.firstName + ' ' + user.lastName;

// After
function getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
}
```

### Early Return

```typescript
// Before
function process(data) {
    if (data) {
        if (data.valid) {
            return doWork(data);
        }
    }
    return null;
}

// After
function process(data) {
    if (!data?.valid) return null;
    return doWork(data);
}
```

### Object Lookup

```typescript
// Before
function getColor(status) {
    if (status === 'success') return 'green';
    if (status === 'error') return 'red';
    if (status === 'warning') return 'yellow';
    return 'gray';
}

// After
const STATUS_COLORS = {
    success: 'green',
    error: 'red',
    warning: 'yellow',
} as const;

function getColor(status: Status) {
    return STATUS_COLORS[status] ?? 'gray';
}
```

### Move to Model Layer

```typescript
// Before (in route)
const users = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, name: true },
});

// After (in models/user.server.ts)
export function getAdminUsers() {
    return prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, email: true, name: true },
    });
}

// In route
import { getAdminUsers } from '~/models/user.server';
const users = await getAdminUsers();
```
