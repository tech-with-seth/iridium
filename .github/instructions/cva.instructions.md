# CVA (Class Variance Authority) Instructions

## Overview

CVA (Class Variance Authority) is a TypeScript-first library for building type-safe, variant-based UI components without requiring CSS-in-JS. This project uses CVA v1.0 (beta) integrated with Tailwind CSS 4 and DaisyUI 5.

## Configuration

### CVA Config (`app/cva.config.ts`)

```typescript
import { defineConfig } from 'cva';
import { twMerge } from 'tailwind-merge';

export const { cva, cx, compose } = defineConfig({
    hooks: {
        onComplete: (className) => twMerge(className),
    },
});
```

**Key Points:**

- `defineConfig()` creates a configured CVA instance
- `twMerge` hook automatically resolves Tailwind class conflicts
- Exports three utilities: `cva`, `cx`, `compose`
- Always import from `~/cva.config`, never directly from `cva` package

## Core Utilities

### `cva()` - Define Component Variants

Creates a variant configuration for a component. Returns a function that generates className strings based on props.

```typescript
import { cva } from '~/cva.config';

export const buttonVariants = cva({
    base: 'btn', // Always applied
    variants: {
        // Conditional classes
        variant: {
            outline: 'btn-outline',
            ghost: 'btn-ghost',
            link: 'btn-link',
        },
        status: {
            primary: 'btn-primary',
            error: 'btn-error',
        },
        size: {
            sm: 'btn-sm',
            md: 'btn-md',
            lg: 'btn-lg',
        },
    },
    defaultVariants: {
        // Defaults when props not provided
        status: 'primary',
        size: 'md',
    },
    compoundVariants: [
        // Multi-variant combinations
        {
            variant: 'outline',
            status: 'primary',
            class: 'border-2', // Applied when both conditions met
        },
    ],
});
```

#### CVA Configuration Schema

**`base`** (string)

- Classes always applied regardless of variants
- Use for component's foundational styles
- Example: `base: 'btn'` for DaisyUI button base class

**`variants`** (object)

- Define variant categories and their options
- Each key is a variant name (prop name)
- Each value is an object mapping option names to className strings
- Example: `size: { sm: 'btn-sm', lg: 'btn-lg' }`

**`defaultVariants`** (object, optional)

- Default values for variants when not specified in props
- Keys must match variant names
- Example: `{ status: 'primary', size: 'md' }`

**`compoundVariants`** (array, optional)

- Apply classes when multiple variant conditions are met
- Each object has variant conditions + `class` property
- Example: `{ variant: 'outline', status: 'error', class: 'border-2' }`

### `cx()` - Merge ClassNames

Merges multiple className strings with intelligent conflict resolution via `tailwind-merge`.

```typescript
import { cx } from '~/cva.config';

// Basic usage
const merged = cx('btn', 'btn-primary', className);

// With conditionals
const classes = cx(
    'btn',
    isActive && 'btn-active',
    error ? 'btn-error' : 'btn-primary',
    className  // Always last for user overrides
);

// With CVA variants
<button className={cx(buttonVariants({ size, status }), className)} />
```

**Key Points:**

- Automatically resolves Tailwind conflicts (e.g., `p-4 p-6` → `p-6`)
- Filters out falsy values (`false`, `null`, `undefined`)
- Always put user's `className` prop last for proper overrides
- Never use standard `clsx` or `cn()` - always use `cx()`

### `compose()` - Combine CVA Variants

Combines multiple CVA variant configurations into one. Useful for creating variant hierarchies or sharing common variants.

```typescript
import { cva, compose } from '~/cva.config';

// Base variants
const baseButton = cva({
    base: 'btn',
    variants: {
        size: { sm: 'btn-sm', md: 'btn-md' },
    },
});

// Extended variants
const iconButton = cva({
    variants: {
        icon: { true: 'btn-circle' },
    },
});

// Compose them
export const composedButton = compose(baseButton, iconButton);
```

## TypeScript Integration

### `VariantProps` - Extract Variant Types

Automatically generates TypeScript types from CVA configuration.

```typescript
import type { VariantProps } from 'cva';
import { cva } from '~/cva.config';

export const buttonVariants = cva({
    variants: {
        variant: { outline: 'btn-outline', ghost: 'btn-ghost' },
        status: { primary: 'btn-primary', error: 'btn-error' },
        size: { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' },
    },
    defaultVariants: { status: 'primary', size: 'md' },
});

// Auto-generated type from variants
interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    loading?: boolean;
}

// Resulting type:
// {
//   variant?: 'outline' | 'ghost';
//   status?: 'primary' | 'error';
//   size?: 'sm' | 'md' | 'lg';
//   loading?: boolean;
//   // + all HTMLButtonElement attributes
// }
```

**Key Points:**

- `VariantProps<typeof variantConfig>` extracts types from CVA config
- All variant props become optional (unless required by TypeScript)
- Extends native HTML element attributes for proper prop passthrough
- Works seamlessly with `defaultVariants`

## Component Pattern

### Standard Component Structure

```typescript
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

// 1. Define variants with CVA
export const componentVariants = cva({
    base: 'base-class',
    variants: {
        variant: { /* ... */ },
        status: { /* ... */ },
        size: { /* ... */ }
    },
    defaultVariants: {
        status: 'primary',
        size: 'md'
    }
});

// 2. Create props interface
interface ComponentProps
    extends React.HTMLAttributes<HTMLElement>,
        VariantProps<typeof componentVariants> {
    // Additional custom props
    customProp?: string;
}

// 3. Implement component
export function Component({
    variant,
    status,
    size,
    customProp,
    className,
    children,
    ...props
}: ComponentProps) {
    return (
        <element
            className={cx(
                componentVariants({ variant, status, size }),
                className
            )}
            {...props}
        >
            {children}
        </element>
    );
}
```

### Boolean Variants Pattern

For boolean modifiers (active, disabled, loading, etc.), use the `{ true: 'class' }` pattern:

```typescript
export const buttonVariants = cva({
    base: 'btn',
    variants: {
        // Boolean variants
        active: { true: 'btn-active' },
        disabled: { true: 'btn-disabled' },
        wide: { true: 'btn-wide' },
        block: { true: 'btn-block' },
        circle: { true: 'btn-circle' },
        square: { true: 'btn-square' }
    }
});

// Usage
<Button active wide>Click me</Button>
// Results in: className="btn btn-active btn-wide"
```

### Compound Variants Pattern

Apply classes when multiple variant conditions are met:

```typescript
export const cardVariants = cva({
    base: 'card',
    variants: {
        variant: { border: 'card-border', shadow: 'card-shadow' },
        padding: { sm: 'p-2', lg: 'p-6' },
    },
    compoundVariants: [
        {
            variant: 'border',
            padding: 'lg',
            class: 'border-2', // Applied only when both conditions met
        },
        {
            variant: ['border', 'shadow'], // Multiple options for same variant
            padding: 'sm',
            class: 'rounded-sm',
        },
    ],
});
```

## DaisyUI Integration

### Mapping DaisyUI Classes to Variants

DaisyUI provides semantic class names that map perfectly to CVA variants:

```typescript
export const buttonVariants = cva({
    base: 'btn', // DaisyUI base class
    variants: {
        // Map DaisyUI modifiers to variant options
        variant: {
            outline: 'btn-outline',
            ghost: 'btn-ghost',
            link: 'btn-link',
            dash: 'btn-dash',
            soft: 'btn-soft',
        },
        // DaisyUI semantic colors
        status: {
            neutral: 'btn-neutral',
            primary: 'btn-primary',
            secondary: 'btn-secondary',
            accent: 'btn-accent',
            info: 'btn-info',
            success: 'btn-success',
            warning: 'btn-warning',
            error: 'btn-error',
        },
        // DaisyUI sizes
        size: {
            xs: 'btn-xs',
            sm: 'btn-sm',
            md: 'btn-md',
            lg: 'btn-lg',
            xl: 'btn-xl',
        },
    },
    defaultVariants: {
        status: 'primary',
        size: 'md',
    },
});
```

**Naming Convention:**

- Variant prop: semantic name (e.g., `status`, `variant`, `size`)
- Variant values: match DaisyUI terminology (e.g., `primary`, `outline`, `lg`)
- Class names: exact DaisyUI classes (e.g., `btn-primary`, `btn-outline`)

### Accessing DaisyUI Documentation

Use the MCP tool to fetch DaisyUI component documentation:

```typescript
// In your development environment
mcp__daisyui__fetch_daisyui_documentation;

// Or search for specific components
mcp__daisyui__search_daisyui_documentation({ query: 'button variants' });
```

## Best Practices

### ✅ Do's

1. **Always import from config**

    ```typescript
    import { cva, cx } from '~/cva.config'; // ✅ Correct
    import { cva } from 'cva'; // ❌ Wrong
    ```

2. **Use VariantProps for type extraction**

    ```typescript
    interface Props extends VariantProps<typeof variants> {} // ✅
    ```

3. **Put className prop last in cx()**

    ```typescript
    cx(variants({ size }), className); // ✅ User can override
    cx(className, variants({ size })); // ❌ Variants override user
    ```

4. **Extend native HTML attributes**

    ```typescript
    interface ButtonProps
        extends React.ButtonHTMLAttributes<HTMLButtonElement>,
            VariantProps<typeof buttonVariants> {} // ✅
    ```

5. **Destructure variant props explicitly**

    ```typescript
    function Button({ variant, status, size, className, ...props }: ButtonProps) {
        return (
            <button
                className={cx(buttonVariants({ variant, status, size }), className)}
                {...props}
            />
        );
    }
    ```

6. **Use defaultVariants for common cases**

    ```typescript
    defaultVariants: {
        status: 'primary',  // Most buttons are primary
        size: 'md'          // Medium is standard size
    }
    ```

7. **Use boolean variants for toggles**
    ```typescript
    variants: {
        active: { true: 'btn-active' },
        disabled: { true: 'btn-disabled' }
    }
    ```

### ❌ Don'ts

1. **Don't use cn() or clsx()**

    ```typescript
    import { cn } from '~/lib/utils'; // ❌ Wrong
    import { cx } from '~/cva.config'; // ✅ Correct
    ```

2. **Don't skip VariantProps**

    ```typescript
    interface Props {
        variant?: 'outline' | 'ghost'; // ❌ Manual typing
    }
    // ✅ Use VariantProps instead
    ```

3. **Don't hardcode DaisyUI classes**

    ```typescript
    <button className="btn btn-primary" />  // ❌ Not variant-based
    <Button status="primary" />             // ✅ Uses variants
    ```

4. **Don't bypass type system**

    ```typescript
    <Button status="custom" />  // ❌ TypeScript error - good!
    ```

5. **Don't create variants without base**

    ```typescript
    cva({ variants: { ... } })              // ❌ No base class
    cva({ base: 'btn', variants: { ... } }) // ✅ Has base
    ```

6. **Don't forget to handle className prop**
    ```typescript
    function Button({ variant }: Props) {
        return <button className={buttonVariants({ variant })} />;  // ❌ No user override
    }
    // ✅ Always include className in props and cx()
    ```

## Troubleshooting

### TypeScript Errors

**Error: Type 'X' is not assignable to type 'Y'**

- Check that variant values match CVA configuration exactly
- Ensure `VariantProps<typeof variants>` is used
- Verify `defaultVariants` keys match `variants` keys

**Error: Property 'variant' does not exist**

- Make sure interface extends `VariantProps<typeof variantConfig>`
- Check that variants are defined in CVA config

### Style Conflicts

**Classes not applying as expected**

- Ensure `twMerge` is configured in `defineConfig` hooks
- Check that `cx()` is used, not `clsx()` or `cn()`
- Verify className prop is last in `cx()` call

**DaisyUI classes not working**

- Confirm exact DaisyUI class names (check docs)
- Verify DaisyUI is installed and configured
- Check Tailwind config includes DaisyUI plugin

### Component Issues

**Variants not updating**

- Ensure variant props are destructured and passed to `variants()`
- Check that component re-renders on prop changes
- Verify no prop name conflicts with HTML attributes

**Custom className ignored**

- Make sure `className` prop is passed to `cx()`
- Check that `className` is last parameter in `cx()`
- Verify `...props` is spread on the element

## Examples

### Complete Button Component

```typescript
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const buttonVariants = cva({
    base: 'btn',
    variants: {
        variant: {
            outline: 'btn-outline',
            ghost: 'btn-ghost',
            link: 'btn-link'
        },
        status: {
            primary: 'btn-primary',
            secondary: 'btn-secondary',
            error: 'btn-error'
        },
        size: {
            sm: 'btn-sm',
            md: 'btn-md',
            lg: 'btn-lg'
        },
        wide: { true: 'btn-wide' },
        block: { true: 'btn-block' }
    },
    defaultVariants: {
        status: 'primary',
        size: 'md'
    },
    compoundVariants: [
        {
            variant: 'outline',
            status: 'error',
            class: 'border-2'
        }
    ]
});

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    loading?: boolean;
}

export function Button({
    variant,
    status,
    size,
    wide,
    block,
    loading,
    className,
    children,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cx(
                buttonVariants({ variant, status, size, wide, block }),
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="loading loading-spinner" />
            ) : (
                children
            )}
        </button>
    );
}
```

### Form Input with CVA

```typescript
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const inputVariants = cva({
    base: 'input w-full',
    variants: {
        size: {
            xs: 'input-xs',
            sm: 'input-sm',
            md: 'input-md',
            lg: 'input-lg'
        },
        color: {
            primary: 'input-primary',
            error: 'input-error',
            success: 'input-success'
        },
        ghost: { true: 'input-ghost' }
    },
    defaultVariants: {
        size: 'md'
    }
});

interface TextInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'>,
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
    color,
    ghost,
    className,
    ...props
}: TextInputProps) {
    return (
        <div className="form-control w-full">
            {label && (
                <label className="label">
                    <span className="label-text">{label}</span>
                </label>
            )}
            <input
                className={cx(
                    inputVariants({
                        size,
                        color: error ? 'error' : color,
                        ghost
                    }),
                    className
                )}
                {...props}
            />
            {(error || helperText) && (
                <label className="label">
                    <span className={cx(
                        'label-text-alt',
                        error && 'text-error'
                    )}>
                        {error || helperText}
                    </span>
                </label>
            )}
        </div>
    );
}
```

## Reference Implementation

See `app/components/Button.tsx` for the canonical CVA implementation pattern used throughout this codebase.
