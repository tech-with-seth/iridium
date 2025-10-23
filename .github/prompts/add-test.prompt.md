---
agent: 'agent'
tools: ['search/codebase', 'usages', 'edit', 'runTests']
description: 'Add or expand automated tests using project-approved patterns'
---

# Add Automated Tests

You are responsible for adding comprehensive automated test coverage while following established testing practices. Review these references before modifying code:

- `.github/instructions/unit-testing.instructions.md`
- `.github/instructions/playwright.instructions.md`
- `.github/instructions/form-validation.instructions.md`
- `docs/testing.md` for project-wide expectations

## Step 1: Identify Test Scope

Clarify with the user or infer from context:

- Feature or module under test
- Required test type(s): **unit**, **integration**, **end-to-end**
- Critical behaviors, edge cases, and regression expectations
- Any external services or asynchronous flows that require mocking

Document the scenarios you plan to cover before implementation.

## Step 2: Audit Existing Coverage

1. Search the codebase for existing tests (Vitest in `app/**` or Playwright in `tests/`).
2. Note gaps in assertions, missing edge cases, or outdated fixtures.
3. Reuse helpers from `test/utils.tsx` and shared Playwright fixtures.

## Step 3: Plan the Test Strategy

- **Unit tests (Vitest)**: Focus on pure functions, hooks, components. Use approved testing libraries and utilities.
- **Integration tests**: Combine multiple modules (e.g., data models). Seed data with caution.
- **E2E tests (Playwright)**: Cover user workflows, authentication flows, and external integrations.

Decide which layers require coverage and align with project testing pyramid goals.

## Step 4: Implement Tests

### Vitest (Unit/Integration)

- Co-locate tests near the module (e.g., `ComponentName.test.tsx`).
- Use `describe` / `it` blocks with clear behavior-driven titles.
- Mock external services (OpenAI, Resend, PostHog) using existing helpers.
- For React components, use Testing Library with DaisyUI-aware queries.
- Validate accessibility states, validation messages, and error flows.

### Playwright (E2E)

- Place specs in `tests/` and leverage shared fixtures.
- Authenticate using provided helpers (see `tests/authentication.spec.ts`).
- Cover success paths, validation failures, and authorization checks.
- Capture screenshots if instructed by Playwright guidelines.

## Step 5: Run Tests Continuously

- Use targeted commands when available (`npm run test -- ComponentName`, `npm run e2e -- spec`).
- Rerun until the new tests pass consistently.
- Investigate flakiness immediately—do not ship unstable tests.

## Step 6: Update Documentation (if needed)

- If you introduce new testing utilities or patterns, update `.github/instructions/unit-testing.instructions.md` via `codify.prompt.md`.
- For major workflow coverage, note it in `docs/testing.md`.

## Checklist

- [ ] Test requirements and scenarios confirmed
- [ ] Existing tests reviewed and gaps identified
- [ ] Appropriate test type selected (unit/integration/E2E)
- [ ] Tests implemented following instruction patterns
- [ ] External dependencies mocked or seeded responsibly
- [ ] `npm run test` / `npm run e2e` (or targeted commands) executed successfully
- [ ] Documentation updated if new patterns introduced

## Anti-Patterns to Avoid

- ❌ Writing tests without understanding feature requirements
- ❌ Duplicating test utilities instead of reusing shared helpers
- ❌ Over-mocking critical logic or skipping essential assertions
- ❌ Leaving tests flaky or dependent on external network calls
- ❌ Ignoring accessibility, validation errors, or regression cases

Deliver only when the checklist is complete and the test suite is stable.
