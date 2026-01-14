# Debug Localhost Development Server

A step-by-step guide for debugging your local React Router 7 app using Playwright MCP.

## When to Use

- Testing new features on localhost before deployment
- Debugging UI issues that only appear in the browser
- Checking console errors during development
- Verifying API requests and responses
- Testing authentication flows

## Prerequisites

- Dev server must be running: `npm run dev`
- Default port: 5173 (React Router 7 with Vite)
- Check `vite.config.ts` if using custom port

## Step-by-Step Workflow

### Step 1: Navigate to Local Server

Use the Playwright MCP `browser_navigate` tool to open your local development server.

```
URL: http://localhost:5173
```

Common routes to test:

- `/` - Landing page
- `/dashboard` - Main authenticated view
- `/portal` - User portal

**Example:**

```markdown
Navigate to http://localhost:5173/dashboard to debug the dashboard page.
```

### Step 2: Capture Page Snapshot

Use `browser_snapshot` to get the accessibility tree and DOM structure. This is better than a screenshot for AI analysis.

**What it captures:**

- Page structure as semantic tree
- Element roles and labels
- Text content
- Interactive elements

**Why snapshot first:**

- Structured data for AI analysis
- No pixel interpretation needed
- Includes accessibility information
- Lower token usage than describing screenshots

### Step 3: Check Console Messages

Use `browser_console_messages` with level filtering to find JavaScript errors.

**Filter by level:**

- `error` - JavaScript errors, uncaught exceptions
- `warning` - React warnings, deprecation notices
- `info` - Informational logs
- `debug` - Debug messages

**Common errors to look for:**

- **Hydration mismatches:** "Text content does not match server-rendered HTML"
- **Route type errors:** "Cannot find module './+types/[route]'"
- **Prisma errors:** "Cannot find module '@prisma/client'"
- **Network errors:** "Failed to fetch"
- **React errors:** "Minified React error #..."

**Example:**

```markdown
Get console messages with level 'error' to check for JavaScript exceptions.
```

### Step 4: Monitor Network Activity

Use `browser_network_requests` to see all API calls and responses.

**Parameters:**

- `includeStatic: false` - Filter out CSS/JS/images (recommended)
- `includeStatic: true` - Include all assets (use for asset loading issues)

**What to check:**

- **Status codes:**
  - 200-299: Success
  - 400-499: Client errors (auth, validation, not found)
  - 500-599: Server errors

- **Request headers:**
  - Authorization: Bearer token present?
  - Content-Type: application/json?

- **Response timing:**
  - Slow endpoints (>1000ms)
  - Failed requests

**Example:**

```markdown
Get network requests with includeStatic: false to see API calls only.
```

### Step 5: Take Screenshot (Optional)

If you need visual confirmation, use `browser_take_screenshot`.

**When to use screenshots:**

- Confirming visual bugs (layout, colors, spacing)
- Checking responsive breakpoints
- Verifying component styling
- Human review needed

**When NOT to use screenshots:**

- AI analysis (use snapshot instead)
- Checking element properties (use evaluate)
- Finding console errors (use console_messages)

### Step 6: Clean Up

Use `browser_close` to release browser resources and prevent hanging processes.

**Always close the browser when:**

- Debugging session is complete
- Switching to different task
- No more browser interaction needed

## Complete Example Session

```markdown
**User:** "The dashboard shows a blank screen after login"

**Debug Steps:**

1. Navigate to http://localhost:5173/dashboard
2. Capture snapshot to see page structure
3. Check console messages with level: "error"
4. Monitor network requests to /api/auth

**Findings:**

- Console shows: "TypeError: Cannot read property 'email' of undefined"
- Network shows: 401 from /api/auth/authenticate
- Snapshot shows: Empty main content area

**Root Cause:**

- Auth middleware not passing user to context
- Component trying to access undefined user.email

**Fix:**

- Check `routes/authenticated.tsx` middleware
- Verify `useAuthenticatedContext()` returns user
```

## Common Issues in Iridium Apps

### Issue: Blank Page After Navigation

**Debug:**

1. Check console for routing errors
2. Verify route exists in `app/routes.ts`
3. Check loader/action for unhandled errors
4. Look for missing error boundaries

### Issue: Form Submission Not Working

**Debug:**

1. Monitor network requests during submission
2. Check request method matches action (POST/PUT/DELETE)
3. Verify form validation (client + server)
4. Check for CORS errors in console

### Issue: Data Not Loading

**Debug:**

1. Check network requests for API calls
2. Verify loader returns data correctly
3. Check for authentication issues (401)
4. Look for Prisma query errors in console

### Issue: Styles Not Applying

**Debug:**

1. Take screenshot to confirm visual issue
2. Use `browser_evaluate` to check element classes
3. Verify DaisyUI base classes present
4. Check CVA variants applied correctly

## Integration with Other Skills

After debugging with `dev-browser`:

- **Fix console errors** → Reference error handling patterns
- **Add tests** → Use `create-e2e-test` or `create-unit-test`
- **Add error handling** → Use `add-error-boundary`
- **Fix API issues** → Check `create-crud-api` patterns

## Tips for Effective Debugging

### 1. Reproduce the Issue First

Before debugging, ensure you can consistently reproduce the problem.

### 2. Check Recent Changes

If something broke recently, check recent commits and changes.

### 3. Start Broad, Then Narrow

1. Console errors (broad)
2. Network requests (specific)
3. Element inspection (focused)

### 4. Use Multiple Tools Together

- Snapshot + Console messages = Full picture
- Network requests + Screenshot = API debugging
- Evaluate + Snapshot = Element debugging

### 5. Document Findings

Keep track of what you find during debugging for future reference.

## Next Steps After Debugging

1. **Fix the issue** - Apply the appropriate fix to the code
2. **Add tests** - Prevent regression with E2E or unit tests
3. **Add error handling** - Use error boundaries for graceful failures
4. **Document** - Add comments or update docs if behavior is subtle
5. **Verify fix** - Run the debug workflow again to confirm resolution

## Reference

- See `SKILL.md` for full list of Playwright MCP tools
- See `.github/instructions/react-router.instructions.md` for routing patterns
- See `.github/instructions/error-boundaries.instructions.md` for error handling
