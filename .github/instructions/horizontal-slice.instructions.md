# Horizontal Slice Instructions

## Overview

A **horizontal slice** is infrastructure-level implementation that provides foundational capabilities across the application without delivering a complete user-facing feature. Unlike vertical slices (which cut through all layers to deliver working functionality), horizontal slices build shared services, libraries, or integrations that enable future vertical slices.

### Key Characteristics

- ✅ **Infrastructure-focused** - Builds shared services, SDKs, or utilities
- ✅ **Layer-specific** - Operates at one architectural layer (e.g., model layer, lib layer)
- ✅ **Reusable** - Designed for multiple features to consume
- ✅ **Foundation-building** - Enables future vertical slices
- ✅ **Not user-facing** - No complete UI-to-database feature flow
- ✅ **Requires vertical slice to complete** - Must be connected to user features later

**Important:** Horizontal slices are complementary to vertical slices, not a replacement. They establish shared infrastructure that vertical slices then consume.

## When to Use Horizontal Slices

### ✅ Appropriate Use Cases

**Third-Party Service Integration:**

- Email service SDK (Resend, SendGrid)
- Payment gateway (Stripe, Polar)
- Analytics platform (PostHog, Mixpanel)
- Cloud storage (S3, Cloudinary)
- External APIs

**Shared Utilities:**

- Authentication middleware
- Caching layer
- Error tracking service
- Logging infrastructure
- Rate limiting

**Common Libraries:**

- Form validation utilities
- Date/time helpers
- String formatting
- File processing
- Image optimization

**Why horizontal first:**

- Multiple features will use the service
- Integration complexity requires focused implementation
- SDK/API patterns need to be established
- Testing infrastructure separately is valuable

### ❌ Inappropriate Use Cases

**Feature-Specific Logic:**

- User profile management → Should be vertical slice
- Post creation → Should be vertical slice
- Comment system → Should be vertical slice
- Search functionality → Should be vertical slice

**Single-Use Components:**

- One-off UI components
- Feature-specific API endpoints
- Custom business logic for single feature

**Why vertical instead:**

- Only one feature needs it
- Can't be reused
- User value is immediate
- Integration risk needs early validation

## Horizontal Slice vs Vertical Slice

### Horizontal Slice (Infrastructure)

```
Layer 1: SDK/Service Integration
├── lib/
│   ├── email.server.ts        ✅ Email service client
│   └── email-helpers.ts       ✅ Utility functions
├── models/
│   └── email.server.ts        ✅ Email sending functions
└── emails/
    ├── welcome-email.tsx      ✅ React Email template
    └── verification-email.tsx ✅ React Email template

❌ No API endpoint
❌ No UI route
❌ No complete user flow
```

**Result:** Infrastructure ready, but no user can trigger it yet.

### Vertical Slice (Feature)

```
Complete user registration feature:
├── lib/validations.ts              ✅ signUpSchema
├── prisma/schema.prisma            ✅ User model
├── models/user.server.ts           ✅ createUser()
├── routes/api/auth/sign-up.ts      ✅ API endpoint
├── routes/sign-up.tsx              ✅ UI form
└── Uses horizontal slice:
    └── models/email.server.ts      ✅ sendWelcomeEmail()
```

**Result:** User can sign up, account created, welcome email sent.

### The Relationship

```
Horizontal Slice (Foundation)
         ↓
    Vertical Slice (Feature)
         ↓
      User Value
```

**Example Flow:**

1. **Horizontal:** Implement Resend email service
    - SDK client in `lib/resend.server.ts`
    - Model functions in `models/email.server.ts`
    - React Email templates
    - **Result:** Email infrastructure exists but unused

2. **Vertical:** Implement user registration
    - Validation schema
    - User model
    - API endpoint
    - UI form
    - **Calls horizontal slice:** `sendWelcomeEmail()`
    - **Result:** Users can sign up and receive emails

3. **Vertical:** Implement password reset
    - Password reset schema
    - Model functions
    - API endpoint
    - UI form
    - **Calls horizontal slice:** `sendPasswordResetEmail()`
    - **Result:** Users can reset passwords via email

## Real-World Example: Resend Email Integration

The Resend email integration (PR #12) is a canonical horizontal slice.

### What Was Implemented (Horizontal)

**1. SDK Client Setup**

```typescript
// app/lib/resend.server.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const DEFAULT_FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
```

**2. Model Layer Functions**

```typescript
// app/models/email.server.ts
import { render } from '@react-email/components';
import { resend, DEFAULT_FROM_EMAIL } from '~/lib/resend.server';

export async function sendWelcomeEmail({
    to,
    userName,
    dashboardUrl
}: {
    to: string;
    userName: string;
    dashboardUrl: string;
}) {
    const html = await render(WelcomeEmail({ userName, dashboardUrl }));

    return resend.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to,
        subject: 'Welcome to Iridium!',
        html
    });
}

export async function sendVerificationEmail({ to, verificationUrl }: { ... }) {
    // Implementation
}

export async function sendPasswordResetEmail({ to, resetUrl }: { ... }) {
    // Implementation
}
```

**3. React Email Templates**

```typescript
// app/emails/welcome-email.tsx
import { Html, Body, Container, Heading, Text, Button } from '@react-email/components';

interface WelcomeEmailProps {
    userName: string;
    dashboardUrl: string;
}

export default function WelcomeEmail({ userName, dashboardUrl }: WelcomeEmailProps) {
    return (
        <Html>
            <Body>
                <Container>
                    <Heading>Welcome {userName}!</Heading>
                    <Text>Thanks for joining Iridium.</Text>
                    <Button href={dashboardUrl}>Get Started</Button>
                </Container>
            </Body>
        </Html>
    );
}
```

**4. BetterAuth Integration**

```typescript
// app/lib/auth.server.ts
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
} from '~/models/email.server';

export const auth = betterAuth({
    emailAndPassword: {
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail({
                to: user.email,
                resetUrl: url,
            });
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await sendVerificationEmail({
                to: user.email,
                verificationUrl: url,
            });
        },
    },
});
```

**5. Documentation**

```markdown
docs/decisions/010-resend-email.md ✅ ADR documenting decision
docs/email.md ✅ Usage guide
.github/instructions/resend.instructions.md ✅ AI agent patterns
```

### What Was NOT Implemented (Needs Vertical Slices)

❌ **No API endpoint** - No `/api/email` route for client-side email sending
❌ **No UI component** - No `<EmailForm>` or email management page
❌ **No complete feature** - Users can't send emails through the UI
❌ **No user flow** - Infrastructure exists but isn't connected to features

### Completing the Horizontal Slice with Vertical Slices

The horizontal slice enables these vertical slices:

**Vertical Slice 1: User Registration with Welcome Email**

- ✅ Already implemented in sign-up flow
- Calls `sendWelcomeEmail()` after user creation
- Complete feature: User signs up → receives welcome email

**Vertical Slice 2: Email Verification**

- ✅ Already implemented via BetterAuth
- Calls `sendVerificationEmail()` on sign-up
- Complete feature: User verifies email via link

**Vertical Slice 3: Password Reset**

- ✅ Already implemented via BetterAuth
- Calls `sendPasswordResetEmail()` on reset request
- Complete feature: User resets password via email

**Future Vertical Slice: Contact Form**

```typescript
// Would add:
// 1. Validation schema (app/lib/validations.ts)
// 2. API endpoint (app/routes/api/contact.ts)
// 3. UI route (app/routes/contact.tsx)
// 4. Calls horizontal slice: sendContactFormEmail()
```

**Future Vertical Slice: Email Notifications**

```typescript
// Would add:
// 1. User notification preferences model
// 2. API endpoints for managing preferences
// 3. UI route for notification settings
// 4. Calls horizontal slice: sendNotificationEmail()
```

## Horizontal Slice Implementation Pattern

### Step 1: Evaluate if Horizontal Slice is Appropriate

Ask these questions:

1. **Will multiple features use this?** (Yes → Horizontal)
2. **Is this infrastructure/tooling?** (Yes → Horizontal)
3. **Can this be built independently?** (Yes → Horizontal)
4. **Does this provide user value alone?** (No → Horizontal)

If all answers align, proceed with horizontal slice.

### Step 2: Plan the Infrastructure

**Define scope:**

- What capabilities does this provide?
- Which layers will it touch?
- What functions/utilities are needed?
- How will vertical slices consume it?

**Example (Email Service):**

- Capabilities: Send transactional emails with templates
- Layers: lib (SDK), models (functions), emails (templates)
- Functions: `sendWelcomeEmail()`, `sendVerificationEmail()`, etc.
- Consumption: Vertical slices call model functions

### Step 3: Implement Infrastructure Layer

**SDK/Service Integration:**

```typescript
// app/lib/[service].server.ts
import { ServiceSDK } from 'service-sdk';

// Initialize singleton
export const serviceClient = new ServiceSDK({
    apiKey: process.env.SERVICE_API_KEY,
});

// Export configuration
export const SERVICE_CONFIG = {
    defaultOption: process.env.SERVICE_DEFAULT || 'default-value',
};
```

**Model Layer Functions:**

```typescript
// app/models/[service].server.ts
import { serviceClient } from '~/lib/[service].server';

/**
 * High-level function that vertical slices will call
 * Handles all complexity internally
 */
export async function doSomethingUseful({
    param1,
    param2,
}: {
    param1: string;
    param2: number;
}) {
    try {
        const result = await serviceClient.performAction({
            param1,
            param2,
        });

        return { success: true, data: result };
    } catch (error) {
        console.error('Service error:', error);
        throw new Error('Failed to perform action');
    }
}
```

**Utility/Helper Functions:**

```typescript
// app/lib/[service]-helpers.ts

/**
 * Pure utility functions for common operations
 */
export function formatForService(data: unknown): ServiceFormat {
    // Transform data to service-specific format
}

export function validateServiceResponse(response: unknown): boolean {
    // Validate response structure
}
```

### Step 4: Add Testing Infrastructure

**Unit Tests:**

```typescript
// app/models/[service].server.test.ts
import { describe, test, expect, vi } from 'vitest';
import { doSomethingUseful } from './[service].server';

describe('[service] model', () => {
    test('doSomethingUseful() returns success', async () => {
        const result = await doSomethingUseful({
            param1: 'test',
            param2: 123,
        });

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
    });

    test('doSomethingUseful() handles errors', async () => {
        await expect(
            doSomethingUseful({
                param1: '',
                param2: -1,
            }),
        ).rejects.toThrow('Failed to perform action');
    });
});
```

**Integration Tests:**

```typescript
// app/lib/[service].server.test.ts
import { describe, test, expect } from 'vitest';
import { serviceClient } from './[service].server';

describe('[service] SDK integration', () => {
    test('serviceClient is initialized', () => {
        expect(serviceClient).toBeDefined();
    });

    test('serviceClient can connect', async () => {
        const result = await serviceClient.healthCheck();
        expect(result.status).toBe('ok');
    });
});
```

### Step 5: Document the Infrastructure

**1. Architecture Decision Record (ADR)**

```markdown
docs/decisions/[number]-[service].md

# [Number]: [Service] Integration

## Status

Accepted

## Context

[Why we needed this service]

## Decision

[Which service we chose and why]

## Consequences

[Benefits and trade-offs]

## Implementation Details

[How to use the infrastructure]

## References

[Links to docs]
```

**2. Usage Guide**

```markdown
docs/[service].md

# [Service] Guide

## Setup

[Environment variables, configuration]

## Usage

[Code examples for common scenarios]

## API Reference

[Function signatures and parameters]

## Troubleshooting

[Common issues and solutions]
```

**3. AI Agent Instructions**

```markdown
.github/instructions/[service].instructions.md

# [Service] Instructions

## Overview

[What this provides]

## Usage Pattern

[How vertical slices should use this]

## Examples

[Code samples for AI to follow]

## Integration Points

[Where this connects to other patterns]
```

### Step 6: Create Examples (Optional but Recommended)

**Test Route:**

```typescript
// app/routes/admin/test-[service].tsx
// ⚠️ Only accessible in development, protected by ADMIN role

import { data } from 'react-router';
import type { Route } from './+types/test-[service]';
import { doSomethingUseful } from '~/models/[service].server';
import { Container } from '~/components/Container';

export async function action({ request }: Route.ActionArgs) {
    // For testing infrastructure manually
    try {
        const result = await doSomethingUseful({
            param1: 'test',
            param2: 123
        });
        return data({ success: true, result });
    } catch (error) {
        return data({ error: error.message }, { status: 500 });
    }
}

export default function TestService({ actionData }: Route.ComponentProps) {
    return (
        <Container>
            <h1>Test [Service] Integration</h1>
            <Form method="post">
                <Button type="submit">Test Service</Button>
            </Form>
            {actionData?.success && <Alert status="success">Success!</Alert>}
            {actionData?.error && <Alert status="error">{actionData.error}</Alert>}
        </Container>
    );
}
```

### Step 7: Plan Vertical Slice Integration

**Document how vertical slices will use this:**

```markdown
## Consuming This Horizontal Slice

### In API Routes

\`\`\`typescript
// app/routes/api/feature.ts
import { doSomethingUseful } from '~/models/[service].server';

export async function action({ request }: Route.ActionArgs) {
const user = await requireUser(request);

    // Call horizontal slice infrastructure
    const result = await doSomethingUseful({
        param1: user.id,
        param2: 42
    });

    return data({ success: true, result });

}
\`\`\`

### In Loaders

\`\`\`typescript
// app/routes/feature.tsx
export async function loader({ request }: Route.LoaderArgs) {
const user = await requireUser(request);

    // Call horizontal slice infrastructure
    const data = await getSomethingUseful(user.id);

    return data({ data });

}
\`\`\`

### In Background Jobs (if applicable)

\`\`\`typescript
// app/jobs/scheduled-task.ts
import { doSomethingUseful } from '~/models/[service].server';

export async function runScheduledTask() {
await doSomethingUseful({ ... });
}
\`\`\`
```

## Common Horizontal Slice Patterns

### Pattern 1: External Service Integration

**Use case:** Integrating third-party APIs or SDKs

**Structure:**

```
app/
├── lib/
│   ├── [service].server.ts       # SDK client singleton
│   └── [service]-helpers.ts      # Utility functions
├── models/
│   └── [service].server.ts       # High-level business functions
└── types/
    └── [service].d.ts            # TypeScript types
```

**Examples:**

- Email (Resend)
- Payment processing (Polar, Stripe)
- Cloud storage (S3, Cloudinary)
- Analytics (PostHog)
- Search (Algolia, Elasticsearch)

### Pattern 2: Shared Utility Layer

**Use case:** Common utilities used across features

**Structure:**

```
app/
├── lib/
│   ├── [utility].ts              # Core utility functions
│   └── [utility].test.ts         # Unit tests
└── types/
    └── [utility].d.ts            # TypeScript types
```

**Examples:**

- Date formatting
- String manipulation
- Validation helpers
- Data transformations
- File processing

### Pattern 3: Middleware/Infrastructure

**Use case:** Request processing or cross-cutting concerns

**Structure:**

```
app/
├── middleware/
│   ├── [concern].ts              # Middleware function
│   └── [concern].test.ts         # Unit tests
└── types/
    └── [concern].d.ts            # TypeScript types
```

**Examples:**

- Authentication middleware (already implemented)
- Logging middleware (already implemented)
- Rate limiting
- Request validation
- Response formatting

### Pattern 4: Database Abstraction

**Use case:** Complex database operations used by multiple features

**Structure:**

```
app/
├── models/
│   ├── [entity].server.ts        # CRUD operations
│   └── [entity].server.test.ts  # Unit tests
└── prisma/
    └── schema.prisma             # Model definition
```

**Examples:**

- User management (already implemented)
- Session handling
- Audit logging
- Query builders
- Transaction helpers

## Horizontal Slice Checklist

### ✅ Planning

- [ ] Multiple features will use this infrastructure
- [ ] Not deliverable as standalone vertical slice
- [ ] Clear integration points defined
- [ ] Documented how vertical slices will consume it

### ✅ Implementation

- [ ] SDK/service client in `app/lib/[service].server.ts`
- [ ] Model layer functions in `app/models/[service].server.ts`
- [ ] Utilities/helpers in `app/lib/[service]-helpers.ts` (if needed)
- [ ] TypeScript types defined
- [ ] Environment variables documented
- [ ] Error handling implemented
- [ ] Follows singleton pattern (for stateful services)

### ✅ Testing

- [ ] Unit tests for model functions
- [ ] Unit tests for utilities
- [ ] Integration tests for SDK client (if applicable)
- [ ] Manual testing route created (optional)
- [ ] All tests pass

### ✅ Documentation

- [ ] ADR created in `docs/decisions/[number]-[service].md`
- [ ] Usage guide in `docs/[service].md`
- [ ] AI instructions in `.github/instructions/[service].instructions.md`
- [ ] README updated with new service
- [ ] Environment variables added to `.env.example`
- [ ] Integration examples provided

### ✅ Quality

- [ ] No TypeScript errors
- [ ] Follows established patterns
- [ ] Code is well-commented
- [ ] Public API is minimal and clear
- [ ] Error messages are helpful
- [ ] Performance is acceptable
- [ ] Security considerations addressed

### ✅ Future Planning

- [ ] Documented which vertical slices will use this
- [ ] Integration points clearly defined
- [ ] Migration path documented (if replacing existing service)
- [ ] Deprecation plan (if temporary)

## Common Horizontal Slice Pitfalls

### ❌ Building Too Much Too Soon

**Problem:** Implementing every possible function "because we might need it."

**Why it's bad:** YAGNI (You Aren't Gonna Need It). Unused code is technical debt.

**Solution:** Implement only what's needed for first vertical slice. Add more when needed.

---

### ❌ No Clear Consumption Path

**Problem:** Built infrastructure but no plan for how features will use it.

**Why it's bad:** Code sits unused; unclear how to integrate with vertical slices.

**Solution:** Document integration examples and plan first consuming vertical slice.

---

### ❌ Leaky Abstractions

**Problem:** Exposing SDK/service implementation details to vertical slices.

**Why it's bad:** Vertical slices become coupled to infrastructure; hard to change later.

**Solution:** Model layer should abstract SDK details behind business functions.

```typescript
// ❌ Bad: Exposing SDK directly
export { resend } from '~/lib/resend.server';

// ✅ Good: Abstract behind business function
export async function sendWelcomeEmail({ to, userName }: { ... }) {
    const html = await render(WelcomeEmail({ userName }));
    return resend.emails.send({ from, to, subject, html });
}
```

---

### ❌ Skipping Documentation

**Problem:** "The code is self-documenting."

**Why it's bad:** Future developers (and AI agents) won't know how to use it.

**Solution:** Always create ADR, usage guide, and AI instructions.

---

### ❌ No Testing

**Problem:** "I'll test it when I integrate it with a feature."

**Why it's bad:** Bugs discovered late; hard to debug integration vs infrastructure issues.

**Solution:** Test infrastructure in isolation first.

---

### ❌ Over-Engineering

**Problem:** Building generic, configurable, extensible framework.

**Why it's bad:** Complexity without benefit; harder to understand and maintain.

**Solution:** Build for current needs. Refactor when patterns emerge.

---

### ❌ Never Completing with Vertical Slices

**Problem:** Infrastructure built but never connected to user features.

**Why it's bad:** Wasted effort; no user value delivered.

**Solution:** Immediately follow horizontal slice with vertical slice that uses it.

## Horizontal to Vertical Workflow

The recommended workflow for infrastructure-heavy features:

### Phase 1: Horizontal Slice (1-2 days)

**Goal:** Establish infrastructure foundation

1. Research service/SDK
2. Implement SDK client
3. Create model layer functions
4. Write unit tests
5. Document usage patterns
6. **Stop here** ⚠️

**Deliverable:** Infrastructure ready but not connected to features

### Phase 2: First Vertical Slice (1-3 days)

**Goal:** Prove infrastructure with real feature

1. Choose simplest feature that needs infrastructure
2. Implement validation schema
3. Create API endpoint (calls horizontal slice)
4. Build UI route
5. Test end-to-end
6. **Deliverable:** Working feature users can use

**Example:** User registration with welcome email

### Phase 3: Additional Vertical Slices (1-3 days each)

**Goal:** Expand usage of infrastructure

1. Implement second feature using infrastructure
2. Refine infrastructure based on learnings
3. Repeat for additional features

**Examples:**

- Password reset with email
- Email verification
- Contact form

### Phase 4: Iteration (Ongoing)

**Goal:** Improve infrastructure based on usage

1. Identify patterns across vertical slices
2. Extract common functionality to horizontal slice
3. Refactor vertical slices to use improved infrastructure

## Real-World Examples from This Codebase

### Example 1: Authentication (BetterAuth)

**Horizontal Slice:**

```
app/lib/auth.server.ts         # BetterAuth client
app/lib/auth-client.ts         # Client-side auth
app/lib/session.server.ts      # Session helpers
app/middleware/auth.ts         # Auth middleware
```

**Vertical Slices Using It:**

- Sign in page (`routes/sign-in.tsx`)
- Sign up flow (would be implemented)
- Password reset (would be implemented)
- Protected routes (`routes/authenticated.tsx` layout)

**Why horizontal first:**

- Multiple features need authentication
- Complex integration (sessions, cookies, security)
- Middleware pattern benefits all protected routes

---

### Example 2: Database (Prisma)

**Horizontal Slice:**

```
prisma/schema.prisma           # Schema definition
app/db.server.ts               # Prisma client singleton
app/generated/prisma/          # Generated client
```

**Vertical Slices Using It:**

- User profile management
- Post CRUD
- Comments
- Any feature touching database

**Why horizontal first:**

- Every feature needs database access
- Schema evolution affects all features
- Singleton pattern prevents connection leaks

---

### Example 3: Caching (FlatCache)

**Horizontal Slice:**

```
app/lib/cache.ts               # Cache client + utilities
```

**Vertical Slices Using It:**

- User profile caching
- API response caching
- External API result caching
- Client-side route caching

**Why horizontal first:**

- Multiple features benefit from caching
- Single cache instance needed
- TTL and key patterns established once

---

### Example 4: Analytics (PostHog)

**Horizontal Slice:**

```
app/lib/posthog.server.ts      # PostHog server client
app/lib/posthog.ts             # PostHog client wrapper
app/components/PostHogProvider.tsx  # Provider component
```

**Vertical Slices Using It:**

- Feature flag checks in UI
- Event tracking in user flows
- A/B test implementations
- User behavior analytics

**Why horizontal first:**

- Every feature should track events
- Feature flags need consistent access
- Provider wraps entire app

---

### Example 5: Email (Resend) - The Canonical Example

**Horizontal Slice:**

```
app/lib/resend.server.ts       # Resend SDK client
app/models/email.server.ts     # Email functions
app/emails/                    # React Email templates
```

**Vertical Slices Using It:**

- User registration (calls `sendWelcomeEmail()`)
- Email verification (calls `sendVerificationEmail()`)
- Password reset (calls `sendPasswordResetEmail()`)
- Future: Contact form, notifications

**Why horizontal first:**

- Multiple authentication flows need email
- Template system benefits all emails
- BetterAuth integration established once

## When to Combine Horizontal + Vertical

Sometimes you can implement both in one PR for smaller services:

### Combined Approach (Small Service)

**Example:** Simple utility library

```typescript
// Horizontal: Utility functions
export function formatCurrency(amount: number): string { ... }
export function parseCurrency(value: string): number { ... }

// Vertical: Billing feature using utilities
export default function BillingPage() {
    const amount = parseCurrency(formData.amount);
    return <div>{formatCurrency(amount)}</div>;
}
```

**When to combine:**

- Service is simple (few functions)
- Only one feature initially needs it
- Low complexity/risk
- Quick to implement (<4 hours total)

### Separated Approach (Complex Service)

**Example:** Payment gateway integration

**PR 1 (Horizontal):** Stripe SDK, webhook handling, model functions
**PR 2 (Vertical):** Checkout flow using Stripe infrastructure
**PR 3 (Vertical):** Subscription management using Stripe infrastructure

**When to separate:**

- Service is complex (many functions, error cases)
- Multiple features will use it
- High risk/complexity
- Needs focused review
- Takes >4 hours to implement

## Summary

A horizontal slice is **infrastructure that enables vertical slices**. It:

1. ✅ Provides shared services multiple features will use
2. ✅ Operates at infrastructure layer (lib, models, middleware)
3. ✅ Is fully tested and documented
4. ✅ Does NOT deliver complete user features alone
5. ✅ MUST be followed by vertical slices that consume it

**Golden Rule:** A horizontal slice without vertical slices using it is wasted effort. Always plan the consuming features.

**Recommended Workflow:**

1. Implement horizontal slice (infrastructure)
2. Immediately implement first vertical slice (feature using infrastructure)
3. Validate integration works
4. Implement additional vertical slices as needed

## Related Patterns

- **Vertical Slice Pattern** - See `.github/instructions/vertical-slice.instructions.md`
- **CRUD Pattern** - See `.github/instructions/crud-pattern.instructions.md`
- **Model Layer Pattern** - See `AGENTS.md` "Model Layer Pattern"
- **Singleton Pattern** - See `AGENTS.md` "Singleton Pattern Usage"

## Additional Resources

- **Email Integration (Canonical Example)**: `docs/decisions/010-resend-email.md`
- **Email Usage Guide**: `docs/email.md`
- **Architecture Decision Records**: `docs/decisions/README.md`
- **Contributing Guide**: `docs/contributing.md`
