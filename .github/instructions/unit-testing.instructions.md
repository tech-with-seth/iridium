---
applyTo: '**/*.test.ts,**/*.test.tsx,vitest.config.ts'
---

# Testing with Vitest

## Running Tests

```bash
npm test               # Watch mode (development)
npm run test:run       # Single run (CI)
npm run test:ui        # Visual test runner
npm run test:coverage  # Coverage report
```

## Test Structure

Tests are co-located with source files:

```
app/
├── lib/
│   ├── form-validation.server.ts
│   └── form-validation.server.test.ts
└── models/
    ├── user.server.ts
    └── user.server.test.ts
```

Naming: `*.test.ts` (utilities), `*.test.tsx` (components).

## Model Layer Testing (Mock Prisma)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserProfile } from './user.server';

vi.mock('~/db.server', () => ({
    prisma: {
        user: { findUnique: vi.fn(), update: vi.fn() },
    },
}));

import { prisma } from '~/db.server';

describe('User Model', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('fetches user profile by ID', async () => {
        const mockUser = { id: 'user-123', email: 'test@example.com' };
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

        const result = await getUserProfile('user-123');

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 'user-123' },
            select: expect.objectContaining({ id: true, email: true }),
        });
        expect(result).toEqual(mockUser);
    });
});
```

## Test Utilities (`app/test/utils.tsx`)

| Utility | Purpose |
|---------|---------|
| `renderWithProviders(ui)` | Render with React Router + auth context |
| `createMockUser(overrides?)` | Mock user object |
| `createMockRequest(options?)` | Mock `Request` for loaders/actions |
| `createMockFormData(data)` | `FormData` from plain object |

## Mocking Patterns

### Module Mocking

```typescript
vi.mock('~/db.server', () => ({
    prisma: { user: { findUnique: vi.fn(), create: vi.fn() } },
}));
import { prisma } from '~/db.server'; // Import AFTER mocking
```

### Typing Async Module Imports

```typescript
// ✅ CORRECT — type the importOriginal result
vi.mock('@react-email/components', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@react-email/components')>();
    return { ...actual, render: vi.fn().mockResolvedValue('<html>Mocked</html>') };
});

// ❌ WRONG — missing type causes "Spread types may only be created from object types"
```

### Typing Mock Functions in Helpers

```typescript
// ✅ Use `any` for flexible mock type acceptance
function assertEmailSentTo(mockFn: any, recipient: string) {
    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ to: recipient }));
}

// ❌ ReturnType<typeof vi.fn> is too restrictive for SDK mock functions
```

### Clearing Mocks

```typescript
beforeEach(() => {
    vi.clearAllMocks();  // Clear call history
    vi.resetAllMocks();  // Also reset implementations
});
```

### Suppressing Console During Error Tests

```typescript
beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
});
```

## Core Principles

1. **Test behavior** — assert on rendered text, API responses, side effects (not implementation)
2. **Exercise public APIs** — interact via component props, exported functions
3. **Prioritize critical logic** — business rules, data mutations, security, error paths
4. **Isolate external effects** — mock network, DB, timers, singletons
5. **Keep tests focused** — one idea per test, Arrange–Act–Assert

## What to Test

- Business rules: validation, permissions, feature flags
- Data flow: transformations, Prisma query payloads (via mocks)
- User interactions: clicks, form submissions, modal open/close
- Side effects: analytics events, API calls, navigation (assert via mocks)
- Error handling: thrown/rejected paths, fallback UI
- Critical states: loading, empty, success, error

## What NOT to Test

- Third-party libraries (React Router, Prisma, DaisyUI)
- Pure styling / raw class names
- Implementation details / internal helpers
- Multiple variations of identical behavior
- Console output (unless logging IS the behavior)

## Style Guide

- Use `getByRole`, `getByLabel`, `getByText` (not `querySelector`)
- Descriptive names: `it('redirects to dashboard after sign-in')`
- Mock only what you need; reset in `beforeEach`
- Prefer explicit assertions over snapshots

## Quick Reference

| Pattern | Code |
|---------|------|
| Mock module | `vi.mock('~/db.server', () => ({ prisma: { ... } }))` |
| Mock function | `vi.fn().mockResolvedValue(data)` |
| Type-safe mock | `vi.mocked(prisma.user.findUnique)` |
| Clear mocks | `vi.clearAllMocks()` |
| Assert element | `expect(el).toBeInTheDocument()` |
| Query by role | `screen.getByRole('button', { name: /save/i })` |

## Example Files

- `app/lib/form-validation.server.test.ts`
- `app/models/user.server.test.ts`
- `app/models/email.server.test.ts`
