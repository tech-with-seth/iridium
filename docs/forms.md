# Forms and Validation

Iridium uses React Hook Form for form state management and Zod for schema validation, providing type-safe forms with excellent developer experience.

## Overview

The form handling approach combines:

- **React Hook Form** - Performant form state management
- **Zod** - Runtime type validation and schema definition
- **@hookform/resolvers** - Integration between React Hook Form and Zod
- **React Router 7 actions** - Server-side form processing

## Basic Form Example

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Route } from "./+types/contact";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

export default function ContactForm({ loaderData }: Route.ComponentProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Handle success
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Name</label>
        <input {...register("name")} id="name" type="text" />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input {...register("email")} id="email" type="email" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea {...register("message")} id="message" />
        {errors.message && <span>{errors.message.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

## Server-Side Validation

Always validate on the server, even with client-side validation:

```typescript
import { z } from 'zod';
import { Route } from './+types/contact';

const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    message: z.string().min(10),
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

    await sendContactMessage(result.data);

    return redirect('/thank-you');
}
```

## Form Patterns

### Controlled Components

For complex interactions, use controlled components:

```typescript
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SearchForm() {
  const [query, setQuery] = useState("");
  const { register, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("query")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}
```

### File Uploads

```typescript
const schema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 5000000, {
    message: "File size should be less than 5MB",
  }),
});

export default function UploadForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const formData = new FormData();
    formData.append("file", data.file);

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("file")} type="file" accept="image/*" />
      <button type="submit">Upload</button>
    </form>
  );
}
```

### Nested Objects

```typescript
const schema = z.object({
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string(),
  }),
});

export default function ProfileForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("user.firstName")} placeholder="First Name" />
      <input {...register("user.lastName")} placeholder="Last Name" />
      <input {...register("address.street")} placeholder="Street" />
      <input {...register("address.city")} placeholder="City" />
      <input {...register("address.zipCode")} placeholder="Zip Code" />
      <button type="submit">Save</button>
    </form>
  );
}
```

### Array Fields

```typescript
import { useFieldArray } from "react-hook-form";

const schema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().min(1),
    })
  ),
});

export default function OrderForm() {
  const { register, control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`items.${index}.name`)} placeholder="Item name" />
          <input
            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
            type="number"
            placeholder="Quantity"
          />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ name: "", quantity: 1 })}
      >
        Add Item
      </button>

      <button type="submit">Submit Order</button>
    </form>
  );
}
```

## Validation Patterns

### Custom Validation

```typescript
const schema = z
    .object({
        password: z.string().min(8),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });
```

### Conditional Validation

```typescript
const schema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('email'),
        email: z.string().email(),
    }),
    z.object({
        type: z.literal('phone'),
        phone: z.string().regex(/^\d{10}$/),
    }),
]);
```

### Async Validation

```typescript
const schema = z.object({
    username: z.string().refine(
        async (username) => {
            const available = await checkUsernameAvailability(username);
            return available;
        },
        { message: 'Username is already taken' },
    ),
});
```

## Error Handling

### Field-Level Errors

```typescript
export default function MyForm() {
  const { register, formState: { errors } } = useForm();

  return (
    <div>
      <input {...register("email")} />
      {errors.email && (
        <span className="error">{errors.email.message}</span>
      )}
    </div>
  );
}
```

### Form-Level Errors

```typescript
export default function MyForm({ loaderData }: Route.ComponentProps) {
  const { register, setError, formState: { errors } } = useForm();

  async function onSubmit(data: FormData) {
    try {
      await submitForm(data);
    } catch (error) {
      setError("root", {
        message: "An unexpected error occurred",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.root && <div className="alert">{errors.root.message}</div>}
      {/* form fields */}
    </form>
  );
}
```

## Form State

### Watch Values

```typescript
import { useForm, useWatch } from "react-hook-form";

export default function MyForm() {
  const { register, control } = useForm();
  const country = useWatch({ control, name: "country" });

  return (
    <form>
      <select {...register("country")}>
        <option value="us">United States</option>
        <option value="ca">Canada</option>
      </select>

      {country === "us" && (
        <input {...register("state")} placeholder="State" />
      )}
    </form>
  );
}
```

### Get Values

```typescript
const { register, getValues } = useForm();

function checkValues() {
    const values = getValues();
    console.log(values);
}
```

### Set Values

```typescript
const { register, setValue } = useForm();

function updateField() {
    setValue('fieldName', 'new value');
}
```

## Form Reset

```typescript
const { register, reset } = useForm();

async function onSubmit(data: FormData) {
    await submitForm(data);
    reset(); // Reset to default values
}
```

## DaisyUI Form Components

Leverage DaisyUI classes for styled form components:

```typescript
export default function StyledForm() {
  const { register, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          {...register("email")}
          type="email"
          className="input input-bordered"
          placeholder="you@example.com"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Password</span>
        </label>
        <input
          {...register("password")}
          type="password"
          className="input input-bordered"
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
}
```

## Best Practices

1. **Always validate on the server** - Client validation is for UX, not security
2. **Use Zod for schema definition** - Single source of truth for types and validation
3. **Show inline errors** - Display validation errors next to fields
4. **Disable submit while processing** - Prevent duplicate submissions
5. **Reset form after success** - Clear fields after successful submission
6. **Use semantic HTML** - Proper labels, fieldsets, and ARIA attributes
7. **Handle loading states** - Show feedback during submission
8. **Debounce expensive validation** - Optimize performance for async checks

## Testing Forms

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "./contact-form";

test("validates email field", async () => {
  const user = userEvent.setup();
  render(<ContactForm />);

  const emailInput = screen.getByLabelText(/email/i);
  await user.type(emailInput, "invalid-email");
  await user.tab(); // Trigger blur validation

  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
});
```

## Further Reading

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Architecture Decision: Zod Validation](./decisions/006-zod-validation.md)
- [Component Documentation](./components.md)
- [Testing Documentation](./testing.md)
