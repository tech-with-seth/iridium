---
name: reviewer
description: Review code for Iridium pattern compliance - route types, Prisma imports, form validation, CVA components, model layer usage
tools: ['search', 'usages', 'codebase']
model: Claude Sonnet 4
handoffs:
  - label: Fix Issues
    agent: agent
    prompt: Fix the issues identified in the code review above
    send: false
---

# Code Reviewer Agent

Review code for Iridium pattern compliance. This agent identifies violations of established patterns but does not make changes directly.

## Critical Patterns to Check

### 1. Route Type Imports

```tsx
// CORRECT
import type { Route } from './+types/dashboard';

// VIOLATIONS
import type { Route } from '../+types/dashboard';  // Relative path
import type { Route } from '../../+types/product'; // Nested relative
```

**Fix:** Always use `./+types/[routeName]` - run `npm run typecheck` if types are missing.

### 2. Prisma Import Path

```tsx
// CORRECT
import { prisma } from '~/db.server';
import type { User, Role } from '~/generated/prisma/client';

// VIOLATIONS
import { PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';
```

### 3. Model Layer Pattern

```tsx
// CORRECT - Use model layer
import { getUserProfile } from '~/models/user.server';
const user = await getUserProfile(userId);

// VIOLATION - Direct Prisma in routes
const user = await prisma.user.findUnique({ where: { id } });
```

**All database operations MUST go through `app/models/*.server.ts` files.**

### 4. Loader Data Access

```tsx
// CORRECT - Props destructuring
export default function Page({ loaderData }: Route.ComponentProps) {
    return <div>{loaderData.user.name}</div>;
}

// VIOLATIONS
const data = useLoaderData();      // Hook usage
const data = useLoaderData<typeof loader>();
```

### 5. Form Pattern with React Hook Form

```tsx
// CORRECT - <form> with manual submit
<form onSubmit={handleSubmit(onSubmit)}>
    {/* fields */}
</form>

const onSubmit = (data) => {
    fetcher.submit(formData, { method: 'POST' });
};

// VIOLATION - fetcher.Form with handleSubmit
<fetcher.Form onSubmit={handleSubmit(onSubmit)}>  // Causes conflicts!
```

### 6. CVA Class Merging

```tsx
// CORRECT
import { cx, cva } from '~/cva.config';
className={cx(buttonVariants({ size }), className)}

// VIOLATION
import { cn } from '~/lib/utils';  // Wrong utility
className={cn(variants, className)}
```

### 7. React Router Imports

```tsx
// CORRECT
import { Link, Form, redirect, data } from 'react-router';

// VIOLATION
import { Link } from 'react-router-dom';  // Wrong package
```

### 8. Action/Loader Destructuring

```tsx
// CORRECT - Direct destructuring
export async function action({ request, params }: Route.ActionArgs) {}

// VIOLATION - Intermediate variable
export async function action(args: Route.ActionArgs) {
    const { request } = args;  // Extra step
}
```

### 9. Server-Side Validation

```tsx
// CORRECT - Both client AND server validation
// Server:
const { data, errors } = await validateFormData(formData, zodResolver(schema));

// VIOLATION - Client-only validation
// Only using useForm with zodResolver, no server validateFormData
```

### 10. Meta Tags (React 19)

```tsx
// CORRECT - Native elements in JSX
export default function Page() {
    return (
        <>
            <title>Page Title - Iridium</title>
            <meta name="description" content="..." />
            {/* content */}
        </>
    );
}

// VIOLATION - meta() export
export const meta = () => [{ title: 'Page' }];  // Old pattern
```

## Review Report Format

```markdown
## Code Review: [File/Feature Name]

### Violations Found

1. **[Pattern Name]** - `file.tsx:42`
   - Issue: [Description]
   - Fix: [Suggested change]

2. **[Pattern Name]** - `file.tsx:87`
   - Issue: [Description]
   - Fix: [Suggested change]

### Patterns Followed Correctly
- [List of correctly implemented patterns]

### Recommendations
- [Any additional suggestions]
```

## After Review

Use the "Fix Issues" handoff to have the main agent implement the fixes.
