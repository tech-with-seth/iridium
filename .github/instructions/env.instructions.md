````instructions
# Environment Variables & Modes

This document defines how to properly use environment variables in this Vite + React Router 7 project.

## 🧠 The Simple Mental Model (For Idiots Like Us)

**CLIENT CODE (Browser)**: `import.meta.env.VITE_*`
**SERVER CODE (Node.js)**: `process.env.*`
**BOTH CONTEXTS**: Must be prefixed with `VITE_` to be exposed to client

### Quick Decision Tree:

```
Is this code running in the browser?
├─ YES → Use import.meta.env.VITE_*
└─ NO → Running on server (Node.js)
    └─ Use process.env.*
```

---

## 🚨 CRITICAL: Security Rules

### ✅ Safe for Client (VITE_* prefix):
```bash
VITE_API_URL=https://api.example.com
VITE_POSTHOG_KEY=phc_public_key_123
VITE_APP_VERSION=1.0.0
VITE_FEATURE_FLAGS=true
```

### ❌ NEVER Expose to Client (No VITE_ prefix):
```bash
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=super_secret_key
OPENAI_API_KEY=sk-proj-...
POLAR_ACCESS_TOKEN=polar_at_...
STRIPE_SECRET_KEY=sk_live_...
```

**⚠️ SECURITY WARNING**: Any variable prefixed with `VITE_` will be embedded in your client JavaScript bundle and visible to anyone. Never prefix secrets with `VITE_`.

---

## Environment Variable Syntax by Context

### Client-Side Code (React Components, Hooks, Client Utils)

**Files**: `app/components/*`, `app/hooks/*`, `app/routes/*.tsx` (component code)

```tsx
// ✅ CORRECT - Client-side usage
export function ApiStatus() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const version = import.meta.env.VITE_APP_VERSION;

  return <div>API: {apiUrl} v{version}</div>;
}

// ✅ CORRECT - Built-in constants
if (import.meta.env.DEV) {
  console.log("Development mode");
}

if (import.meta.env.PROD) {
  // Production-only code
}

// ❌ WRONG - process.env doesn't exist in browser
const key = process.env.VITE_API_KEY; // undefined in browser!
```

### Server-Side Code (Loaders, Actions, Middleware, `.server.ts` files)

**Files**: `app/lib/*.server.ts`, `app/middleware/*`, route `loader`/`action` functions

```tsx
// ✅ CORRECT - Server-side usage
import type { Route } from "./+types/dashboard";

export async function loader({ request }: Route.LoaderArgs) {
  // Server has access to ALL env vars (not just VITE_*)
  const dbUrl = process.env.DATABASE_URL;
  const authSecret = process.env.BETTER_AUTH_SECRET;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Can also access VITE_* vars on server
  const publicApiUrl = process.env.VITE_API_URL;

  return { data: await fetchFromDb(dbUrl) };
}

// ❌ WRONG - import.meta.env is NOT available in Node.js context
const secret = import.meta.env.BETTER_AUTH_SECRET; // undefined!
```

### Universal Code (Runs in Both Contexts)

**Files**: Shared utilities that run on both client and server

```tsx
// ✅ CORRECT - Environment detection pattern
export function getApiUrl() {
  // Server-side
  if (typeof process !== 'undefined' && process.env.VITE_API_URL) {
    return process.env.VITE_API_URL;
  }

  // Client-side
  return import.meta.env.VITE_API_URL;
}

// ✅ BETTER - Use server-only files for secrets
// app/lib/config.server.ts
export const serverConfig = {
  database: process.env.DATABASE_URL,
  authSecret: process.env.BETTER_AUTH_SECRET
};

// app/lib/config.ts (client-safe)
export const clientConfig = {
  apiUrl: import.meta.env.VITE_API_URL,
  version: import.meta.env.VITE_APP_VERSION
};
```

---

## Built-in Vite Constants

These are **always available** in client code via `import.meta.env`:

```tsx
import.meta.env.MODE        // "development" | "production" | custom mode
import.meta.env.BASE_URL    // Base URL for assets (from vite config)
import.meta.env.PROD        // true in production
import.meta.env.DEV         // true in development
import.meta.env.SSR         // true when rendering on server
```

**Example Usage:**
```tsx
export function DevTools() {
  if (!import.meta.env.DEV) return null;

  return <div>Debug Panel - Mode: {import.meta.env.MODE}</div>;
}
```

---

## .env File Structure & Loading Priority

### File Hierarchy (Highest to Lowest Priority):

1. **Command-line environment** (highest priority)
   ```bash
   VITE_API_URL=https://prod.example.com npm run build
   ```

2. **`.env.[mode].local`** - Mode-specific, gitignored
   ```bash
   .env.production.local   # Production secrets (gitignored)
   .env.development.local  # Development secrets (gitignored)
   ```

3. **`.env.[mode]`** - Mode-specific, committed
   ```bash
   .env.production  # Production config (committed)
   .env.development # Development config (committed)
   .env.staging     # Custom staging mode (committed)
   ```

4. **`.env.local`** - All modes, gitignored
   ```bash
   .env.local       # Local overrides for all modes (gitignored)
   ```

5. **`.env`** - Base defaults (lowest priority)
   ```bash
   .env             # Default values for all environments (committed)
   ```

### Recommended Setup:

```bash
# .env (committed - safe defaults)
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Iridium

# .env.local (gitignored - local secrets)
DATABASE_URL=postgresql://localhost:5432/mydb
BETTER_AUTH_SECRET=local_dev_secret_key
OPENAI_API_KEY=sk-proj-local-dev-key

# .env.production (committed - production config)
VITE_API_URL=https://api.production.com
VITE_POSTHOG_HOST=https://us.i.posthog.com

# .env.production.local (gitignored - production secrets)
DATABASE_URL=postgresql://prod-db:5432/prod
BETTER_AUTH_SECRET=actual_production_secret
OPENAI_API_KEY=sk-proj-production-key
```

### .gitignore Requirements:

```gitignore
# Local environment files
.env.local
.env.*.local
.env.development.local
.env.production.local
```

---

## Modes vs NODE_ENV

### Understanding the Difference:

**`MODE`** - Vite's custom environment identifier (can be anything)
**`NODE_ENV`** - Node.js standard process environment

### Command Reference:

| Command | `NODE_ENV` | `MODE` | Loads |
|---------|-----------|-------|-------|
| `vite dev` | `"development"` | `"development"` | `.env.development` |
| `vite build` | `"production"` | `"production"` | `.env.production` |
| `vite build --mode staging` | `"production"` | `"staging"` | `.env.staging` |
| `NODE_ENV=development vite build` | `"development"` | `"production"` | `.env.production` |

### Custom Modes (Staging, Testing, etc.):

```bash
# Create .env.staging file
VITE_API_URL=https://staging-api.example.com
VITE_POSTHOG_HOST=https://staging.posthog.com
NODE_ENV=production  # Still optimized build

# Build with staging mode
npm run build -- --mode staging

# The app will:
# - Load .env.staging variables
# - Build optimized production bundle (NODE_ENV=production)
# - Use staging API URLs at runtime
```

### Access Mode in Code:

```tsx
// Client-side
const currentMode = import.meta.env.MODE;

// Server-side
const currentMode = process.env.MODE;
const nodeEnv = process.env.NODE_ENV;
```

---

## TypeScript IntelliSense for Environment Variables

### Setup Type Definitions:

Create `app/env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Public variables (exposed to client)
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_POSTHOG_API_KEY: string;
  readonly VITE_POSTHOG_HOST: string;
  readonly VITE_APP_VERSION: string;

  // Built-in Vite constants
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Server-side environment types (for .server.ts files)
declare namespace NodeJS {
  interface ProcessEnv {
    // Server-only secrets
    DATABASE_URL: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    OPENAI_API_KEY: string;
    POLAR_ACCESS_TOKEN?: string;
    POLAR_SERVER?: "sandbox" | "production";
    POLAR_WEBHOOK_SECRET?: string;

    // Public variables (also available on server)
    VITE_API_URL?: string;
    VITE_POSTHOG_API_KEY?: string;
    VITE_POSTHOG_HOST?: string;

    // Node.js standard
    NODE_ENV: "development" | "production" | "test";
    MODE?: string;
  }
}
```

### Benefits:
- ✅ Autocomplete for environment variables
- ✅ Type checking prevents typos
- ✅ Documents required vs optional variables
- ✅ Separate types for client vs server variables

---

## Common Patterns & Examples

### Pattern 1: API Configuration

```tsx
// app/lib/config.server.ts (server-only)
export const serverConfig = {
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    secret: process.env.BETTER_AUTH_SECRET,
    url: process.env.BETTER_AUTH_URL,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  }
} as const;

// app/lib/config.ts (client-safe)
export const publicConfig = {
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME,
    version: import.meta.env.VITE_APP_VERSION,
  },
  posthog: {
    apiKey: import.meta.env.VITE_POSTHOG_API_KEY,
    host: import.meta.env.VITE_POSTHOG_HOST,
  }
} as const;
```

### Pattern 2: Feature Flags

```tsx
// .env
VITE_FEATURE_NEW_DASHBOARD=true
VITE_FEATURE_AI_CHAT=false

// app/lib/features.ts
export const features = {
  newDashboard: import.meta.env.VITE_FEATURE_NEW_DASHBOARD === 'true',
  aiChat: import.meta.env.VITE_FEATURE_AI_CHAT === 'true',
} as const;

// Usage in component
import { features } from '~/lib/features';

export default function Dashboard() {
  if (features.newDashboard) {
    return <NewDashboard />;
  }
  return <LegacyDashboard />;
}
```

### Pattern 3: Environment-Specific Behavior

```tsx
// app/components/ErrorBoundary.tsx
export function ErrorBoundary({ error }: { error: Error }) {
  // Show detailed errors only in development
  if (import.meta.env.DEV) {
    return (
      <div>
        <h1>Error Details (Dev Only)</h1>
        <pre>{error.stack}</pre>
      </div>
    );
  }

  // Production: Generic error message
  return <h1>Something went wrong. Please try again.</h1>;
}
```

### Pattern 4: Conditional API Endpoints

```tsx
// app/lib/api.ts
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchProducts() {
  const response = await fetch(`${BASE_URL}/api/products`);
  return response.json();
}

// Different URLs per environment:
// Development: http://localhost:3000/api/products
// Staging: https://staging-api.example.com/api/products
// Production: https://api.example.com/api/products
```

---

## Variable Expansion in .env Files

Vite supports variable expansion using `$VAR` syntax:

```bash
# .env
BASE_API_URL=https://api.example.com
VITE_API_URL=$BASE_API_URL/v1
VITE_GRAPHQL_URL=$BASE_API_URL/graphql

# Result:
# VITE_API_URL=https://api.example.com/v1
# VITE_GRAPHQL_URL=https://api.example.com/graphql

# Escape $ with backslash if you need literal $
PASSWORD=test\$foo  # Literal: test$foo
```

---

## Debugging Environment Variables

### Check What's Loaded:

```tsx
// Temporary debug component (remove before commit!)
export function EnvDebug() {
  if (!import.meta.env.DEV) return null;

  return (
    <pre>
      {JSON.stringify(import.meta.env, null, 2)}
    </pre>
  );
}
```

### Common Issues:

1. **Variable not showing up?**
   - ✅ Restart dev server (Vite loads .env at startup)
   - ✅ Check spelling (case-sensitive)
   - ✅ Client variables MUST have `VITE_` prefix

2. **Getting `undefined` in browser?**
   - ✅ Missing `VITE_` prefix
   - ✅ Using `process.env.*` instead of `import.meta.env.*`

3. **Getting `undefined` on server?**
   - ✅ Using `import.meta.env.*` instead of `process.env.*`
   - ✅ Variable not set in environment

4. **Types not working?**
   - ✅ Check `app/env.d.ts` exists
   - ✅ Run `npm run typecheck`
   - ✅ Restart TypeScript server in VS Code

---

## Anti-Patterns to Avoid

### ❌ Don't Mix Syntaxes:

```tsx
// ❌ WRONG - Using process.env in client code
export function ClientComponent() {
  const key = process.env.VITE_API_KEY; // undefined in browser!
  return <div>{key}</div>;
}

// ✅ CORRECT
export function ClientComponent() {
  const key = import.meta.env.VITE_API_KEY;
  return <div>{key}</div>;
}
```

### ❌ Don't Expose Secrets:

```tsx
// ❌ WRONG - Secret exposed to client bundle
VITE_DATABASE_URL=postgresql://...
VITE_AUTH_SECRET=secret123

// ✅ CORRECT - No VITE_ prefix for secrets
DATABASE_URL=postgresql://...
AUTH_SECRET=secret123
```

### ❌ Don't Hardcode Environments:

```tsx
// ❌ WRONG - Hardcoded URLs
const API_URL = "https://api.production.com";

// ✅ CORRECT - Use env vars
const API_URL = import.meta.env.VITE_API_URL;
```

### ❌ Don't Forget to Parse Booleans:

```tsx
// ❌ WRONG - All env vars are strings
const isEnabled = import.meta.env.VITE_FEATURE_FLAG; // "false" is truthy!

// ✅ CORRECT - Explicitly check
const isEnabled = import.meta.env.VITE_FEATURE_FLAG === 'true';
```

---

## Quick Reference Cheat Sheet

```typescript
// CLIENT CODE (Browser)
import.meta.env.VITE_*          // ✅ Public variables
import.meta.env.MODE            // ✅ Current mode
import.meta.env.DEV             // ✅ Is development?
import.meta.env.PROD            // ✅ Is production?
process.env.*                   // ❌ Doesn't exist

// SERVER CODE (Node.js)
process.env.DATABASE_URL        // ✅ Server secrets
process.env.VITE_*              // ✅ Public variables
process.env.NODE_ENV            // ✅ Node environment
import.meta.env.*               // ❌ Doesn't exist

// FILES
.env                            // Committed defaults
.env.local                      // Gitignored local overrides
.env.[mode]                     // Committed mode-specific
.env.[mode].local               // Gitignored mode-specific secrets

// COMMANDS
npm run dev                     // Loads .env.development
npm run build                   // Loads .env.production
npm run build -- --mode staging // Loads .env.staging
```

---

## Related Documentation

- [Vite Env Variables Guide](https://vite.dev/guide/env-and-mode.html)
- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [dotenv-expand Syntax](https://github.com/motdotla/dotenv-expand)

````
