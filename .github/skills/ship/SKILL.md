---
name: ship
description: Deploy to Railway and debug deployment issues. Use when deploying the application, checking deployment status, or debugging deployment failures.
---

# Ship to Railway

Deploys the application to Railway and provides debugging workflows for deployment issues.

## When to Use

- Deploying the application to Railway
- Debugging failed deployments
- Checking deployment status
- User asks to "deploy", "ship", or "debug deployment"

## Railway CLI Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link
```

## Essential Commands

```bash
# View deployment status
railway status

# List recent deployments
railway deployment list

# Stream live logs
railway logs

# View build logs for failed deployment
railway logs --build <deployment-id>

# View runtime logs for crashed deployment
railway logs <deployment-id> --lines 200

# Deploy manually
railway up

# Redeploy latest
railway deployment redeploy
```

## Pre-Deployment Checklist

```bash
# 1. Run local build
npm run build

# 2. Check TypeScript
npm run typecheck

# 3. Run tests
npm run test:run

# 4. Check environment variables in Railway
railway variables
```

## Deployment Status Types

| Status | Meaning | What to Check |
|--------|---------|---------------|
| SUCCESS | Running | App is live |
| FAILED | Build failed | `railway logs --build <id>` |
| CRASHED | Runtime error | `railway logs <id>` |
| REMOVED | Replaced | Check newer deployment |

## Common Issues & Fixes

### Issue 1: Peer Dependency Conflict (FAILED)

**Error:**
```
ERESOLVE could not resolve
peer react@"^18.0.0" from @some/package
Found: react@19.x
```

**Fix:** Add `--legacy-peer-deps` to Dockerfile:

```dockerfile
RUN npm ci --legacy-peer-deps
RUN npm ci --omit=dev --legacy-peer-deps
```

### Issue 2: Missing Production Dependency (CRASHED)

**Error:**
```
Cannot find module 'some-package'
```

**Fix:** Move package from `devDependencies` to `dependencies`:

```bash
npm install --save-prod some-package
```

### Issue 3: Missing Environment Variable

**Error:**
```
Environment variable not found: DATABASE_URL
```

**Fix:** Set variable in Railway:

```bash
railway variables set DATABASE_URL="postgresql://..."
```

### Issue 4: Database Connection Failed

**Error:**
```
Failed to connect to database after 30 attempts
```

**Fix:**
1. Check `DATABASE_URL` is set correctly
2. Use internal hostname for Railway services:
   `postgresql://user:pass@postgres.railway.internal:5432/db`

## Debugging Workflow

### Step 1: Check Status

```bash
railway deployment list
```

### Step 2: Get Deployment ID

Look for the most recent deployment and note its ID.

### Step 3: Check Logs

**For FAILED (build error):**
```bash
railway logs --build <deployment-id>
```

**For CRASHED (runtime error):**
```bash
railway logs <deployment-id> --lines 200
```

### Step 4: Fix and Redeploy

```bash
# Make fixes
git add .
git commit -m "fix: deployment issue"
git push
```

Railway auto-deploys on push to linked branch.

## Environment Variables

**Critical variables to set:**

```bash
DATABASE_URL          # Required at build + runtime
BETTER_AUTH_SECRET    # Runtime only
BETTER_AUTH_URL       # Match your Railway domain
NODE_ENV=production   # Set by Railway automatically
```

**Check all variables:**
```bash
railway variables
```

## Dockerfile Multi-Stage Build

Our Dockerfile has 4 stages:

1. **development-dependencies-env** - All deps (dev + prod)
2. **production-dependencies-env** - Prod deps only (`--omit=dev`)
3. **build-env** - Build application
4. **Final stage** - Runtime with prod deps only

**Key insight:** Production stage uses `--omit=dev`, so runtime packages MUST be in `dependencies`, not `devDependencies`.

## Quick Reference

| Symptom | Status | Fix |
|---------|--------|-----|
| Peer dependency error | FAILED | Add `--legacy-peer-deps` |
| Module not found (build) | FAILED | Add missing package |
| Module not found (runtime) | CRASHED | Move to `dependencies` |
| Database connection | CRASHED | Check `DATABASE_URL` |
| Old code running | SUCCESS | `railway deployment redeploy` |

## Full Reference

See `.github/instructions/railway-deployment.instructions.md` for comprehensive documentation.
