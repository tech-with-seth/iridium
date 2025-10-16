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
	email: z.string().email('Invalid email')
});

describe('validateFormData', () => {
	it('validates correct form data', async () => {
		const formData = new FormData();
		formData.append('name', 'John Doe');
		formData.append('email', 'john@example.com');

		const result = await validateFormData(formData, zodResolver(testSchema));

		expect(result.data).toEqual({
			name: 'John Doe',
			email: 'john@example.com'
		});
		expect(result.errors).toBeUndefined();
	});

	it('returns errors for invalid data', async () => {
		const formData = new FormData();
		formData.append('name', '');
		formData.append('email', 'invalid-email');

		const result = await validateFormData(formData, zodResolver(testSchema));

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
			update: vi.fn()
		}
	}
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
			role: Role.USER
		};

		vi.mocked(prisma.user.findUnique).mockResolvedValue(mockProfile as any);

		const result = await getUserProfile('user-123');

		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: 'user-123' },
			select: expect.objectContaining({
				id: true,
				email: true,
				name: true
			})
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

			const request = createMockRequest({ url: 'http://localhost:5173/profile' });
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
				body: { name: 'Updated Name' }
			});

			const response = await action({ request, params: {}, context: {} });
			const data = await response.json();

			expect(data.success).toBe(true);
			expect(updateUser).toHaveBeenCalledWith({
				userId: 'user-123',
				data: expect.objectContaining({ name: 'Updated Name' })
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
	body: { name: 'John' }
});
```

### `createMockFormData(data)`

Creates a `FormData` object from a plain object.

```tsx
import { createMockFormData } from '~/test/utils';

const formData = createMockFormData({
	name: 'John',
	email: 'john@example.com'
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
			update: vi.fn()
		}
	}
}));

// Import AFTER mocking
import { prisma } from '~/db.server';
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

## Best Practices

### DO:

✅ **Test behavior, not implementation**

```tsx
// Good: Test what the user sees/does
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();

// Bad: Test implementation details
expect(component.state.isSubmitting).toBe(false);
```

✅ **Use descriptive test names**

```ts
// Good
it('displays error message when email is invalid');

// Bad
it('test 1');
```

✅ **Arrange-Act-Assert pattern**

```ts
// Arrange: Set up test data
const user = createMockUser();

// Act: Perform action
const result = await getUserProfile(user.id);

// Assert: Verify result
expect(result.name).toBe('Test User');
```

✅ **Test edge cases and error states**

```ts
it('handles null user gracefully', async () => {
	vi.mocked(getUserProfile).mockResolvedValue(null);
	const result = await loader({ request, params: {}, context: {} });
	expect(result.status).toBe(404);
});
```

✅ **Clear mocks between tests**

```ts
beforeEach(() => {
	vi.clearAllMocks();
});
```

### DON'T:

❌ **Don't test third-party libraries**

```ts
// Bad: Testing React Router's redirect
it('redirects to home', () => {
	expect(redirect).toHaveBeenCalledWith('/');
});

// Good: Test your business logic
it('redirects to home after successful logout', async () => {
	await action({ request, params: {}, context: {} });
	expect(deleteSession).toHaveBeenCalled();
});
```

❌ **Don't use implementation details for queries**

```tsx
// Bad
const element = container.querySelector('.btn-primary');

// Good
const element = screen.getByRole('button', { name: /submit/i });
```

❌ **Don't write overly complex tests**

If a test is hard to write, the code may need refactoring.

❌ **Don't ignore flaky tests**

Fix or delete flaky tests immediately. They erode trust in the test suite.

---

## Quick Reference

| Command                  | Description                      |
| ------------------------ | -------------------------------- |
| `npm test`               | Run tests in watch mode          |
| `npm run test:run`       | Run tests once (CI)              |
| `npm run test:ui`        | Run tests with visual UI         |
| `npm run test:coverage`  | Generate coverage report         |
| `vi.mock('module')`      | Mock a module                    |
| `vi.fn()`                | Create a mock function           |
| `vi.clearAllMocks()`     | Clear all mock call history      |
| `expect().toBeInTheDocument()` | Assert element is rendered |
| `screen.getByRole()`     | Query element by ARIA role       |

## Example Test Files

Reference these files for complete examples:

- **Component:** `app/components/Button.test.tsx`
- **Utility:** `app/lib/form-validation.server.test.ts`
- **Model:** `app/models/user.server.test.ts`

---

For more information, see the [Vitest documentation](https://vitest.dev/).
