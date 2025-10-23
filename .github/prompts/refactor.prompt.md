---
agent: 'agent'
tools: ['search/codebase', 'usages', 'changes', 'edit', 'runTests']
description: 'Refactor existing code safely while preserving behavior'
---

# Refactor Existing Code

You are improving existing code quality without changing observable behavior. Follow the established architecture and ensure the system remains stable. Reference these guides:

- `.github/instructions/pure-functions.instructions.md`
- `.github/instructions/horizontal-slice.instructions.md`
- `.github/instructions/component-patterns.instructions.md`
- `.github/instructions/react-router.instructions.md`
- Any feature-specific instructions relevant to the target area

## Step 1: Understand Current Behavior

1. Review the user story or module purpose.
2. Inspect existing tests (Vitest/Playwright) and documentation.
3. Confirm inputs, outputs, side effects, and invariants.
4. Run existing tests to capture the current baseline if time permits.

Document assumptions and acceptance criteria before refactoring.

## Step 2: Map Dependencies

- Use symbol searches to find all usages of the target functions/components.
- Note external contracts (API responses, props interfaces, DB schemas).
- Identify shared utilities or middleware that must remain compatible.

## Step 3: Design the Refactor

Define the goal and approach:

- Simplify complex logic into pure functions where possible.
- Extract reusable modules or hooks.
- Align with architectural patterns (vertical/horizontal slices, middleware, models).
- Ensure CVA + DaisyUI consistency for UI updates.

Write down the planned changes and confirm they preserve behavior.

## Step 4: Execute Incremental Changes

1. Refactor in small, verifiable steps.
2. Maintain TypeScript types and update signatures carefully.
3. Keep git history clean—avoid mixing unrelated changes.
4. Add concise comments only when the intent would otherwise be unclear.

## Step 5: Update Tests & Docs

- Adjust unit/integration tests if interfaces change.
- Add new tests to guard fixed bugs or clarified behavior.
- Update documentation (`docs/`, `.github/instructions/`, READMEs) if public patterns shift.
- Use `codify.prompt.md` when establishing new conventions.

## Step 6: Verify Behavior

- Run targeted test suites (`npm run test`, `npm run e2e`, or scoped commands).
- Execute `npm run typecheck` if types or routes changed.
- Manually exercise critical flows when appropriate.

## Checklist

- [ ] Current behavior and invariants documented
- [ ] All dependencies and usages reviewed
- [ ] Refactor plan confirmed to preserve behavior
- [ ] Changes implemented incrementally with clean diffs
- [ ] Tests updated/passing and typecheck clean
- [ ] Documentation reflects any new patterns or interfaces
- [ ] Manual verification performed when needed

## Anti-Patterns to Avoid

- ❌ Mixing refactors with feature work or bug fixes
- ❌ Changing public APIs without coordinating updates
- ❌ Removing tests instead of updating them
- ❌ Introducing breaking changes without versioning/migration plan
- ❌ Leaving dead code or TODOs without follow-up issues

Deliver the refactor only when confidence is high that behavior is preserved and code quality has measurably improved.
