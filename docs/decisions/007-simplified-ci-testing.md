# ADR 007: Simplified CI/CD Testing Strategy

**Date:** 2025-01-28  
**Status:** Accepted  
**Context:** After implementing CI/CD workflows, we realized they were over-engineered for our current test suite

## Problem

The initial CI/CD setup included:

1. **E2E Workflow**: Full PostgreSQL service + migrations + seeding
2. **Unit Test Workflow**: 9 environment variables including database connection strings
3. **Unused Infrastructure**: Seeded test users that no tests actually used
4. **Slow CI**: Unnecessary database setup added 30-60 seconds to every E2E run

### Root Cause Analysis

Upon inspection, we discovered:

- ❌ **Unit tests** mock all database operations with `vi.mock('~/db.server')` - never use real database
- ❌ **E2E tests** only test UI visibility and redirects - never authenticate or query database
- ❌ **Seed script** creates `seth@mail.com` user - but NO tests log in or use this user
- ❌ **Services** (Polar, PostHog, Resend) are mocked in unit tests, initialized but unused in E2E

**The entire database setup was unnecessary waste.**

## Decision

We simplified both workflows to match actual test requirements:

### Unit Tests (Vitest)

**Before:**

```yaml
env:
    DATABASE_URL: postgresql://postgres:postgres@localhost:5432/tws_test
    BETTER_AUTH_SECRET: test-secret-key
    BETTER_AUTH_URL: http://localhost:5173
    OPENAI_API_KEY: sk-test-key
    VITE_POSTHOG_API_KEY: phc_test_key
    VITE_POSTHOG_HOST: https://us.i.posthog.com
    RESEND_API_KEY: re_test_key
    RESEND_FROM_EMAIL: test@example.com
```

**After:**

```yaml
env:
    CI: true
    # Required for Prisma client generation only
    # All database calls are mocked in unit tests
    DATABASE_URL: file:./test.db
```

**Rationale:**

- Only need `DATABASE_URL` for `npx prisma generate` (type generation)
- All other env vars were unused since everything is mocked
- SQLite in-memory (`file:./test.db`) sufficient for type generation

### E2E Tests (Playwright)

**Before:**

```yaml
services:
    postgres:
        image: postgres:16
        # ... full PostgreSQL setup
env:
    DATABASE_URL: postgresql://postgres:postgres@localhost:5432/tws_test
    # ... all 9 environment variables
steps:
    # ...
    - run: npx prisma migrate deploy
    - run: npm run seed
```

**After:**

```yaml
env:
    CI: true
    # Required by server startup (middleware, auth initialization)
    # Not used by actual tests - all external services are mocked in-memory
    DATABASE_URL: file:./test.db
    BETTER_AUTH_SECRET: test-secret-key-for-ci-at-least-32-characters-long
    BETTER_AUTH_URL: http://localhost:5173
    OPENAI_API_KEY: sk-test-key
    VITE_POSTHOG_API_KEY: phc_test_key_for_ci_testing
    VITE_POSTHOG_HOST: https://us.i.posthog.com
    RESEND_API_KEY: re_test_key_for_ci
    RESEND_FROM_EMAIL: test@example.com
steps:
    # ...
    - run: npx prisma generate
    # No migrations, no seed, no PostgreSQL service
```

**Rationale:**

- Current E2E tests only verify:
  - UI elements are visible
  - Protected routes redirect to sign-in
  - Meta tags are correct
- Tests **do not**:
  - Fill forms or submit data
  - Authenticate users
  - Query database
  - Test actual data flows
- Server needs env vars to start (imports use them), but values can be dummy
- SQLite in-memory sufficient for Prisma client generation

## Consequences

### Positive

- ✅ **Faster CI**: E2E workflow completes ~30-60 seconds faster (no DB setup)
- ✅ **Simpler maintenance**: No PostgreSQL version updates, no migration drift
- ✅ **Clearer intent**: Workflows now match what tests actually do
- ✅ **Lower cognitive load**: Developers don't wonder why database exists but isn't used
- ✅ **Better documentation**: Updated instructions clearly explain minimal setup

### Negative

- ⚠️ **Must add database later**: When we add authenticated E2E tests, need to restore database setup
- ⚠️ **Seed script untested**: `prisma/seed.ts` no longer runs in CI (should add unit test)

### Future Considerations

**When to restore database in E2E workflow:**

Add PostgreSQL service + migrations + seed when you write tests that:

1. Authenticate users (fill sign-in form, submit, verify dashboard)
2. Create/read/update/delete data (test CRUD operations end-to-end)
3. Test data relationships (verify foreign keys, cascades, constraints)
4. Test database-driven business logic (permissions, role checks)

**Example test that WOULD require database:**

```typescript
test('user can update profile', async ({ page }) => {
    // Login with seeded user (requires database + seed)
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill('seth@mail.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Navigate and update (requires database)
    await page.goto('/profile');
    await page.getByLabel('Name').fill('New Name');
    await page.getByRole('button', { name: /save/i }).click();

    // Verify persistence (requires database)
    await page.reload();
    await expect(page.getByText('New Name')).toBeVisible();
});
```

## Implementation

Files changed:

1. `.github/workflows/unit-tests.yml` - Removed unused env vars
2. `.github/workflows/e2e-tests.yml` - Removed PostgreSQL service, migrations, seed
3. `.github/instructions/playwright.instructions.md` - Documented when database is needed
4. `.github/instructions/unit-testing.instructions.md` - Added CI/CD section explaining mocking strategy
5. `docs/decisions/007-simplified-ci-testing.md` - This ADR

## References

- Previous ADR: [006-zod-validation.md](./006-zod-validation.md)
- Vitest Mocking: <https://vitest.dev/guide/mocking>
- Playwright CI: <https://playwright.dev/docs/ci>
- GitHub Actions Services: <https://docs.github.com/en/actions/using-containerized-services>

## Validation

To verify this approach is correct:

```bash
# Run unit tests - should pass without database
npm run test:run

# Run E2E tests - should pass without database
npm run e2e

# Check CI workflows succeed
git push origin HEAD
# Monitor GitHub Actions runs
```

All tests pass ✅
