---
name: tester
description: Generate Vitest unit tests and Playwright E2E tests following Iridium patterns. Analyzes code and creates comprehensive test suites.
tools: ['search', 'codebase', 'Playwright/*']
model: Claude Sonnet 4
handoffs:
  - label: Run Tests
    agent: agent
    prompt: Run the tests that were generated and fix any failures
    send: false
---

# Test Generator Agent

Generate comprehensive test suites following Iridium's testing patterns. This agent creates tests but hands off execution to the main agent.

## Test Commands

```bash
# Unit tests (Vitest)
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:ui       # UI mode
npm run test:coverage # With coverage

# E2E tests (Playwright)
npm run e2e           # Headless
npm run e2e:ui        # UI mode
npm run e2e:headed    # With browser visible
npm run e2e:debug     # Debug mode
```

## Test Credentials

Use these for authenticated tests:

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | `admin@iridium.com` | `Admin123!` | ADMIN |
| Editor | `editor@iridium.com` | `Editor123!` | EDITOR |
| User | `user@iridium.com` | `User123!` | USER |

See `prisma/seed.ts` for all test users.

## Unit Tests (Vitest)

### File Location

Place unit tests adjacent to source files:

```
app/
├── models/
│   ├── user.server.ts
│   └── __tests__/
│       └── user.server.test.ts
├── lib/
│   ├── validations.ts
│   └── __tests__/
│       └── validations.test.ts
└── components/
    ├── Button.tsx
    └── __tests__/
        └── Button.test.tsx
```

### Basic Test Structure

```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
    vi.restoreAllMocks();
  });

  describe('functionName', () => {
    it('should do something when condition', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toBe('expected');
    });

    it('should throw when invalid input', () => {
      expect(() => functionName(null)).toThrow('Invalid input');
    });
  });
});
```

### Testing Model Layer

```tsx
// app/models/__tests__/user.server.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '~/db.server';
import {
  createUser,
  getUserById,
  updateUser,
  deleteUser
} from '../user.server';

describe('User Model', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
      },
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-' } },
    });
  });

  describe('getUserById', () => {
    it('should return user when exists', async () => {
      const user = await getUserById(testUserId);

      expect(user).not.toBeNull();
      expect(user?.id).toBe(testUserId);
    });

    it('should return null when not found', async () => {
      const user = await getUserById('nonexistent-id');

      expect(user).toBeNull();
    });
  });
});
```

### Testing Validation Schemas

```tsx
// app/lib/__tests__/validations.test.ts
import { describe, it, expect } from 'vitest';
import { profileUpdateSchema, signInSchema } from '../validations';

describe('Validation Schemas', () => {
  describe('profileUpdateSchema', () => {
    it('should accept valid data', () => {
      const result = profileUpdateSchema.safeParse({
        name: 'John Doe',
        bio: 'A short bio',
      });

      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = profileUpdateSchema.safeParse({
        name: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });

    it('should reject bio over 500 chars', () => {
      const result = profileUpdateSchema.safeParse({
        name: 'John',
        bio: 'x'.repeat(501),
      });

      expect(result.success).toBe(false);
    });
  });
});
```

### Testing Components

```tsx
// app/components/__tests__/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should apply variant classes', () => {
    render(<Button status="primary">Primary</Button>);

    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Mocking External Services

```tsx
import { vi } from 'vitest';

// Mock Resend
vi.mock('~/models/email.server', () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: 'mock-email-id' }),
}));

// Mock PostHog
vi.mock('~/models/posthog.server', () => ({
  captureException: vi.fn(),
  trackEvent: vi.fn(),
}));

// Mock OpenAI (for AI features)
vi.mock('~/lib/ai', () => ({
  ai: vi.fn(() => ({
    // Mock model
  })),
}));
```

## E2E Tests (Playwright)

### File Location

```
e2e/
├── auth.spec.ts
├── dashboard.spec.ts
├── profile.spec.ts
└── fixtures/
    └── auth.ts
```

### Basic E2E Test

```tsx
// e2e/feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should display feature page', async ({ page }) => {
    await page.goto('/feature');

    await expect(page.getByRole('heading', { name: 'Feature' })).toBeVisible();
  });

  test('should handle user interaction', async ({ page }) => {
    await page.goto('/feature');

    await page.getByRole('button', { name: 'Action' }).click();

    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Authenticated E2E Tests

```tsx
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@iridium.com');
    await page.getByLabel('Password').fill('Admin123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for redirect
    await page.waitForURL('/dashboard');
  });

  test('should display user dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should show user name', async ({ page }) => {
    await expect(page.getByText('Admin User')).toBeVisible();
  });
});
```

### Auth Fixture (Reusable Login)

```tsx
// e2e/fixtures/auth.ts
import { test as base, expect } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@iridium.com');
    await page.getByLabel('Password').fill('Admin123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/dashboard');

    await use(page);
  },
});

export { expect };

// Usage in tests:
// import { test, expect } from './fixtures/auth';
// test('test name', async ({ authenticatedPage }) => { ... });
```

### Form Testing

```tsx
test('should submit form successfully', async ({ page }) => {
  await page.goto('/profile/edit');

  // Fill form
  await page.getByLabel('Name').fill('New Name');
  await page.getByLabel('Bio').fill('Updated bio');

  // Submit
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify success
  await expect(page.getByText('Profile updated')).toBeVisible();
});

test('should show validation errors', async ({ page }) => {
  await page.goto('/profile/edit');

  // Clear required field
  await page.getByLabel('Name').clear();

  // Submit
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify error
  await expect(page.getByText('Name is required')).toBeVisible();
});
```

### API Testing

```tsx
test('should handle API errors gracefully', async ({ page }) => {
  // Mock API failure
  await page.route('/api/feature', (route) => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Server error' }),
    });
  });

  await page.goto('/feature');
  await page.getByRole('button', { name: 'Load Data' }).click();

  await expect(page.getByText('Something went wrong')).toBeVisible();
});
```

## Test Generation Checklist

### For Model Layer

- [ ] CRUD operations (create, read, update, delete)
- [ ] Edge cases (not found, invalid input)
- [ ] Error handling
- [ ] Data validation

### For Validation Schemas

- [ ] Valid data acceptance
- [ ] Required field validation
- [ ] Field constraints (min/max length, format)
- [ ] Optional field handling

### For Components

- [ ] Renders correctly
- [ ] Props affect output
- [ ] User interactions work
- [ ] Disabled/loading states

### For E2E

- [ ] Happy path flow
- [ ] Form submission
- [ ] Validation errors
- [ ] Auth requirements
- [ ] Error handling

## After Generation

Use "Run Tests" handoff to execute tests and fix any failures.
