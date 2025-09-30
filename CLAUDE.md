# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
npm run dev           # Start development server (auto-generates types)
npm run build         # Production build
npm run typecheck     # Generate types + run TypeScript checks
npm start             # Start production server
npm run seed          # Seed database with initial data

# Database operations
npx prisma generate   # Regenerate Prisma client (after schema changes)
npx prisma migrate dev --name <description>  # Apply database migrations
npx prisma migrate deploy  # Production migrations
```

## Architecture Overview

This is a modern full-stack boilerplate using **React Router 7** (not v6) with BetterAuth authentication, OpenAI integration, and clean architecture patterns. The key architectural patterns are:

### Config-Based Routing (React Router 7)
- Routes are defined in `app/routes.ts` using `@react-router/dev/routes`
- **NEVER** use file-based routing patterns or React Router v6 syntax
- Always import route types as `./+types/[routeName]` (relative to route file)
- Run `npm run typecheck` after adding routes to generate types

### Singleton Pattern Services
- **Database**: `app/db.server.ts` - Global Prisma client
- **Auth**: `app/lib/auth.server.ts` - BetterAuth instance
- **AI**: `app/lib/ai.ts` - OpenAI client singleton
- **Cache**: `app/lib/cache.ts` - FlatCache instance with TTL support

### Custom Prisma Configuration
- Prisma client outputs to `app/generated/prisma` (not default location)
- Database singleton pattern prevents connection pooling issues
- BetterAuth adapter configured for PostgreSQL

## Key Development Patterns

### Adding Protected Routes
1. Add route to `app/routes.ts`
2. Create route file with loader that calls `requireUser(request)`
3. Use middleware in `app/middleware/auth.ts` for layout-based protection
4. Run `npm run typecheck` to generate types

### Creating API Endpoints
1. Add route to `api` prefix in `app/routes.ts`
2. Create handler in `app/routes/api/`
3. Use `requireUser()` for authentication
4. Handle multiple HTTP methods in single action function

### Database Schema Management
- Prisma client outputs to `app/generated/prisma` (not default location)
- BetterAuth requires specific models: User, Account, Session, Verification
- Clean schema with email/password authentication

### Authentication Flow
- BetterAuth with Prisma adapter handles all auth logic
- Session helpers in `app/lib/session.server.ts`:
  - `requireUser()` for protected routes
  - `requireAnonymous()` for auth pages
  - `getUser()` for optional user context
- Middleware-based protection in `app/middleware/auth.ts`

### AI Integration
- OpenAI client singleton in `app/lib/ai.ts`
- Streaming responses using `streamText()` from `ai` package
- Client-side integration with `useChat()` hook from `@ai-sdk/react`

### Caching Strategy
- File-based caching with TTL support via `flat-cache`
- User-scoped keys: `getUserScopedKey(userId, key)`
- Check expiration: `isCacheExpired(key)`

## Required Environment Variables

```bash
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:5173"
OPENAI_API_KEY="sk-..."

# Optional - for Polar.sh billing integration
POLAR_ACCESS_TOKEN="polar_at_..."
POLAR_SERVER="sandbox"  # or "production"
POLAR_WEBHOOK_SECRET="your-polar-webhook-secret"
```

## Critical Anti-Patterns to Avoid

- ❌ Using React Router v6 patterns or `react-router-dom`
- ❌ File-based routing assumptions (routes.ts is source of truth)
- ❌ Direct Prisma imports (use singleton from `~/db.server`)
- ❌ Missing type generation (`npm run typecheck` after route changes)
- ❌ Manual session management (use session helpers)
- ❌ Bypassing auth middleware for protected routes

## Import Patterns

```typescript
// Prisma client (custom output path)
import { prisma } from "~/db.server";

// Route types (relative import)
import { Route } from "./+types/dashboard";

// Auth helpers
import { requireUser, getUser } from "~/lib/session.server";

// AI client
import { openai } from "~/lib/ai";

// Auth client
import { authClient } from "~/lib/auth-client";

// Utilities and validation
import { userSchema } from "~/lib/validations";
import { cn } from "~/lib/utils";
```