# 006: Zod Validation

## Status

Accepted

## Context

We needed a validation solution that:

- Provides runtime validation
- Generates TypeScript types
- Works on client and server
- Integrates with form libraries
- Offers good error messages
- Supports complex schemas
- Has minimal bundle size
- Provides good developer experience

Form validation is critical for data integrity and user experience. We need validation that works seamlessly across our stack.

## Decision

We chose Zod as our schema validation library.

Zod is a TypeScript-first schema validation library that provides runtime validation with automatic type inference.

### Key Features

**Type Inference**:

```typescript
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

type FormData = z.infer<typeof schema>;
// { email: string; age: number; }
```

**Runtime Validation**:

```typescript
const result = schema.safeParse(data);

if (!result.success) {
  console.log(result.error.issues);
} else {
  console.log(result.data); // Fully typed
}
```

**Composable Schemas**:

```typescript
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
});

const userSchema = z.object({
  name: z.string(),
  address: addressSchema,
});
```

## Consequences

### Positive

- **Type Safety**: Single source of truth for types and validation
- **Runtime Validation**: Catch errors at runtime
- **Great DX**: Intuitive API with excellent autocomplete
- **Error Messages**: Clear, customizable error messages
- **Composability**: Build complex schemas from simple ones
- **Small Bundle**: Tree-shakeable, minimal size
- **Framework Agnostic**: Works anywhere JavaScript runs
- **Transform Support**: Parse and transform data
- **Async Validation**: Support for async rules

### Negative

- **Learning Curve**: Need to learn Zod API
- **Bundle Size**: Adds to client bundle (though small)
- **Error Handling**: Need to handle errors explicitly
- **Performance**: Validation has runtime cost

### Neutral

- **Schema Definition**: Requires upfront schema design
- **Migration**: Existing validation needs migration
- **Documentation**: Schemas document themselves

## Alternatives Considered

### Yup

**Pros:**

- Mature and stable
- Large community
- Similar API to Zod
- Good documentation

**Cons:**

- Not TypeScript-first
- Less type safety
- Larger bundle size
- Slower validation

**Why not chosen:** Zod offers better TypeScript integration and smaller bundle.

### Joi

**Pros:**

- Very mature
- Extensive features
- Battle-tested
- Rich ecosystem

**Cons:**

- Server-side only
- Large bundle size
- Complex API
- Not TypeScript-first

**Why not chosen:** Too large for client-side. Zod works on both client and server.

### AJV (JSON Schema)

**Pros:**

- Extremely fast
- JSON Schema standard
- Small bundle
- Wide adoption

**Cons:**

- JSON Schema syntax
- Less intuitive API
- Separate type definitions
- More boilerplate

**Why not chosen:** Less developer-friendly than Zod. Requires separate TypeScript types.

### Class Validator

**Pros:**

- Decorator-based
- Works with classes
- Good for DTOs
- TypeScript support

**Cons:**

- Requires classes
- Decorator syntax
- Experimental decorators
- More verbose

**Why not chosen:** Decorator syntax less modern. Zod is more flexible.

### Superstruct

**Pros:**

- Small bundle
- Simple API
- Good TypeScript support
- Composable

**Cons:**

- Smaller community
- Less features
- Limited documentation
- Less active

**Why not chosen:** Zod has better ecosystem and more features.

### io-ts

**Pros:**

- Functional programming focused
- Type safety
- Runtime types
- Small bundle

**Cons:**

- Complex API
- Steep learning curve
- Less intuitive
- Functional programming required

**Why not chosen:** Too complex for team. Zod is more approachable.

## Implementation Details

### Basic Validation

```typescript
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

// Validate
const result = loginSchema.safeParse(formData);

if (!result.success) {
  // Handle errors
  const errors = result.error.flatten().fieldErrors;
  // { email?: string[]; password?: string[]; }
} else {
  // Use validated data
  const data = result.data;
  // { email: string; password: string; }
}
```

### Form Integration

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({
  resolver: zodResolver(loginSchema),
});
```

### Server-Side Validation

```typescript
import { Route } from "./+types/login";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  // Process validated data
  await login(result.data);
  return redirect("/dashboard");
}
```

### Complex Schemas

```typescript
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().min(18).max(120),
  role: z.enum(["admin", "user", "guest"]),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string().regex(/^\d{5}$/),
  }),
  tags: z.array(z.string()).min(1),
  metadata: z.record(z.string()),
  createdAt: z.date(),
});
```

### Custom Validation

```typescript
const passwordSchema = z.string()
  .min(8)
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain uppercase letter",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Password must contain number",
  });

const signupSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
```

### Async Validation

```typescript
const usernameSchema = z.string().refine(
  async (username) => {
    const available = await checkUsernameAvailability(username);
    return available;
  },
  { message: "Username already taken" }
);
```

### Transformations

```typescript
const schema = z.object({
  email: z.string().email().toLowerCase(),
  age: z.string().transform((val) => parseInt(val)),
  tags: z.string().transform((val) => val.split(",")),
});
```

## Validation Patterns

### Client and Server Validation

```typescript
// shared-schema.ts
export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

// Client-side
const form = useForm({
  resolver: zodResolver(contactSchema),
});

// Server-side
export async function action({ request }: Route.ActionArgs) {
  const data = await request.formData();
  const result = contactSchema.safeParse(Object.fromEntries(data));
  // ...
}
```

### Partial Schemas

```typescript
const updateSchema = userSchema.partial(); // All fields optional
const pickSchema = userSchema.pick({ name: true, email: true });
const omitSchema = userSchema.omit({ password: true });
```

### Union Types

```typescript
const paymentSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("card"),
    cardNumber: z.string(),
    cvv: z.string(),
  }),
  z.object({
    method: z.literal("paypal"),
    email: z.string().email(),
  }),
]);
```

## Error Handling

```typescript
const result = schema.safeParse(data);

if (!result.success) {
  // Formatted errors
  const formatted = result.error.format();

  // Flat errors
  const flat = result.error.flatten();

  // Individual issues
  result.error.issues.forEach((issue) => {
    console.log(issue.path, issue.message);
  });
}
```

## Performance Considerations

- Validation has runtime cost
- Use `.safeParse()` to avoid throwing
- Share schemas between client and server
- Consider lazy validation for large forms
- Cache parsed schemas when possible

## References

- [Zod Documentation](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
- [Forms Guide](../forms.md)
- [React Hook Form Integration](https://react-hook-form.com/get-started#SchemaValidation)
