# Check Browser Console for Errors

A focused guide for finding and fixing JavaScript errors, React issues, and framework-specific problems using browser console messages.

## When to Use

- JavaScript errors breaking functionality
- React hydration mismatches
- TypeScript type errors appearing in browser
- Third-party library warnings
- Framework-specific issues (React Router, Prisma, BetterAuth)
- Silent failures (no visual error but feature not working)

## Workflow

### 1. Navigate to Page

Use `browser_navigate` to open the page where errors occur.

**Tips:**

- Start from a clean state (clear cookies/cache if needed)
- Navigate to the specific route with issues
- Include any URL parameters or query strings

**Example:**

```markdown
Navigate to http://localhost:5173/dashboard/thread/abc123
```

### 2. Get Console Messages

Use `browser_console_messages` with level filtering to find errors.

**Level options:**

- `error` - Critical errors (uncaught exceptions, failed requests)
- `warning` - Non-critical issues (deprecations, React warnings)
- `info` - Informational messages
- `debug` - Debug output

**Start with errors first:**

```markdown
Get console messages with level: "error"
```

### 3. Analyze Error Messages

Look for these error patterns:

#### Uncaught Exceptions

```
Uncaught TypeError: Cannot read property 'email' of undefined
Uncaught ReferenceError: user is not defined
```

**Common causes:**

- Missing null checks
- Accessing properties on undefined objects
- Variables not initialized

#### Network Errors

```
Failed to fetch
TypeError: NetworkError when attempting to fetch resource
```

**Common causes:**

- API endpoint doesn't exist
- CORS policy blocking request
- Server not running
- Wrong URL or port

#### React Errors

```
Minified React error #418
Minified React error #31
```

**Common causes:**

- Hydration mismatches (server vs client HTML)
- Invalid hook usage
- Component lifecycle issues

#### Module Errors

```
Cannot find module './+types/dashboard'
Cannot find module '@prisma/client'
```

**Common causes:**

- Route types not generated
- Wrong import path
- Missing dependencies

### 4. Get Additional Context

If errors mention specific functionality:

**For network errors:**

```markdown
Get network requests to see failed API calls
```

**For page structure issues:**

```markdown
Capture snapshot to see current page state
```

**For element-specific issues:**

```markdown
Use browser_evaluate to inspect element properties
```

## Common React Router 7 Errors

### Hydration Mismatch

**Error:**

```
Warning: Text content does not match server-rendered HTML
Error: Hydration failed because the initial UI does not match what was rendered on the server
```

**Cause:**

Client-rendered content differs from server-rendered HTML. This happens when:

- Using `window`, `localStorage`, or other browser-only APIs on server
- Rendering different content based on client state
- Date/time rendering with timezone differences
- Random values not seeded on server

**Debug steps:**

1. Check console for specific element that mismatched
2. Find component rendering that element
3. Look for client-only code in component or loader

**Fix:**

```typescript
// ❌ WRONG - window not available on server
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// ✅ CORRECT - check if running in browser
const isDark = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
```

### Route Type Import Errors

**Error:**

```
Cannot find module './+types/dashboard'
Module not found: Error: Can't resolve './+types/thread'
```

**Cause:**

Route types not generated after adding/modifying routes in `app/routes.ts`.

**Debug steps:**

1. Verify route exists in `app/routes.ts`
2. Check import path uses `./+types/` (NOT `../+types/`)
3. Check if TypeScript server restarted

**Fix:**

```bash
npm run typecheck
```

This generates route types in `.react-router/types/` directory.

### Prisma Import Errors

**Error:**

```
Cannot find module '@prisma/client'
Error: Cannot find module 'generated/prisma/client'
```

**Cause:**

Iridium uses a custom Prisma output path. Default imports won't work.

**Debug steps:**

1. Check import statement in error stack trace
2. Verify Prisma client generated

**Fix:**

```typescript
// ❌ WRONG - default Prisma path
import { PrismaClient } from '@prisma/client';

// ✅ CORRECT - Iridium custom path
import { prisma } from '~/db.server';
import type { User, Role } from '~/generated/prisma/client';
```

## Common BetterAuth Errors

### Session Not Found

**Error:**

```
TypeError: Cannot read property 'user' of null
Unauthorized: Session not found
```

**Cause:**

- Session expired
- Auth cookie not set
- Middleware not running
- Wrong auth configuration

**Debug steps:**

1. Check network requests for `/api/auth/better-auth` calls
2. Verify cookies in browser storage
3. Check `requireUser()` in route loader

**Fix:**

```typescript
// In route loader
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);  // Redirects if not authenticated
    // ...
}
```

### Auth Callback Errors

**Error:**

```
Error: redirect_uri_mismatch
Error: Invalid client credentials
```

**Cause:**

- Wrong OAuth callback URL
- Missing environment variables
- Incorrect provider configuration

**Debug steps:**

1. Check `BETTER_AUTH_URL` environment variable
2. Verify provider callback URL matches
3. Check provider credentials

## Common Prisma Errors

### Connection Errors

**Error:**

```
PrismaClientInitializationError: Can't reach database server
Error: P1001: Can't reach database server at localhost:5432
```

**Cause:**

- Database not running
- Wrong connection string
- Firewall blocking connection

**Debug steps:**

1. Verify `DATABASE_URL` in `.env`
2. Check database server status
3. Test connection manually

### Query Errors

**Error:**

```
PrismaClientKnownRequestError: Invalid field name
Error: P2025: Record to delete does not exist
```

**Cause:**

- Schema out of sync with database
- Invalid query parameters
- Missing foreign key relations

**Debug steps:**

1. Check model definitions in `prisma/schema.prisma`
2. Verify migrations applied: `npx prisma migrate status`
3. Check query in model layer function

## Common Vercel AI SDK Errors

### Streaming Errors

**Error:**

```
TypeError: response.body is undefined
Error: Failed to parse stream
```

**Cause:**

- API route not returning correct stream format
- Missing OpenAI API key
- Network interruption

**Debug steps:**

1. Check `/api/chat` endpoint response
2. Verify `OPENAI_API_KEY` set
3. Check network requests for API calls

**Fix:**

```typescript
// In API route action
const result = await streamText({
    model: ai('gpt-4o'),
    messages: convertToModelMessages(messages),
});

return result.toUIMessageStreamResponse();  // Correct format
```

## Workflow Example

**User:** "Chat feature isn't working, no response from AI"

### Step 1: Navigate and Check Console

```markdown
1. Navigate to http://localhost:5173/dashboard
2. Get console messages with level: "error"
```

### Step 2: Analyze Findings

```
Found errors:
- "TypeError: Cannot read property 'toUIMessageStreamResponse' of undefined"
- "401 Unauthorized from /api/chat"
```

### Step 3: Debug Deeper

```markdown
Get network requests to see API call details
```

### Step 4: Identify Root Cause

- API route missing `await` keyword
- OpenAI API key not set in environment

### Step 5: Suggest Fix

```typescript
// app/routes/api/chat.ts
export async function action({ request }: Route.ActionArgs) {
    const { messages } = await request.json();

    // ❌ Missing await
    const result = streamText({
        model: ai('gpt-4o'),
        messages: convertToModelMessages(messages),
    });

    // ✅ Add await
    const result = await streamText({
        model: ai('gpt-4o'),
        messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}
```

## Tips for Effective Error Analysis

### 1. Read the Full Stack Trace

Error messages include file paths and line numbers. Use these to locate the exact issue.

### 2. Check Error Frequency

- Same error repeated many times → Loop or recursive call
- Single error → One-time initialization issue
- Errors after user action → Event handler issue

### 3. Look for Cascading Errors

First error may cause subsequent errors. Fix the root cause first.

### 4. Check Both Client and Server

Some errors appear in browser console, others in server logs. Check both.

### 5. Search for Known Issues

Copy error message and search in:

- React Router docs
- Prisma docs
- BetterAuth docs
- GitHub issues

## After Finding Errors

1. **Fix the code** - Apply the appropriate fix
2. **Test the fix** - Run debug workflow again to verify
3. **Add error handling** - Use try/catch or error boundaries
4. **Add logging** - Log important state for future debugging
5. **Add tests** - Prevent regression with unit or E2E tests

## Integration with Other Templates

- **API errors** → See `monitor-network.md`
- **Element issues** → See `inspect-element.md`
- **Localhost debugging** → See `debug-localhost.md`

## Reference

- React Router 7 Docs: https://reactrouter.com/
- Prisma Error Reference: https://www.prisma.io/docs/reference/api-reference/error-reference
- BetterAuth Docs: https://www.better-auth.com/docs
- See `.github/instructions/` for framework-specific patterns
