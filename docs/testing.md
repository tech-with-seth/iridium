# Testing

TWS Foundations uses Vitest for unit and integration testing, and Playwright for end-to-end testing.

## Overview

The testing strategy includes:

- **Vitest** - Fast unit and integration testing
- **Testing Library** - React component testing utilities
- **Playwright** - End-to-end browser testing
- **Happy DOM** - Fast DOM implementation for unit tests

## Unit Testing with Vitest

### Test Setup

Tests are configured in `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        environment: 'happy-dom',
        setupFiles: ['./app/test/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
        },
    },
});
```

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Writing Unit Tests

```typescript
import { describe, test, expect } from 'vitest';
import { calculateTotal } from './utils';

describe('calculateTotal', () => {
    test('calculates total with tax', () => {
        const result = calculateTotal(100, 0.1);
        expect(result).toBe(110);
    });

    test('handles zero values', () => {
        const result = calculateTotal(0, 0.1);
        expect(result).toBe(0);
    });

    test('throws on negative values', () => {
        expect(() => calculateTotal(-100, 0.1)).toThrow();
    });
});
```

### Testing React Components

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import Button from "./button";

describe("Button", () => {
  test("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  test("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("applies variant classes", () => {
    const { container } = render(<Button variant="primary">Click me</Button>);
    const button = container.querySelector("button");

    expect(button).toHaveClass("btn-primary");
  });

  test("disables button when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### Testing Forms

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import ContactForm from "./contact-form";

describe("ContactForm", () => {
  test("validates required fields", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  test("validates email format", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "invalid-email");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  test("submits form with valid data", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<ContactForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/name/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/message/i), "Hello world");

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        message: "Hello world",
      });
    });
  });
});
```

### Testing Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { useUserData } from './use-user-data';

describe('useUserData', () => {
    test('fetches user data', async () => {
        const { result } = renderHook(() => useUserData('user-id'));

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toEqual({
            id: 'user-id',
            name: 'John Doe',
        });
    });

    test('handles errors', async () => {
        const { result } = renderHook(() => useUserData('invalid-id'));

        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
        });
    });
});
```

### Mocking

#### Mocking Modules

```typescript
import { describe, test, expect, vi } from 'vitest';

vi.mock('~/lib/auth.server', () => ({
    auth: {
        api: {
            getSession: vi.fn().mockResolvedValue({
                user: { id: 'test-user', email: 'test@example.com' },
            }),
        },
    },
}));

test('gets user session', async () => {
    const { auth } = await import('~/lib/auth.server');
    const session = await auth.api.getSession({ headers: new Headers() });

    expect(session.user.email).toBe('test@example.com');
});
```

#### Mocking Fetch

```typescript
import { describe, test, expect, beforeEach, vi } from 'vitest';

beforeEach(() => {
    global.fetch = vi.fn();
});

test('fetches data from API', async () => {
    (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
    });

    const response = await fetch('/api/data');
    const data = await response.json();

    expect(data).toEqual({ data: 'test' });
    expect(global.fetch).toHaveBeenCalledWith('/api/data');
});
```

#### Mocking Timers

```typescript
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.restoreAllMocks();
});

test('delays execution', () => {
    const callback = vi.fn();

    setTimeout(callback, 1000);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(1);
});
```

## End-to-End Testing with Playwright

### Playwright Configuration

Configuration in `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
    },
});
```

### Running End-to-End Tests

```bash
# Run tests
npm run e2e

# Run with UI
npm run e2e:ui

# Run in headed mode
npm run e2e:headed

# Debug tests
npm run e2e:debug

# Show report
npm run e2e:report
```

### Writing End-to-End Tests

```typescript
import { test, expect } from '@playwright/test';

test('user can sign up', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="name"]', 'Test User');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome, Test User')).toBeVisible();
});

test('shows validation errors', async ({ page }) => {
    await page.goto('/signup');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
});

test('user can navigate between pages', async ({ page }) => {
    await page.goto('/');

    await page.click('text=About');
    await expect(page).toHaveURL('/about');

    await page.click('text=Contact');
    await expect(page).toHaveURL('/contact');
});
```

### Page Object Pattern

```typescript
// tests/pages/login-page.ts
import { Page } from '@playwright/test';

export class LoginPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('/login');
    }

    async login(email: string, password: string) {
        await this.page.fill('input[name="email"]', email);
        await this.page.fill('input[name="password"]', password);
        await this.page.click('button[type="submit"]');
    }

    async getErrorMessage() {
        return this.page.locator('.alert-error').textContent();
    }
}

// tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login-page';

test('user can login', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');

    await expect(page).toHaveURL('/dashboard');
});
```

### Testing API Routes

```typescript
import { test, expect } from '@playwright/test';

test('API returns user data', async ({ request }) => {
    const response = await request.get('/api/users/123');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('id', '123');
    expect(data).toHaveProperty('email');
});

test('API validates authentication', async ({ request }) => {
    const response = await request.get('/api/protected');

    expect(response.status()).toBe(401);
});
```

## Test Organization

### Directory Structure

```
app/
├── components/
│   ├── button.tsx
│   └── button.test.tsx
├── models/
│   ├── user.server.ts
│   └── user.server.test.ts
└── lib/
    ├── utils.ts
    └── utils.test.ts

tests/
├── auth.spec.ts
├── navigation.spec.ts
└── pages/
    ├── login-page.ts
    └── dashboard-page.ts
```

### Test Naming

- Unit tests: `*.test.ts` or `*.test.tsx`
- End-to-end tests: `*.spec.ts`
- Test files should be colocated with the code they test

## Best Practices

1. **Test behavior, not implementation** - Focus on what the user sees and does
2. **Use Testing Library queries** - Prefer `getByRole` over `getByTestId`
3. **Avoid testing implementation details** - Test the public API
4. **Mock external dependencies** - Database, APIs, authentication
5. **Keep tests focused** - One assertion per test when possible
6. **Use descriptive test names** - Clearly describe what is being tested
7. **Set up and tear down properly** - Clean state between tests
8. **Run tests in CI** - Automate testing in your deployment pipeline

## Coverage

Generate coverage reports:

```bash
npm run test:coverage
```

Coverage reports are saved to `coverage/` directory. Aim for:

- 80%+ line coverage
- 70%+ branch coverage
- Focus on critical paths and business logic

## Continuous Integration

The project includes GitHub Actions workflows for automated testing:

### Unit Tests Workflow

`.github/workflows/unit-tests.yml` runs Vitest tests:

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
            DATABASE_URL: postgresql://postgres:postgres@localhost:5432/tws_test
            BETTER_AUTH_SECRET: test-secret-key-for-ci-at-least-32-characters-long
            BETTER_AUTH_URL: http://localhost:5173
            OPENAI_API_KEY: sk-test-key
            VITE_POSTHOG_API_KEY: phc_test_key_for_ci_testing
            VITE_POSTHOG_HOST: https://us.i.posthog.com
            RESEND_API_KEY: re_test_key_for_ci
            RESEND_FROM_EMAIL: test@example.com
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: 20
                  cache: npm
            - run: npm ci
            - run: npx prisma generate
            - run: npm run test:run
```

### E2E Tests Workflow

`.github/workflows/e2e-tests.yml` runs Playwright tests with a full PostgreSQL database:

```yaml
name: E2E Tests

on:
    push:
        branches: [main, dev]
    pull_request:
        branches: [main, dev]

jobs:
    playwright:
        name: Run Playwright Suite
        runs-on: ubuntu-latest
        timeout-minutes: 30
        services:
            postgres:
                image: postgres:16
                env:
                    POSTGRES_USER: postgres
                    POSTGRES_PASSWORD: postgres
                    POSTGRES_DB: tws_test
                options: >-
                    --health-cmd pg_isready
                    --health-interval 10s
                    --health-timeout 5s
                    --health-retries 5
                ports:
                    - 5432:5432
        env:
            CI: true
            DATABASE_URL: postgresql://postgres:postgres@localhost:5432/tws_test
            BETTER_AUTH_SECRET: test-secret-key-for-ci-at-least-32-characters-long
            BETTER_AUTH_URL: http://localhost:5173
            OPENAI_API_KEY: sk-test-key
            VITE_POSTHOG_API_KEY: phc_test_key_for_ci_testing
            VITE_POSTHOG_HOST: https://us.i.posthog.com
            RESEND_API_KEY: re_test_key_for_ci
            RESEND_FROM_EMAIL: test@example.com
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: 20
                  cache: npm
            - run: npm ci
            - run: npx prisma generate
            - run: npx prisma migrate deploy
            - run: npm run seed
            - run: npx playwright install --with-deps
            - run: npm run e2e
            - uses: actions/upload-artifact@v4
              if: always()
              with:
                  name: playwright-report
                  path: playwright-report
                  retention-days: 7
```

**Key CI/CD Considerations:**

- **PostgreSQL Service**: E2E tests require a database; use GitHub Actions services
- **Environment Variables**: All required env vars must be set, even with dummy values
- **Playwright webServer**: Automatically starts dev server (no manual setup needed)
- **Artifacts**: Upload test reports for debugging failures
- **Timeouts**: Set appropriate timeouts (15 min for unit, 30 min for E2E)

## Further Reading

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Development Workflow](./development.md)
