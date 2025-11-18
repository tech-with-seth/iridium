# Testing with Vitest

This project uses [Vitest](https://vitest.dev/) for fast, modern unit and integration testing.

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Testing Patterns](#testing-patterns)
    - [Component Testing](#component-testing)
    - [Utility/Library Testing](#utilitylibrary-testing)
    - [Model Layer Testing](#model-layer-testing)
    - [Route Testing (Loader/Action)](#route-testing-loaderaction)
- [Test Utilities](#test-utilities)
- [Mocking](#mocking)
- [Coverage](#coverage)
- [Best Practices](#best-practices)

## Overview

Vitest is a modern testing framework built on Vite. It provides:

- Fast execution with native ESM support
- Instant watch mode with HMR
- TypeScript support out of the box
- Jest-compatible API
- Happy DOM for component testing
- Built-in coverage reporting

**Configuration:** `vitest.config.ts`

## Running Tests

```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI (visual test runner)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

All test files follow the naming convention:

- `*.test.ts` - For TypeScript utility/library tests
- `*.test.tsx` - For React component tests

Tests are co-located with their source files:

```
app/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx          # Component test
├── lib/
│   ├── form-validation.server.ts
│   └── form-validation.server.test.ts  # Utility test
└── models/
    ├── user.server.ts
    └── user.server.test.ts      # Model test
```

## Testing Patterns

### Component Testing

Use React Testing Library for component tests. Focus on user behavior, not implementation details.

**Example: `Button.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '~/test/utils';
import { Button } from './Button';

describe('Button Component', () => {
    it('renders with default props', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('btn');
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        const button = screen.getByRole('button');
        button.click();

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles loading state', () => {
        render(<Button loading>Loading</Button>);
        const button = screen.getByRole('button');

        expect(button).toBeDisabled();
        expect(button.querySelector('.loading-spinner')).toBeInTheDocument();
    });
});
```

**Key principles:**

- Query by role, label, or text (not class or test IDs)
- Test user interactions (clicks, typing, form submission)
- Verify rendered output, not implementation
- Use semantic queries: `getByRole`, `getByLabelText`, `getByText`

### Utility/Library Testing

Test pure functions and utility modules with straightforward input/output assertions.

**Example: `form-validation.server.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { validateFormData } from './form-validation.server';

const testSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
});

describe('validateFormData', () => {
    it('validates correct form data', async () => {
        const formData = new FormData();
        formData.append('name', 'John Doe');
        formData.append('email', 'john@example.com');

        const result = await validateFormData(
            formData,
            zodResolver(testSchema),
        );

        expect(result.data).toEqual({
            name: 'John Doe',
            email: 'john@example.com',
        });
        expect(result.errors).toBeUndefined();
    });

    it('returns errors for invalid data', async () => {
        const formData = new FormData();
        formData.append('name', '');
        formData.append('email', 'invalid-email');

        const result = await validateFormData(
            formData,
            zodResolver(testSchema),
        );

        expect(result.errors?.name).toBeDefined();
        expect(result.errors?.email).toBeDefined();
    });
});
```

### Model Layer Testing

Test database operations by mocking the Prisma client. Focus on verifying correct queries and data transformations.

**Example: `user.server.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Role } from '~/generated/prisma/client';
import { getUserProfile, updateUser } from './user.server';

// Mock the Prisma client
vi.mock('~/db.server', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));

import { prisma } from '~/db.server';

describe('User Model', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches user profile by ID', async () => {
        const mockProfile = {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            role: Role.USER,
        };

        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockProfile as any);

        const result = await getUserProfile('user-123');

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 'user-123' },
            select: expect.objectContaining({
                id: true,
                email: true,
                name: true,
            }),
        });
        expect(result).toEqual(mockProfile);
    });
});
```

**Key points:**

- Mock `~/db.server` with `vi.mock()`
- Verify Prisma methods are called with correct arguments
- Clear mocks between tests with `beforeEach()`
- Use `vi.mocked()` for type-safe mock access

### Route Testing (Loader/Action)

Test route loaders and actions by mocking dependencies and verifying responses.

**Example: `profile.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { loader, action } from './profile';
import { createMockRequest } from '~/test/utils';

// Mock dependencies
vi.mock('~/lib/session.server');
vi.mock('~/models/user.server');

import { requireUser } from '~/lib/session.server';
import { getUserProfile, updateUser } from '~/models/user.server';

describe('Profile Route', () => {
    describe('loader', () => {
        it('returns user profile', async () => {
            const mockUser = { id: 'user-123' };
            const mockProfile = { id: 'user-123', name: 'Test User' };

            vi.mocked(requireUser).mockResolvedValue(mockUser as any);
            vi.mocked(getUserProfile).mockResolvedValue(mockProfile as any);

            const request = createMockRequest({
                url: 'http://localhost:5173/profile',
            });
            const response = await loader({ request, params: {}, context: {} });

            const data = await response.json();
            expect(data.profile).toEqual(mockProfile);
        });
    });

    describe('action', () => {
        it('updates user profile on PUT request', async () => {
            const mockUser = { id: 'user-123' };
            const updatedUser = { id: 'user-123', name: 'Updated Name' };

            vi.mocked(requireUser).mockResolvedValue(mockUser as any);
            vi.mocked(updateUser).mockResolvedValue(updatedUser as any);

            const request = createMockRequest({
                method: 'PUT',
                url: 'http://localhost:5173/profile',
                body: { name: 'Updated Name' },
            });

            const response = await action({ request, params: {}, context: {} });
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(updateUser).toHaveBeenCalledWith({
                userId: 'user-123',
                data: expect.objectContaining({ name: 'Updated Name' }),
            });
        });
    });
});
```

## Test Utilities

Custom test utilities are located in `app/test/utils.tsx`:

### `renderWithProviders(ui, options?)`

Renders React components with necessary providers (React Router context, auth context, etc.).

```tsx
import { renderWithProviders, screen } from '~/test/utils';

renderWithProviders(<MyComponent />);
expect(screen.getByText('Hello')).toBeInTheDocument();
```

### `createMockUser(overrides?)`

Creates a mock user object for testing.

```tsx
import { createMockUser } from '~/test/utils';

const user = createMockUser({ role: 'ADMIN' });
```

### `createMockRequest(options?)`

Creates a mock `Request` object for testing loaders/actions.

```tsx
import { createMockRequest } from '~/test/utils';

const request = createMockRequest({
    method: 'POST',
    url: 'http://localhost:5173/api/profile',
    body: { name: 'John' },
});
```

### `createMockFormData(data)`

Creates a `FormData` object from a plain object.

```tsx
import { createMockFormData } from '~/test/utils';

const formData = createMockFormData({
    name: 'John',
    email: 'john@example.com',
});
```

## Mocking

Vitest provides powerful mocking capabilities via `vi.mock()`.

### Module Mocking

Mock entire modules before importing them:

```ts
vi.mock('~/db.server', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));

// Import AFTER mocking
import { prisma } from '~/db.server';
```

### Typing Async Module Imports

When mocking modules with async imports (like React Email components), properly type the import to avoid TypeScript errors:

```ts
// ✅ CORRECT: Type the importOriginal result
vi.mock('@react-email/components', async (importOriginal) => {
    const actual =
        await importOriginal<typeof import('@react-email/components')>();
    return {
        ...actual,
        render: vi.fn().mockResolvedValue('<html>Mocked Email</html>'),
    };
});

// ❌ WRONG: Missing type causes "Spread types may only be created from object types" error
vi.mock('@react-email/components', async (importOriginal) => {
    const actual = await importOriginal(); // TypeScript doesn't know this is an object
    return {
        ...actual, // Error: Can't spread unknown type
        render: vi.fn(),
    };
});
```

### Typing Mock Functions in Helper Utilities

For assertion helpers that accept mocked functions, use `any` type to avoid complex mock type issues:

```ts
// ✅ CORRECT: Use `any` for flexible mock type acceptance
function assertEmailSentTo(mockFn: any, recipient: string) {
    expect(mockFn).toHaveBeenCalledWith(
        expect.objectContaining({ to: recipient }),
    );
}

// ❌ PROBLEMATIC: Strict typing causes issues with mocked SDK functions
function assertEmailSentTo(
    mockFn: ReturnType<typeof vi.fn>, // Too restrictive
    recipient: string,
) {
    // Fails when mockFn is resend.emails.send (SDK function type)
}
```

### Function Mocking

Mock functions with return values or implementations:

```ts
import { vi } from 'vitest';

const mockFn = vi.fn();
mockFn.mockReturnValue('mocked value');
mockFn.mockResolvedValue({ data: 'async mocked value' });
mockFn.mockImplementation((arg) => `custom: ${arg}`);
```

### Spying on Functions

Spy on existing functions without replacing them:

```ts
const spy = vi.spyOn(console, 'log');
expect(spy).toHaveBeenCalledWith('Hello');
spy.mockRestore();
```

### Clearing Mocks

Reset mock state between tests:

```ts
beforeEach(() => {
    vi.clearAllMocks(); // Clear call history
    vi.resetAllMocks(); // Also reset implementations
});
```

### Suppressing Console Output

## CI/CD Integration

Unit tests run in GitHub Actions on every push and pull request. The workflow is minimal since all external dependencies (database, email service, etc.) are mocked.

### Unit Test Workflow

Location: `.github/workflows/unit-tests.yml`

```yaml
name: Unit Tests

on:
    push:
        branches: [main, dev]
    pull_request:
        branches: [main, dev]

jobs:
    vitest:
        name: Run Vitest Suite
        runs-on: ubuntu-latest
        timeout-minutes: 15
        env:
            CI: true
            # Required for Prisma client generation only
            # All database calls are mocked in unit tests
            DATABASE_URL: file:./test.db
        steps:
            - name: Checkout repository
              uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: 20
                  cache: npm

            - name: Install dependencies
              run: npm ci

            - name: Generate Prisma Client
              run: npx prisma generate

            - name: Run unit tests
              run: npm run test:run

            - name: Run TypeScript checks
              run: npm run typecheck
```

### Key CI/CD Principles

1. **No Database Required**: All database operations are mocked with `vi.mock('~/db.server')`
2. **SQLite In-Memory**: `DATABASE_URL=file:./test.db` only used for Prisma client generation
3. **No External Services**: Resend, OpenAI, PostHog, Polar all mocked
4. **Fast Execution**: No network calls, no container setup, just pure unit tests
5. **Type Safety**: TypeScript check ensures type errors caught before deployment

### Why No Database?

Unit tests use mocks instead of real database connections:

```ts
// All tests mock Prisma completely
vi.mock('~/db.server', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

// Tests verify business logic, not database operations
it('creates user with valid data', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

    const result = await createUser({ email: 'test@example.com' });

    expect(result).toEqual(mockUser);
    expect(prisma.user.create).toHaveBeenCalledWith({
        data: { email: 'test@example.com' },
    });
});
```

Benefits:

- **Fast**: No database startup or connections
- **Isolated**: Tests don't affect each other via shared state
- **Reliable**: No network issues or database drift
- **Portable**: Runs anywhere without infrastructure

### Troubleshooting CI Failures

**Prisma generation fails:**

- Ensure `DATABASE_URL` is set (even if dummy value)
- Check `schema.prisma` is valid

**Tests pass locally but fail in CI:**

- Check for hard-coded paths or environment-specific behavior
- Ensure mocks are properly configured in `beforeEach`
- Verify no reliance on local files or services

**Type errors in CI:**

- Run `npm run typecheck` locally first
- Ensure route types are generated (`npm run typecheck`)
- Check import paths use correct aliases (`~/` prefix)

For tests that intentionally trigger errors (testing error handling), suppress console output to keep test output clean:

```ts
beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error during tests to avoid cluttering output
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

// Example: Testing error handling without console noise
it('handles errors gracefully', async () => {
    vi.mocked(someFunction).mockRejectedValue(new Error('Expected error'));

    await expect(functionUnderTest()).rejects.toThrow('Expected error');
    // Console.error was called but output is suppressed
});
```

## Coverage

Generate coverage reports to identify untested code:

```bash
npm run test:coverage
```

Coverage reports are generated in:

- `coverage/index.html` - Visual coverage report
- Terminal output - Summary statistics

**Coverage thresholds** (configurable in `vitest.config.ts`):

- Aim for >80% coverage on critical paths
- 100% coverage on utility functions
- Focus on meaningful tests over coverage metrics

## Core Principles

1. **Test behavior-first** – Favor observable outcomes (rendered text, stateful side-effects, API responses) over implementation details such as internal state, private helpers, or CSS classes. Only assert on classes when they reflect a contractually visible state (e.g., loading spinners, success/error banners).
2. **Exercise public APIs** – Only interact with the code the way production code does (component props, exported functions). Avoid reaching into module internals with `jest.requireActual`, accessing private helpers, or mutating module state.
3. **Prioritize critical logic** – Cover business rules, data mutations, security boundaries, error paths, and user flows before cosmetic permutations. Snapshot coverage should focus on structured output (JSON, HTML fragments), not entire component trees.
4. **Isolate external effects** – Mock network calls, databases, timers, and global singletons. Keep tests deterministic and fast by avoiding live network I/O, file system writes, or environment-dependent behavior.
5. **Keep tests focused** – Each test should validate one idea. Prefer Arrange–Act–Assert formatting and descriptive names that communicate behavior. Complex flows can be split across multiple spec blocks.

## What to Test

- **Business rules**: validation logic, permission checks, feature flag behavior, caching decisions.
- **Data flow**: transformations applied to inputs, serialization/deserialization, Prisma query payloads (via mocks).
- **User interactions**: click/keyboard flows, form submissions, modal open/close, optimistic updates.
- **Side effects**: dispatched analytics events, API calls, navigation, session updates (assert via mocks/spies).
- **Error handling**: thrown/rejected paths, fallback UI, retry logic.
- **Critical rendering states**: loading, empty, success, error. Assert text or semantic indicators rendered to the user.
- **Public contracts**: exported hooks, utilities, API responses. Assert return shapes and type guards.

## What *Not* to Test

- **Third-party libraries**: Do not re-test React Router, DaisyUI, Prisma, etc. Trust verified libraries unless you wrap them with custom logic.
- **Pure styling**: Avoid assertions on raw class names unless those classes are the only observable contract (e.g., DaisyUI states that drive accessibility). Prefer semantic assertions (`toBeDisabled`, `toHaveAccessibleName`).
- **Implementation details**: Internal helper functions, private state, or values derived solely for rendering. If you must test them, promote them into exported, reusable utilities.
- **Multiple variations of the same behavior**: Once a representative variant is covered, additional permutations with identical behavior add little value. Use table-driven tests for concise coverage when necessary.
- **Transitory console output or logging**: Do not assert on `console.log`/`console.error` unless verifying that logging is the behavior.

## Style Guide

- **Arrange–Act–Assert**: Make each section explicit. Setup shared fixtures in `beforeEach` only when they are reused.
- **Descriptive names**: `it('redirects to dashboard after successful sign-in')` reads better than `it('works')`.
- **Happy DOM utilities**: Use Testing Library queries (`getByRole`, `findByText`) rather than `querySelector`.
- **Minimal mocking surface**: Mock only what you need, and reset mocks using `vi.clearAllMocks()`/`vi.resetAllMocks()` in `beforeEach`.
- **Avoid inline snapshots**: Prefer explicit assertions to snapshots to keep tests intentional.
- **Suppress noisy logs**: Spy on `console.error`/`console.warn` when testing error paths to keep output clean, but restore after each test.

## Quick Reference

| Command                        | Description                 |
| ------------------------------ | --------------------------- |
| `npm test`                     | Run tests in watch mode     |
| `npm run test:run`             | Run tests once (CI)         |
| `npm run test:ui`              | Run tests with visual UI    |
| `npm run test:coverage`        | Generate coverage report    |
| `vi.mock('module')`            | Mock a module               |
| `vi.fn()`                      | Create a mock function      |
| `vi.clearAllMocks()`           | Clear mock call history     |
| `expect(...).toBeInTheDocument()` | Assert element is rendered |
| `screen.getByRole()`           | Query by accessible role    |

## Example Test Files

- **Component:** `app/components/Button.test.tsx`
- **Utility:** `app/lib/form-validation.server.test.ts`
- **Model:** `app/models/user.server.test.ts`

Refer to the [Vitest documentation](https://vitest.dev/) and [Testing Library documentation](https://testing-library.com/) for advanced patterns.
