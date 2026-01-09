---
name: create-component
description: Create CVA + DaisyUI components following Iridium patterns. Use when asked to create UI components, buttons, inputs, cards, modals, alerts, or any reusable UI element.
---

# Create Component

## When to Use

- Creating new UI components (buttons, inputs, cards, modals)
- Building form elements with labels and error states
- User asks to "add a component" or "create a component"

## Critical Rules

### 1. Always Import from CVA Config

```tsx
// CORRECT
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

// WRONG
import { cva } from 'cva';  // Wrong package
import { cn } from '~/lib/utils';  // Wrong utility
```

### 2. className Last in cx()

```tsx
className={cx(buttonVariants({ size, status }), className)}  // className always last
```

## Quick Start

```tsx
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const buttonVariants = cva({
    base: 'btn',
    variants: {
        status: {
            primary: 'btn-primary',
            secondary: 'btn-secondary',
        },
        size: {
            sm: 'btn-sm',
            md: 'btn-md',
            lg: 'btn-lg',
        },
    },
    defaultVariants: {
        status: 'primary',
        size: 'md',
    },
});

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    loading?: boolean;
}

export function Button({ status, size, className, children, ...props }: ButtonProps) {
    return (
        <button className={cx(buttonVariants({ status, size }), className)} {...props}>
            {children}
        </button>
    );
}
```

## Component Directories

| Category | Directory | Examples |
|----------|-----------|----------|
| Actions | `app/components/actions/` | Button |
| Data Display | `app/components/data-display/` | Card, Badge |
| Data Input | `app/components/data-input/` | TextInput, Select |
| Feedback | `app/components/feedback/` | Alert, Modal |
| Layout | `app/components/layout/` | Container |

## Checklist

1. [ ] Create in appropriate category directory
2. [ ] Define CVA variants with `base`, `variants`, `defaultVariants`
3. [ ] Extend native HTML attributes in props interface
4. [ ] Put `className` last in `cx()` call
5. [ ] Add JSDoc with usage example

## Templates

- [Component Template](./templates/component.tsx)
- [Form Input Template](./templates/form-input.tsx)

## Full Reference

See `.github/instructions/component-patterns.instructions.md` and `.github/instructions/cva.instructions.md` for:
- Form component patterns
- Boolean variants
- Compound variants
- DaisyUI class reference
