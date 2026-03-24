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

Run a single Playwright test: `bunx playwright test tests/auth.spec.ts --project=chromium`

Prisma CLI: always use `bunx --bun prisma <command>` (not `npx`).

## Local Setup

```sh
cp .env.example .env        # fill in BETTER_AUTH_SECRET and ANTHROPIC_API_KEY
docker compose -f docker-compose.dev.yml up -d   # starts Postgres
bun install
bun run db:migrate
bun run dev
```

Environment variables are validated at startup by `app/lib/env.server.ts` — missing or invalid vars produce clear error messages.

## Tech Stack

- **Framework**: React Router v7 with SSR and `v8_middleware` future flag
- **Auth**: Better Auth with Prisma adapter, admin plugin (roles: USER < EDITOR < ADMIN)
- **Database**: PostgreSQL via Prisma ORM (schema at `prisma/schema.prisma`, generated client at `app/generated/prisma/`)
- **AI**: Vercel AI SDK (`ai`, `@ai-sdk/react`) + VoltAgent with `anthropic/claude-3-haiku-20240307`
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

- `thread.server.ts` — thread CRUD + `saveChat` (upserts last 2 messages)
- `message.server.ts` — `addMessageToThread`
- `session.server.ts` — `getUserFromSession`, `requireUser`, `requireAnonymous`, `hasRole`, `requireRole`

### Auth Flow

- Server config: `app/lib/auth.server.ts` (Better Auth + Prisma adapter)
- Client config: `app/lib/auth.client.ts` (`createAuthClient` + `adminClient` plugin)
- API passthrough: `/api/auth/*` → `auth.handler` in `app/routes/api-auth.ts`
- Middleware: `app/middleware/auth.ts` checks session, redirects to `/login`, stores user in `userContext`
- Protect a route: `export const middleware: Route.MiddlewareFunction[] = [authMiddleware]`

### AI Chat Flow

1. Client sends messages via `useChat` (`@ai-sdk/react`) with `DefaultChatTransport` → `/api/chat`
2. Server validates session, applies rate limiting (20 req/min), streams via `agent.streamText()`
3. VoltAgent manages conversation memory (PostgreSQL-backed) and calls tools as needed
4. `UIMessage.parts` are serialized as JSON string in the `content` DB column
5. On completion, `saveChat()` upserts messages to the database

Agent tools are defined in `app/voltagent/tools/` (e.g., `create_note`, `list_notes`, `search_notes`, `render_card`). The `render_card` tool demonstrates VoltAgent's tool-driven generative UI pattern -- the agent returns structured data and `CardToolPart` renders it as a rich visual card.

### Rate Limiting

In-memory sliding window in `app/lib/rate-limit.server.ts`. Used for chat (20/min) and note creation (10/hour). Single-instance only — needs Redis for distributed setups.

### Environment Validation

`app/lib/env.server.ts` validates all required env vars (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_BASE_URL`, `ANTHROPIC_API_KEY`) with Zod at startup. Import `env` from this module instead of reading `process.env` directly in server code.

### Testing

**Unit tests** use Vitest (`bun run test`). Test files live alongside source files as `*.test.ts`. Modules that import server-side dependencies (auth, Prisma) need `vi.mock()` to avoid env validation side effects.

**E2E tests** use Playwright (`bun run test:e2e`) in `tests/`. Auth setup project runs first and saves `storageState` to `test-results/.auth/user.json` -- all browser projects reuse this so tests don't re-login. Test fixtures in `tests/fixtures.ts` export `test` (with `authedPage` fixture), `expect`, and `TEST_USER`. Chat tests mock `/api/chat` with canned SSE responses (no AI service needed).

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

Root layout in `app/root.tsx`: header nav → 3/9 grid (sidebar + content) → footer. Auth-conditional nav items with right-side DaisyUI `Drawer` for mobile.

### Formatting

Prettier with: 80 char width, 4-space indentation, single quotes, semicolons, tailwindcss plugin for class sorting. ESLint with typescript-eslint and react-hooks plugin.
