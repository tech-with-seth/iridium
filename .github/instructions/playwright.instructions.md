# Playwright End-to-End Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end testing. Playwright provides reliable, fast, and cross-browser testing capabilities.

## Prerequisites

Playwright is installed as a dev dependency and includes Chromium, Firefox, and WebKit browsers.

## Running Tests

```bash
# Run all tests (headless mode)
npm run e2e

# Run tests with UI mode (interactive debugging)
npm run e2e:ui

# Run tests in headed mode (see browser)
npm run e2e:headed

# Debug tests step-by-step
npm run e2e:debug

# Show HTML test report
npm run e2e:report
```

## Test Structure

Tests are located in the `tests/` directory:

```
tests/
├── app-layout.spec.ts       # Application layout and structure tests
├── authentication.spec.ts    # Authentication flow and protected routes
└── home.spec.ts             # Home page content tests
```

## Configuration

Playwright configuration is defined in `playwright.config.ts`:

- **Base URL**: `http://localhost:5173` (development server)
- **Test Directory**: `./tests`
- **Browsers**: Chromium, Firefox, WebKit
- **Auto-start Dev Server**: Playwright automatically starts the dev server before running tests

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
    test('should do something', async ({ page }) => {
        await page.goto('/');

        // Your test assertions
        await expect(
            page.getByRole('heading', { name: 'Title' }),
        ).toBeVisible();
    });
});
```

### Best Practices

1. **Use Semantic Selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Test User Behavior**: Focus on what users see and do, not implementation details
3. **Group Related Tests**: Use `test.describe()` to organize tests by feature
4. **Wait for Elements**: Use `await expect()` with `.toBeVisible()` instead of manual waits
5. **Test Authentication States**: Test both authenticated and unauthenticated flows

### Example: Testing Protected Routes

```typescript
test('protected routes redirect to sign-in', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect unauthenticated users
    await expect(page).toHaveURL(/sign-in/);
});
```

### Example: Testing Form Interactions

```typescript
test('submits form with valid data', async ({ page }) => {
    await page.goto('/sign-in');

    await page
        .getByRole('textbox', { name: /email/i })
        .fill('user@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Assert success state
    await expect(page).toHaveURL('/dashboard');
});
```

## Testing React Router 7 Patterns

### Testing Loaders and Actions

Playwright tests the **result** of loaders/actions, not their implementation:

```typescript
test('displays data from loader', async ({ page }) => {
    await page.goto('/profile');

    // Verify the page displays data loaded by the loader
    await expect(page.getByText(/user profile/i)).toBeVisible();
});
```

### Testing Protected Routes with Middleware

```typescript
test('middleware protects authenticated routes', async ({ page }) => {
    // No authentication cookie/session
    await page.goto('/dashboard');

    // Should redirect to sign-in via middleware
    await expect(page).toHaveURL(/sign-in/);
});
```

### Testing Meta Tags (React 19 Pattern)

```typescript
test('has correct page meta information', async ({ page }) => {
    await page.goto('/');

    // Check document title
    await expect(page).toHaveTitle('TWS Foundations');

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute(
        'content',
        /Modern full-stack/,
    );
});
```

## Debugging Tests

### Using UI Mode (Recommended)

```bash
npm run e2e:ui
```

UI mode provides:

- Visual test runner
- Time-travel debugging
- Step-by-step execution
- Watch mode for development

### Using Debug Mode

```bash
npm run e2e:debug
```

Opens Playwright Inspector for step-by-step debugging with:

- Breakpoints
- DOM snapshots
- Network logs
- Console output

### Using Headed Mode

```bash
npm run e2e:headed
```

Runs tests in visible browser windows to see what's happening.

## CI/CD Integration

Playwright is configured for CI environments:

- **Retries**: 2 retries on CI (0 locally)
- **Workers**: 1 worker on CI (parallel locally)
- **Reporter**: HTML report generated after test runs
- **Fail on `.only`**: Prevents accidental commits of focused tests

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
    test:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: 20
            - name: Install dependencies
              run: npm ci
            - name: Install Playwright Browsers
              run: npx playwright install --with-deps
            - name: Run Playwright tests
              run: npm run e2e
            - uses: actions/upload-artifact@v4
              if: always()
              with:
                  name: playwright-report
                  path: playwright-report/
                  retention-days: 30
```

## Test Reports

After running tests, view the HTML report:

```bash
npm run e2e:report
```

The report includes:

- Test results (pass/fail/skip)
- Screenshots on failure
- Execution traces
- Performance metrics

## Common Patterns

### Testing Feature Flags (PostHog Integration)

```typescript
test('displays content based on feature flag', async ({ page }) => {
    await page.goto('/');

    // Test default content (flag off)
    await expect(page.getByText(/production-ready SaaS/i)).toBeVisible();
});
```

### Testing Role-Based Access

```typescript
test('admin routes require admin role', async ({ page, context }) => {
    // Set up authenticated user with USER role
    await context.addCookies([
        /* auth cookies */
    ]);

    await page.goto('/admin/design');

    // Should show 403 or redirect
    await expect(page.getByText(/forbidden|not authorized/i)).toBeVisible();
});
```

### Testing API Endpoints via UI

```typescript
test('form submission calls API endpoint', async ({ page }) => {
    // Listen for API calls
    const responsePromise = page.waitForResponse(
        (response) =>
            response.url().includes('/api/profile') &&
            response.status() === 200,
    );

    await page.goto('/profile/edit');
    await page.getByRole('textbox', { name: /name/i }).fill('John Doe');
    await page.getByRole('button', { name: /save/i }).click();

    // Verify API was called successfully
    await responsePromise;

    // Verify UI updates
    await expect(page.getByText('Profile updated')).toBeVisible();
});
```

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [Test Generator](https://playwright.dev/docs/codegen) - `npx playwright codegen`
