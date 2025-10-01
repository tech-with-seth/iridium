# Component Patterns

This document defines the canonical patterns for building UI components in this project.

## DaisyUI + CVA Component Pattern

All UI components should follow the pattern established in `app/components/Button.tsx`.

### Core Structure

Components use **CVA (Class Variance Authority)** for type-safe variant management with **DaisyUI** class names as the foundation.

```typescript
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

// 1. Define CVA variants
export const componentVariants = cva({
    base: 'daisy-component-class',
    variants: {
        variant: {
            outline: 'component-outline',
            dash: 'component-dash',
            soft: 'component-soft',
            ghost: 'component-ghost',
            link: 'component-link'
        },
        status: {
            neutral: 'component-neutral',
            primary: 'component-primary',
            secondary: 'component-secondary',
            accent: 'component-accent',
            info: 'component-info',
            success: 'component-success',
            warning: 'component-warning',
            error: 'component-error'
        },
        size: {
            xs: 'component-xs',
            sm: 'component-sm',
            md: 'component-md',
            lg: 'component-lg',
            xl: 'component-xl'
        }
    },
    defaultVariants: {
        status: 'primary',
        size: 'md'
    },
    compoundVariants: []
});

// 2. Props interface
interface ComponentProps
    extends React.HTMLAttributes<HTMLElement>,
        VariantProps<typeof componentVariants> {
    // Additional custom props
}

// 3. Component implementation
export function Component({
    variant,
    status,
    size,
    className,
    ...props
}: ComponentProps) {
    return (
        <element
            className={cx(
                componentVariants({
                    variant,
                    status,
                    size
                }),
                className
            )}
            {...props}
        />
    );
}
```

### Key Features

1. **CVA-based variants** using `cva()` from `~/cva.config`
2. **TypeScript interface** extending native HTML attributes + `VariantProps`
3. **className merging** using `cx()` utility (not `cn()`)
4. **DaisyUI class names** as the foundation for all styling
5. **Default variants** for common use cases
6. **Props destructuring** for clean variant application
7. **Passthrough of native HTML attributes** via `...props`

### DaisyUI Integration

- Access DaisyUI documentation via MCP tool: `mcp__daisyui__fetch_daisyui_documentation`
- Use DaisyUI class names for all base and variant styles
- Follow DaisyUI naming conventions for consistency

### Variant Categories

Common variant types to include:

- **variant/style**: Visual style variations (outline, dash, soft, ghost, link)
- **status/color**: Semantic colors (neutral, primary, secondary, accent, info, success, warning, error)
- **size**: Size variations (xs, sm, md, lg, xl)
- **Boolean modifiers**: Single-purpose flags (active, disabled, wide, block, circle, square)

### Form Component Standards

Form components should additionally include:

- **Label Support**: Optional label with required indicator (`*`)
- **Error States**: Error prop that changes styling and shows error text
- **Helper Text**: Optional helper text when no error is present
- **Disabled State**: Proper disabled styling and behavior

See `app/components/TextInput.tsx` for reference implementation.

### Reference Implementation

**Button Component** (`app/components/Button.tsx`) is the canonical reference for this pattern.

Key aspects demonstrated:
- Comprehensive variant support
- Clean props destructuring
- Custom loading state implementation
- Proper TypeScript typing
- Native HTML attribute passthrough

### Anti-Patterns to Avoid

- ❌ Using `cn()` instead of `cx()` for className merging
- ❌ Creating components without CVA variants
- ❌ Bypassing DaisyUI class names with custom CSS
- ❌ Not extending native HTML attributes
- ❌ Hardcoding styles instead of using variants
- ❌ Missing TypeScript types for props
