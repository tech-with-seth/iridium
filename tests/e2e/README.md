# E2E Tests (Phase 1 Baseline)

Phase 1 keeps Playwright simple and stable. The goal is a minimal, reliable
suite that verifies the app starts and core signed-out flows work.

## Run

```bash
npm run e2e
npm run e2e:ui
npm run e2e:headed
npm run e2e:debug
npm run e2e:report
```

## Structure

```
tests/e2e/
  smoke.spec.ts
```

## Writing Tests

- Keep setup, action, and assertions separated (use `test.step`).
- Prefer semantic selectors (`getByRole`, `getByLabel`) over CSS selectors.
- Avoid timing hacks (`waitForTimeout`).
- Focus on user-visible flows that survive UI refactors.

## Deferred (by design)

- Database seeding and authenticated journeys
- Storage-state auth, fixtures, and advanced helpers
- CI gating or nightly pipelines
