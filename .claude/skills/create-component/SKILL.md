---
name: create-component
description: Create CVA + DaisyUI components following Iridium patterns. Use when asked to create UI components, buttons, inputs, cards, modals, alerts, or any reusable UI element.
---

# Create Component

Creates type-safe, variant-based UI components using CVA (Class Variance Authority) with DaisyUI styling.

## When to Use

- Creating new UI components (buttons, inputs, cards, modals, etc.)
- Building form elements with labels and error states
- Creating layout components with variants
- User asks to "add a component" or "create a component"

## Critical Patterns

### 1. Always Import from CVA Config

```tsx
// ✅ CORRECT
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

// ❌ NEVER
import { cva } from 'cva';  // Wrong package
import { cn } from '~/lib/utils';  // Wrong utility
```

### 2. CVA Structure

```tsx
export const componentVariants = cva({
    base: 'daisy-base-class',
    variants: {
        variant: {
            outline: 'component-outline',
            ghost: 'component-ghost',
        },
        status: {
            primary: 'component-primary',
            error: 'component-error',
        },
        size: {
            sm: 'component-sm',
            md: 'component-md',
            lg: 'component-lg',
        },
        // Boolean variants
        wide: { true: 'component-wide' },
        block: { true: 'component-block' },
    },
    defaultVariants: {
        status: 'primary',
        size: 'md',
    },
});
```

### 3. Props Interface

```tsx
interface ComponentProps
    extends React.HTMLAttributes<HTMLElement>,
        VariantProps<typeof componentVariants> {
    // Additional custom props
    loading?: boolean;
}
```

### 4. Component Implementation

```tsx
export function Component({
    variant,
    status,
    size,
    wide,
    block,
    className,
    children,
    ...props
}: ComponentProps) {
    return (
        <element
            className={cx(
                componentVariants({ variant, status, size, wide, block }),
                className  // Always last for user overrides
            )}
            {...props}
        >
            {children}
        </element>
    );
}
```

### 5. JSDoc Documentation

```tsx
/**
 * Brief description of component purpose.
 *
 * @example
 * ```tsx
 * <Component variant="outline" status="primary" size="lg">
 *   Content
 * </Component>
 * ```
 *
 * @see {@link https://daisyui.com/components/component/ DaisyUI Documentation}
 */
```

## Component Categories

Place components in the appropriate directory:

| Category | Directory | Examples |
|----------|-----------|----------|
| Actions | `app/components/actions/` | Button, IconButton |
| Data Display | `app/components/data-display/` | Card, Table, Badge |
| Data Input | `app/components/data-input/` | TextInput, Select, Checkbox |
| Feedback | `app/components/feedback/` | Alert, Toast, Modal, Loading |
| Layout | `app/components/layout/` | Container, Grid, Divider |
| Navigation | `app/components/navigation/` | Navbar, Breadcrumb, Tabs |

## Form Component Pattern

Form components should include:

```tsx
interface TextInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
        VariantProps<typeof inputVariants> {
    label?: string;
    error?: string;
    helperText?: string;
}

export function TextInput({
    label,
    error,
    helperText,
    size,
    className,
    required,
    ...props
}: TextInputProps) {
    return (
        <div className="form-control w-full">
            {label && (
                <label className="label">
                    <span className="label-text">
                        {label}
                        {required && <span className="text-error ml-1">*</span>}
                    </span>
                </label>
            )}
            <input
                className={cx(
                    inputVariants({ size, color: error ? 'error' : undefined }),
                    className
                )}
                {...props}
            />
            {(error || helperText) && (
                <label className="label">
                    <span className={cx('label-text-alt', error && 'text-error')}>
                        {error || helperText}
                    </span>
                </label>
            )}
        </div>
    );
}
```

## Anti-Patterns

- ❌ Using `cn()` instead of `cx()` for className merging
- ❌ Importing from `cva` package directly instead of `~/cva.config`
- ❌ Creating components without CVA variants
- ❌ Not extending native HTML attributes
- ❌ Hardcoding styles instead of using variants
- ❌ Missing TypeScript types for props
- ❌ Forgetting to export the variants for reuse
- ❌ Not putting `className` last in `cx()` call

## After Creating

1. Export the component from `app/components/index.ts` if it's a general-use component
2. Add JSDoc with examples
3. Consider adding to Storybook if available

## Templates

- [Component Template](./templates/component.tsx)
- [Form Input Template](./templates/form-input.tsx)

## Examples

- [Button Example](./examples/button.tsx)
- [TextInput Example](./examples/text-input.tsx)

## Full Reference

See `.github/instructions/component-patterns.instructions.md` and `.github/instructions/cva.instructions.md` for comprehensive documentation.
