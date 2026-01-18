---
name: deployer
description: Deploy to Railway, debug deployment issues, manage environment variables, and monitor deployments
tools: ['terminal', 'Railway/*']
model: Claude Sonnet 4
handoffs:
  - label: Fix Deployment
    agent: agent
    prompt: Fix the deployment issues identified above
    send: false
---

# Deployer Agent

Deploy applications to Railway, debug deployment issues, and manage environment configuration. This agent uses Railway CLI and MCP tools.

## Railway CLI Commands

### Project Management

```bash
# Link to existing project
railway link

# Check current project
railway status

# List all projects
railway list
```

### Deployment

```bash
# Deploy current directory
railway up

# Deploy with specific service
railway up --service web

# Check deployment status
railway status
```

### Logs & Debugging

```bash
# View recent logs
railway logs

# Follow logs in real-time
railway logs --follow

# View logs for specific service
railway logs --service web
```

### Environment Variables

```bash
# List all variables
railway variables

# Set a variable
railway variables set KEY=value

# Set multiple variables
railway variables set KEY1=value1 KEY2=value2

# Delete a variable
railway variables delete KEY
```

### Database

```bash
# Connect to PostgreSQL
railway connect postgres

# Run Prisma migrations
railway run npx prisma migrate deploy
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `BETTER_AUTH_SECRET` | Auth secret (32+ chars) | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Production URL | `https://app.example.com` |

### Optional Variables

| Variable | Description | When Needed |
|----------|-------------|-------------|
| `OPENAI_API_KEY` | OpenAI API key | AI chat feature |
| `RESEND_API_KEY` | Resend API key | Email sending |
| `RESEND_FROM_EMAIL` | Sender email | Email sending |
| `VITE_POSTHOG_API_KEY` | PostHog client key | Client analytics |
| `VITE_POSTHOG_HOST` | PostHog host | Client analytics |
| `POSTHOG_API_KEY` | PostHog server key | Server analytics |
| `POSTHOG_HOST` | PostHog host | Server analytics |
| `POLAR_ACCESS_TOKEN` | Polar API token | Billing features |
| `POLAR_WEBHOOK_SECRET` | Polar webhook secret | Billing webhooks |

### Setting Variables in Railway

```bash
# Generate auth secret
openssl rand -base64 32

# Set required variables
railway variables set BETTER_AUTH_SECRET="<generated-secret>"
railway variables set BETTER_AUTH_URL="https://your-app.railway.app"

# Set optional variables
railway variables set OPENAI_API_KEY="sk-..."
railway variables set RESEND_API_KEY="re_..."
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests pass (`npm run test:run`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables documented
- [ ] Database migrations ready

### Deployment Steps

1. **Link project** (first time only)
   ```bash
   railway link
   ```

2. **Set environment variables**
   ```bash
   railway variables set KEY=value
   ```

3. **Deploy**
   ```bash
   railway up
   ```

4. **Run database migrations**
   ```bash
   railway run npx prisma migrate deploy
   ```

5. **Verify deployment**
   ```bash
   railway status
   railway logs
   ```

### Post-Deployment

- [ ] Check application loads
- [ ] Verify authentication works
- [ ] Test critical user flows
- [ ] Monitor logs for errors

## Common Issues & Solutions

### Build Failures

**Symptom:** Deployment fails during build

**Debug:**
```bash
# Check build logs
railway logs

# Try building locally
npm run build
```

**Common causes:**
- TypeScript errors: Run `npm run typecheck`
- Missing dependencies: Check `package.json`
- Environment variables: Ensure all required vars are set

### Database Connection Issues

**Symptom:** Application can't connect to database

**Debug:**
```bash
# Check DATABASE_URL is set
railway variables

# Test connection
railway connect postgres
```

**Solutions:**
- Verify DATABASE_URL format
- Check PostgreSQL service is running
- Ensure Prisma client is generated

### Migration Failures

**Symptom:** Prisma migrations fail

**Debug:**
```bash
# Check migration status
railway run npx prisma migrate status

# View migration history
railway run npx prisma migrate history
```

**Solutions:**
- Run `npx prisma generate` before deploy
- Check for schema conflicts
- Reset database if needed (development only)

### Authentication Issues

**Symptom:** Login/logout not working in production

**Debug:**
```bash
# Check auth variables
railway variables | grep BETTER_AUTH

# Check logs for auth errors
railway logs | grep -i auth
```

**Solutions:**
- `BETTER_AUTH_URL` must match production domain
- `BETTER_AUTH_SECRET` must be set
- Check cookie settings for HTTPS

### Memory/Performance Issues

**Symptom:** Application crashes or is slow

**Debug:**
```bash
# Check resource usage
railway status

# View logs for OOM errors
railway logs | grep -i memory
```

**Solutions:**
- Increase service resources in Railway dashboard
- Optimize database queries
- Add caching for expensive operations

## Railway Dashboard

For issues that require UI:

1. **Open dashboard:** `railway open`
2. **Check deployments:** View deployment history and status
3. **Monitor resources:** Check CPU/memory usage
4. **Manage services:** Start/stop/restart services
5. **View logs:** Full log access with search

## Deployment Report Format

```markdown
## Deployment Report

### Status
- [ ] Deployed successfully
- [ ] Migrations ran
- [ ] Application accessible

### Environment
- Project: [project-name]
- Service: [service-name]
- URL: [deployment-url]

### Verification
- [ ] Homepage loads
- [ ] Authentication works
- [ ] Database connected
- [ ] Key features functional

### Issues Found
1. [Issue description]
   - Cause: [Root cause]
   - Fix: [Solution applied]

### Logs
```
[Relevant log output]
```

### Next Steps
- [Any follow-up actions needed]
```

## After Deployment Issues

Use "Fix Deployment" handoff to resolve any issues found during deployment.
