# React Hook Form Instructions

## Overview

React Hook Form is a performant, flexible, and extensible form library for React. It minimizes re-renders, provides intuitive APIs, and integrates seamlessly with validation libraries like Zod. This project uses React Hook Form for all form handling with Zod schema validation and CVA-based UI components.

## Installation

```bash
npm install react-hook-form @hookform/resolvers
```

## Core Concepts

### Performance-First Design

- Uncontrolled components by default (minimal re-renders)
- Form state isolated from React render cycle
- Subscription-based updates for optimal performance

### HTML Standard Alignment

- Leverages native form validation
- Supports standard HTML input attributes
- Works with browser validation APIs

## Import Patterns

```typescript
// Core hooks
import {
    useForm,
    useFormContext,
    useController,
    useFieldArray,
} from 'react-hook-form';

// Zod integration
import { zodResolver } from '@hookform/resolvers/zod';

// Type inference
import type { SubmitHandler, FieldErrors } from 'react-hook-form';

// Validation schemas
import { signInSchema } from '~/lib/validations';
```

## Basic Usage Pattern

### 1. Define Zod Schema

All validation schemas live in `app/lib/validations.ts`:

```typescript
import { z } from 'zod';

export const contactFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
```

### 2. Component with Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, type ContactFormData } from '~/lib/validations';

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: ''
    }
  });

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    // Form data is fully validated and typed
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput
        {...register('name')}
        label="Name"
        error={errors.name?.message}
      />
      <TextInput
        {...register('email')}
        label="Email"
        type="email"
        error={errors.email?.message}
      />
      <Textarea
        {...register('message')}
        label="Message"
        error={errors.message?.message}
      />
      <Button type="submit" loading={isSubmitting}>
        Submit
      </Button>
    </form>
  );
}
```

## React Router 7 Integration

### Server-Side Form Handling

```typescript
import type { Route } from './+types/contact';
import { contactFormSchema } from '~/lib/validations';

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate with Zod
    const result = contactFormSchema.safeParse(data);

    if (!result.success) {
        return data(
            { errors: result.error.flatten().fieldErrors },
            { status: 400 },
        );
    }

    // Process validated data
    await sendEmail(result.data);

    return redirect('/success');
}
```

### Client-Side with Server Action

```typescript
import { useFetcher } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function ContactForm() {
  const fetcher = useFetcher();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(contactFormSchema)
  });

  const onSubmit = (data: ContactFormData) => {
    fetcher.submit(data, { method: 'POST' });
  };

  return (
    <fetcher.Form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </fetcher.Form>
  );
}
```

## useForm API

### Configuration Options

```typescript
const form = useForm({
    // Validation mode
    mode: 'onSubmit', // 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all'
    reValidateMode: 'onChange', // When to re-validate after error

    // Default values (highly recommended)
    defaultValues: {
        username: '',
        email: '',
    },

    // Schema validation
    resolver: zodResolver(mySchema),

    // Focus management
    shouldFocusError: true, // Auto-focus first error field

    // Error display
    criteriaMode: 'firstError', // 'firstError' | 'all'

    // Advanced options
    shouldUnregister: false, // Keep values when inputs unmount
    shouldUseNativeValidation: false,
});
```

### Return Values

```typescript
const {
    // Field registration
    register, // Register input with validation
    unregister, // Remove input from form

    // Form submission
    handleSubmit, // Validate and submit handler

    // Form state
    formState: {
        errors, // Field validation errors
        isDirty, // Any field modified
        dirtyFields, // Which fields modified
        touchedFields, // Which fields touched
        isSubmitting, // Currently submitting
        isSubmitted, // Has been submitted
        isSubmitSuccessful, // Submitted without errors
        isValid, // Form is valid
        isValidating, // Currently validating
        submitCount, // Number of submissions
    },

    // Field manipulation
    watch, // Watch field values
    getValues, // Get current values
    setValue, // Set field value programmatically
    reset, // Reset entire form
    resetField, // Reset single field
    setFocus, // Focus specific field

    // Validation
    trigger, // Manually trigger validation
    setError, // Set custom error
    clearErrors, // Clear errors

    // Advanced
    control, // For Controller/useController
    getFieldState, // Get field-specific state
} = useForm();
```

## register() Function

### Basic Registration

```typescript
<input {...register('fieldName')} />
```

### With Validation

```typescript
<input
  {...register('username', {
    required: 'Username is required',
    minLength: {
      value: 3,
      message: 'Username must be at least 3 characters'
    },
    maxLength: {
      value: 20,
      message: 'Username must not exceed 20 characters'
    },
    pattern: {
      value: /^[a-zA-Z0-9_]+$/,
      message: 'Username can only contain letters, numbers, and underscores'
    },
    validate: {
      noSpaces: (value) => !value.includes(' ') || 'No spaces allowed',
      async checkAvailability(value) {
        const available = await checkUsername(value);
        return available || 'Username already taken';
      }
    }
  })}
/>
```

### Validation Options

| Option      | Type                                           | Description                   |
| ----------- | ---------------------------------------------- | ----------------------------- |
| `required`  | `boolean \| string`                            | Field is required             |
| `min`       | `number \| { value: number, message: string }` | Minimum value (numbers)       |
| `max`       | `number \| { value: number, message: string }` | Maximum value (numbers)       |
| `minLength` | `number \| { value: number, message: string }` | Minimum length (strings)      |
| `maxLength` | `number \| { value: number, message: string }` | Maximum length (strings)      |
| `pattern`   | `RegExp \| { value: RegExp, message: string }` | Regex pattern                 |
| `validate`  | `Function \| Object`                           | Custom validation function(s) |
| `disabled`  | `boolean`                                      | Disable field                 |
| `onChange`  | `(e: Event) => void`                           | Custom onChange handler       |
| `onBlur`    | `(e: Event) => void`                           | Custom onBlur handler         |

## Controlled Components with Controller

For UI libraries that don't expose `ref` (Material-UI, React-Select, etc.), use `Controller`:

```typescript
import { Controller } from 'react-hook-form';

function MyForm() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="category"
        control={control}
        rules={{ required: 'Category is required' }}
        render={({ field, fieldState: { error } }) => (
          <Select
            {...field}
            options={categories}
            error={error?.message}
          />
        )}
      />
    </form>
  );
}
```

### Controller Props

- `name` - Unique field name (required)
- `control` - Control object from `useForm()`
- `rules` - Validation rules (use `resolver` instead for schema validation)
- `defaultValue` - Initial value
- `render` - Render prop function

### Field Object Properties

The `field` object passed to `render` contains:

- `value` - Current field value
- `onChange` - Update value handler
- `onBlur` - Touch field handler
- `name` - Field name
- `ref` - Field reference (for focus management)

### FieldState Properties

- `invalid` - Is field invalid
- `isTouched` - Has field been touched
- `isDirty` - Has field been modified
- `error` - Field error object

## useController Hook

For building custom controlled input components:

```typescript
import { useController } from 'react-hook-form';

interface CustomInputProps {
  name: string;
  control: Control<any>;
  label: string;
}

function CustomInput({ name, control, label }: CustomInputProps) {
  const {
    field,
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: { required: true }
  });

  return (
    <div>
      <label>{label}</label>
      <input {...field} />
      {error && <span>{error.message}</span>}
    </div>
  );
}
```

## Dynamic Fields with useFieldArray

For repeating field groups (e.g., adding multiple items):

```typescript
import { useForm, useFieldArray } from 'react-hook-form';

function TodoList() {
  const { control, register } = useForm({
    defaultValues: {
      todos: [{ text: '' }]
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'todos'
  });

  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`todos.${index}.text`)} />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ text: '' })}>
        Add Todo
      </button>
    </div>
  );
}
```

### useFieldArray Methods

- `append(value)` - Add field(s) to end
- `prepend(value)` - Add field(s) to start
- `insert(index, value)` - Insert field(s) at position
- `remove(index)` - Remove field at index
- `update(index, value)` - Update field at index
- `move(from, to)` - Move field position
- `swap(indexA, indexB)` - Swap two fields
- `replace(values)` - Replace entire array

**Important:** Always use `field.id` as the React `key` prop, not the array index.

## FormProvider & useFormContext

For deeply nested components, avoid prop drilling with context:

```typescript
import { useForm, FormProvider, useFormContext } from 'react-hook-form';

function ParentForm() {
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <NestedInput />
      </form>
    </FormProvider>
  );
}

function NestedInput() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <input
      {...register('nestedField')}
      aria-invalid={errors.nestedField ? 'true' : 'false'}
    />
  );
}
```

## Error Handling

### Displaying Errors

```typescript
const { formState: { errors } } = useForm();

// Single field error
<TextInput
  {...register('email')}
  error={errors.email?.message}
/>

// Multiple validation errors (criteriaMode: 'all')
{errors.email?.types && (
  <div>
    {Object.values(errors.email.types).map((error, i) => (
      <p key={i}>{error}</p>
    ))}
  </div>
)}
```

### Setting Custom Errors

```typescript
const { setError } = useForm();

setError('username', {
    type: 'server',
    message: 'This username is already taken',
});

// Multiple fields
setError('root.serverError', {
    type: 'server',
    message: 'Something went wrong',
});
```

### Clearing Errors

```typescript
const { clearErrors } = useForm();

clearErrors('username'); // Clear single field
clearErrors(['email', 'name']); // Clear multiple
clearErrors(); // Clear all
```

## Form State Management

### Watch Values

```typescript
const { watch } = useForm();

// Watch all fields
const formData = watch();

// Watch specific field
const username = watch('username');

// Watch multiple fields
const [username, email] = watch(['username', 'email']);

// Watch with callback (for subscriptions)
useEffect(() => {
    const subscription = watch((value, { name, type }) => {
        console.log(value, name, type);
    });
    return () => subscription.unsubscribe();
}, [watch]);
```

### Get Values

```typescript
const { getValues } = useForm();

// Get all values
const data = getValues();

// Get specific field
const username = getValues('username');

// Get multiple fields
const values = getValues(['username', 'email']);
```

### Set Values

```typescript
const { setValue } = useForm();

// Set single value
setValue('username', 'john_doe');

// With options
setValue('username', 'john_doe', {
    shouldValidate: true, // Trigger validation
    shouldDirty: true, // Mark as dirty
    shouldTouch: true, // Mark as touched
});
```

### Reset Form

```typescript
const { reset } = useForm();

// Reset to default values
reset();

// Reset to new values
reset({
    username: 'new_username',
    email: 'new@email.com',
});

// Reset specific fields
reset(undefined, {
    keepErrors: true,
    keepDirty: true,
    keepValues: false,
});
```

## Integration with CVA Components

Our CVA-based components work seamlessly with React Hook Form. See `.github/instructions/component-patterns.instructions.md` for more details on component architecture.

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput } from '~/components/TextInput';
import { Button } from '~/components/Button';
import { contactFormSchema } from '~/lib/validations';

function MyForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(contactFormSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput
        {...register('email')}
        label="Email"
        type="email"
        error={errors.email?.message}
        helperText="We'll never share your email"
      />

      <Button
        type="submit"
        loading={isSubmitting}
        status="primary"
      >
        Submit
      </Button>
    </form>
  );
}
```

### Custom Form Components

When building custom form components that integrate with React Hook Form, you **MUST use `forwardRef`** to pass the ref from `register()`:

```typescript
import { forwardRef } from 'react';
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

const inputVariants = cva({
  base: 'input',
  variants: {
    status: {
      primary: 'input-primary',
      error: 'input-error'
    }
  }
});

interface CustomInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
}

// IMPORTANT: Use forwardRef to pass ref from register()
export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, error, status, className, ...props }, ref) => {
    return (
      <div className="form-control">
        {label && (
          <label className="label">
            <span className="label-text">{label}</span>
          </label>
        )}
        <input
          ref={ref}  // Critical for register() to work
          className={cx(
            inputVariants({ status: error ? 'error' : status }),
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput';
```

**Why forwardRef is required:**

- `register()` returns a `ref` that React Hook Form uses for validation and value management
- Without `forwardRef`, the ref cannot be passed to the underlying input element
- This will cause validation to fail and form values won't be tracked properly

## TypeScript Patterns

### Form Data Types

```typescript
import { z } from 'zod';

const schema = z.object({
    username: z.string(),
    age: z.number(),
});

type FormData = z.infer<typeof schema>;

const { handleSubmit } = useForm<FormData>();

const onSubmit: SubmitHandler<FormData> = (data) => {
    // data is fully typed
    console.log(data.username);
};
```

### Typed Errors

```typescript
import type { FieldErrors } from 'react-hook-form';
import type { ContactFormData } from '~/lib/validations';

function showErrors(errors: FieldErrors<ContactFormData>) {
    // Fully typed errors object
    if (errors.email) {
        console.log(errors.email.message);
    }
}
```

### Custom Resolver Type

```typescript
import type { Resolver } from 'react-hook-form';

const customResolver: Resolver<FormData> = async (values) => {
    return {
        values: values.email ? values : {},
        errors: !values.email
            ? {
                  email: {
                      type: 'required',
                      message: 'Email is required',
                  },
              }
            : {},
    };
};
```

## Performance Optimization

### 1. Avoid Watching Entire Form

```typescript
// ❌ Bad - triggers re-render on any field change
const formData = watch();

// ✅ Good - only re-renders when specific field changes
const email = watch('email');
```

### 2. Use Subscription-Based Updates

```typescript
// For side effects, use subscription instead of watch()
useEffect(() => {
    const subscription = watch((value, { name }) => {
        if (name === 'country') {
            // Update state list based on country
        }
    });
    return () => subscription.unsubscribe();
}, [watch]);
```

### 3. Memoize Form Components

```typescript
import { memo } from 'react';

const ExpensiveFormField = memo(({ register, error }) => {
  return <input {...register('field')} />;
});
```

### 4. Read formState Before Render

```typescript
// ❌ Bad - formState proxy won't track subscriptions
const { formState } = useForm();
return <div>{formState.isDirty && 'Form is dirty'}</div>;

// ✅ Good - read before render
const { formState: { isDirty } } = useForm();
return <div>{isDirty && 'Form is dirty'}</div>;
```

## Validation Best Practices

### 1. Use Zod for Schema Validation

```typescript
// ❌ Avoid inline validation rules (harder to maintain)
<input {...register('email', { required: true, pattern: /.../ })} />

// ✅ Use Zod schemas in validations.ts
const schema = z.object({
  email: z.string().email()
});

const { register } = useForm({
  resolver: zodResolver(schema)
});
```

### 2. Validation Mode Strategy

```typescript
// For better UX, validate on submit, re-validate on change
const form = useForm({
    mode: 'onSubmit', // Don't annoy users while typing
    reValidateMode: 'onChange', // But show fixes immediately after error
});
```

### 3. Async Validation Debouncing

```typescript
const checkUsername = debounce(async (username: string) => {
    const response = await fetch(`/api/check-username?username=${username}`);
    return response.ok;
}, 500);

const schema = z.object({
    username: z.string().refine(async (val) => await checkUsername(val), {
        message: 'Username already taken',
    }),
});
```

## Common Patterns

### File Upload

```typescript
function FileUploadForm() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: { file: FileList }) => {
    const formData = new FormData();
    formData.append('file', data.file[0]);
    await uploadFile(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="file"
        {...register('file', {
          required: 'Please select a file',
          validate: {
            fileSize: (files) =>
              files[0]?.size < 5000000 || 'File size must be less than 5MB',
            fileType: (files) =>
              ['image/jpeg', 'image/png'].includes(files[0]?.type) ||
              'Only JPEG and PNG files are allowed'
          }
        })}
      />
      <button type="submit">Upload</button>
    </form>
  );
}
```

### Dependent Fields

```typescript
function AddressForm() {
  const { register, watch, setValue } = useForm();
  const country = watch('country');

  useEffect(() => {
    // Reset state when country changes
    if (country !== previousCountry) {
      setValue('state', '');
    }
  }, [country, setValue]);

  return (
    <form>
      <select {...register('country')}>
        <option value="us">United States</option>
        <option value="ca">Canada</option>
      </select>

      <select {...register('state')}>
        {country === 'us' ? usStates : canadianProvinces}
      </select>
    </form>
  );
}
```

### Conditional Fields

```typescript
const schema = z.object({
  hasAddress: z.boolean(),
  address: z.string().optional()
}).refine(
  (data) => !data.hasAddress || (data.hasAddress && data.address),
  {
    message: 'Address is required when checkbox is checked',
    path: ['address']
  }
);

function ConditionalForm() {
  const { register, watch } = useForm({
    resolver: zodResolver(schema)
  });

  const hasAddress = watch('hasAddress');

  return (
    <form>
      <input type="checkbox" {...register('hasAddress')} />

      {hasAddress && (
        <input {...register('address')} />
      )}
    </form>
  );
}
```

### Multi-Step Forms

```typescript
function MultiStepForm() {
  const [step, setStep] = useState(1);
  const { register, handleSubmit, trigger } = useForm({
    mode: 'onChange'
  });

  const nextStep = async () => {
    // Validate current step before proceeding
    const isValid = await trigger();
    if (isValid) setStep(step + 1);
  };

  const onSubmit = (data) => {
    console.log('Final submission:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {step === 1 && (
        <div>
          <input {...register('firstName')} />
          <button type="button" onClick={nextStep}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <input {...register('email')} />
          <button type="button" onClick={() => setStep(1)}>Back</button>
          <button type="submit">Submit</button>
        </div>
      )}
    </form>
  );
}
```

## Accessibility

### ARIA Attributes

```typescript
function AccessibleForm() {
  const { register, formState: { errors } } = useForm();

  return (
    <form>
      <input
        {...register('email', { required: true })}
        aria-invalid={errors.email ? 'true' : 'false'}
        aria-describedby={errors.email ? 'email-error' : undefined}
      />
      {errors.email && (
        <span id="email-error" role="alert">
          {errors.email.message}
        </span>
      )}
    </form>
  );
}
```

### Focus Management

```typescript
const { setFocus } = useForm({
    shouldFocusError: true, // Auto-focus first error on submit
});

// Manual focus
useEffect(() => {
    setFocus('username');
}, [setFocus]);
```

## Anti-Patterns to Avoid

- ❌ Using `value` prop with `register()` (use `defaultValue` in `useForm()` instead)
- ❌ Registering the same field name multiple times
- ❌ Watching entire form when only specific fields are needed
- ❌ Not using `forwardRef` in custom form components
- ❌ Mixing controlled and uncontrolled modes unnecessarily
- ❌ Inline validation logic (use Zod schemas in `validations.ts`)
- ❌ Not destructuring `formState` before render (proxy won't track)
- ❌ Using array index as key in `useFieldArray` (use `field.id`)
- ❌ Stacking multiple `useFieldArray` actions without awaiting

## Pre-Built Integration

This project includes pre-configured patterns for React Hook Form:

- **Validation schemas**: See `app/lib/validations.ts` for Zod schemas
- **Form components**: `TextInput`, `Textarea`, `Select`, etc. support `register()` out of the box
- **Error handling**: Components accept `error` prop for displaying validation errors
- **TypeScript types**: All schemas export inferred types

## Additional Resources

- [React Hook Form Documentation](https://react-hook-form.com/)
- [API Reference](https://react-hook-form.com/docs)
- [Zod Integration Guide](https://react-hook-form.com/get-started#SchemaValidation)
- [Advanced Patterns](https://react-hook-form.com/advanced-usage)
- Project validations: `app/lib/validations.ts`
- Component patterns: `.github/instructions/component-patterns.instructions.md`
