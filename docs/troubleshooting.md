# Troubleshooting

Common issues and solutions for TWS Foundations.

## Installation Issues

### npm install fails

**Problem:** Dependency installation fails with errors

**Solutions:**

1. Clear npm cache:

```bash
npm cache clean --force
```

2. Delete node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

3. Check Node.js version:

```bash
node --version  # Should be 20 or higher
```

### Prisma generate fails

**Problem:** Prisma Client generation fails

**Solutions:**

1. Ensure DATABASE_URL is set in `.env`
2. Run migration first:

```bash
npx prisma migrate dev
```

3. Clear Prisma cache:

```bash
npx prisma generate --force
```

## Development Server Issues

### Port already in use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5173`

**Solutions:**

1. Find and kill the process:

```bash
lsof -ti:5173 | xargs kill -9
```

2. Use a different port:

```bash
PORT=3000 npm run dev
```

### Hot reload not working

**Problem:** Changes not reflecting in browser

**Solutions:**

1. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
2. Restart development server
3. Clear browser cache
4. Check for TypeScript errors in terminal

### Development server crashes

**Problem:** Server exits unexpectedly

**Solutions:**

1. Check for syntax errors in recent changes
2. Review terminal output for error messages
3. Verify environment variables are set
4. Restart with clean state:

```bash
rm -rf .react-router
npm run dev
```

## Database Issues

### Cannot connect to database

**Problem:** `Error: Can't reach database server`

**Solutions:**

1. Verify PostgreSQL is running:

```bash
psql -U postgres -c "SELECT version();"
```

2. Check DATABASE_URL in `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

3. Test connection:

```bash
npx prisma db pull
```

### Migration fails

**Problem:** `Error: Migration failed to apply`

**Solutions:**

1. Check migration file for errors
2. Reset database (development only):

```bash
npx prisma migrate reset
```

3. Apply migrations manually:

```bash
npx prisma migrate deploy
```

### Prisma Client not found

**Problem:** `Cannot find module '@prisma/client'`

**Solution:**

```bash
npx prisma generate
```

## Authentication Issues

### Session not persisting

**Problem:** User logged out on page refresh

**Solutions:**

1. Check BETTER_AUTH_SECRET is set
2. Verify cookies are enabled in browser
3. Ensure BETTER_AUTH_URL matches your domain
4. Check for HTTPS in production

### Login fails silently

**Problem:** No error, but login does not work

**Solutions:**

1. Check browser console for errors
2. Verify database has User, Session, and Account tables
3. Check network tab for failed requests
4. Verify BETTER_AUTH_URL is correct

### "Invalid session" error

**Problem:** Session validation fails

**Solutions:**

1. Clear cookies and log in again
2. Check session expiration settings
3. Verify database session records
4. Restart development server

## Build Issues

### TypeScript errors

**Problem:** `tsc` fails with type errors

**Solutions:**

1. Run type generation:

```bash
npx react-router typegen
```

2. Check for missing types:

```bash
npm install --save-dev @types/node
```

3. Review error messages and fix type issues

### Build fails with Prisma error

**Problem:** Build cannot find Prisma Client

**Solutions:**

1. Generate Prisma Client before build:

```bash
npx prisma generate
npm run build
```

2. Add to build script in `package.json`:

```json
{
    "scripts": {
        "build": "prisma generate && react-router build"
    }
}
```

### Out of memory during build

**Problem:** `JavaScript heap out of memory`

**Solution:**

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## Testing Issues

### Tests fail to run

**Problem:** Vitest exits with errors

**Solutions:**

1. Check test setup file exists: `app/test/setup.ts`
2. Verify vitest.config.ts is correct
3. Clear test cache:

```bash
npx vitest --clearCache
```

### Mock not working

**Problem:** Module mock is ignored

**Solution:**

Ensure mock is before imports:

```typescript
import { vi } from 'vitest';

vi.mock('~/lib/auth.server', () => ({
    auth: {
        /* mock */
    },
}));

import { auth } from '~/lib/auth.server';
```

### Test database issues

**Problem:** Tests failing due to database

**Solution:**

Use separate test database:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/test_db
```

## Form Issues

### Validation not working

**Problem:** Form submits with invalid data

**Solutions:**

1. Check Zod schema is correct
2. Verify zodResolver is configured:

```typescript
const form = useForm({
    resolver: zodResolver(schema),
});
```

3. Check for JavaScript errors in console

### Form not submitting

**Problem:** Submit button does nothing

**Solutions:**

1. Check onSubmit handler is attached
2. Verify no JavaScript errors
3. Check network tab for failed requests
4. Ensure button type is "submit"

## Styling Issues

### Tailwind classes not applied

**Problem:** Classes present but no styles

**Solutions:**

1. Restart development server
2. Check Tailwind configuration
3. Verify class names are correct
4. Check for conflicting styles

### DaisyUI components not styled

**Problem:** Components appear unstyled

**Solutions:**

1. Verify DaisyUI is in `tailwind.config.ts`:

```typescript
import daisyui from 'daisyui';

export default {
    plugins: [daisyui],
};
```

2. Check data-theme attribute on HTML element
3. Restart development server

## Deployment Issues

### Build succeeds locally but fails in production

**Problem:** Production build fails

**Solutions:**

1. Check all environment variables are set
2. Verify Node.js version matches
3. Review build logs for specific errors
4. Test production build locally:

```bash
npm run build
npm run start
```

### Application crashes after deployment

**Problem:** Server exits after starting

**Solutions:**

1. Check application logs
2. Verify database connection
3. Check environment variables
4. Review error tracking service

### Database connection timeout

**Problem:** Cannot connect to database in production

**Solutions:**

1. Verify database is accessible from production network
2. Check connection string is correct
3. Verify SSL settings if required
4. Check firewall rules

## Performance Issues

### Slow page loads

**Problem:** Pages take long to load

**Solutions:**

1. Check loader performance:

```typescript
export async function loader() {
    const start = Date.now();
    const data = await getData();
    console.log('Loader took:', Date.now() - start, 'ms');
    return data;
}
```

2. Optimize database queries
3. Add database indexes
4. Use caching for expensive operations

### High memory usage

**Problem:** Application uses too much memory

**Solutions:**

1. Check for memory leaks
2. Optimize database connection pool
3. Clear unused caches
4. Review large data operations

## Integration Issues

### PostHog not tracking

**Problem:** Events not appearing in PostHog

**Solutions:**

1. Verify POSTHOG_API_KEY is set
2. Check PostHog initialization
3. Review browser console for errors
4. Verify events are being captured

### Polar billing not working

**Problem:** Subscription checks fail

**Solutions:**

1. Verify Polar credentials
2. Check Polar plugin configuration
3. Review webhook setup
4. Test with Polar test mode

## Getting More Help

If you cannot find a solution:

1. Check existing GitHub issues
2. Review React Router 7 documentation
3. Check Prisma documentation
4. Open a new issue with:
    - Error message
    - Steps to reproduce
    - Environment details
    - What you have tried

## Useful Commands

```bash
# Clear all caches
rm -rf node_modules .react-router build
npm install

# Reset database (development only)
npx prisma migrate reset

# Check for issues
npm run typecheck
npm run test:run

# Debug production build
npm run build
NODE_ENV=production npm run start

# View database
npx prisma studio
```

## Further Reading

- [Development Workflow](./development.md)
- [Deployment Guide](./deployment.md)
- [Testing Guide](./testing.md)
- [React Router 7 Docs](https://reactrouter.com/dev)
- [Prisma Docs](https://www.prisma.io/docs)
