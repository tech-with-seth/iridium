# Component Patterns

This document defines the canonical patterns for building UI components in Iridium.

## Quick Reference

| Pattern | Example | Key Features |
|---------|---------|--------------|
| Action Component | `Button.tsx` | Loading state, variant/status/size |
| Form Input | `TextInput.tsx` | Label, error, helperText, required |
| Data Display | `Badge.tsx`, `Card.tsx` | Read-only, semantic variants |
| Feedback | `Alert.tsx`, `Loading.tsx` | Status-based styling |
| Layout | `Container.tsx` | Structural, minimal variants |

## Core Architecture

All components follow the **CVA + DaisyUI** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    Component Structure                       │
├─────────────────────────────────────────────────────────────┤
│  1. CVA Variants    → Type-safe variant definitions         │
│  2. Props Interface → Extends HTML attrs + VariantProps     │
│  3. JSDoc Comment   → Usage examples + DaisyUI link         │
│  4. Component       → Renders with cx() class merging       │
└─────────────────────────────────────────────────────────────┘
```

## 1. Action Component Pattern (Button)

The `Button` component is the canonical reference for action components.

```typescript
// app/components/actions/Button.tsx
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

// 1. Define CVA variants with DaisyUI classes
export const buttonVariants = cva({
    base: 'btn',
    variants: {
        variant: {
            outline: 'btn-outline',
            dash: 'btn-dash',
            soft: 'btn-soft',
            ghost: 'btn-ghost',
            link: 'btn-link',
        },
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
        size: {
            sm: 'btn-sm',
            md: 'btn-md',
            lg: 'btn-lg',
            xl: 'btn-xl',
        },
        // Boolean modifiers
        active: { true: 'btn-active' },
        disabled: { true: 'btn-disabled' },
        wide: { true: 'btn-wide' },
        block: { true: 'btn-block' },
        circle: { true: 'btn-circle' },
        square: { true: 'btn-square' },
    },
    defaultVariants: {
        size: 'md',
    },
});

// 2. Props interface extends HTML attributes + CVA variants
interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    loading?: boolean;
}

// 3. JSDoc with examples and DaisyUI link
/**
 * Primary UI button component with multiple variants, sizes, and states.
 *
 * @example
 * ```tsx
 * <Button variant="outline" status="primary" size="lg">
 *   Click me
 * </Button>
 * <Button loading>Loading...</Button>
 * <Button status="error" variant="soft">Delete</Button>
 * ```
 *
 * @see {@link https://daisyui.com/components/button/ DaisyUI Button Documentation}
 */
export function Button({
    active,
    block,
    children,
    circle,
    className,
    disabled,
    loading,
    size,
    square,
    status,
    type = 'button',
    variant,
    wide,
    ...props
}: ButtonProps) {
    // Combine disabled states
    const resolvedDisabled = Boolean(disabled || loading);

    return (
        <button
            type={type}
            disabled={resolvedDisabled}
            className={cx(
                buttonVariants({
                    active,
                    block,
                    circle,
                    disabled: resolvedDisabled,
                    size,
                    square,
                    status,
                    variant,
                    wide,
                }),
                className,
            )}
            {...props}
        >
            {loading ? (
                <span className="loading loading-spinner loading-md"></span>
            ) : (
                children
            )}
        </button>
    );
}
```

### Key Features

- **Loading state**: Shows spinner, disables button
- **Type default**: Defaults to `"button"` (not `"submit"`)
- **Boolean variants**: `active`, `wide`, `block`, `circle`, `square`
- **Status colors**: All DaisyUI semantic colors
- **Native attributes**: Full passthrough via `...props`

## 2. Form Input Pattern (TextInput)

Form components add label, error, and helper text support.

```typescript
// app/components/data-input/TextInput.tsx
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const textInputVariants = cva({
    base: 'input',
    variants: {
        variant: {
            ghost: 'input-ghost',
        },
        color: {
            neutral: 'input-neutral',
            primary: 'input-primary',
            secondary: 'input-secondary',
            accent: 'input-accent',
            info: 'input-info',
            success: 'input-success',
            warning: 'input-warning',
            error: 'input-error',
        },
        size: {
            xs: 'input-xs',
            sm: 'input-sm',
            md: 'input-md',
            lg: 'input-lg',
            xl: 'input-xl',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

// Note: Omit conflicting HTML attributes
interface TextInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'>,
        VariantProps<typeof textInputVariants> {
    label?: React.ReactNode;
    labelClassName?: string;
    error?: string;
    helperText?: string;
}

/**
 * Text input field with label, error states, and helper text support.
 *
 * @example
 * ```tsx
 * <TextInput
 *   label="Email"
 *   type="email"
 *   placeholder="user@example.com"
 *   required
 * />
 * <TextInput
 *   label="Username"
 *   error="Username is already taken"
 *   helperText="3-20 characters"
 * />
 * ```
 *
 * @see {@link https://daisyui.com/components/input/ DaisyUI Input Documentation}
 */
export function TextInput({
    label,
    error,
    helperText,
    required,
    disabled,
    size,
    color,
    variant,
    className,
    labelClassName,
    ...props
}: TextInputProps) {
    return (
        <label className={cx('flex flex-col gap-1', labelClassName)}>
            {label && (
                <span className="text-sm font-medium">
                    {label}
                    {required && <span className="text-error ml-1">*</span>}
                </span>
            )}

            <input
                disabled={disabled}
                required={required}
                className={cx(
                    textInputVariants({
                        size,
                        color: error ? 'error' : color,
                        variant,
                    }),
                    className,
                )}
                {...props}
            />

            {(error || helperText) && (
                <span
                    className={cx(
                        'text-xs',
                        error ? 'text-error' : 'text-base-content/70',
                    )}
                >
                    {error || helperText}
                </span>
            )}
        </label>
    );
}
```

### Form Component Requirements

| Feature | Implementation |
|---------|----------------|
| Label | Optional `label` prop with required indicator (`*`) |
| Error state | `error` prop overrides color to `error` |
| Helper text | Shows when no error present |
| Required indicator | Red asterisk next to label |
| Disabled state | Native `disabled` attribute |
| Attribute conflicts | Use `Omit<>` for `size`, `color` |

## 3. Data Display Pattern (Badge)

Read-only components for displaying information.

```typescript
// app/components/data-display/Badge.tsx
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const badgeVariants = cva({
    base: 'badge',
    variants: {
        variant: {
            outline: 'badge-outline',
            dash: 'badge-dash',
            soft: 'badge-soft',
            ghost: 'badge-ghost',
        },
        status: {
            neutral: 'badge-neutral',
            primary: 'badge-primary',
            secondary: 'badge-secondary',
            accent: 'badge-accent',
            info: 'badge-info',
            success: 'badge-success',
            warning: 'badge-warning',
            error: 'badge-error',
        },
        size: {
            xs: 'badge-xs',
            sm: 'badge-sm',
            md: 'badge-md',
            lg: 'badge-lg',
            xl: 'badge-xl',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof badgeVariants> {}

/**
 * Badge component for labels, counts, and status indicators.
 *
 * @see {@link https://daisyui.com/components/badge/ DaisyUI Badge Documentation}
 */
export function Badge({
    variant,
    status,
    size,
    className,
    children,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cx(badgeVariants({ variant, status, size }), className)}
            {...props}
        >
            {children}
        </span>
    );
}
```

## 4. Feedback Pattern (Alert)

Status-based components for user feedback.

```typescript
// app/components/feedback/Alert.tsx
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const alertVariants = cva({
    base: 'alert',
    variants: {
        variant: {
            outline: 'alert-outline',
            dash: 'alert-dash',
            soft: 'alert-soft',
        },
        status: {
            info: 'alert-info',
            success: 'alert-success',
            warning: 'alert-warning',
            error: 'alert-error',
        },
    },
    defaultVariants: {
        status: 'info',
    },
});

interface AlertProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof alertVariants> {
    icon?: React.ReactNode;
}

/**
 * Alert component for displaying messages and notifications.
 *
 * @see {@link https://daisyui.com/components/alert/ DaisyUI Alert Documentation}
 */
export function Alert({
    variant,
    status,
    icon,
    className,
    children,
    ...props
}: AlertProps) {
    return (
        <div
            role="alert"
            className={cx(alertVariants({ variant, status }), className)}
            {...props}
        >
            {icon}
            <span>{children}</span>
        </div>
    );
}
```

## 5. Layout Pattern (Container)

Structural components with minimal variants.

```typescript
// app/components/layout/Container.tsx
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const containerVariants = cva({
    base: 'mx-auto px-4',
    variants: {
        size: {
            sm: 'max-w-screen-sm',
            md: 'max-w-screen-md',
            lg: 'max-w-screen-lg',
            xl: 'max-w-screen-xl',
            full: 'max-w-full',
        },
    },
    defaultVariants: {
        size: 'lg',
    },
});

interface ContainerProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof containerVariants> {}

/**
 * Container component for consistent page width and padding.
 */
export function Container({
    size,
    className,
    children,
    ...props
}: ContainerProps) {
    return (
        <div
            className={cx(containerVariants({ size }), className)}
            {...props}
        >
            {children}
        </div>
    );
}
```

## Variant Categories

### Standard Variant Names

| Category | Values | Use Case |
|----------|--------|----------|
| `variant` | outline, dash, soft, ghost, link | Visual style |
| `status` | neutral, primary, secondary, accent, info, success, warning, error | Semantic meaning |
| `color` | Same as status | Alternative name for inputs |
| `size` | xs, sm, md, lg, xl | Component size |

### Boolean Modifiers

```typescript
variants: {
    active: { true: 'btn-active' },
    disabled: { true: 'btn-disabled' },
    wide: { true: 'btn-wide' },
    block: { true: 'btn-block' },
    circle: { true: 'btn-circle' },
    square: { true: 'btn-square' },
}
```

Usage: `<Button wide block>Full Width</Button>`

## JSDoc Standards

Every exported component must have JSDoc with:

1. **Description**: What the component does
2. **@example**: At least one usage example
3. **@see**: Link to DaisyUI documentation

```typescript
/**
 * Primary UI button component with multiple variants, sizes, and states.
 *
 * @example
 * ```tsx
 * <Button variant="outline" status="primary">Click me</Button>
 * ```
 *
 * @see {@link https://daisyui.com/components/button/ DaisyUI Button Documentation}
 */
```

## Component Directory Structure

```
app/components/
├── actions/           # Interactive elements
│   ├── Button.tsx
│   └── Modal.tsx
├── data-display/      # Read-only display
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   └── Table.tsx
├── data-input/        # Form elements
│   ├── Checkbox.tsx
│   ├── Select.tsx
│   ├── TextInput.tsx
│   └── Textarea.tsx
├── feedback/          # User feedback
│   ├── Alert.tsx
│   ├── Loading.tsx
│   └── Tooltip.tsx
├── layout/            # Structural
│   ├── Container.tsx
│   ├── Drawer.tsx
│   └── Header.tsx
├── navigation/        # Navigation
│   ├── Navbar.tsx
│   └── Tabs.tsx
└── index.ts           # Barrel exports
```

## Import Patterns

```typescript
// CVA utilities - ALWAYS from ~/cva.config
import { cva, cx } from '~/cva.config';
import type { VariantProps } from 'cva';

// ❌ NEVER import from 'cva' package directly
import { cva } from 'cva';  // WRONG!
```

## Testing Components

```typescript
// app/components/actions/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
    it('renders with default props', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('applies variant classes', () => {
        render(<Button variant="outline" status="primary">Test</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('btn-outline', 'btn-primary');
    });

    it('shows loading spinner when loading', () => {
        render(<Button loading>Submit</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('calls onClick handler', async () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click</Button>);
        await userEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledOnce();
    });
});
```

## Accessibility Checklist

- [ ] Use semantic HTML elements (`<button>`, `<input>`, not `<div>`)
- [ ] Add `role` attribute when needed (`role="alert"`)
- [ ] Include `aria-label` for icon-only buttons
- [ ] Ensure disabled state is communicated (`disabled` attribute)
- [ ] Maintain focus visibility (DaisyUI handles this)
- [ ] Use proper heading hierarchy in cards/modals

## Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|------------------|
| `cn()` for class merging | Use `cx()` from `~/cva.config` |
| Import from `'cva'` package | Import from `~/cva.config` |
| Custom CSS over DaisyUI | Use DaisyUI classes |
| Missing TypeScript types | Extend HTML attributes + VariantProps |
| Hardcoded styles | Use CVA variants |
| Missing JSDoc | Add description, example, @see link |
| Using `div` for buttons | Use semantic `<button>` element |
| Forgetting `type="button"` | Default to `"button"` (not `"submit"`) |

## Creating New Components

1. **Choose category**: actions, data-display, data-input, feedback, layout, navigation
2. **Create file**: `app/components/[category]/ComponentName.tsx`
3. **Define CVA variants**: Start with `base`, add `variant`, `status`, `size`
4. **Create props interface**: Extend HTML attributes, add custom props
5. **Add JSDoc**: Description, example, DaisyUI link
6. **Implement component**: Use `cx()` for class merging
7. **Export from index**: Add to `app/components/index.ts`
8. **Write tests**: Cover variants, states, interactions
9. **Test in design route**: Verify at `/design`

## Further Reading

- [CVA Instructions](./cva.instructions.md) - Detailed CVA patterns
- [DaisyUI Instructions](./daisyui.instructions.md) - Component library reference
- [DaisyUI Documentation](https://daisyui.com/components/)
- [Component README](../../app/components/README.md) - Project component docs
