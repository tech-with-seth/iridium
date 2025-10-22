# Deployment

This guide covers deploying TWS Foundations to production environments.

## Prerequisites

Before deploying, ensure you have:

- PostgreSQL database configured
- Environment variables set
- Build process tested locally
- Domain configured (optional)

## Environment Variables

Required environment variables for production:

```env
# Application
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Better Auth
BETTER_AUTH_SECRET=your-production-secret-key
BETTER_AUTH_URL=https://yourdomain.com

# Polar (optional)
POLAR_ACCESS_TOKEN=your-polar-token
POLAR_ORGANIZATION_ID=your-org-id

# PostHog (optional)
POSTHOG_API_KEY=your-posthog-key
POSTHOG_HOST=https://app.posthog.com

# OpenAI (optional)
OPENAI_API_KEY=your-openai-key
```

## Build Process

### Local Build Test

Test the production build locally:

```bash
# Install dependencies
npm install

# Run type checking
npm run typecheck

# Run tests
npm run test:run

# Build for production
npm run build

# Start production server
npm run start
```

### Build Configuration

The build is configured in `react-router.config.ts`:

```typescript
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  serverBuildFile: "index.js",
} satisfies Config;
```

## Database Setup

### Running Migrations

Apply database migrations in production:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### Database Seeding

Optionally seed the database:

```bash
npm run seed
```

**Warning:** Only run seed in development or staging environments. Never seed production with test data.

## Deployment Platforms

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build application
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "run", "start"]
```

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/app
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: ${BETTER_AUTH_URL}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

Build and run:

```bash
docker-compose up -d
```

### Railway

Deploy to Railway:

1. Create a new project on [Railway](https://railway.app)
2. Connect your Git repository
3. Add a PostgreSQL database
4. Set environment variables
5. Deploy

Railway will automatically:

- Install dependencies
- Run build command
- Start the application

### Fly.io

Deploy to Fly.io:

1. Install Fly CLI: `brew install flyctl`
2. Login: `fly auth login`
3. Launch app: `fly launch`
4. Add PostgreSQL: `fly postgres create`
5. Set secrets: `fly secrets set BETTER_AUTH_SECRET=...`
6. Deploy: `fly deploy`

### Vercel

Deploy to Vercel:

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`
4. Set environment variables in Vercel dashboard
5. Deploy to production: `vercel --prod`

**Note:** Ensure your database is accessible from Vercel's network.

### Cloudflare Pages

Deploy to Cloudflare Pages:

1. Create a new Pages project
2. Connect your Git repository
3. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `build/client`
4. Add environment variables
5. Deploy

## HTTPS and SSL

### Production Checklist

- [ ] Use HTTPS in production
- [ ] Set `BETTER_AUTH_URL` to HTTPS URL
- [ ] Configure secure cookies
- [ ] Set up SSL certificate
- [ ] Enable HTTP to HTTPS redirect

### Certificate Management

Most platforms handle SSL automatically:

- Railway: Automatic SSL
- Fly.io: Automatic SSL with `fly certs add`
- Vercel: Automatic SSL
- Cloudflare: Automatic SSL

## Performance Optimization

### Caching

Configure caching headers in loaders:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const data = await getData();

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
```

### CDN Configuration

Use a CDN for static assets:

1. Configure asset URLs in `react-router.config.ts`
2. Upload build files to CDN
3. Update environment variables

### Database Connection Pooling

Use connection pooling for PostgreSQL:

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}
```

Set connection pool size:

```env
DATABASE_URL=postgresql://user:password@host:5432/db?connection_limit=10
```

## Monitoring

### Health Checks

Create a health check endpoint:

```typescript
// app/routes/api/health.ts
export async function loader() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;

    return Response.json({ status: "healthy" });
  } catch (error) {
    return Response.json({ status: "unhealthy" }, { status: 503 });
  }
}
```

### Error Tracking

Consider integrating error tracking:

- Sentry
- Bugsnag
- Rollbar

### Performance Monitoring

Use PostHog for performance monitoring:

```typescript
import { posthog } from "~/lib/posthog.server";

export async function loader({ request }: Route.LoaderArgs) {
  const start = Date.now();

  const data = await getData();

  posthog.capture({
    distinctId: "system",
    event: "loader_performance",
    properties: {
      route: "/dashboard",
      duration: Date.now() - start,
    },
  });

  return data;
}
```

## Rollback Strategy

### Database Rollback

Prisma migration rollback is not supported. Instead:

1. Create a new migration to revert changes
2. Test thoroughly in staging
3. Apply to production

### Application Rollback

Most platforms support easy rollbacks:

- Railway: Rollback from dashboard
- Fly.io: `fly releases list && fly releases rollback <version>`
- Vercel: Rollback from dashboard

## Continuous Deployment

### GitHub Actions

Example workflow for automated deployment:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm install
      - run: npm run typecheck
      - run: npm run test:run
      - run: npm run build

      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up
```

## Security Considerations

- [ ] Rotate secrets regularly
- [ ] Use environment variables for sensitive data
- [ ] Enable CORS only for trusted domains
- [ ] Set secure HTTP headers
- [ ] Keep dependencies updated
- [ ] Enable rate limiting
- [ ] Monitor for suspicious activity

## Post-Deployment Checklist

- [ ] Verify application is running
- [ ] Test authentication flow
- [ ] Check database connection
- [ ] Verify environment variables
- [ ] Test critical user paths
- [ ] Check error tracking
- [ ] Monitor performance
- [ ] Verify SSL certificate
- [ ] Test form submissions
- [ ] Check external integrations (Polar, PostHog)

## Troubleshooting

### Application Won't Start

1. Check environment variables
2. Verify database connection
3. Review build logs
4. Check for missing dependencies

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check network access to database
3. Verify connection pool limits
4. Test database credentials

### Build Failures

1. Run `npm run typecheck` locally
2. Check for missing environment variables at build time
3. Verify Prisma client is generated
4. Review build logs for errors

## Further Reading

- [React Router 7 Deployment](https://reactrouter.com/dev/start/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Better Auth Production Guide](https://better-auth.com/docs/production)
- [Troubleshooting Guide](./troubleshooting.md)
