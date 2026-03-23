# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Iridium is a full-stack AI chat application built with React Router v7 (SSR), Better Auth, Prisma/PostgreSQL, and Vercel AI SDK with VoltAgent.

## Build & Dev Commands

| Command | Purpose |
| --- | --- |
| `bun install` | Install dependencies |
| `bun run dev` | Start dev server (port 5173) |
| `bun run build` | Production build |
| `bun run typecheck` | Generate route types + run tsc |
| `bun run seed` | Seed database with test users |
| `bun run studio` | Open Prisma Studio GUI |

Prisma CLI: always use `bunx --bun prisma <command>` (not `npx`).

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

Agent tools are defined in `app/voltagent/tools/` (e.g., `create_note`, `list_notes`, `search_notes`).

### Rate Limiting

In-memory sliding window in `app/lib/rate-limit.server.ts`. Used for chat (20/min) and note creation (10/hour). Single-instance only — needs Redis for distributed setups.

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

- `app/context.ts` — `userContext` via React Router's `createContext<User | null>`
- `app/shared.ts` — shared className helpers (`listItemClassName`, `navLinkClassName`)

### Layout

Root layout in `app/root.tsx`: header nav → 3/9 grid (sidebar + content) → footer. Auth-conditional nav items with right-side DaisyUI `Drawer` for mobile.

### Formatting

Prettier with: 80 char width, 4-space tabs, single quotes, semicolons, tailwindcss plugin for class sorting.
