---
name: iridium-form
description: Build validated forms in this Iridium app using React Hook Form v7 + Zod v4, useFetcher submission, and DaisyUI v5 markup. Use when adding any user-input form (login, signup, settings, create/edit pages, contact, etc.), composing fieldsets with accessible error messages, wiring client + server validation against a shared schema, displaying form-level or field-level errors from an action, or editing a *.tsx file that contains a <form> or imports react-hook-form, @hookform/resolvers/zod, or zod. Do NOT use for the chat input (uses @ai-sdk/react useChat), for the existing Better Auth login/register flows, or for pure search/filter forms (use <Form method="get"> directly).
---

# Iridium Forms

Compose validated, accessible forms with React Hook Form + Zod, submit them through `useFetcher`, and render them in DaisyUI v5 markup. The same Zod schema validates on both sides of the wire.

## Project package versions

The form stack in this repo. Match the API for the installed major version:

| Package | Version | Notes |
|---|---|---|
| `react-hook-form` | ^7.76 | v7 API: `useForm`, `register`, `handleSubmit`, `setError`, `formState.errors`. |
| `zod` | ^4.4 | v4 syntax. Use `z.email()` and `z.url()` as standalone formats -- **not** `z.string().email()`. Issues are on `result.error.issues` with `path[]` + `message`. |
| `@hookform/resolvers` | ^5.2 | Import `zodResolver` from `@hookform/resolvers/zod`. v5 is the pair for RHF 7 + Zod 4. |
| `react-router` | 7.14 | Framework mode. Import `useFetcher`, `Form`, `redirect`, `data` from `react-router`. Never `react-router-dom`. |
| `daisyui` | ^5.5 | v5 form classes: `fieldset`, `fieldset-legend`, `input`, `label`, `alert`, `btn`. v5 dropped the v4 `form-control` / `input-bordered` classes -- don't use them. |
| `lucide-react` | ^1.16 | Project's icon library. Use these for form icons; never heroicons. |

## When to apply

- Adding any user-input form: create/edit pages, settings, contact, multi-field flows.
- Surfacing per-field errors from the server back into the UI.
- Showing pending state, disabling the submit button during submission, or optimistic UI.
- Editing a file that already has `useForm`, `zodResolver`, or `<form>` in it.

Use the `react-router-framework-mode` skill for route-level concerns (loaders, redirects, error boundaries, registering the file in `app/routes.ts`).

## Form template

```tsx
import { useEffect } from 'react';
import { CircleXIcon } from 'lucide-react';
import { useFetcher } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.email({ message: 'Enter a valid email address' }),
});

type FormValues = z.infer<typeof formSchema>;

type ActionData = {
    formError?: string;
    fieldErrors?: Partial<Record<keyof FormValues, string>>;
};

export function ExampleForm() {
    const fetcher = useFetcher<ActionData>();
    const isSubmitting = fetcher.state !== 'idle';

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    // Lift server field errors back into RHF
    useEffect(() => {
        if (!fetcher.data?.fieldErrors) return;
        for (const [field, message] of Object.entries(fetcher.data.fieldErrors)) {
            setError(field as keyof FormValues, { message });
        }
    }, [fetcher.data, setError]);

    const onSubmit = (data: FormValues) => {
        fetcher.submit(data, {
            method: 'post',
            encType: 'application/json',
        });
    };

    return (
        <>
            {fetcher.data?.formError && (
                <div role="alert" className="alert alert-error mb-4">
                    <CircleXIcon aria-hidden="true" className="h-6 w-6" />
                    <span>{fetcher.data.formError}</span>
                </div>
            )}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
            >
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                        What is your first name?
                    </legend>
                    <input
                        type="text"
                        className="input"
                        placeholder="Your name"
                        aria-invalid={errors.name ? true : undefined}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        {...register('name')}
                    />
                    {errors.name && (
                        <p id="name-error" className="label text-error italic">
                            {errors.name.message}
                        </p>
                    )}
                </fieldset>
                {/* Repeat the fieldset block for every additional field. */}
                <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </>
    );
}
```

## Validation: one schema, both sides

Declare the Zod schema once and use it for both the client resolver and the server action.

```tsx
// client
useForm<FormValues>({ resolver: zodResolver(formSchema) });

// server (in the route's action)
import { data } from 'react-router';

export async function action({ request }: Route.ActionArgs) {
    const parsed = formSchema.safeParse(await request.json());
    if (!parsed.success) {
        return data(
            {
                fieldErrors: Object.fromEntries(
                    parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
                ),
            },
            { status: 400 },
        );
    }
    // ...do work with parsed.data via app/models/*.server.ts
    return { formError: null };
}
```

Zod v4 notes:
- `z.email()`, `z.url()`, `z.uuid()` are standalone string formats. Don't write `z.string().email()`.
- `safeParse` returns `{ success, data }` or `{ success, error }` where `error.issues[]` has `{ path, message, code }`.
- Coerce numbers/dates from JSON with `z.coerce.number()` / `z.coerce.date()` when needed.

Never trust client validation alone -- always `safeParse` on the server.

## Submission pattern (pick one)

| Pattern | Use when |
|---|---|
| `useFetcher` + `fetcher.submit(data, { method: 'post', encType: 'application/json' })` | **Default for RHF forms.** RHF owns the submit handler; you want validated JS objects on the server, no navigation. |
| `<fetcher.Form method="post">` with `name="..."` inputs | Inline mutations without RHF (likes, ratings, toggles). |
| `<Form method="post">` from `react-router` | Mutations that should redirect on success and don't need RHF. |
| `<Form method="get">` | Search/filter forms. Auto-syncs to URL `searchParams`. |

For RHF forms in this project, prefer `useFetcher` + JSON. It keeps client validation, lets you return structured `{ formError, fieldErrors }`, and avoids FormData stringification.

`fetcher.state` is `'idle' | 'submitting' | 'loading'`. Disable submit on anything other than `'idle'`.

## DaisyUI v5 markup rules

- Wrap each field in `<fieldset className="fieldset">` with a `<legend className="fieldset-legend">`. Use fieldset/legend rather than `<label>`. (DaisyUI v5 dropped `form-control` -- don't reach for it.)
- Inputs use `className="input"` only. No `input-bordered` (that was v4). Add size (`input-sm`) or color modifiers only when design calls for them.
- Field errors render as `<p id="<field>-error" className="label text-error italic">{message}</p>`.
- Form-level errors render as `alert alert-error` with `role="alert"` and a `CircleXIcon` from lucide-react.
- Submit buttons: `className="btn btn-primary"`. Disable while pending.

## Accessibility

- Pair `aria-describedby={errors.X ? 'X-error' : undefined}` on the input with a matching `id="X-error"` on the error `<p>`.
- Set `aria-invalid` on the input when an error is present.
- Use `noValidate` on `<form>` so the browser's native bubble doesn't fight RHF's messages.
- Form-level alerts use `role="alert"` so screen readers announce them immediately.
- Decorative icons get `aria-hidden="true"`.

## Returning errors from the action

Pick the shape that matches what to show:

- `{ formError: string }` -- one banner at the top of the form.
- `{ fieldErrors: Record<string, string> }` -- per-field messages, lifted back into RHF via `setError` (see template).
- `{ formError, fieldErrors }` -- both, when the failure is partly per-field and partly global (e.g. "email taken" on `email` plus a global "fix the issues below" banner).

On success: return `{ formError: null }` to let the UI clear, or `throw redirect('/somewhere')` from `react-router`.

## Pending state and optimistic UI

For optimistic UI, read `fetcher.formData` (FormData submissions) or track the last submitted JSON in component state, and render the expected result before the action resolves. See `react-router-framework-mode` → `references/pending-ui.md` for the full pattern.

## Multiple intents in one form

When one form dispatches to different action branches (save vs delete), include an `intent`:

```tsx
fetcher.submit(
    { intent: 'delete', ...data },
    { method: 'post', encType: 'application/json' },
);
```

Then branch on `parsed.data.intent` in the action.

## Don'ts

- Don't use `<Form>` from react-router for RHF-driven forms -- it navigates and bypasses `handleSubmit`.
- Don't replace `<fieldset>` / `<legend>` with `<label>`. Project convention is fieldset/legend.
- Don't omit `aria-describedby` + matching `id`. The error UI is only accessible when both are present.
- Don't validate only on the client. Re-run the same Zod schema in the action.
- Don't put DB calls directly in the action -- delegate to `app/models/*.server.ts` functions.
- Don't write `z.string().email()` -- Zod v4 uses `z.email()`.
- Don't import from `react-router-dom`. Everything ships from `react-router` in v7.
- Don't use DaisyUI v4 classes (`form-control`, `input-bordered`). v5 dropped them.

## See also

- `react-router-framework-mode` -- loaders, actions, route registration, redirects, error boundaries, optimistic UI.
- `app/middleware/auth.ts` -- gate a form's route with `authMiddleware`.
- `app/models/*.server.ts` -- where mutation logic lives.
