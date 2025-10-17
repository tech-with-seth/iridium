# Zod Validation Instructions

## Overview

Zod is used throughout this project for runtime type validation and type inference. All validation schemas are centralized in `app/lib/validations.ts`.

## Import Pattern

```typescript
import { z } from 'zod';
import type { z as zType } from 'zod';

// For type inference
import { signInSchema, signUpSchema } from '~/lib/validations';
type SignInData = z.infer<typeof signInSchema>;
```

## Core Usage Patterns

### 1. Defining Schemas

Create schemas in `app/lib/validations.ts` following existing patterns:

```typescript
export const userSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    xp: z.number().int().positive()
});
```

### 2. Parsing Data (Server-Side)

**In loaders and actions**, use `.parse()` to validate and throw on error:

```typescript
export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Throws ZodError if validation fails
    const validatedData = userSchema.parse(data);

    // Use validated data with full type safety
    await prisma.user.create({ data: validatedData });

    return data({ success: true });
}
```

**For non-throwing validation**, use `.safeParse()`:

```typescript
export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = userSchema.safeParse(data);

    if (!result.success) {
        return data(
            {
                errors: result.error.issues
            },
            { status: 400 }
        );
    }

    // result.data is fully typed
    await prisma.user.create({ data: result.data });

    return data({ success: true });
}
```

### 3. Async Validation

For schemas with async refinements or transforms, use async methods:

```typescript
const asyncSchema = z.string().refine(
    async (val) => {
        const exists = await checkDatabaseForValue(val);
        return !exists;
    },
    { message: 'Value already exists' }
);

// In loader/action
const result = await asyncSchema.safeParseAsync(input);
```

### 4. Type Inference

Extract TypeScript types from schemas:

```typescript
// Basic type inference
type User = z.infer<typeof userSchema>;

// Input vs Output types (for transforms)
const transformSchema = z.string().transform((val) => val.length);

type Input = z.input<typeof transformSchema>; // string
type Output = z.output<typeof transformSchema>; // number
```

### 5. Error Handling

**Access detailed error information:**

```typescript
try {
    schema.parse(data);
} catch (error) {
    if (error instanceof z.ZodError) {
        error.issues; // Array of validation issues
        /* [
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['username'],
        message: 'Expected string, received number'
      }
    ] */
    }
}
```

**Format errors for form responses:**

```typescript
if (!result.success) {
    const fieldErrors = result.error.issues.reduce(
        (acc, issue) => {
            const path = issue.path.join('.');
            acc[path] = issue.message;
            return acc;
        },
        {} as Record<string, string>
    );

    return data({ errors: fieldErrors }, { status: 400 });
}
```

## Common Schema Patterns

### Form Validation

```typescript
export const contactFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters')
});
```

### Optional Fields with Defaults

```typescript
export const createPostSchema = z.object({
    title: z.string().min(1),
    content: z.string(),
    published: z.boolean().default(false),
    tags: z.array(z.string()).optional().default([])
});
```

### Refinements (Custom Validation)

```typescript
export const passwordSchema = z
    .object({
        password: z.string().min(8),
        confirmPassword: z.string()
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'] // Error path
    });
```

### Transforms

```typescript
export const numericStringSchema = z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) throw new Error('Invalid number');
    return num;
});

// Input: "42" -> Output: 42
```

### Discriminated Unions

```typescript
export const apiResponseSchema = z.discriminatedUnion('status', [
    z.object({ status: z.literal('success'), data: z.any() }),
    z.object({ status: z.literal('error'), message: z.string() })
]);
```

## Best Practices

1. **Centralize schemas** - Always add new schemas to `app/lib/validations.ts`
2. **Export types** - Export inferred types alongside schemas for reuse
3. **Descriptive messages** - Provide clear error messages for better UX
4. **Use safeParse** - Prefer `.safeParse()` in actions to return errors to forms
5. **Async only when needed** - Avoid async validation unless absolutely necessary
6. **Coercion sparingly** - Use `.coerce()` only for form data (e.g., `z.coerce.number()`)

## Integration with React Router 7

### Action with Validation

```typescript
export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = mySchema.safeParse(data);

    if (!result.success) {
        return data({ errors: result.error.flatten() }, { status: 400 });
    }

    // Process validated data
    await doSomething(result.data);

    return redirect('/success');
}
```

### Client-Side Usage

```typescript
export default function MyForm({ actionData }: Route.ComponentProps) {
  const errors = actionData?.errors;

  return (
    <form method="post">
      <TextInput
        name="username"
        error={errors?.username?.[0]}
      />
      {/* ... */}
    </form>
  );
}
```

## Pre-Built Schemas

The project includes these schemas in `app/lib/validations.ts`:

- `signInSchema` - Email/password sign-in
- `signUpSchema` - User registration with email/username/password
- `chatMessageSchema` - Chat message validation

Reference these for consistent validation patterns across the app.

## Additional Resources

- [Zod Documentation](https://zod.dev)
- [Zod API Reference](https://zod.dev/api)
- Project validations: `app/lib/validations.ts`
