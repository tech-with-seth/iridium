# Deployment Guide

This guide provides step-by-step instructions for deploying Iridium to production. Choose your platform below and follow the specific deployment steps.

## Quick Navigation

- [Railway Deployment](#railway-recommended) - Recommended for beginners (PostgreSQL included, automatic SSL)
- [Docker Deployment](#docker) - For custom infrastructure
- [Vercel Deployment](#vercel) - Serverless deployment (with limitations)
- [Environment Variables Reference](#environment-variables-reference)
- [Post-Deployment Checklist](#post-deployment-checklist)

---

## Railway (Recommended)

Railway provides the simplest deployment experience with automatic PostgreSQL provisioning, SSL certificates, and zero-config deployments.

### Prerequisites

- Railway account ([sign up free](https://railway.app))
- Railway CLI installed: `brew install railway` (or see [Railway docs](https://docs.railway.com/guides/cli))
- Repository pushed to GitHub

### Step 1: Initial Setup

```bash
# Login to Railway
railway login

# Create new project (or link existing one)
railway init

# Add PostgreSQL database
railway add --plugin postgresql
```

### Step 2: Configure Environment Variables

Set required environment variables:

```bash
# Generate secure secret (REQUIRED)
railway variables set BETTER_AUTH_SECRET=$(openssl rand -base64 32)

# Email service (REQUIRED)
railway variables set RESEND_API_KEY=your_resend_key_here
railway variables set RESEND_FROM_EMAIL=noreply@yourdomain.com

# OpenAI (optional - only if using AI features)
railway variables set OPENAI_API_KEY=sk-proj-your-key-here

# PostHog Analytics (optional)
railway variables set VITE_POSTHOG_API_KEY=phc_your-key-here
railway variables set VITE_POSTHOG_HOST=https://us.i.posthog.com
railway variables set VITE_POSTHOG_PROJECT_ID=12345
railway variables set POSTHOG_PERSONAL_API_KEY=phx_your-personal-key

# Polar Billing (optional)
railway variables set POLAR_ACCESS_TOKEN=polar_at_your-token
railway variables set POLAR_SERVER=sandbox  # or "production"
railway variables set POLAR_WEBHOOK_SECRET=your-webhook-secret
```

**Note:** `DATABASE_URL` is automatically set by Railway when you add PostgreSQL.

### Step 3: Deploy

```bash
# Deploy your application
railway up

# Railway will build using your Dockerfile and deploy automatically
# Watch the deployment logs in your terminal
```

After deployment completes, Railway will provide your app URL.

### Step 4: Post-Deployment Setup

```bash
# Run database migrations
railway run npx prisma migrate deploy

# Generate Prisma client (if needed)
railway run npx prisma generate

# Seed database (optional - development/staging only)
railway run npm run seed
```

### Step 5: Update Auth URL

Once you have your Railway URL, update the auth configuration:

```bash
# Replace with your actual Railway URL
railway variables set BETTER_AUTH_URL=https://your-app-name.railway.app

# Trigger a redeploy to apply the change
railway up
```

### Continuous Deployment

Railway automatically deploys when you push to your connected Git branch. To configure:

1. Go to Railway dashboard → Your project → Settings
2. Connect your GitHub repository
3. Select branch (usually `main` or `production`)
4. Railway will auto-deploy on every push

### Railway Configuration File (Optional)

Create `railway.json` at repository root for advanced configuration:

```json
{
    "$schema": "https://railway.app/railway.schema.json",
    "build": {
        "builder": "DOCKERFILE",
        "dockerfilePath": "Dockerfile"
    },
    "deploy": {
        "numReplicas": 1,
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 10
    }
}
```

### Common Railway Issues

**Build taking too long?**

- First build takes 5-10 minutes due to multi-stage Docker build
- Subsequent builds are faster with layer caching

**App won't start?**

- Check `railway logs` for errors
- Verify all required environment variables are set
- Ensure `DATABASE_URL` is present (check Railway dashboard)

**Database connection issues?**

- Railway PostgreSQL is on private network - no additional config needed
- Verify `DATABASE_URL` in Railway dashboard matches expectations

---

## Environment Variables Reference

### Required Variables

These must be set for the application to function:

```env
# Database (automatically set by Railway with PostgreSQL add-on)
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication (CRITICAL - must be unique per environment)
BETTER_AUTH_SECRET=minimum-32-character-random-string
BETTER_AUTH_URL=https://yourdomain.com

# Email Service (required for auth flows)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com  # Must be verified in Resend
```

### Optional Variables

Add these based on features you're using:

```env
# AI Features (OpenAI integration)
OPENAI_API_KEY=sk-proj-your-openai-key

# PostHog Analytics & Feature Flags
VITE_POSTHOG_API_KEY=phc_your-project-key           # Client-side (public)
VITE_POSTHOG_HOST=https://us.i.posthog.com         # US or EU region
VITE_POSTHOG_PROJECT_ID=12345                       # Project ID
POSTHOG_PERSONAL_API_KEY=phx_your-personal-key     # Server-side (private)

# Polar Billing Integration
POLAR_ACCESS_TOKEN=polar_at_your-access-token
POLAR_SERVER=sandbox                                 # or "production"
POLAR_WEBHOOK_SECRET=your-webhook-secret
```

### Generating Secrets

```bash
# Generate BETTER_AUTH_SECRET (minimum 32 characters)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**⚠️ Security Warning:**

- Never commit `.env` files to version control
- Use different secrets for development, staging, and production
- Rotate `BETTER_AUTH_SECRET` regularly and on security incidents
- Keep API keys secure - they have access to sensitive services

---

## Post-Deployment Checklist

After deploying to any platform, verify everything works:

### 1. Application Health

- [ ] Application loads without errors
- [ ] Homepage renders correctly
- [ ] Static assets (CSS, images) load properly
- [ ] SSL certificate is valid (HTTPS)
- [ ] Check health endpoint: `https://yourdomain.com/api/health` (if implemented)

### 2. Database & Migrations

```bash
# For Railway
railway run npx prisma migrate status

# For other platforms
npx prisma migrate status
```

- [ ] All migrations applied successfully
- [ ] Prisma client generated correctly
- [ ] Database connection works (test by signing in)

### 3. Authentication Flow

- [ ] Sign up page loads
- [ ] Can create new account
- [ ] Verification email sent (check Resend dashboard)
- [ ] Can sign in with credentials
- [ ] Session persists across page refreshes
- [ ] Sign out works correctly
- [ ] Protected routes require authentication

### 4. Email Functionality

Test email flows in Resend dashboard or your inbox:

- [ ] Welcome email sent on signup
- [ ] Password reset email works
- [ ] Email verification works
- [ ] Emails have correct branding and links
- [ ] Links point to production URL (not localhost)

### 5. Integrations

**PostHog (if enabled):**

- [ ] Events appearing in PostHog dashboard
- [ ] Feature flags loading correctly
- [ ] Session recordings working (if enabled)

**Polar (if enabled):**

- [ ] Checkout flow works
- [ ] Webhooks configured in Polar dashboard
- [ ] Test subscription creation (use sandbox mode)

**OpenAI (if enabled):**

- [ ] AI features respond correctly
- [ ] API key has sufficient credits
- [ ] Rate limits appropriate for production

### 6. Performance & Monitoring

- [ ] Application response time is acceptable (<2s)
- [ ] No console errors in browser
- [ ] Check deployment logs for errors
- [ ] Set up error tracking (Sentry, PostHog, etc.)
- [ ] Configure uptime monitoring (UptimeRobot, Better Uptime)

### 7. Security

- [ ] `BETTER_AUTH_URL` points to production domain
- [ ] All secrets are production values (not dev/test)
- [ ] Database not publicly accessible
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (if implemented)
- [ ] Environment variables secured

---`

---

## Docker

For custom infrastructure or self-hosting, use the included multi-stage Dockerfile.

### Using Existing Dockerfile

```bash
npm run typecheck
```

Fix any TypeScript errors before proceeding.

### 2. Run Tests

```bash
# Unit tests
npm run test:run

# E2E tests
npm run e2e
```

Ensure all tests pass.

### 3. Test Production Build Locally

```bash
# Install dependencies (if needed)
npm install

# Generate Prisma client
npx prisma generate

# Build for production
npm run build

# Start production server
npm run start
```

Visit `http://localhost:3000` and verify:

- Application loads without errors
- Authentication works
- All pages render correctly
- API endpoints respond

### 4. Verify Environment Variables

Check your `.env.example` against your actual configuration:

```bash
# See what variables are used
grep -r "process.env" app/ | grep -v node_modules | cut -d: -f2 | sort -u

# Compare with your .env file
diff <(grep -v "^#" .env.example | cut -d= -f1 | sort) \
     <(grep -v "^#" .env | cut -d= -f1 | sort)
```

---

## Database Migration Strategy

### Safe Migration Process

1. **Backup Production Database**

```bash
# For Railway
railway run pg_dump $DATABASE_URL > backup.sql
```

2. **Test Migrations in Staging**

Always test migrations in a staging environment first:

```bash
# Create staging branch migration
git checkout -b migration/add-user-fields

# Create migration
npx prisma migrate dev --name add_user_fields

# Test thoroughly in staging environment
railway run --environment staging npx prisma migrate deploy
```

3. **Apply to Production**

Only after staging verification:

```bash
# Apply to production
railway run --environment production npx prisma migrate deploy
```

### Migration Rollback

Prisma doesn't support automatic rollbacks. Instead:

1. Create a new migration that reverses changes
2. Test in staging
3. Apply to production

```bash
# Example: Rollback added column
npx prisma migrate dev --name remove_user_phone_number
```

---

## Monitoring and Logging

### Application Logs

**Railway:**

```bash
railway logs
railway logs --follow  # Stream logs
```

**Docker:**

```bash
docker logs -f <container-id>
docker-compose logs -f app
```

### Health Check Endpoint

Create `app/routes/api/health.ts`:

```typescript
import type { Route } from './+types/health';
import { prisma } from '~/db.server';

export async function loader({ request }: Route.LoaderArgs) {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        return Response.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
        });
    } catch (error) {
        return Response.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 503 }
        );
    }
}
```

Add route to `app/routes.ts`:

```typescript
...prefix('api', [
    route('health', 'routes/api/health.ts'),
    // ... other routes
])
```

### Uptime Monitoring

Set up external monitoring:

- [UptimeRobot](https://uptimerobot.com/) - Free tier available
- [Better Uptime](https://betteruptime.com/) - Modern monitoring
- [Pingdom](https://www.pingdom.com/) - Enterprise option

Configure to check: `https://yourdomain.com/api/health`

### Error Tracking

Integrate error tracking service:

**PostHog (already integrated):**

```typescript
// app/lib/posthog.server.ts already configured
// Errors automatically tracked in production
```

**Sentry (optional):**

```bash
npm install @sentry/react @sentry/remix
```

```typescript
// app/entry.client.tsx
import * as Sentry from '@sentry/react';

if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
    });
}
```

---

### Using Existing Dockerfile

The repository includes an optimized production Dockerfile:

```bash
# Build the image
docker build -t iridium .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e BETTER_AUTH_SECRET=your-secret \
  -e BETTER_AUTH_URL=https://yourdomain.com \
  -e RESEND_API_KEY=your-key \
  iridium
```

### Docker Compose Setup

Create `docker-compose.yml` for local production testing:

```yaml
version: '3.8'

services:
    app:
        build: .
        ports:
            - '3000:3000'
        environment:
            DATABASE_URL: postgresql://postgres:password@db:5432/app
            BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
            BETTER_AUTH_URL: http://localhost:3000
            RESEND_API_KEY: ${RESEND_API_KEY}
        depends_on:
            db:
                condition: service_healthy

    db:
        image: postgres:16-alpine
        environment:
            POSTGRES_DB: app
            POSTGRES_USER: postgres
            POSTGRES_PASSWORD: password
        volumes:
            - postgres-data:/var/lib/postgresql/data
        healthcheck:
            test: ['CMD-SHELL', 'pg_isready -U postgres']
            interval: 10s
            timeout: 5s
            retries: 5

volumes:
    postgres-data:
```

Run with:

```bash
# Create .env file with secrets
echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" > .env
echo "RESEND_API_KEY=your_key" >> .env

# Start services
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app
```

### Docker Deployment Notes

- The Dockerfile uses multi-stage builds to minimize image size
- Custom Prisma output path (`app/generated/prisma`) is included
- Application listens on port 3000 by default
- Build time: ~5-10 minutes on first build

---

## Vercel

**⚠️ Note:** Vercel works best with serverless architectures. Iridium uses a long-running server, so Railway is the better choice. Use Vercel only if you understand serverless limitations.

### Quick Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

### Configuration

Create `vercel.json`:

```json
{
    "buildCommand": "npm run build",
    "outputDirectory": "build/client",
    "framework": null,
    "rewrites": [{ "source": "/(.*)", "destination": "/api/index" }]
}
```

Set environment variables in Vercel dashboard:

- Project Settings → Environment Variables
- Add all required variables from [Environment Variables Reference](#environment-variables-reference)

### Important Vercel Limitations

- PostgreSQL must be externally hosted (use Supabase, Neon, Railway)
- Ensure database accessible from Vercel's network
- Serverless function timeout limits (10s hobby, 60s pro)
- Consider edge runtime limitations

---

## Pre-Deployment Verification

Test everything locally before deploying to production.

### 1. Run Type Checking

```bash
npm run typecheck
```

Fix any TypeScript errors before proceeding.

### 2. Run Tests

```bash
# Unit tests
npm run test:run

# E2E tests
npm run e2e
```

Ensure all tests pass.

### 3. Test Production Build Locally

```bash
# Install dependencies (if needed)
npm install

# Generate Prisma client
npx prisma generate

# Build for production
npm run build

# Start production server
npm run start
```

Visit `http://localhost:3000` and verify:

- Application loads without errors
- Authentication works
- All pages render correctly
- API endpoints respond

### 4. Verify Environment Variables

Check your `.env.example` against your actual configuration:

```bash
# See what variables are used
grep -r "process.env" app/ | grep -v node_modules | cut -d: -f2 | sort -u

# Compare with your .env file
diff <(grep -v "^#" .env.example | cut -d= -f1 | sort) \
     <(grep -v "^#" .env | cut -d= -f1 | sort)
```

---

## Performance Optimization

### Database Connection Pooling

Configure Prisma connection pooling for production:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Optional: Direct connection for migrations
  directUrl = env("DIRECT_URL")
}
```

Add connection pool parameters to `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=10
```

### Caching Strategy

Iridium includes three-tier caching (see `.github/instructions/caching-pattern.instructions.md`):

1. **Client-side route caching** - Automatic via React Router
2. **Model layer caching** - Built into `app/models/*.server.ts`
3. **Manual caching** - Using `app/lib/cache.ts` utilities

Example model layer caching:

```typescript
// app/models/user.server.ts
import { cache, getUserScopedKey, isCacheExpired } from '~/lib/cache';

export async function getUserProfile(userId: string) {
    const cacheKey = getUserScopedKey(userId, 'profile');

    // Check cache first
    if (!isCacheExpired(cacheKey)) {
        const cached = cache.getKey(cacheKey);
        if (cached) return cached;
    }

    // Fetch from database
    const profile = await prisma.user.findUnique({
        where: { id: userId },
    });

    // Cache for 1 hour
    cache.setKey(cacheKey, profile);
    return profile;
}
```

### CDN for Static Assets

For optimal performance, serve static assets via CDN:

**Cloudflare CDN (free tier available):**

1. Add your domain to Cloudflare
2. Enable "Always Use HTTPS"
3. Enable "Auto Minify" for JS/CSS/HTML
4. Set caching rules for static assets

---

## Security Hardening

### Environment-Specific Secrets

**Never reuse secrets across environments:**

```bash
# Development
BETTER_AUTH_SECRET=dev_secret_min_32_chars

# Staging
BETTER_AUTH_SECRET=staging_secret_min_32_chars

# Production
BETTER_AUTH_SECRET=prod_secret_min_32_chars
```

### Secret Rotation

Rotate secrets regularly:

```bash
# Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# Update in Railway
railway variables set BETTER_AUTH_SECRET=$NEW_SECRET

# Redeploy application
railway up
```

**⚠️ Warning:** Rotating `BETTER_AUTH_SECRET` invalidates all existing sessions.

### Security Headers

Add security headers in `app/root.tsx`:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    return data(
        { /* your data */ },
        {
            headers: {
                'X-Frame-Options': 'DENY',
                'X-Content-Type-Options': 'nosniff',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            },
        }
    );
}
```

### Rate Limiting

Implement rate limiting for API endpoints (example):

```typescript
// app/lib/rate-limit.server.ts
import { cache } from '~/lib/cache';

export function checkRateLimit(
    identifier: string,
    limit: number = 100,
    window: number = 60
): boolean {
    const key = `ratelimit:${identifier}`;
    const current = cache.getKey(key) || 0;

    if (current >= limit) {
        return false;
    }

    cache.setKey(key, current + 1);
    return true;
}
```

---

## Continuous Deployment

### GitHub Actions (Railway)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
    push:
        branches: [main]
    pull_request:
        branches: [main]

jobs:
    test:
        runs-on: ubuntu-latest

        steps:
            - uses: actions/checkout@v4

            - uses: actions/setup-node@v4
              with:
                  node-version: 20
                  cache: 'npm'

            - name: Install dependencies
              run: npm ci

            - name: Type check
              run: npm run typecheck

            - name: Run tests
              run: npm run test:run

            - name: Build
              run: npm run build

    deploy:
        needs: test
        if: github.ref == 'refs/heads/main'
        runs-on: ubuntu-latest

        steps:
            - uses: actions/checkout@v4

            - name: Install Railway CLI
              run: npm install -g @railway/cli

            - name: Deploy to Railway
              env:
                  RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
              run: railway up --service iridium

            - name: Run Migrations
              env:
                  RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
              run: railway run npx prisma migrate deploy
```

**Setup instructions:**

1. Get Railway token: `railway login --token`
2. Add `RAILWAY_TOKEN` to GitHub repository secrets
3. Push to `main` branch to trigger deployment

---

## Troubleshooting Deployment Issues

### Application Won't Start

**Check logs:**

```bash
railway logs          # Railway
docker logs <id>      # Docker
```

**Common causes:**

- Missing environment variables (especially `DATABASE_URL`, `BETTER_AUTH_SECRET`)
- Database connection failed
- Prisma client not generated
- Port binding issues

**Solution:**

```bash
# Verify environment variables
railway variables    # Railway

# Regenerate Prisma client
railway run npx prisma generate
```

### Database Connection Errors

**Symptoms:**

- "Can't reach database server"
- "Connection timeout"
- "ECONNREFUSED"

**Solutions:**

1. Verify `DATABASE_URL` is correct
2. Check database is running (Railway dashboard)
3. Verify network access (private network vs public)
4. Check connection pool limits

```bash
# Test connection
railway run npx prisma db execute --stdin <<< "SELECT 1"
```

### Build Failures

**Common causes:**

- TypeScript errors
- Missing dependencies
- Build script failures
- Out of memory

**Solutions:**

```bash
# Test build locally
npm run build

# Check for type errors
npm run typecheck

# Clear cache and rebuild
rm -rf node_modules .react-router
npm install
npm run build
```

### Migration Failures

**Symptoms:**

- "Migration already applied"
- "Database schema drift"
- "Migration failed"

**Solutions:**

```bash
# Check migration status
railway run npx prisma migrate status

# Resolve drift (destructive!)
railway run npx prisma migrate resolve --rolled-back <migration-name>

# Force reset (DEVELOPMENT ONLY!)
railway run npx prisma migrate reset
```

### SSL Certificate Issues

**Railway:** SSL is automatic. If issues persist:

1. Wait 5-10 minutes after first deployment
2. Check custom domain DNS settings
3. Verify domain ownership in platform dashboard

---

## Rollback Procedures

### Application Rollback

**Railway:**

1. Go to Railway dashboard → Your project
2. Click "Deployments" tab
3. Click "Redeploy" on previous working deployment

**Docker:

```bash
# List previous images
docker images

# Run previous image
docker run -p 3000:3000 iridium:<previous-tag>
```

### Database Rollback

**⚠️ Critical:** Prisma doesn't support automatic rollbacks.

**Manual rollback process:**

1. Restore from backup:

```bash
# Railway
railway run psql $DATABASE_URL < backup.sql
```

2. Create compensating migration:

```bash
# Example: Revert column addition
npx prisma migrate dev --name revert_user_phone
```

---

## Additional Resources

- [React Router 7 Deployment Docs](https://reactrouter.com/start/framework/deployment)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Better Auth Production Guide](https://better-auth.com/docs/concepts/production)
- [Railway Documentation](https://docs.railway.com/)
- [Troubleshooting Guide](./troubleshooting.md)

---

## Need Help?

If you encounter issues not covered here:

1. Check [Troubleshooting Guide](./troubleshooting.md)
2. Review platform-specific documentation
3. Search existing GitHub issues
4. Open a new issue with deployment logs
