<!--
SYNC IMPACT REPORT
==================
Version change: (unversioned template) → 1.0.0
Bump rationale: Initial ratification — template placeholders replaced with
  concrete, project-derived principles. First adopted version.

Modified principles: (all newly defined from template slots)
  [PRINCIPLE_1] → I. Type Safety & Validation First
  [PRINCIPLE_2] → II. Server/Client Boundary Discipline
  [PRINCIPLE_3] → III. Test Coverage (Unit + E2E)
  [PRINCIPLE_4] → IV. Convention-Driven Architecture
  [PRINCIPLE_5] → V. Security & Resource Guardrails

Added sections:
  - Technology Constraints (was [SECTION_2_NAME])
  - Development Workflow & Quality Gates (was [SECTION_3_NAME])

Removed sections: none

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — "Constitution Check" gate is generic
     and resolves against this file; no edit required.
  ✅ .specify/templates/spec-template.md — no hardcoded principle references; aligned.
  ✅ .specify/templates/tasks-template.md — task categories are generic; aligned.

Follow-up TODOs: none — ratification date set to first adoption (2026-06-04).
-->

# Iridium Constitution

## Core Principles

### I. Type Safety & Validation First

The type system and schema validation are the first line of defense, not an afterthought.

- All external input MUST be validated with Zod before use: form data, search params,
  request bodies, and environment variables.
- Environment variables MUST be read through the validated `env` module
  (`app/lib/env.server.ts`), never `process.env` directly in application code.
- Route loader/action argument types MUST come from generated `./+types/<route>` —
  hand-typed `LoaderArgs`/`ActionArgs` are prohibited.
- Prisma enums MUST be preferred over free-form string fields for fixed value sets
  (roles, statuses, types).

**Rationale**: SSR, auth, and AI streaming all cross trust boundaries where a bad value
is a runtime failure or a security hole. Validating at the edge keeps the rest of the
code able to trust its inputs.

### II. Server/Client Boundary Discipline

The line between server-only and client-safe code MUST stay explicit and unbroken.

- Server-only modules MUST use the `.server.ts` suffix.
- The Prisma client MUST be imported only in `*.server.ts` model files, never in route
  components or client code.
- Database queries and sensitive logic MUST live in `app/models/*.server.ts` as plain
  async functions, not inline in loaders/actions.
- Server functions MUST return clean typed shapes, not raw Prisma models.
- Auth checks MUST use the shared `getUserFromSession` / `requireUser` /
  `requireRole` patterns — no ad hoc session parsing.

**Rationale**: A leaked server import bloats the client bundle or exposes secrets. A
consistent boundary keeps the data-access layer testable and the security model uniform.

### III. Test Coverage (Unit + E2E)

Behavior that matters MUST be protected by tests at the right level.

- Unit tests use Vitest (`describe`/`it`/`expect`/`vi`) — never Jest — and are
  co-located with the code they test as `*.test.ts`.
- Integration tests are preferred over heavily mocked unit tests.
- User-facing flows (auth, navigation, chat, tool rendering, access control) MUST be
  covered by Playwright E2E tests in `tests/`.
- A failing test MUST be fixed or flagged — never rewritten merely to pass.

**Rationale**: The app couples auth, persistence, and streaming AI; bugs hide in the
seams between them. Integration and E2E coverage catch regressions that mocked unit
tests cannot.

### IV. Convention-Driven Architecture

New code MUST follow the established patterns rather than inventing parallel ones.

- Routes are defined in `app/routes.ts` using config helpers (`index`/`route`/`prefix`),
  NOT file-system routing. API routes live under `/api` and export only `loader`/`action`.
- The data-access layer is plain async functions in `app/models/*.server.ts` — no
  classes or ORM wrappers.
- Components use CVA from `cva.config`, DaisyUI v5 class names, the `~/` import alias,
  named function declarations, and named exports (no default exports).
- React Router v7 framework-mode patterns are the source of truth for routing, error
  boundaries, and form/action handling.

**Rationale**: A small codebase with one way to do each thing stays navigable. Divergent
patterns multiply the surface every future change must reason about.

### V. Security & Resource Guardrails

Protected resources MUST stay protected and finite resources MUST stay bounded.

- Protected routes MUST declare the auth middleware; access control MUST be enforced
  server-side, not assumed from the UI.
- Cross-user data access MUST be prevented at the query layer (scope reads/writes to the
  authenticated user) and covered by tests.
- Rate-limited endpoints (chat, note creation) MUST keep their limits; new
  expensive or abusable endpoints MUST add limits.
- Destructive data operations MUST prefer soft deletes (`deletedAt`) over hard deletes,
  and Prisma `migrate`/`db push` MUST NOT run without explicit human approval.

**Rationale**: This is a multi-user app with an external AI bill attached. An unguarded
endpoint is both a privacy breach and a cost-amplification vector.

## Technology Constraints

- **Runtime/Tooling**: Bun for dev and scripts; Prisma CLI invoked as `bunx --bun prisma`.
- **Framework**: React Router v7 (SSR, `v8_middleware` future flag).
- **Auth**: Better Auth with the Prisma adapter and admin plugin (roles USER < EDITOR < ADMIN).
- **Data**: PostgreSQL via Prisma; app data and VoltAgent memory live in separate databases.
- **AI**: Vercel AI SDK + VoltAgent; agent tools live in `app/voltagent/tools/`.
- **Styling**: Tailwind CSS v4 + DaisyUI v5; CVA with tailwind-merge; lucide-react icons.
- **Formatting**: Prettier (80 cols, 4-space indent, single quotes, semicolons,
  tailwindcss plugin) and ESLint with typescript-eslint + react-hooks. No em dashes or
  `--` separators in prose.

## Development Workflow & Quality Gates

- `bun run validate` (typecheck + lint + format:check) MUST pass before a change is
  considered done; `bun run test` and relevant E2E suites MUST pass for behavior changes.
- After Prisma schema changes, `bunx --bun prisma generate` MUST be run and the migration
  reviewed before merge.
- Cleanup and incidental fixes MUST be kept separate from feature work for reviewability.
- Documentation (CLAUDE.md, README, rules) MUST be updated when a change makes existing
  docs wrong — not merely incomplete.

## Governance

This constitution supersedes ad hoc practice. When code and a principle conflict, the
principle wins or the principle is amended — code does not silently diverge.

- **Amendments**: Proposed via PR that edits this file, states the rationale, and bumps
  the version. Changes affecting dependent templates (`plan`, `spec`, `tasks`) MUST update
  those templates in the same change.
- **Versioning**: Semantic. MAJOR for backward-incompatible removals/redefinitions of a
  principle or governance rule; MINOR for a new principle/section or materially expanded
  guidance; PATCH for clarifications and wording.
- **Compliance**: Plans MUST pass the Constitution Check gate before research and again
  after design. Complexity that violates a principle MUST be justified in the plan's
  Complexity Tracking table or the design MUST be simplified.
- **Runtime guidance**: `CLAUDE.md` and `.claude/rules/*.md` provide day-to-day
  development guidance consistent with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-06-04 | **Last Amended**: 2026-06-04
