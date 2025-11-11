# Form Building Guide

Complete guide to building forms in Iridium using React Hook Form + Zod validation.

---

## Quick Reference

| Pattern | Use Case | Complexity |
|---------|----------|------------|
| [Basic Form](#basic-form) | Simple forms with 1-3 fields | Easy |
| [Multi-Field Form](#multi-field-form) | Complex forms with validation | Medium |
| [Multi-Step Form](#multi-step-form) | Wizard-style forms | Advanced |
| [File Upload Form](#file-upload-form) | Forms with image/file uploads | Medium |
| [Dynamic Fields](#dynamic-fields) | Add/remove fields dynamically | Advanced |

---

## Core Concepts

### The Iridium Form Pattern

Every form in Iridium follows this hybrid validation approach:

1. **Define schema** in `app/lib/validations.ts` (Zod)
2. **Server validates** in route `action` using `validateFormData()`
3. **Client validates** with `useValidatedForm()` hook
4. **Errors sync automatically** between server and client

**Benefits:**
- ✅ Single source of truth (one schema)
- ✅ Instant client-side feedback
- ✅ Server-side security
- ✅ Type-safe end-to-end

---

## Basic Form

Simple contact form with client + server validation.

### 1. Define Schema

```typescript
// app/lib/validations.ts
export const contactSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactData = z.infer<typeof contactSchema>;
```

### 2. Create API Endpoint

```typescript
// app/routes/api/contact.ts
import type { Route } from './+types/contact';
import { data } from 'react-router';
import { validateFormData } from '~/lib/form-validation.server';
import { contactSchema } from '~/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();

    const { data: validatedData, errors } = await validateFormData(
        formData,
        zodResolver(contactSchema),
    );

    if (errors) {
        return data({ errors }, { status: 400 });
    }

    // Process the validated data
    console.log('Contact submission:', validatedData);

    return data({ success: true, message: 'Message sent!' });
}
```

### 3. Build UI

```typescript
// app/routes/contact.tsx
import { useFetcher } from 'react-router';
import { useValidatedForm } from '~/lib/form-hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactData } from '~/lib/validations';
import { TextInput } from '~/components/TextInput';
import { Textarea } from '~/components/Textarea';
import { Button } from '~/components/Button';
import { Container } from '~/components/Container';

export default function ContactRoute() {
    const fetcher = useFetcher();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useValidatedForm<ContactData>({
        resolver: zodResolver(contactSchema),
        fetcher,
    });

    function onSubmit(data: ContactData) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('message', data.message);

        fetcher.submit(formData, {
            method: 'POST',
            action: '/api/contact',
        });
    }

    return (
        <Container>
            <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextInput
                    label="Name"
                    {...register('name')}
                    error={errors.name?.message}
                />

                <TextInput
                    label="Email"
                    type="email"
                    {...register('email')}
                    error={errors.email?.message}
                />

                <Textarea
                    label="Message"
                    rows={5}
                    {...register('message')}
                    error={errors.message?.message}
                />

                <Button
                    type="submit"
                    status="primary"
                    disabled={fetcher.state === 'submitting'}
                >
                    {fetcher.state === 'submitting'
                        ? 'Sending...'
                        : 'Send Message'}
                </Button>

                {fetcher.data?.success && (
                    <p className="text-green-600">{fetcher.data.message}</p>
                )}
            </form>
        </Container>
    );
}
```

---

## Multi-Field Form

Complex form with multiple field types and validation.

### Schema with Complex Validation

```typescript
// app/lib/validations.ts
export const profileSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email'),
    age: z.coerce
        .number()
        .min(18, 'Must be 18 or older')
        .max(120, 'Invalid age'),
    website: z
        .string()
        .url('Must be a valid URL')
        .optional()
        .or(z.literal('')),
    bio: z.string().max(500, 'Bio too long').optional(),
    newsletter: z.boolean().default(false),
    role: z.enum(['user', 'editor', 'admin']),
});

export type ProfileData = z.infer<typeof profileSchema>;
```

### UI with All Field Types

```typescript
import { Select } from '~/components/Select';
import { Checkbox } from '~/components/Checkbox';
import { Radio } from '~/components/Radio';

export default function ProfileFormRoute() {
    const fetcher = useFetcher();
    const { register, handleSubmit, formState: { errors } } = useValidatedForm<ProfileData>({
        resolver: zodResolver(profileSchema),
        fetcher,
        defaultValues: {
            newsletter: false,
            role: 'user',
        },
    });

    function onSubmit(data: ProfileData) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, String(value));
        });
        fetcher.submit(formData, { method: 'POST', action: '/api/profile' });
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextInput
                label="Full Name"
                {...register('name')}
                error={errors.name?.message}
            />

            <TextInput
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
            />

            <TextInput
                label="Age"
                type="number"
                {...register('age')}
                error={errors.age?.message}
            />

            <TextInput
                label="Website"
                placeholder="https://example.com"
                {...register('website')}
                error={errors.website?.message}
            />

            <Textarea
                label="Bio"
                rows={4}
                {...register('bio')}
                error={errors.bio?.message}
            />

            <Select label="Role" {...register('role')} error={errors.role?.message}>
                <option value="user">User</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
            </Select>

            <Checkbox {...register('newsletter')}>
                Subscribe to newsletter
            </Checkbox>

            <Button type="submit" status="primary">
                Save Profile
            </Button>
        </form>
    );
}
```

---

## Multi-Step Form

Wizard-style form with progress tracking.

### Schema (Broken into Steps)

```typescript
// Step 1: Personal info
export const step1Schema = z.object({
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    email: z.string().email(),
});

// Step 2: Company info
export const step2Schema = z.object({
    company: z.string().min(1, 'Company name required'),
    position: z.string().min(1, 'Position required'),
});

// Step 3: Preferences
export const step3Schema = z.object({
    interests: z.array(z.string()).min(1, 'Select at least one'),
    notifications: z.boolean(),
});

// Combined schema for server validation
export const onboardingSchema = step1Schema
    .merge(step2Schema)
    .merge(step3Schema);

export type OnboardingData = z.infer<typeof onboardingSchema>;
```

### Multi-Step UI

```typescript
import { useState } from 'react';

export default function OnboardingRoute() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<OnboardingData>>({});
    const fetcher = useFetcher();

    const currentSchema =
        step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema;

    const { register, handleSubmit, formState: { errors } } = useValidatedForm({
        resolver: zodResolver(currentSchema),
        fetcher,
        defaultValues: formData,
    });

    function onSubmit(data: any) {
        const updated = { ...formData, ...data };
        setFormData(updated);

        if (step < 3) {
            setStep(step + 1);
        } else {
            // Final step - submit to server
            const finalData = new FormData();
            Object.entries(updated).forEach(([key, value]) => {
                finalData.append(key, String(value));
            });
            fetcher.submit(finalData, {
                method: 'POST',
                action: '/api/onboarding',
            });
        }
    }

    return (
        <Container>
            {/* Progress indicator */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    <span>Step {step} of 3</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                        className="bg-blue-600 h-2 rounded transition-all"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-bold">Personal Info</h2>
                        <TextInput
                            label="First Name"
                            {...register('firstName')}
                            error={errors.firstName?.message}
                        />
                        <TextInput
                            label="Last Name"
                            {...register('lastName')}
                            error={errors.lastName?.message}
                        />
                        <TextInput
                            label="Email"
                            type="email"
                            {...register('email')}
                            error={errors.email?.message}
                        />
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className="text-2xl font-bold">Company Info</h2>
                        <TextInput
                            label="Company"
                            {...register('company')}
                            error={errors.company?.message}
                        />
                        <TextInput
                            label="Position"
                            {...register('position')}
                            error={errors.position?.message}
                        />
                    </>
                )}

                {step === 3 && (
                    <>
                        <h2 className="text-2xl font-bold">Preferences</h2>
                        {/* Interests checkboxes */}
                        <Checkbox {...register('notifications')}>
                            Email notifications
                        </Checkbox>
                    </>
                )}

                <div className="flex gap-2">
                    {step > 1 && (
                        <Button
                            type="button"
                            status="neutral"
                            onClick={() => setStep(step - 1)}
                        >
                            Back
                        </Button>
                    )}
                    <Button type="submit" status="primary">
                        {step === 3 ? 'Complete' : 'Next'}
                    </Button>
                </div>
            </form>
        </Container>
    );
}
```

---

## File Upload Form

Form with image upload using Cloudinary.

See [IMAGE_HANDLING.md](IMAGE_HANDLING.md) for complete Cloudinary integration guide.

### Quick Example

```typescript
export const productSchema = z.object({
    name: z.string().min(1, 'Product name required'),
    price: z.coerce.number().min(0, 'Price must be positive'),
    image: z.instanceof(File).optional(),
});

export default function ProductFormRoute() {
    const { register, handleSubmit, formState: { errors } } = useValidatedForm({
        resolver: zodResolver(productSchema),
        fetcher,
    });

    function onSubmit(data: any) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('price', data.price);
        if (data.image) {
            formData.append('image', data.image);
        }
        fetcher.submit(formData, { method: 'POST', action: '/api/products' });
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
            <TextInput label="Product Name" {...register('name')} />
            <TextInput label="Price" type="number" {...register('price')} />
            <input type="file" {...register('image')} accept="image/*" />
            <Button type="submit">Create Product</Button>
        </form>
    );
}
```

---

## Dynamic Fields

Add/remove fields dynamically (e.g., multiple email addresses).

### Schema for Array Fields

```typescript
export const inviteSchema = z.object({
    emails: z.array(
        z.object({
            email: z.string().email('Invalid email'),
            role: z.enum(['user', 'admin']),
        }),
    ).min(1, 'At least one email required'),
});

export type InviteData = z.infer<typeof inviteSchema>;
```

### UI with Dynamic Fields

```typescript
import { useFieldArray } from 'react-hook-form';

export default function InviteFormRoute() {
    const fetcher = useFetcher();
    const { register, control, handleSubmit, formState: { errors } } = useValidatedForm<InviteData>({
        resolver: zodResolver(inviteSchema),
        fetcher,
        defaultValues: {
            emails: [{ email: '', role: 'user' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'emails',
    });

    function onSubmit(data: InviteData) {
        const formData = new FormData();
        formData.append('emails', JSON.stringify(data.emails));
        fetcher.submit(formData, { method: 'POST', action: '/api/invites' });
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-2xl font-bold">Invite Team Members</h2>

            {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                    <TextInput
                        label={`Email ${index + 1}`}
                        {...register(`emails.${index}.email`)}
                        error={errors.emails?.[index]?.email?.message}
                        className="flex-1"
                    />
                    <Select
                        label="Role"
                        {...register(`emails.${index}.role`)}
                        className="w-32"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </Select>
                    {fields.length > 1 && (
                        <Button
                            type="button"
                            size="sm"
                            status="error"
                            onClick={() => remove(index)}
                        >
                            Remove
                        </Button>
                    )}
                </div>
            ))}

            <Button
                type="button"
                status="neutral"
                onClick={() => append({ email: '', role: 'user' })}
            >
                Add Another Email
            </Button>

            <Button type="submit" status="primary">
                Send Invites
            </Button>
        </form>
    );
}
```

---

## Common Patterns

### Loading States

```typescript
const isSubmitting = fetcher.state === 'submitting';

<Button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

### Success Messages

```typescript
{fetcher.data?.success && (
    <Alert status="success">{fetcher.data.message}</Alert>
)}

{fetcher.data?.error && (
    <Alert status="error">{fetcher.data.error}</Alert>
)}
```

### Conditional Fields

```typescript
const [showAdvanced, setShowAdvanced] = useState(false);

{showAdvanced && (
    <>
        <TextInput label="Advanced Option 1" {...register('advanced1')} />
        <TextInput label="Advanced Option 2" {...register('advanced2')} />
    </>
)}
```

### Dependent Fields

```typescript
const userType = watch('userType');

{userType === 'business' && (
    <TextInput label="Company Name" {...register('company')} />
)}
```

---

## Testing Forms

### Unit Test Example

```typescript
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from './contact';

describe('ContactForm', () => {
    test('validates required fields', async () => {
        render(<ContactForm />);
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /submit/i }));

        expect(await screen.findByText('Name is required')).toBeInTheDocument();
        expect(await screen.findByText('Email is required')).toBeInTheDocument();
    });

    test('validates email format', async () => {
        render(<ContactForm />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/email/i), 'invalid-email');
        await user.click(screen.getByRole('button', { name: /submit/i }));

        expect(await screen.findByText('Invalid email')).toBeInTheDocument();
    });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('submits contact form', async ({ page }) => {
    await page.goto('/contact');

    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('textarea[name="message"]', 'Test message');

    await page.click('button[type="submit"]');

    await expect(page.getByText('Message sent!')).toBeVisible();
});
```

---

## Best Practices

### ✅ DO

- **Use Zod schemas** - Single source of truth for validation
- **Validate on server** - Never trust client-side only
- **Show field errors** - Use `error` prop on inputs
- **Disable while submitting** - Prevent double submissions
- **Test validation** - Write tests for edge cases
- **Use TypeScript types** - Infer from Zod schemas

### ❌ DON'T

- **Don't skip server validation** - Security vulnerability
- **Don't use `<fetcher.Form>`** - Use `<form>` with `handleSubmit`
- **Don't duplicate validation** - Use shared Zod schemas
- **Don't forget loading states** - Poor UX without feedback
- **Don't validate passwords client-side only** - Security risk

---

## Troubleshooting

### Form doesn't submit

```typescript
// ❌ WRONG - Using fetcher.Form with handleSubmit
<fetcher.Form onSubmit={handleSubmit(onSubmit)}>

// ✅ CORRECT - Use <form>
<form onSubmit={handleSubmit(onSubmit)}>
```

### Server errors don't show

```typescript
// ✅ CORRECT - Pass fetcher to useValidatedForm
const { register, handleSubmit } = useValidatedForm({
    resolver: zodResolver(schema),
    fetcher, // This syncs server errors automatically
});
```

### Types don't match

```typescript
// ✅ CORRECT - Infer types from schema
export const mySchema = z.object({ /* ... */ });
export type MyData = z.infer<typeof mySchema>;

// Use the inferred type
useValidatedForm<MyData>({ /* ... */ });
```

---

## Next Steps

- [BUILD_YOUR_FIRST_FEATURE.md](BUILD_YOUR_FIRST_FEATURE.md) - Complete CRUD tutorial
- [IMAGE_HANDLING.md](IMAGE_HANDLING.md) - File uploads with Cloudinary
- [`.github/instructions/form-validation.instructions.md`](.github/instructions/form-validation.instructions.md) - Deep dive
- [`.github/instructions/react-hook-form.instructions.md`](.github/instructions/react-hook-form.instructions.md) - Advanced patterns
- [`docs/forms.md`](docs/forms.md) - Additional examples