---
applyTo: 'railway.json,Dockerfile,docker-compose.yml'
---

# Railway Deployment & Debugging Instructions

## Overview

This guide covers Railway deployment workflows, common deployment failures, and debugging techniques using the Railway CLI. Based on real production issues encountered in this project.

## Railway CLI Setup

### Installation

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project (run in project directory)
railway link
```

### Essential Commands

```bash
# View deployment status
railway status

# List recent deployments
railway deployment list

# Stream live logs
railway logs

# View historical logs (last N lines)
railway logs --lines 200

# View build logs
railway logs --build

# View logs from specific deployment
railway logs <deployment-id>

# Deploy manually
railway up

# Redeploy latest deployment
railway deployment redeploy
```

## Deployment Status Types

Understanding deployment statuses:

- **SUCCESS** - Deployment built and is running successfully
- **FAILED** - Build failed (compile errors, dependency issues)
- **CRASHED** - Build succeeded but application crashed at runtime
- **REMOVED** - Deployment removed (replaced by newer deployment)

## Common Deployment Failures

### 1. Peer Dependency Conflicts (BUILD FAILURE)

**Symptom:**
```bash
railway deployment list
# Shows: FAILED

railway logs --build <deployment-id>
# Error: ERESOLVE could not resolve
# peer react@"^16.3.0-0 || ^17.0.0-0 || ^18.0.0-0" from @visx/axis@3.12.0
```

**Root Cause:**
Package version incompatibility. In our case, React 19 conflicted with @visx packages that only support React 16-18.

**Solution 1: Use `--legacy-peer-deps` (Quick Fix)**

Update Dockerfile to bypass strict peer dependency checks:

```dockerfile
# Stage 1: install full dependency tree (including dev deps) for the build step
FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci --legacy-peer-deps  # ← Add this flag

# Stage 2: install only production dependencies for the final runtime image
FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev --legacy-peer-deps  # ← Add this flag
```

**Solution 2: Upgrade Conflicting Packages**

Check if newer versions support your dependencies:

```bash
# Check available versions
npm view @visx/axis versions --json

# Check peer dependencies of specific version
npm view @visx/axis@4.0.1-alpha.0 peerDependencies

# Upgrade if compatible version exists
npm install @visx/axis@4.0.1-alpha.0 --legacy-peer-deps
```

### 2. Missing Production Dependencies (RUNTIME CRASH)

**Symptom:**
```bash
railway deployment list
# Shows: CRASHED (not FAILED)

railway logs <deployment-id>
# Error: Cannot find module 'prisma/config'
# Failed to connect to database after 30 attempts
```

**Root Cause:**
Required module is in `devDependencies` but needed at runtime. The Dockerfile uses `npm ci --omit=dev` for production, which excludes dev dependencies.

**How to Diagnose:**

1. Build succeeded, so it's not a compile-time issue
2. Application crashes at startup, indicating missing runtime dependency
3. Error message shows missing module

**Solution:**

Move the required package from `devDependencies` to `dependencies`:

```bash
# Move package to production dependencies
npm install --save-prod prisma --legacy-peer-deps

# Verify the change
git diff package.json

# Commit and push
git add package.json package-lock.json
git commit -m "fix: move prisma to production dependencies"
git push
```

**Prevention:**

Audit package placement:
- **`dependencies`** - Required at runtime (servers, APIs, configs)
- **`devDependencies`** - Only needed for development/build (TypeScript, test tools, compilers)

For Prisma specifically:
- `prisma` (CLI) → `dependencies` (if using `prisma/config` or runtime migrations)
- `@prisma/client` → `dependencies` (always needed at runtime)

### 3. Build Arguments Not Passed

**Symptom:**
```bash
# Prisma generate fails during build
railway logs --build <deployment-id>
# Error: Environment variable not found: DATABASE_URL
```

**Solution:**

Ensure build arguments are passed in Dockerfile:

```dockerfile
FROM node:20-alpine AS build-env
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
```

And in Railway settings:
- Add `DATABASE_URL` to environment variables
- Ensure it's available at build time (not just runtime)

### 4. Missing Files in Docker Context

**Symptom:**
```bash
# Build fails with "file not found"
ERROR [build-env 3/6] COPY --from=development-dependencies-env /app/node_modules /app/node_modules
```

**Solution:**

Check `.dockerignore` - ensure required files aren't excluded:

```bash
# View .dockerignore
cat .dockerignore

# Common issue: node_modules shouldn't be in .dockerignore if you're copying them
```

## Debugging Workflow

### Step 1: Identify Deployment Status

```bash
railway deployment list
```

Look at the most recent deployment status:
- **FAILED** → Build/compile issue → Check build logs
- **CRASHED** → Runtime issue → Check application logs
- **SUCCESS** → No issues

### Step 2: Get Relevant Logs

For **FAILED** deployments:
```bash
railway logs --build <deployment-id>
```

For **CRASHED** deployments:
```bash
railway logs <deployment-id> --lines 200
```

For **SUCCESS** (but behaving oddly):
```bash
railway logs  # Stream live logs
```

### Step 3: Analyze Error Messages

Common error patterns:

**Build Errors:**
- `ERESOLVE could not resolve` → Peer dependency conflict
- `Module not found` during build → Missing package or incorrect import
- `TypeScript error` → Type checking failed

**Runtime Errors:**
- `Cannot find module 'X'` → Missing production dependency
- `Connection refused` → Database/service not ready
- `Environment variable not found` → Missing env vars

### Step 4: Fix and Redeploy

```bash
# Make fixes locally
git add .
git commit -m "fix: deployment issue"
git push

# Railway auto-deploys on push to linked branch
# Or manually trigger:
railway up
```

### Step 5: Monitor New Deployment

```bash
# Watch deployment progress
railway logs

# Check deployment status
railway deployment list
```

## Railway-Specific Considerations

### Environment Variables

Set in Railway dashboard or via CLI:
```bash
railway variables
railway variables set KEY=value
```

**Critical Variables:**
- `DATABASE_URL` - Required at build time (for Prisma generate) and runtime
- `BETTER_AUTH_SECRET` - Runtime only
- `BETTER_AUTH_URL` - Should match your Railway domain
- `NODE_ENV=production` - Set automatically by Railway

### Database Connection

Railway provides internal networking for linked services:

```bash
# Internal hostname (preferred for service-to-service)
DATABASE_URL=postgresql://user:pass@postgres.railway.internal:5432/db

# Public hostname (for external access)
DATABASE_URL=postgresql://user:pass@postgres-production-abc.railway.app:5432/db
```

### Multi-Stage Docker Builds

Our Dockerfile uses 4 stages:

1. **development-dependencies-env** - Install all deps (dev + prod)
2. **production-dependencies-env** - Install only prod deps
3. **build-env** - Build application using dev deps
4. **Final stage** - Runtime image with only prod deps and built artifacts

**Critical insight:** Production stage uses `--omit=dev`, so any package needed at runtime MUST be in `dependencies`, not `devDependencies`.

## Quick Reference: Common Issues

| Symptom | Status | Likely Cause | Command to Investigate |
|---------|--------|--------------|------------------------|
| Build fails with peer dependency error | FAILED | Version conflict | `railway logs --build <id>` |
| Build fails with "Module not found" | FAILED | Missing package in package.json | `railway logs --build <id>` |
| App crashes immediately on start | CRASHED | Missing prod dependency | `railway logs <id> --lines 200` |
| App crashes after running | CRASHED | Runtime error in code | `railway logs` |
| Can't connect to database | CRASHED | Missing DATABASE_URL or service not linked | `railway variables` |
| Build succeeds but old code running | SUCCESS | Cache issue | `railway deployment redeploy` |

## Deployment Checklist

Before pushing:

- [ ] Run `npm run build` locally to verify build succeeds
- [ ] Run `npm run typecheck` to catch TypeScript errors
- [ ] Verify all runtime dependencies in `dependencies` (not `devDependencies`)
- [ ] Check environment variables are set in Railway
- [ ] Test with `DATABASE_URL` if using Prisma
- [ ] Review Dockerfile for `--legacy-peer-deps` if needed

After pushing:

- [ ] Monitor deployment: `railway deployment list`
- [ ] Check build logs if FAILED: `railway logs --build <id>`
- [ ] Check runtime logs if CRASHED: `railway logs <id>`
- [ ] Verify application is accessible at Railway URL

## Real-World Example: Recent Deployment Failure

This project encountered two sequential deployment failures:

### Issue 1: Peer Dependency Conflict

**Deployment:** `1277e067-99ef-44dd-b58d-ad71f71a9adb`
**Status:** FAILED
**Error:**
```
ERESOLVE could not resolve
peer react@"^16.3.0-0 || ^17.0.0-0 || ^18.0.0-0" from @visx/axis@3.12.0
Found: react@19.2.0
```

**Fix:** Added `--legacy-peer-deps` to Dockerfile

### Issue 2: Missing Production Dependency

**Deployment:** `fca1aeeb-cb29-4d5d-bdc3-100e55a0dd5a`
**Status:** CRASHED
**Error:**
```
Cannot find module 'prisma/config'
Require stack: /app/prisma.config.ts
Failed to connect to database after 30 attempts
```

**Root Cause:** `prisma` was in `devDependencies`, but `prisma.config.ts` imports `prisma/config` at runtime.
**Fix:** Moved `prisma` to `dependencies`

Both fixes required:
1. Identifying the deployment ID: `railway deployment list`
2. Getting logs: `railway logs --build <id>` or `railway logs <id>`
3. Analyzing error messages
4. Fixing locally and pushing

## Additional Resources

- [Railway Docs](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [npm ci documentation](https://docs.npmjs.com/cli/v10/commands/npm-ci)

## Tips

1. **Always check deployment list first** - Status tells you whether it's a build or runtime issue
2. **Build logs ≠ Runtime logs** - Use `--build` flag for build failures
3. **Deployment IDs persist** - You can inspect failed deployments even after they're REMOVED
4. **Railway auto-deploys** - Pushing to linked branch triggers deployment automatically
5. **Test locally with Docker** - Build your Dockerfile locally to catch issues early:
   ```bash
   docker build -t iridium-test --build-arg DATABASE_URL=$DATABASE_URL .
   docker run -e DATABASE_URL=$DATABASE_URL iridium-test
   ```
