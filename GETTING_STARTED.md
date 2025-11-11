# Getting Started

Quick reference for bootstrapping Iridium, daily workflow, common commands, and critical gotchas. Use this while building features.

For comprehensive documentation, see [`docs/README.md`](./docs/README.md).

---

## Initial Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd <YOUR_PROJECT_NAME>
npm install
```

### 2. Environment Variables

Copy and fill the example env file (**do NOT commit `.env`**):

```bash
cp .env.example .env
# Edit .env and fill real values for required keys below
```

**Required environment variables**:

```bash
# Database - replace with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/iridium"

# Auth Secret - generate with: openssl rand -base64 32
BETTER_AUTH_SECRET="<run: openssl rand -base64 32>"

# Auth URL - use http://localhost:5173 for local dev
BETTER_AUTH_URL="http://localhost:5173"

# Email - required for auth flows (sign up, password reset, etc.)
# Get free API key from https://resend.com
RESEND_API_KEY="re_your-resend-api-key-here"
RESEND_FROM_EMAIL="onboarding@resend.dev"  # Use resend.dev for testing
```

**Optional environment variables** (app works without these):

```bash
# AI features (optional - only needed if using AI functionality)
OPENAI_API_KEY="sk-proj-your-openai-api-key-here"

# Analytics & Feature Flags (optional)
VITE_POSTHOG_API_KEY="phc_..."
VITE_POSTHOG_HOST="https://us.i.posthog.com"
POSTHOG_PERSONAL_API_KEY="phx_..."
VITE_POSTHOG_PROJECT_ID="12345"

# Billing (optional - only for Polar integration)
POLAR_ACCESS_TOKEN="polar_at_..."
POLAR_SERVER="sandbox"
POLAR_WEBHOOK_SECRET="..."
```

**Generate your auth secret**:

```bash
# macOS/Linux
openssl rand -base64 32

# Copy the output and paste it as your BETTER_AUTH_SECRET in .env
```

See [`.env.example`](./.env.example) for full documentation.

### 3. Database Setup

**Create the PostgreSQL database** (if it doesn't exist):

```bash
# Option 1: Using psql command line
createdb iridium

# Option 2: Using psql shell
psql -U postgres
CREATE DATABASE iridium;
\q

# Option 3: Using Docker (if you don't have PostgreSQL installed)
docker run --name iridium-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=iridium -p 5432:5432 -d postgres:16
# Then update DATABASE_URL in .env to: postgresql://postgres:password@localhost:5432/iridium
```

**Run migrations and seed data**:

```bash
npx prisma generate                    # Generate Prisma client (required first time)
npx prisma migrate deploy              # Apply existing migrations to your database
npm run seed                           # Seed test users and organizations
```

**Test user credentials** (created by `npm run seed`):

```text
Admin:   admin@iridium.com   / Admin123!
Editor:  editor@iridium.com  / Editor123!
Users:   alice@iridium.com   / Alice123!
         bob@iridium.com     / BobBob123!
         charlie@iridium.com / Charlie123!
```

### 4. Start Development Server

```bash
npm run dev
```

Dev server auto-generates route types. If types are missing, run `npm run typecheck`.

---

## Daily Workflow

### Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run typecheck` | Generate route types + TypeScript check |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma migrate dev --name <desc>` | Create and apply database migration |
| `npm run seed` | Seed database with dev data |
| `npm test` | Run unit tests |
| `npm run build` | Production build |
| `npm start` | Start production server |

**VS Code Tasks**: Use the Command Palette → "Run Task" for pre-configured tasks (dev, typecheck, prisma:*, railway:*, test:*, e2e:*).

### After Building a Feature

1. **Generate route types**: `npm run typecheck` — React Router 7 requires generated types (`.react-router/types/...`).
2. **Database changes**: If you modified Prisma schema:

   ```bash
   npx prisma migrate dev --name <description>
   npx prisma generate
   ```

3. **Restart dev server**: `npm run dev` and smoke test your route/API.
4. **Verify auth flows**: Ensure `BETTER_AUTH_*` env vars are set for protected routes.
5. **Run tests**: `npm test` (and E2E via workspace tasks).

---

## Critical Gotchas

### Route Types (React Router 7)

- **Must run `npm run typecheck`** after adding routes to generate types.
- Import route types with **relative path**: `import type { Route } from './+types/your-route';`
- Routes are config-based in `app/routes.ts`, not file-based.

### Prisma Client

- Custom output path: `~/generated/prisma/client` (not `@prisma/client`).
- **Always run `npx prisma generate`** after schema changes.
- Restart dev server after regenerating client.

### Authentication

- `BETTER_AUTH_SECRET` must be **≥32 characters**.
- Missing/incorrect auth env vars break sessions and protected routes.
- Protected routes use middleware in layout files (e.g., `app/routes/authenticated.tsx`).

### Environment Variables

- Client-side env vars **must have `VITE_` prefix** (e.g., `VITE_POSTHOG_API_KEY`).
- Server-only vars have no prefix (e.g., `BETTER_AUTH_SECRET`).

### Styling

- Uses **DaisyUI 5** + **Tailwind CSS 4** + **CVA** for component variants.
- Always use `cx()` utility from `~/cva.config` for className merging.

---

## Where to Go Next

### Build Your First Feature

**Start here if you're ready to build:**

- **[Build Your First Feature](./BUILD_YOUR_FIRST_FEATURE.md)** - Complete bookmarks CRUD tutorial (20 mins)
- **[Form Building Guide](./FORM_BUILDING.md)** - All form patterns with React Hook Form + Zod
- **[Image Handling Guide](./IMAGE_HANDLING.md)** - File uploads with Cloudinary

### Reference Documentation

- **Development patterns**: [`docs/development.md`](./docs/development.md)
- **Routing & route types**: [`docs/routing.md`](./docs/routing.md)
- **Database/Prisma**: [`docs/decisions/003-postgresql-prisma.md`](./docs/decisions/003-postgresql-prisma.md)
- **Testing**: [`docs/testing.md`](./docs/testing.md)
- **Troubleshooting**: [`docs/troubleshooting.md`](./docs/troubleshooting.md)
- **AI/Agents**: [`AGENTS.md`](./AGENTS.md)
- **Full docs**: [`docs/README.md`](./docs/README.md)

---

## CI/CD Recommendation

Add these steps to your CI pipeline to catch type and Prisma regressions:

```yaml
# Example GitHub Actions steps
- name: Install dependencies
  run: npm ci

- name: Generate route types & typecheck
  run: npm run typecheck

- name: Generate Prisma client
  run: npx prisma generate

- name: Run tests
  run: npm test
```

See [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) for the full workflow.
