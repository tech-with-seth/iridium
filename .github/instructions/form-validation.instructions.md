---
applyTo: 'app/lib/validations.ts,app/lib/form*.ts,app/lib/form*.server.ts'
---

# Form Validation Instructions

## Overview

**This is the standard pattern for ALL forms in this application.** Every form should use this hybrid client + server validation approach with Zod schemas, React Hook Form, and our custom utilities.

### Why This Pattern?

- ✅ **Single source of truth** - One Zod schema validates everywhere
- ✅ **Instant feedback** - Client-side validation provides immediate UX
- ✅ **Security** - Server-side validation prevents malicious submissions
- ✅ **Type-safe** - Full TypeScript inference from schema to UI
- ✅ **Progressive enhancement** - Works without JavaScript
- ✅ **DRY** - No duplicate validation logic
- ✅ **Automatic error syncing** - Server errors populate form fields instantly

## Architecture

### Core Components

1. **Zod Schemas** (`app/lib/validations.ts`) - Define validation rules once
2. **Server Utilities** (`app/lib/form-validation.server.ts`) - Parse and validate FormData on server
3. **Client Hook** (`app/lib/form-hooks.ts`) - Sync server errors with React Hook Form
4. **Consistent Error Handling** - Field-level + form-level errors

### Validation Flow

```
User types in form
    ↓
Client validates instantly (React Hook Form + Zod) → Immediate feedback
    ↓
User submits form
    ↓
Form submits to server via useFetcher()
    ↓
Server validates with same Zod schema → Security guarantee
    ↓
If errors: Return to client, automatically populate fields
    ↓
If valid: Execute business logic, redirect/return success
```

## Critical: `<form>` vs `<fetcher.Form>`

**When using React Hook Form with manual `fetcher.submit()`, ALWAYS use `<form>`, NOT `<fetcher.Form>`.**

### Why This Matters

Using `<fetcher.Form>` with `onSubmit={handleSubmit(onSubmit)}` creates a submission conflict:

- `<fetcher.Form>` tries to submit naturally via its built-in behavior
- `handleSubmit(onSubmit)` prevents default and manually calls `fetcher.submit()`
- This conflict can cause redirects to fail and unpredictable form behavior

### The Rules

✅ **Use `<form>` when:**

- Using React Hook Form's `handleSubmit`
- Manually calling `fetcher.submit()` in your submit handler
- Programmatically controlling submission
- **This is the standard pattern for this application**

❌ **Use `<fetcher.Form>` when:**

- Letting the form submit naturally without React Hook Form
- Progressive enhancement without client-side validation
- **This is rare in this application** since we use hybrid validation everywhere

### Standard Pattern (Use This)

```typescript
const { register, handleSubmit } = useValidatedForm({ /* ... */ });

const onSubmit = (data: FormData) => {
  const formData = new FormData();
  formData.append('field', data.field);
  fetcher.submit(formData, { method: 'POST' });
};

// ✅ CORRECT - Use <form> with manual submission
<form onSubmit={handleSubmit(onSubmit)}>
  <TextInput {...register('field')} />
  <Button type="submit">Submit</Button>
</form>
```

### Progressive Enhancement Only (Rare)

```typescript
// ❌ Only use <fetcher.Form> when NOT using React Hook Form
// This is for progressive enhancement without client validation
<fetcher.Form method="post" action="/api/endpoint">
  <input name="field" />
  <button type="submit">Submit</button>
</fetcher.Form>
```

## Standard Implementation

### Step 1: Define Zod Schema

**All validation schemas must live in `app/lib/validations.ts`:**

```typescript
import { z } from 'zod';

// Example: Contact form
export const contactFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Example: Profile update
export const profileUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

// Example: Create post
export const createPostSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(100, 'Title must be 100 characters or less'),
    content: z.string().min(1, 'Content is required'),
    published: z.boolean().default(false),
    tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed').optional(),
});

export type CreatePostData = z.infer<typeof createPostSchema>;
```

### Step 2: Create Server Action

**In your route file (e.g., `app/routes/contact.tsx`):**

```typescript
import { data, redirect } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Route } from './+types/contact';
import { getValidatedFormData } from '~/lib/form-validation.server';
import { contactFormSchema, type ContactFormData } from '~/lib/validations';
import { sendContactEmail } from '~/lib/email.server';

export async function action({ request }: Route.ActionArgs) {
    // Validate with Zod schema
    const { data: validatedData, errors } =
        await getValidatedFormData<ContactFormData>(
            request,
            zodResolver(contactFormSchema),
        );

    // Return validation errors to client
    if (errors) {
        return data({ errors }, { status: 400 });
    }

    try {
        // Execute business logic with validated data
        await sendContactEmail(validatedData!);

        return redirect('/contact/success');
    } catch (error) {
        // Return form-level error
        return data(
            { error: 'Failed to send message. Please try again.' },
            { status: 500 },
        );
    }
}
```

### Step 3: Create Client Form Component

**In the same route file:**

```typescript
import { useFetcher } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useValidatedForm } from '~/lib/form-hooks';
import { contactFormSchema, type ContactFormData } from '~/lib/validations';
import { TextInput } from '~/components/TextInput';
import { Textarea } from '~/components/Textarea';
import { Button } from '~/components/Button';
import { Alert } from '~/components/Alert';
import { Card } from '~/components/Card';

export default function ContactPage() {
  const fetcher = useFetcher();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useValidatedForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    errors: fetcher.data?.errors  // Server errors sync automatically
  });

  const onSubmit = (data: ContactFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('subject', data.subject);
    formData.append('message', data.message);

    fetcher.submit(formData, { method: 'POST' });
  };

  const isLoading = fetcher.state === 'submitting' || fetcher.state === 'loading';

  return (
    <>
      <title>Contact Us - Iridium</title>
      <meta name="description" content="Get in touch with our team" />

      <Card>
        <h1 className="text-2xl font-bold mb-4">Contact Us</h1>

        {/* Form-level error (from server) */}
        {fetcher.data?.error && (
          <Alert status="error" className="mb-4">
            {fetcher.data.error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextInput
            {...register('name')}
            label="Name"
            error={errors.name?.message}
            required
          />

          <TextInput
            {...register('email')}
            label="Email"
            type="email"
            error={errors.email?.message}
            required
          />

          <TextInput
            {...register('subject')}
            label="Subject"
            error={errors.subject?.message}
            required
          />

          <Textarea
            {...register('message')}
            label="Message"
            rows={5}
            error={errors.message?.message}
            required
          />

          <Button type="submit" loading={isLoading}>
            Send Message
          </Button>
        </form>
      </Card>
    </>
  );
}
```

## Authentication Pattern

**Note: Authentication is a special case in this application.**

Authentication uses **client-side `authClient`** from Better Auth, not server-side form validation patterns. This allows Better Auth to automatically manage session cookies.

For complete authentication patterns including sign-in, sign-up, and session management, see:

- **`.github/instructions/better-auth.instructions.md`** - Complete Better Auth integration guide
- **Reference implementation:** `app/routes/sign-in.tsx`

**Key differences from standard CRUD:**

- Uses `authClient.signIn.email()` / `authClient.signUp.email()` directly on client
- Better Auth handles cookies automatically via `/api/auth/*` endpoints
- Uses `useNavigate()` for redirects after success (not server redirects)
- Client-side validation with React Hook Form + Zod still applies

## API Reference

### `validateFormData<T>(formData, resolver)`

**This is the ONE function you need for server-side validation in React Router 7.**

Validates FormData using a React Hook Form resolver (typically zodResolver).

**Location:** `app/lib/form-validation.server.ts`

**Parameters:**

- `formData: FormData` - FormData from `request.formData()`
- `resolver: Resolver<T>` - React Hook Form resolver (use `zodResolver(schema)`)

**Returns:**

```typescript
{
  data?: T;                                           // Validated data (if validation passed)
  errors?: Record<string, { type: string; message: string }>; // Field errors (if validation failed)
  receivedValues: Record<string, any>;                // Raw form values received
}
```

**Standard Usage:**

```typescript
export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const { data, errors } = await validateFormData<ContactFormData>(
        formData,
        zodResolver(contactFormSchema),
    );

    if (errors) {
        return data({ errors }, { status: 400 });
    }

    // Use validated data safely
    await processForm(data!);
    return redirect('/success');
}
```

**With Intent-Based Routing** (for CRUD operations, not auth):

```typescript
export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get('intent') as string;

    if (intent === 'create') {
        const { data, errors } = await validateFormData<CreatePostData>(
            formData,
            zodResolver(createPostSchema),
        );
        // ... handle create
    }

    if (intent === 'update') {
        const { data, errors } = await validateFormData<UpdatePostData>(
            formData,
            zodResolver(updatePostSchema),
        );
        // ... handle update
    }
}
```

### `useValidatedForm<TFieldValues>(options)`

Client-side hook that wraps `useForm` from React Hook Form and automatically syncs server errors.

**Location:** `app/lib/form-hooks.ts`

**Parameters:**

```typescript
{
  resolver: Resolver;                                  // Zod resolver (required)
  errors?: Record<string, { type: string; message: string }>; // Server errors from fetcher.data
  defaultValues?: DefaultValues<TFieldValues>;         // Initial form values
  mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'all';  // Validation trigger mode
  // ...all other useForm options supported
}
```

**Returns:** `UseFormReturn<TFieldValues>` - Standard React Hook Form API

**Usage:**

```typescript
const fetcher = useFetcher();

const {
    register,
    handleSubmit,
    formState: { errors },
} = useValidatedForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    errors: fetcher.data?.errors, // Auto-syncs server errors
    defaultValues: {
        name: '',
        email: '',
    },
});
```

## Common Form Patterns

### Form with File Upload

**Schema:**

```typescript
export const uploadSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    file: z
        .custom<FileList>()
        .refine((files) => files?.length > 0, 'File is required')
        .refine(
            (files) => files?.[0]?.size < 5000000,
            'File must be less than 5MB',
        )
        .refine(
            (files) => ['image/jpeg', 'image/png'].includes(files?.[0]?.type),
            'Only JPEG and PNG files allowed',
        ),
});

export type UploadFormData = z.infer<typeof uploadSchema>;
```

**Client:**

```typescript
<TextInput {...register('title')} label="Title" error={errors.title?.message} />

<input
  type="file"
  {...register('file')}
  accept="image/jpeg,image/png"
/>
{errors.file?.message && <span className="text-error">{errors.file.message}</span>}
```

**Server:**

```typescript
const { data, errors } = await getValidatedFormData<UploadFormData>(
    request,
    zodResolver(uploadSchema),
);
if (!errors) {
    const file = (data!.file as FileList)[0];
    await uploadFile(file, data!.title);
}
```

### Form with Dynamic Fields

**Schema:**

```typescript
export const todoListSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    todos: z
        .array(
            z.object({
                text: z.string().min(1, 'Todo text is required'),
                completed: z.boolean().default(false),
            }),
        )
        .min(1, 'At least one todo is required'),
});

export type TodoListData = z.infer<typeof todoListSchema>;
```

**Client:**

```typescript
import { useFieldArray } from 'react-hook-form';

const { register, control, handleSubmit } = useValidatedForm<TodoListData>({
  resolver: zodResolver(todoListSchema),
  errors: fetcher.data?.errors,
});

const { fields, append, remove } = useFieldArray({
  control,
  name: 'todos'
});

// In JSX
{fields.map((field, index) => (
  <div key={field.id}>
    <TextInput
      {...register(`todos.${index}.text`)}
      label={`Todo ${index + 1}`}
    />
    <button type="button" onClick={() => remove(index)}>Remove</button>
  </div>
))}

<button type="button" onClick={() => append({ text: '', completed: false })}>
  Add Todo
</button>
```

### Form with Conditional Fields

**Schema:**

```typescript
export const shippingSchema = z
    .object({
        sameAsBilling: z.boolean(),
        shippingAddress: z.string().optional(),
        shippingCity: z.string().optional(),
        shippingZip: z.string().optional(),
    })
    .refine(
        (data) =>
            data.sameAsBilling ||
            (data.shippingAddress && data.shippingCity && data.shippingZip),
        {
            message: 'Shipping address is required when different from billing',
            path: ['shippingAddress'],
        },
    );
```

**Client:**

```typescript
const { register, watch } = useValidatedForm({
  resolver: zodResolver(shippingSchema),
});

const sameAsBilling = watch('sameAsBilling');

<input type="checkbox" {...register('sameAsBilling')} />

{!sameAsBilling && (
  <>
    <TextInput {...register('shippingAddress')} label="Address" />
    <TextInput {...register('shippingCity')} label="City" />
    <TextInput {...register('shippingZip')} label="Zip" />
  </>
)}
```

### Search Form (GET Request)

**Schema:**

```typescript
export const searchSchema = z.object({
    q: z.string().min(1, 'Search query is required'),
    category: z.enum(['all', 'posts', 'users', 'products']).default('all'),
    sortBy: z.enum(['relevance', 'date', 'popular']).default('relevance'),
});

export type SearchFormData = z.infer<typeof searchSchema>;
```

**Client (submits as GET):**

```typescript
const onSubmit = (data: SearchFormData) => {
    const params = new URLSearchParams();
    params.append('q', data.q);
    params.append('category', data.category);
    params.append('sortBy', data.sortBy);

    fetcher.submit(params, { method: 'GET' });
};
```

**Server (loader, not action):**

```typescript
export async function loader({ request }: Route.LoaderArgs) {
    const { data, errors } = await getValidatedFormData<SearchFormData>(
        request,
        zodResolver(searchSchema),
    );

    if (errors) {
        return { results: [], errors };
    }

    const results = await searchDatabase(data!);
    return { results };
}
```

## Error Handling Best Practices

### Two Types of Errors

**1. Field-level errors** - Validation errors for specific fields:

```typescript
<TextInput
  {...register('email')}
  error={errors.email?.message}  // Shows inline with field
/>
```

**2. Form-level errors** - Business logic or server errors:

```typescript
{fetcher.data?.error && (
  <Alert status="error" className="mb-4">
    {fetcher.data.error}
  </Alert>
)}
```

### Error Response Pattern

Always return errors in this format from your actions:

```typescript
// Validation errors (from Zod)
return data(
    { errors: { email: { type: 'validation', message: 'Invalid email' } } },
    { status: 400 },
);

// Business logic errors
return data({ error: 'User already exists' }, { status: 409 });

// Server errors
return data(
    { error: 'Something went wrong. Please try again.' },
    { status: 500 },
);
```

## Form State Management

### Loading States

```typescript
const isLoading = fetcher.state === 'submitting' || fetcher.state === 'loading';

<Button type="submit" loading={isLoading} disabled={isLoading}>
  {isLoading ? 'Submitting...' : 'Submit'}
</Button>
```

### Success States

```typescript
const isSuccess = fetcher.state === 'idle' && fetcher.data?.success;

{isSuccess && (
  <Alert status="success">Form submitted successfully!</Alert>
)}
```

### Reset Form After Success

```typescript
import { useEffect } from 'react';

const { reset } = useValidatedForm({
    /* ... */
});

useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
        reset(); // Clear form
    }
}, [fetcher.state, fetcher.data, reset]);
```

## Progressive Enhancement

**Note: This application uses React Hook Form with manual `fetcher.submit()`, so progressive enhancement is not a primary concern. However, the server always validates, ensuring security.**

If you need true progressive enhancement (form works without JavaScript):

1. Use `<fetcher.Form>` WITHOUT React Hook Form
2. Server always validates - never trust client
3. Use hidden inputs for data like `intent`
4. Server returns errors that can render server-side

### Example Without JS (Rare)

```typescript
// ❌ This pattern is NOT standard for this app
// Only use when progressive enhancement is explicitly required
<fetcher.Form method="post" action="/contact">
  <input name="email" type="email" required />
  <button type="submit">Submit</button>
</fetcher.Form>
```

**For standard forms in this app, use `<form>` + React Hook Form + `fetcher.submit()` as documented above.**

## TypeScript Best Practices

### Always Use Type Inference

```typescript
// ✅ GOOD - Single source of truth
export const schema = z.object({ email: z.string().email() });
export type FormData = z.infer<typeof schema>;

// ❌ BAD - Duplicate type definition
type FormData = { email: string };
```

### Use Typed Schemas in Components

```typescript
// ✅ GOOD - Type-safe
const { register } = useValidatedForm<ContactFormData>({
  resolver: zodResolver(contactFormSchema)
});

// Field names are type-checked
<TextInput {...register('email')} />  // ✅
<TextInput {...register('emaill')} /> // ❌ TypeScript error
```

### Server Actions are Type-Safe

```typescript
const { data } = await getValidatedFormData<ContactFormData>(/* ... */);

// data is ContactFormData | undefined
data?.email; // ✅ Type-safe access
```

## Testing Considerations

### Unit Testing Schemas

```typescript
import { contactFormSchema } from '~/lib/validations';

test('validates correct data', () => {
    const result = contactFormSchema.safeParse({
        name: 'John',
        email: 'john@example.com',
        message: 'Hello world',
    });

    expect(result.success).toBe(true);
});

test('rejects invalid email', () => {
    const result = contactFormSchema.safeParse({
        name: 'John',
        email: 'invalid',
        message: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('email');
});
```

### Integration Testing Forms

Test both client validation and server validation separately.

## Migration Guide

### From Manual Validation

**Before:**

```typescript
// Server - Manual parsing and validation
export async function action({ request }) {
  const formData = await request.formData();
  const email = formData.get('email');

  if (!email || !email.includes('@')) {
    return { error: 'Invalid email' };
  }

  // Continue...
}

// Client - No validation
<Form method="post">
  <input name="email" />
</Form>
```

**After:**

```typescript
// Server - Use getValidatedFormData
export async function action({ request }: Route.ActionArgs) {
  const { data, errors } = await getValidatedFormData<FormData>(
    request,
    zodResolver(schema)
  );

  if (errors) return data({ errors }, { status: 400 });

  // Continue with validated data
}

// Client - Use useValidatedForm
const { register, handleSubmit, formState: { errors } } = useValidatedForm({
  resolver: zodResolver(schema),
  errors: fetcher.data?.errors
});

const onSubmit = (data: FormData) => {
  const formData = new FormData();
  formData.append('email', data.email);
  fetcher.submit(formData, { method: 'POST' });
};

<form onSubmit={handleSubmit(onSubmit)}>
  <TextInput {...register('email')} error={errors.email?.message} />
  <Button type="submit">Submit</Button>
</form>
```

## Real-World Examples

See these files for complete implementations:

**Authentication** (uses client-side Better Auth pattern):

- Reference: `app/routes/sign-in.tsx`
- Documentation: `.github/instructions/better-auth.instructions.md`
- Pattern: Client-side `authClient` with React Hook Form validation

**Profile CRUD** (uses standard server action pattern):

- Schema: `app/lib/validations.ts` (`profileUpdateSchema`)
- API: `app/routes/api/profile.ts`
- UI: `app/routes/profile.tsx`
- Demonstrates: Server validation, field/form errors, loading states

## Troubleshooting

### Redirect not working after successful form submission

**Problem:** Form submits successfully but doesn't redirect.

**Cause:** Using `<fetcher.Form>` with `onSubmit={handleSubmit(onSubmit)}` creates a submission conflict. The `<fetcher.Form>` tries to submit naturally while `handleSubmit` prevents default and manually calls `fetcher.submit()`, causing unpredictable behavior.

**Solution:** Use `<form>` instead of `<fetcher.Form>` when manually controlling submission:

```typescript
// ❌ WRONG - Causes submission conflicts
<fetcher.Form onSubmit={handleSubmit(onSubmit)}>
  {/* fields */}
</fetcher.Form>

// ✅ CORRECT - Use regular <form> with manual fetcher.submit()
const onSubmit = (data: ProfileData) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('bio', data.bio);
  fetcher.submit(formData, { method: 'PUT', action: '/api/profile' });
};

<form onSubmit={handleSubmit(onSubmit)}>
  <TextInput {...register('name')} label="Name" />
  <TextInput {...register('bio')} label="Bio" />
  <Button type="submit">Save</Button>
</form>
```

### Server errors not appearing in form fields

**Problem:** Server validation errors don't show up in the form.

**Solution:** Ensure you pass `fetcher.data?.errors` to `useValidatedForm`:

```typescript
useValidatedForm({
    resolver: zodResolver(schema),
    errors: fetcher.data?.errors, // ← Must include this
});
```

### Form submits without validation

**Problem:** Form bypasses client validation.

**Solution:** Use `handleSubmit` wrapper:

```typescript
// ✅ GOOD
<fetcher.Form onSubmit={handleSubmit(onSubmit)}>

// ❌ BAD - Bypasses React Hook Form validation
<fetcher.Form onSubmit={onSubmit}>
```

### TypeScript errors in getValidatedFormData

**Problem:** `Type 'X' does not satisfy constraint 'FieldValues'`

**Solution:** Ensure your Zod schema infers to an object type:

```typescript
// ✅ GOOD
z.object({ email: z.string() });

// ❌ BAD
z.string(); // Not a FieldValues type
```

### Fields not registering with React Hook Form

**Problem:** TextInput doesn't work with `{...register()}`.

**Solution:** Ensure your component uses `forwardRef`:

```typescript
import { forwardRef } from 'react';

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ ...props }, ref) => <input ref={ref} {...props} />
);
```

## Anti-Patterns to Avoid

❌ **Don't use `<fetcher.Form>` with manual submission**

```typescript
// BAD - Causes submission conflicts
<fetcher.Form onSubmit={handleSubmit(onSubmit)}>
  {/* fields */}
</fetcher.Form>
```

✅ **Use `<form>` with manual submission**

```typescript
// GOOD - Standard pattern for this app
const onSubmit = (data: FormData) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  fetcher.submit(formData, { method: 'POST' });
};

<form onSubmit={handleSubmit(onSubmit)}>
  {/* fields */}
</form>
```

---

❌ **Don't duplicate validation logic**

```typescript
// BAD - Validation in two places
if (!email.includes('@')) return { error: 'Invalid' }; // Manual check
const result = schema.safeParse(data); // Schema check
```

✅ **Use schema everywhere**

```typescript
// GOOD - Schema is single source of truth
const { data, errors } = await getValidatedFormData(
    request,
    zodResolver(schema),
);
```

---

❌ **Don't manually sync errors**

```typescript
// BAD - Manual useEffect for syncing
useEffect(() => {
    if (fetcher.data?.errors) {
        Object.entries(fetcher.data.errors).forEach(/* ... */);
    }
}, [fetcher.data]);
```

✅ **Use useValidatedForm**

```typescript
// GOOD - Automatic syncing
useValidatedForm({ errors: fetcher.data?.errors });
```

---

❌ **Don't trust client-only validation**

```typescript
// BAD - Only validates on client
export async function action({ request }) {
    const data = await request.formData();
    await saveToDatabase(data); // No validation!
}
```

✅ **Always validate on server**

```typescript
// GOOD - Server validates all requests
const { data, errors } = await getValidatedFormData(/* ... */);
if (errors) return data({ errors }, { status: 400 });
await saveToDatabase(data!);
```

## Additional Resources

- **React Hook Form**: `.github/instructions/react-hook-form.instructions.md`
- **Zod Validation**: `.github/instructions/zod.instructions.md`
- **Component Patterns**: `.github/instructions/component-patterns.instructions.md`
- **React Router 7**: `.github/instructions/react-router.instructions.md`
