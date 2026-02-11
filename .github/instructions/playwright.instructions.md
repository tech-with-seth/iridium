---
applyTo: 'e2e/**/*,playwright.config.ts'
---

# Playwright End-to-End Testing

## Running Tests

```bash
npm run e2e           # Headless (CI default)
npm run e2e:ui        # Interactive UI mode (recommended for dev)
npm run e2e:headed    # Visible browser
npm run e2e:debug     # Step-by-step with Playwright Inspector
npm run e2e:report    # View HTML report
```

## Test Structure

```
tests/
└── e2e/
    └── smoke.spec.ts    # Baseline smoke tests
```

**Configuration:** `playwright.config.ts` — auto-starts dev server, runs Chromium/Firefox/WebKit.

## Writing Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
    test('should do something', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Title' })).toBeVisible();
    });
});
```

## Best Practices

1. **Semantic selectors**: `getByRole`, `getByLabel`, `getByText` — not CSS selectors
2. **Test user behavior**: Focus on what users see and do
3. **Group with `test.describe()`**: Organize by feature
4. **Auto-waiting**: Use `await expect(el).toBeVisible()` — no manual waits
5. **Test auth states**: Both authenticated and unauthenticated flows

## Common Patterns

### Protected Route Redirect

```typescript
test('redirects unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/$/);
});
```

### Form Interaction

```typescript
test('opens auth drawer and shows email fields', async ({ page }) => {
    await page.goto('/');
    const header = page.getByRole('banner');
    await header.getByRole('button', { name: /sign in/i }).click();
    await page.getByLabel(/email/i).fill('user@example.com');
    await expect(page.getByLabel(/email/i)).toBeVisible();
});
```

### Meta Tags

```typescript
test('has correct meta information', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Iridium');
    const meta = page.locator('meta[name="description"]');
    await expect(meta).toHaveAttribute('content', /Modern full-stack/);
});
```

### API Response Verification

```typescript
test('form submission calls API', async ({ page }) => {
    const responsePromise = page.waitForResponse(
        (r) => r.url().includes('/api/profile') && r.status() === 200
    );
    await page.goto('/profile/edit');
    await page.getByRole('textbox', { name: /name/i }).fill('John Doe');
    await page.getByRole('button', { name: /save/i }).click();
    await responsePromise;
});
```

## Debugging

| Mode | Command | Best For |
|------|---------|----------|
| UI Mode | `npm run e2e:ui` | Time-travel debugging, watch mode |
| Debug | `npm run e2e:debug` | Breakpoints, DOM snapshots |
| Headed | `npm run e2e:headed` | Seeing browser interactions |
| Report | `npm run e2e:report` | Post-run analysis, screenshots |

## Test Reports

Reports include pass/fail results, failure screenshots, execution traces, and performance metrics. Generated at `playwright-report/`.

## CI Notes

- Retries: 2 on CI, 0 locally
- Workers: 1 on CI, parallel locally
- `webServer` auto-starts dev server (don't start manually)
- `reuseExistingServer: !process.env.CI` — fresh server in CI
- Always upload `playwright-report/` as artifact

## Reference

- **Tests:** `tests/e2e/`
- **Config:** `playwright.config.ts`
- **Docs:** https://playwright.dev/docs/intro
- **Codegen:** `npx playwright codegen` (generate tests by recording)
