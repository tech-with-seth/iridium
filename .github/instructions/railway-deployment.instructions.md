---
applyTo: 'railway.json,Dockerfile,docker-compose.yml'
---

# Railway Deployment & Debugging

## Essential CLI Commands

```bash
railway status                    # Deployment status
railway deployment list           # Recent deployments
railway logs                      # Stream live logs
railway logs --build <id>         # Build logs for a specific deployment
railway logs <id> --lines 200     # Runtime logs for a specific deployment
railway up                        # Manual deploy
railway deployment redeploy       # Redeploy latest
railway variables                 # List env vars
railway variables set KEY=value   # Set env var
```

## Deployment Statuses

| Status | Meaning | Investigate With |
|--------|---------|------------------|
| SUCCESS | Running | `railway logs` |
| FAILED | Build error | `railway logs --build <id>` |
| CRASHED | Runtime crash | `railway logs <id> --lines 200` |
| REMOVED | Replaced by newer | — |

## Common Failures

### Peer Dependency Conflict (FAILED)

```
ERESOLVE could not resolve peer react@"^18" from @visx/axis@3.12.0
```

**Fix:** Add `--legacy-peer-deps` to Dockerfile `npm ci` commands.

### Missing Production Dependency (CRASHED)

```
Cannot find module 'prisma/config'
```

**Fix:** Move package from `devDependencies` → `dependencies`:
```bash
npm install --save-prod prisma --legacy-peer-deps
```

**Rule:** Anything imported at runtime MUST be in `dependencies`. `devDependencies` is only for build/test tools.

### Missing Build Args

Prisma generate needs `DATABASE_URL` at build time:
```dockerfile
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
```

## Debugging Workflow

1. `railway deployment list` → Check status (FAILED vs CRASHED)
2. FAILED → `railway logs --build <id>` (compile/dependency issue)
3. CRASHED → `railway logs <id> --lines 200` (runtime issue)
4. Fix locally, push → Railway auto-deploys on linked branch

## Multi-Stage Dockerfile

This project uses 4 Docker stages:
1. **development-dependencies-env** — all deps (dev + prod)
2. **production-dependencies-env** — prod deps only (`--omit=dev`)
3. **build-env** — build app with dev deps
4. **Final** — runtime with only prod deps + built artifacts

**Critical:** Production stage uses `--omit=dev`, so any package needed at runtime MUST be in `dependencies`.

## Pre-Deploy Checklist

- [ ] `npm run build` succeeds locally
- [ ] `npm run typecheck` passes
- [ ] Runtime deps in `dependencies` (not `devDependencies`)
- [ ] Env vars set in Railway (`railway variables`)
- [ ] `DATABASE_URL` available at build time (for Prisma generate)
