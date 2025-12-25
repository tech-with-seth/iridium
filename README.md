# Iridium

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Router](https://img.shields.io/badge/React_Router-7.9-red?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Iridium is now a **small, opinionated starter** for building auth-protected React Router 7 apps with a clean UI kit and a minimal feature set. It ships with email/password auth, a profile editor, a simple dashboard, and an AI chat demo so you can start from a working app instead of an empty shell.

## Instant deploy

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/8Vtjm7?referralCode=YZe1VE&utm_medium=integration&utm_source=template&utm_campaign=generic)

## What you get

- **React Router 7 + React 19** with config-based routing and native meta tags
- **Authentication**: BetterAuth (email/password) with Prisma + sessions
- **Profile & dashboard**: View/edit profile, basic dashboard shell
- **AI chat demo**: Vercel AI SDK + OpenAI wired to a chat UI
- **UI system**: DaisyUI 5 + Tailwind CSS v4 + CVA-based components
- **Docs & patterns**: Short instructions for routing, validation, and components
- **Testing ready**: Vitest unit tests and Playwright e2e examples

Nice-to-have integrations stay optional (PostHog analytics, Resend emails). Billing, multi-tenancy, and shop flows have been scoped out to keep the starter lean.

## Quick start

```bash
git clone https://github.com/tech-with-seth/iridium.git
cd iridium
npm install

cp .env.example .env
# Fill in at least: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
# Optional: RESEND_API_KEY (emails), OPENAI_API_KEY (chat demo)

npx prisma generate
npx prisma migrate deploy
npm run seed

npm run dev
# Visit http://localhost:5173
# Test login: admin@iridium.com / Admin123!
```

## App overview

- **Public**: Home, sign-in, sign-out
- **Protected**: Dashboard, profile (view/edit), AI chat, design system demo
- **API**: Auth handler, profile CRUD, chat endpoint, feature flags (PostHog optional)

Routes live in `app/routes.ts` (config-based, not file-system routing). Run `npm run typecheck` after route edits to regenerate types.

## Architecture (lightweight)

- **Routing**: Config in `app/routes.ts`; React 19 meta elements in components
- **Auth**: BetterAuth + Prisma, session helpers in `app/lib/session.server.ts`
- **Data**: Model-layer helpers in `app/models/` (do not call Prisma directly in routes)
- **UI**: CVA + DaisyUI components in `app/components/` with `cx` from `app/cva.config.ts`
- **Validation**: Zod schemas in `app/lib/validations.ts`; shared server/client pattern in `app/lib/form-hooks.ts` and `app/lib/form-validation.server.ts`
- **AI**: OpenAI client singleton in `app/lib/ai.ts`; Vercel AI SDK streaming in chat endpoint

Custom Prisma client lives at `app/generated/prisma` (import from `~/generated/prisma/client`).

## Environment

Required

- `DATABASE_URL`
- `BETTER_AUTH_SECRET` (32+ chars)
- `BETTER_AUTH_URL` (e.g., <http://localhost:5173>)

Optional

- `OPENAI_API_KEY` (AI chat demo)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (transactional emails)
- `VITE_POSTHOG_API_KEY`, `VITE_POSTHOG_HOST` (analytics/feature flags)

See `.env.example` for the full list.

## Commands

- `npm run dev` — start dev server
- `npm run typecheck` — generate route types and run TS checks
- `npm run build` — production build
- `npm run test` — Vitest unit tests
- `npm run e2e` — Playwright suite

## Project structure (trimmed)

```text
app/
  routes.ts           # Config-based routing
  routes/             # Route modules (dashboard, profile, chat, design)
  components/         # CVA + DaisyUI components
  lib/                # Auth, AI, validation, utilities
  models/             # Server-side data helpers
  middleware/         # Auth/context/logging middleware
  generated/prisma/   # Prisma client (custom output)
prisma/               # Schema, migrations, seed
docs/                 # Guides and patterns
```

## Contributing

- Keep changes aligned with the smaller starter scope
- Use the model layer for data access (no direct Prisma in routes)
- Follow the CVA + DaisyUI component pattern
- Run `npm run typecheck` before opening a PR

## License

MIT License
