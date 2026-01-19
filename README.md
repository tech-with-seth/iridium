# Iridium

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Router](https://img.shields.io/badge/React_Router-7.9-red?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Iridium is a **small, opinionated starter** for building auth-protected React Router 7 apps with a clean UI kit and a minimal feature set. It ships with email/password auth (plus social OAuth), a threaded AI chat dashboard, and design/form demos so you can start from a working app instead of an empty shell.

## Instant deploy

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/?referralCode=YZe1VE)

## What you get

- **React Router 7 + React 19** with config-based routing and native meta tags
- **Authentication**: BetterAuth (email/password + GitHub/Google OAuth) with Prisma + sessions
- **Dashboard + chat**: Threaded chat UI wired to Vercel AI SDK + OpenAI
- **UI system**: DaisyUI 5 + Tailwind CSS v4 + CVA-based components
- **Docs & patterns**: Instruction guides for routing, validation, components, auth, and CRUD
- **Testing ready**: Vitest unit tests and Playwright e2e examples

Nice-to-have integrations stay optional (PostHog analytics/LLM tracking, Resend emails, Polar billing). Multi-tenancy and full shop flows stay out of scope to keep the starter lean.

## Quick start

```bash
git clone https://github.com/tech-with-seth/iridium.git
cd iridium
npm install

cp .env.example .env
# Fill in at least: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, VITE_BETTER_AUTH_BASE_URL
# Optional: OPENAI_API_KEY (chat demo), RESEND_API_KEY (emails), PostHog, Polar, OAuth providers

npx prisma generate
npx prisma migrate deploy
npm run seed

npm run dev
# Visit http://localhost:5173
# Test login: admin@iridium.com / Admin123!
```

## App overview

- **Public**: Landing, success, checkout
- **Protected**: Dashboard + threads, chat, design system demo, forms demo, Polar portal
- **API**: BetterAuth handler, sign-out endpoint, chat, email, interest list, PostHog feature flags, Polar webhooks

Routes live in `app/routes.ts` (config-based, not file-system routing). Run `npm run typecheck` after route edits to regenerate types.

## Architecture (lightweight)

- **Routing**: Config in `app/routes.ts`; React 19 meta elements in components
- **Auth**: BetterAuth + Prisma, session helpers in `app/lib/session.server.ts`
- **Data**: Model-layer helpers in `app/models/` when available
- **UI**: CVA + DaisyUI components in `app/components/` with `cx` from `app/cva.config.ts`
- **Validation**: Zod schemas in `app/lib/validations.ts`; shared server/client pattern in `app/lib/form-hooks.ts` and `app/lib/form-validation.server.ts`
- **AI**: OpenAI SDK client in `app/lib/ai.ts`; Vercel AI SDK streaming with `chatTools`
- **Analytics/Email/Billing**: PostHog, Resend, Polar clients in `app/lib/`

Custom Prisma client lives at `app/generated/prisma` (import from `~/generated/prisma/client`).

## Environment

Required

- `DATABASE_URL`
- `BETTER_AUTH_SECRET` (32+ chars)
- `BETTER_AUTH_URL` (e.g., <http://localhost:5173>)
- `VITE_BETTER_AUTH_BASE_URL` (client auth base URL)

Optional

- `OPENAI_API_KEY` (AI chat demo)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (transactional emails)
- `DEFAULT_THEME`, `ADMIN_EMAIL`
- `VITE_POSTHOG_API_KEY`, `VITE_POSTHOG_API_HOST`, `VITE_POSTHOG_UI_HOST`, `VITE_POSTHOG_HOST`, `VITE_POSTHOG_PROJECT_ID` (client analytics)
- `POSTHOG_API_KEY`, `POSTHOG_HOST`, `POSTHOG_PROJECT_ID`, `POSTHOG_PERSONAL_API_KEY` (server analytics/feature flags)
- `POLAR_ACCESS_TOKEN`, `POLAR_ORGANIZATION_ID`, `POLAR_PRODUCT_ID`, `POLAR_SERVER`, `POLAR_SUCCESS_URL`, `POLAR_RETURN_URL`, `POLAR_WEBHOOK_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

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
  routes/             # Route modules (landing, dashboard, chat, design, forms)
  components/         # CVA + DaisyUI components
  lib/                # Auth, AI, validation, PostHog, Resend, Polar
  models/             # Server-side data helpers
  middleware/         # Auth/context/logging middleware
  generated/prisma/   # Prisma client (custom output)
prisma/               # Schema, migrations, seed
docs/                 # Guides and patterns
```

## Contributing

- Keep changes aligned with the smaller starter scope
- Prefer the model layer for data access when available
- Follow the CVA + DaisyUI component pattern
- Run `npm run typecheck` before opening a PR

## License

MIT License
