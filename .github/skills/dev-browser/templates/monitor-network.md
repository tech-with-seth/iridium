# Monitor Network Requests and API Calls

A comprehensive guide for debugging API requests, network failures, authentication issues, and data loading problems.

## When to Use

- API requests failing (400/500 errors)
- Data not loading in components
- Slow page loads or performance issues
- CORS errors blocking requests
- Authentication failures (401/403)
- Form submissions not working
- WebSocket or streaming issues
- Missing or incorrect request headers

## Workflow

### 1. Navigate to Page

Navigate to the page that makes the API requests you want to monitor.

```markdown
Navigate to http://localhost:5173/dashboard
```

**Tips:**

- Start from clean state if testing initial load
- Include any necessary authentication state
- Navigate to specific route that triggers requests

### 2. Get All Network Requests

Use `browser_network_requests` to get all HTTP requests since page load.

```markdown
Get network requests with includeStatic: false
```

**Parameters:**

- `includeStatic: false` - Filter out CSS/JS/images (recommended for API debugging)
- `includeStatic: true` - Include all assets (use for asset loading issues)

**What it returns:**

- URL and method (GET, POST, PUT, DELETE)
- Status code (200, 400, 401, 500, etc.)
- Request headers (Authorization, Content-Type)
- Response headers (Content-Type, Set-Cookie)
- Request body (for POST/PUT/PATCH)
- Response body
- Timing information

### 3. Analyze Requests

Filter and analyze requests by status code, endpoint, or timing.

#### Success Requests (200-299)

- Confirm data is loading correctly
- Check response body structure
- Verify timing is acceptable

#### Client Errors (400-499)

- **400 Bad Request:** Invalid request body or parameters
- **401 Unauthorized:** Missing or invalid authentication
- **403 Forbidden:** Authenticated but not authorized
- **404 Not Found:** Endpoint doesn't exist or wrong URL
- **422 Unprocessable Entity:** Validation errors

#### Server Errors (500-599)

- **500 Internal Server Error:** Server-side exception
- **502 Bad Gateway:** Upstream server error
- **503 Service Unavailable:** Server overloaded or down

### 4. Debug Failed Requests

For each failed request:

1. **Check URL** - Verify endpoint exists and path is correct
2. **Check Method** - Ensure method matches route (GET loader, POST action)
3. **Check Headers** - Verify Authorization, Content-Type
4. **Check Body** - Ensure request body is valid JSON
5. **Check Response** - Read error message in response body

## Common API Issues in Iridium

### 401 Unauthorized

**Symptom:** API requests return 401, user gets redirected to login

**Debug:**

```markdown
Get network requests and filter for 401 status codes
```

**What to check:**

1. **Request has Authorization header:**
   ```
   Authorization: Bearer [session-token]
   ```

2. **Session cookie exists:**
   - Check cookies in browser storage
   - Look for `better-auth.session_token`

3. **Route has auth check:**
   ```typescript
   // In route loader
   const user = await requireUser(request);
   ```

**Common causes:**

- Session expired (default: 7 days in Iridium)
- `requireUser()` check in loader/action
- Cookie not sent (cross-origin request)
- BetterAuth not configured correctly

**Fix:**

```typescript
// Ensure loader checks auth
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);  // Redirects to login if not authenticated
    // ...
}
```

### 404 Not Found

**Symptom:** API returns 404, endpoint not found

**Debug:**

```markdown
Get network requests and check the failing request URL
```

**What to check:**

1. **Route registered in `app/routes.ts`:**
   ```typescript
   ...prefix(Paths.API, [
       route(Paths.PROFILE, 'routes/api/profile.ts'),
   ]),
   ```

2. **HTTP method matches route:**
   - GET → loader function
   - POST/PUT/DELETE → action function

3. **URL path is correct:**
   - Check for typos
   - Verify path constants in `app/constants.ts`

**Common causes:**

- Route not registered in `app/routes.ts`
- Wrong HTTP method (GET vs POST)
- Missing `Paths.API` prefix
- Typo in URL

**Fix:**

```typescript
// Register route in app/routes.ts
import { Paths } from './constants';

export default [
    ...prefix(Paths.API, [
        route(Paths.PROFILE, 'routes/api/profile.ts'),  // Add your route
    ]),
] satisfies RouteConfig;
```

### 500 Internal Server Error

**Symptom:** API returns 500, server crashed or threw exception

**Debug:**

1. Get network request to see endpoint
2. Check server console logs for error details
3. Check response body for error message

**What to check:**

- **Prisma query error:**
  ```
  PrismaClientKnownRequestError: Invalid field name
  ```

- **Model layer exception:**
  ```
  TypeError: Cannot read property 'id' of undefined
  ```

- **Missing environment variables:**
  ```
  Error: OPENAI_API_KEY is required
  ```

**Common causes:**

- Database query error (check Prisma schema)
- Null reference in model layer function
- Missing validation (accepting invalid data)
- Unhandled promise rejection

**Fix:**

Add proper error handling:

```typescript
export async function action({ request }: Route.ActionArgs) {
    try {
        const user = await requireUser(request);
        const data = await getUserProfile(user.id);
        return data({ profile: data });
    } catch (error) {
        console.error('Failed to load profile:', error);
        return data(
            { error: 'Failed to load profile' },
            { status: 500 }
        );
    }
}
```

### CORS Errors

**Symptom:** Browser blocks request, console shows CORS error

**Debug:**

```markdown
1. Check console messages for CORS error
2. Get network requests to see request origin
```

**Error message:**

```
Access to fetch at 'https://api.example.com' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**What to check:**

1. **BetterAuth trustedOrigins:**
   ```typescript
   // app/lib/auth.server.ts
   export const auth = betterAuth({
       trustedOrigins: [
           'http://localhost:5173',
           process.env.BETTER_AUTH_URL!,
       ],
       // ...
   });
   ```

2. **External API CORS settings:**
   - Can't control external APIs
   - May need proxy through your backend

**Common causes:**

- Making request from different origin
- Missing CORS headers on backend
- Preflight OPTIONS request failing

**Fix for BetterAuth:**

```typescript
// Add your frontend URL to trustedOrigins
trustedOrigins: [
    'http://localhost:5173',
    'https://yourdomain.com',
]
```

## Debugging Specific API Patterns

### Chat API (Streaming)

**Expected behavior:**

- POST to `/api/chat`
- Status: 200
- Content-Type: `text/event-stream`
- Response streams data over time

**Debug:**

```markdown
1. Get network requests
2. Filter for /api/chat
3. Check:
   - Request has Authorization header
   - Request body contains messages array
   - Response is streaming (not single JSON object)
   - No console errors about Vercel AI SDK
```

**Common issues:**

- Missing `await` in streamText call
- Wrong model name (`gpt-4o` not `gpt-4`)
- OpenAI API key not set
- Messages array format incorrect

### Form Submission

**Expected behavior:**

- POST/PUT/PATCH to endpoint
- Status: 200 or 302 (redirect)
- Validation errors return 400

**Debug:**

```markdown
1. Get network requests after form submit
2. Check:
   - Request method matches action
   - Request body has all form fields
   - Content-Type is application/x-www-form-urlencoded or multipart/form-data
   - Response has success or validation errors
```

**Common issues:**

- Wrong HTTP method
- Missing CSRF token
- Validation failing (check response body)
- Action not handling method

### File Upload

**Expected behavior:**

- POST to endpoint
- Content-Type: `multipart/form-data`
- Status: 200

**Debug:**

```markdown
Get network requests and check:
- Request Content-Type is multipart/form-data
- Request body includes file
- File size within limits
```

**Common issues:**

- Missing `enctype="multipart/form-data"` on form
- File too large
- Backend not parsing multipart correctly

## Performance Debugging

### Slow Requests

**Symptom:** Page loads slowly or feels laggy

**Debug:**

```markdown
Get network requests and sort by timing
```

**What to check:**

- **Request timing:**
  - < 100ms: Fast
  - 100-500ms: Acceptable
  - 500-1000ms: Slow
  - > 1000ms: Very slow

- **Slowest endpoints:**
  - Database queries (N+1 problem)
  - External API calls
  - Large data transfers

**Common causes:**

- Missing database indexes
- N+1 queries (loading relations inefficiently)
- Not using pagination
- Large response bodies

**Fix:**

```typescript
// ❌ SLOW - N+1 query
const users = await prisma.user.findMany();
for (const user of users) {
    const posts = await prisma.post.findMany({ where: { userId: user.id } });
}

// ✅ FAST - Include relation
const users = await prisma.user.findMany({
    include: { posts: true }
});
```

### Too Many Requests

**Symptom:** Page makes dozens of network requests

**Debug:**

```markdown
Get network requests with includeStatic: true and count total
```

**What to check:**

- **Duplicate requests** - Same endpoint called multiple times
- **Waterfall loading** - Requests depend on previous requests
- **Missing batch endpoints** - Loading items one by one

**Fix:**

```typescript
// ❌ BAD - Multiple requests
const user = await fetch('/api/user');
const posts = await fetch('/api/posts');
const comments = await fetch('/api/comments');

// ✅ BETTER - Single request
const data = await fetch('/api/dashboard');  // Returns all data
```

## Complete Example: Debug Failed Login

**User:** "Login button does nothing, no error message"

### Step 1: Navigate and Monitor

```markdown
1. Navigate to http://localhost:5173
2. Get network requests after clicking login button
```

### Step 2: Analyze Findings

```
Found:
- POST to /api/auth/better-auth/sign-in/email
- Status: 400 Bad Request
- Response body: { "error": "Invalid credentials" }
```

### Step 3: Check Request Details

- Request body has email and password
- Content-Type is application/json
- No Authorization header (expected for login)

### Step 4: Check Response

Response indicates credentials are invalid, but user insists they're correct.

### Step 5: Identify Root Cause

Check database for user:

```typescript
const user = await prisma.user.findUnique({
    where: { email: 'user@example.com' }
});
```

User exists but password hash doesn't match. Check BetterAuth password configuration.

### Step 6: Suggest Fix

```typescript
// Verify password hashing configuration
// Check that password was hashed when creating user
// Test with a fresh user registration
```

## Tips for Network Debugging

### 1. Reproduce Consistently

Ensure you can trigger the request consistently before debugging.

### 2. Check Both Request and Response

Issues can be in either the client (request) or server (response).

### 3. Compare Working vs Broken

If one endpoint works but another doesn't, compare the requests side-by-side.

### 4. Use Network Tab Filters

Filter by:

- Status code (400, 401, 500)
- URL path (/api/)
- Method (POST, PUT, DELETE)
- Timing (slow requests)

### 5. Check Server Logs

Browser network tab shows client side. Server logs show server-side errors.

## After Finding the Issue

1. **Fix the code** - Update route handler, model layer, or client code
2. **Test the fix** - Trigger request again and verify success
3. **Add validation** - Prevent invalid requests at client
4. **Add error handling** - Handle errors gracefully
5. **Add logging** - Log important requests for debugging

## Integration with Other Templates

- **Console errors** → See `check-console-errors.md`
- **Authentication issues** → See BetterAuth docs
- **Element not updating** → See `inspect-element.md`

## Reference

- HTTP Status Codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- BetterAuth Docs: https://www.better-auth.com/docs
- React Router Actions: https://reactrouter.com/
- See `.github/instructions/api-endpoints.instructions.md` for API patterns
- See `.github/instructions/crud-pattern.instructions.md` for CRUD operations
