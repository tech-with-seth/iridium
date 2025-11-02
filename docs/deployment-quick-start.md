# Deployment Quick Start

**⚡ Quick reference for deploying Iridium.** For detailed instructions, see [Deployment Guide](./deployment.md).

---

## 🚀 Railway (Recommended - 5 Minutes)

```bash
# 1. Login and create project
railway login
railway init

# 2. Add PostgreSQL database
railway add --database postgres

# 3. Set required environment variables
railway variables --set "BETTER_AUTH_SECRET=$(openssl rand -base64 32)"
railway variables --set "RESEND_API_KEY=your_resend_key"
railway variables --set "RESEND_FROM_EMAIL=noreply@yourdomain.com"

# 4. Deploy
railway up

# 5. (Auto) Database migrations run on deploy
#    Need to re-run manually? Use: railway run npx prisma migrate deploy

# 6. Get your Railway URL and update auth URL
railway open  # Opens dashboard to see your URL
railway variables --set "BETTER_AUTH_URL=https://your-app.railway.app"
```

**✅ Done!** Your app is live at `https://your-app.railway.app`

---

## 📋 Required Environment Variables

```bash
DATABASE_URL=postgresql://...              # Auto-set by Railway PostgreSQL
BETTER_AUTH_SECRET=<min-32-chars>         # Generate: openssl rand -base64 32
BETTER_AUTH_URL=https://yourdomain.com    # Your production URL
RESEND_API_KEY=re_...                     # From resend.com
RESEND_FROM_EMAIL=noreply@yourdomain.com  # Verified sender
```

---

## 🐳 Docker (Self-Hosted)

```bash
# Build and run with docker-compose
docker-compose up -d

# Prisma migrations run automatically on container boot
# Run manually (if needed): docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app
```

---

## ✓ Post-Deployment Checklist

Quick verification after deployment:

- [ ] App loads at production URL
- [ ] Sign up creates new account
- [ ] Email verification works (check Resend dashboard)
- [ ] Sign in works
- [ ] Protected routes require auth
- [ ] Database connection working
- [ ] SSL certificate valid (HTTPS)
- [ ] No console errors
- [ ] Check platform logs for errors

---

## 🔧 Common Commands

### Railway

```bash
railway logs                    # View logs
railway logs --deployment       # View deployment logs
railway logs --build            # View build logs
railway variables               # List environment variables
railway variables --set "KEY=value"  # Set environment variable
railway run <command>           # Run command in production
railway status                  # Check deployment status
railway open                    # Open dashboard in browser
railway connect postgres        # Connect to PostgreSQL shell
```

### Docker

```bash
docker-compose logs -f app    # View logs
docker-compose ps             # Check status
docker-compose restart app    # Restart app
docker-compose exec app sh    # Shell into container
```

---

## 🆘 Quick Troubleshooting

**App won't start?**

```bash
railway logs                  # Check logs for errors
railway variables             # Verify env vars are set
```

**Database connection failed?**

```bash
railway run npx prisma db execute --stdin <<< "SELECT 1"
```

**Need to rollback?**

- **Railway**: Dashboard → Deployments → Redeploy previous

**Build failed?**

```bash
npm run typecheck            # Check TypeScript errors
npm run build                # Test build locally
```

---

## 📚 Full Documentation

- [Complete Deployment Guide](./deployment.md) - Detailed instructions for all platforms
- [Environment Variables Reference](./deployment.md#environment-variables-reference)
- [Post-Deployment Checklist](./deployment.md#post-deployment-checklist)
- [Troubleshooting Guide](./troubleshooting.md)

---

**Need help?** Check the [full deployment guide](./deployment.md) or [troubleshooting docs](./troubleshooting.md).
