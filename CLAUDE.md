# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Iridium is a full-stack AI chat application built with React Router v7 (SSR), Better Auth, Prisma/PostgreSQL, and Vercel AI SDK with VoltAgent.

## Commands

| Command                | Purpose                              |
| ---------------------- | ------------------------------------ |
| `bun run dev`          | Start dev server (port 5173)         |
| `bun run build`        | Production build                     |
| `bun run typecheck`    | Generate route types + run tsc       |
| `bun run lint`         | ESLint check                         |
| `bun run format`       | Prettier write                       |
| `bun run format:check` | Prettier check (no write)            |
| `bun run validate`     | typecheck + lint + format:check      |
| `bun run test`         | Run Vitest unit tests                |
| `bun run test:watch`   | Run Vitest in watch mode             |
| `bun run test:e2e`     | Run all Playwright E2E tests         |
| `bun run db:migrate`   | Run Prisma migrations                |
| `bun run db:seed`      | Seed database with test users        |
| `bun run db:fresh`     | Reset DB + migrate + seed (one shot) |
| `bun run db:studio`    | Open Prisma Studio GUI               |
| `bun run db:push`      | Push schema without migration        |
| `bun run db:generate`  | Regenerate Prisma client             |
| `bun run docker:up`    | Start both Postgres containers       |
| `bun run docker:down`  | Stop containers (data preserved)     |
| `bun run docker:nuke`  | Stop containers and delete volumes   |

Run a single Playwright test: `bunx playwright test tests/auth.spec.ts --project=chromium`

Prisma CLI: always use `bunx --bun prisma <command>` (not `npx`).

## Local Setup

```sh
cp .env.example .env        # fill in BETTER_AUTH_SECRET and ANTHROPIC_API_KEY
bun install
bun run docker:up           # starts both Postgres containers
bun run db:migrate          # apply Prisma migrations
bun run db:seed             # seed demo users
bun run dev
```

### Two-Database Setup

The app runs two PostgreSQL instances via `docker-compose.dev.yml`:

| Database    | Port | Env Var                  | Purpose                          |
| ----------- | ---- | ------------------------ | -------------------------------- |
| `iridium`   | 5432 | `DATABASE_URL`           | Prisma (app data, auth, threads) |
| `voltagent` | 5433 | `VOLTAGENT_DATABASE_URL` | VoltAgent memory and state       |

VoltAgent creates its own tables automatically on first connection -- no migration needed.

Environment variables are validated at startup by `app/lib/env.server.ts` -- missing or invalid vars produce clear error messages.

## Tech Stack

- **Framework**: React Router v7 with SSR and `v8_middleware` future flag
- **Auth**: Better Auth with Prisma adapter, admin plugin (roles: USER < EDITOR < ADMIN)
- **Database**: PostgreSQL via Prisma ORM (schema at `prisma/schema.prisma`, generated client at `app/generated/prisma/`)
- **AI**: Vercel AI SDK (`ai`, `@ai-sdk/react`) + VoltAgent. Per-thread model selection against the allowlist in `app/lib/ai-models.ts` (Haiku 4.5 default)
- **Email**: Resend + react-email behind `app/lib/email.server.ts` (console fallback without `RESEND_API_KEY`)
- **Styling**: Tailwind CSS v4 + DaisyUI v5, CVA with tailwind-merge
- **Runtime**: Bun (dev), Node 20 Alpine (Docker/prod)
- **Validation**: Zod + React Hook Form
- **Icons**: lucide-react

## Architecture

### Routing (config-based, NOT file-system)

Routes are defined in `app/routes.ts` using `@react-router/dev/routes` helpers (`index`, `route`, `prefix`). Route files export: `middleware` array (optional) → `loader` → `action` → `default` component.

Auto-generated types: `import type { Route } from './+types/<routeName>'`.

API routes live under `/api` prefix and export only `loader`/`action` (no component).

### Data Access Layer

Plain async functions in `app/models/*.server.ts` — no classes, no ORM wrappers. Functions use the Prisma client directly.

- `thread.server.ts` — thread CRUD + `saveChat` (upserts last 2 messages), `searchThreads`, `updateThreadModel`, `deleteTrailingAssistantMessages`
- `note.server.ts` — note CRUD with search, counts, and pagination params
- `message.server.ts` — `addMessageToThread`
- `session.server.ts` — `getUserFromSession`, `requireUser`, `requireAnonymous`, `hasRole`, `requireRole`
- `user.server.ts` — `getUserById`, `updateUserProfile`

**Soft deletes**: `Thread` and `Note` have `deletedAt`; every read in the model layer filters `deletedAt: null` and deletes set the timestamp. The model layer is the only Prisma entry point for these tables — never query them from routes directly.

### Auth Flow

- Server config: `app/lib/auth.server.ts` (Better Auth + Prisma adapter)
- Client config: `app/lib/auth.client.ts` (`createAuthClient` + `adminClient` plugin)
- API passthrough: `/api/auth/*` → `auth.handler` in `app/routes/api-auth.ts`
- Middleware: `app/middleware/auth.ts` checks session, redirects to `/login`, stores user in `userContext`
- Protect a route: `export const middleware: Route.MiddlewareFunction[] = [authMiddleware]`
- Account flows: `/forgot-password` + `/reset-password` (token emails via `sendResetPassword`), `/settings` (profile, change password, delete account). Verification emails send on sign-up but sign-in is not gated (`requireEmailVerification` stays off — the E2E fixtures rely on sign-up auto-login)
- Admin: `/admin` (requireAdmin) lists users with search/pagination and supports role changes, ban/unban, and impersonation (`/stop-impersonating` ends it; banner renders from SiteHeader). Gotcha: the admin plugin's `adminRoles` AND its `roles` permission map must be re-keyed to the uppercase Role enum or every admin API call returns FORBIDDEN (see `auth.server.ts`)

### AI Chat Flow

1. Client sends messages via `useChat` (`@ai-sdk/react`) with `DefaultChatTransport` → `/api/chat`
2. Server validates session, applies rate limiting (20 req/min), streams via `agent.streamText()`
3. VoltAgent manages conversation memory (PostgreSQL-backed) and calls tools as needed
4. `UIMessage.parts` are serialized as JSON string in the `content` DB column
5. On completion, `saveChat()` upserts messages to the database

Agent tools are defined in `app/voltagent/tools/` (`create_note`, `list_notes`, `search_notes`, `render_card`, `get_weather`, `get_current_datetime`). The `render_card` tool demonstrates VoltAgent's tool-driven generative UI pattern -- the agent returns structured data and `CardToolPart` renders it as a rich visual card.

Per-thread model: `Thread.model` is set via a `set-model` intent in the `/chat` action and flows into the agent's dynamic model callback through the call `context` Map. Regeneration (`useChat().regenerate()`) sends `trigger: 'regenerate-message'`; the server deletes trailing assistant rows, clears VoltAgent conversation memory, and resends trimmed history.

### Rate Limiting

In-memory sliding window in `app/lib/rate-limit.server.ts`. Used for chat (20/min) and note creation (10/hour). Single-instance only — needs Redis for distributed setups.

### Environment Validation

`app/lib/env.server.ts` validates all required env vars (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_BASE_URL`, `ANTHROPIC_API_KEY`, `VOLTAGENT_DATABASE_URL`) with Zod at startup, plus optional ones (`RESEND_API_KEY`, `EMAIL_FROM`, `DISABLE_AUTH_RATE_LIMIT`, `E2E_TEST_HOOKS`). Import `env` from this module instead of reading `process.env` directly in server code.

### Testing

**Unit tests** use Vitest (`bun run test`). Test files live alongside source files as `*.test.ts`. Modules that import server-side dependencies (auth, Prisma) need `vi.mock()` to avoid env validation side effects.

**E2E tests** use Playwright (`bun run test:e2e`) in `tests/`, covering auth, navigation, dashboard, notes, settings, password reset, theme switching, SEO endpoints, healthcheck, the chat flow, model selection/regeneration, agent tool rendering, chat error UX, the `/api/chat` API boundary, and cross-user thread access control. They run against a dedicated dev server on port `7778` (override with `E2E_PORT`) so they never collide with `bun run dev` on 5173; the `webServer` config also points `BETTER_AUTH_BASE_URL`/`VITE_BETTER_AUTH_BASE_URL` at that port and sets `DISABLE_AUTH_RATE_LIMIT=true`, `E2E_TEST_HOOKS=true` (enables `/api/test-mailbox` for reading reset links), plus a dummy `ANTHROPIC_API_KEY`.

Auth is explicit per test: the `authedPage` fixture in `tests/fixtures.ts` signs up a brand-new isolated user on demand (so every test starts with zero threads and parallel runs never share state), while a plain `page` stays logged out. `globalSetup` only ensures the seed users (Alice, Bob) exist for tests that log in as them. Fixtures also export `createAuthedContext` and `createThreadViaApi` for multi-user scenarios. Chat tests mock `/api/chat` with canned SSE responses (no AI service needed); tool-rendering tests stream `dynamic-tool` parts via helpers in `tests/chat-mock.ts`.

## Conventions

### Imports

- Use `~/` path alias for all app imports (maps to `./app/*`)
- Server-only files use `.server.ts` suffix

### Components

- Use CVA from `cva.config` (not the raw `cva` package) — it integrates `tailwind-merge`
- Export both variant definitions and a named function component
- Type props with `PropsWithChildren<Props>`
- Use DaisyUI v5 class names (`card`, `btn`, `chat-bubble`, `drawer`, `badge`, etc.)

### Routes

- Pages set `<title>` and `<meta>` inline in JSX — no `meta` export
- Use `<Form>` with `intent` hidden fields for action disambiguation
- Export `ErrorBoundary` using `isRouteErrorResponse` for error handling
- Use `tiny-invariant` for runtime assertions

### Context & Shared Styles

- `app/context.ts` — `userContext` via React Router's `createContext<SessionUser | null>`
- `app/shared.ts` — shared className helpers (`listItemClassName`, `navLinkClassName`)

### Layout

`app/root.tsx` is chrome-agnostic: it renders only the HTML document (`Layout`), the auth `loader` (`isAuthenticated`), and a bare `<Outlet/>`. All page chrome lives in per-section layout routes under `app/routes/layouts/`, composed in `routes.ts` via `layout(...)`:

- `layouts/app.tsx` — locked app shell (`h-dvh` grid: header → internal-scroll `main` → footer). Wraps `/dashboard`, `/chat`, `/notes`, `/settings`. Use this shell for app surfaces that should fill the viewport and scroll internally.
- `layouts/marketing.tsx` — growable document (`min-h-dvh` flex column, footer at content's end). Wraps `/` (landing).
- `layouts/auth.tsx` — full-bleed, no header/footer. Wraps `/login`, `/forgot-password`, `/reset-password`.

Shared chrome is extracted into `SiteHeader` and `SiteFooter` (`app/components/`). `SiteHeader` reads auth state via `useRouteLoaderData<typeof rootLoader>('root')` rather than props, and owns the skip link, the labeled Site/Main navs, the theme toggle, and the mobile nav overlay (hamburger with `aria-expanded`). Root also renders the flash `Toaster` and sets `data-theme` on `<html>` from the theme cookie.

**Definite height matters:** app/auth shells use `h-dvh` (a fixed height) so the `min-h-0` + `overflow-y-auto` chain can scroll children internally. `min-h-screen` is a minimum, not a definite height, and silently breaks internal scrolling once content exceeds the viewport.

### Formatting

Prettier with: 80 char width, 4-space indentation, single quotes, semicolons, tailwindcss plugin for class sorting. ESLint with typescript-eslint and react-hooks plugin.

<!-- SPECKIT START -->

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan

<!-- SPECKIT END -->
