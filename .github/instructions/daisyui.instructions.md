# DaisyUI Component Library Instructions

## Overview

DaisyUI is a pure CSS component library built on Tailwind CSS. This project uses **DaisyUI 5** with **Tailwind CSS 4** and **CVA (Class Variance Authority)** for type-safe, variant-based components.

## Core Principles

### DaisyUI as the Foundation

- **DaisyUI provides CSS classes only** - no JavaScript, no React components
- **We create React components** that wrap DaisyUI classes with CVA variants
- **All styling comes from DaisyUI classes** - avoid custom Tailwind utilities unless necessary
- **Follow DaisyUI naming conventions** exactly as documented

### MCP Documentation Access

**ALWAYS use the MCP tools to access up-to-date DaisyUI documentation:**

```typescript
// Fetch entire documentation
mcp__daisyui__fetch_daisyui_documentation;

// Search for specific components or features
mcp__daisyui__search_daisyui_documentation({ query: 'button modifiers' });
mcp__daisyui__search_daisyui_documentation({ query: 'form input variants' });
mcp__daisyui__search_daisyui_documentation({ query: 'card component' });

// Search DaisyUI codebase
mcp__daisyui__search_daisyui_code({ query: 'btn-primary' });
```

**When to use MCP tools:**

- Before creating a new component, search for the DaisyUI component documentation
- When unsure about available modifiers or variants
- To verify exact class names and combinations
- To understand semantic color system and naming conventions

## DaisyUI Component Patterns

### Standard Component Structure

Every DaisyUI component follows this pattern:

1. **Base class** - The component name (e.g., `btn`, `input`, `card`)
2. **Modifier classes** - Variants that modify the base (e.g., `btn-primary`, `btn-lg`)
3. **Utility classes** - Additional Tailwind utilities if needed

### Common DaisyUI Components

#### Button Component Classes

```typescript
// Base class
'btn'

// Visual variants
'btn-outline'   // Outlined style
'btn-ghost'     // Transparent background
'btn-link'      // Link style
'btn-soft'      // Soft background
'btn-dash'      // Dashed outline

// Semantic colors
'btn-neutral'   'btn-primary'   'btn-secondary'  'btn-accent'
'btn-info'      'btn-success'   'btn-warning'    'btn-error'

// Sizes
'btn-xs'  'btn-sm'  'btn-md'  'btn-lg'  'btn-xl'

// Modifiers
'btn-wide'      // Extra wide
'btn-block'     // Full width
'btn-circle'    // Circular shape
'btn-square'    // Square shape
'btn-active'    // Active state
'btn-disabled'  // Disabled state
```

#### Input Component Classes

```typescript
// Base classes
'input'         // Standard input
'textarea'      // Textarea

// Variants
'input-bordered'  // With border
'input-ghost'     // Transparent style

// Semantic colors
'input-primary'   'input-secondary'  'input-accent'
'input-info'      'input-success'    'input-warning'  'input-error'

// Sizes
'input-xs'  'input-sm'  'input-md'  'input-lg'
```

#### Form Control Structure

```typescript
// Wrapper for form inputs
<div className="form-control">
  <label className="label">
    <span className="label-text">Label</span>
  </label>
  <input className="input input-bordered" />
  <label className="label">
    <span className="label-text-alt">Helper text</span>
  </label>
</div>
```

#### Select Component Classes

```typescript
'select'          // Base class
'select-bordered' // With border
'select-ghost'    // Transparent style

// Semantic colors
'select-primary'  'select-secondary'  'select-accent'
'select-info'     'select-success'    'select-warning'  'select-error'

// Sizes
'select-xs'  'select-sm'  'select-md'  'select-lg'
```

#### Checkbox & Radio Classes

```typescript
// Checkbox
'checkbox'
'checkbox-primary'  'checkbox-secondary'  'checkbox-accent'
'checkbox-xs'  'checkbox-sm'  'checkbox-md'  'checkbox-lg'

// Radio
'radio'
'radio-primary'  'radio-secondary'  'radio-accent'
'radio-xs'  'radio-sm'  'radio-md'  'radio-lg'
```

#### Range Component Classes

```typescript
'range'
'range-primary'  'range-secondary'  'range-accent'
'range-xs'  'range-sm'  'range-md'  'range-lg'
```

#### Toggle Component Classes

```typescript
'toggle'
'toggle-primary'  'toggle-secondary'  'toggle-accent'
'toggle-xs'  'toggle-sm'  'toggle-md'  'toggle-lg'
```

#### Card Component Classes

```typescript
'card'; // Base class
'card-bordered'; // With border
'card-compact'; // Compact padding
'card-normal'; // Normal padding
'card-side'; // Horizontal layout

// Child elements
'card-body'; // Content wrapper
'card-title'; // Title element
'card-actions'; // Actions footer
```

#### Modal Component Classes

```typescript
'modal'           // Base modal
'modal-open'      // Open state
'modal-box'       // Modal content box
'modal-action'    // Action buttons wrapper
'modal-backdrop'  // Background overlay

// Positions
'modal-top'  'modal-middle'  'modal-bottom'
```

#### Drawer Component Classes

```typescript
'drawer'; // Base drawer
'drawer-toggle'; // Checkbox for toggle
'drawer-side'; // Side panel
'drawer-content'; // Main content
'drawer-overlay'; // Background overlay

// Positions
'drawer-end'; // Right side
```

## Semantic Color System

DaisyUI uses a **semantic color system** with consistent naming across all components:

### Primary Color Variants

- `neutral` - Neutral/gray colors
- `primary` - Primary brand color
- `secondary` - Secondary brand color
- `accent` - Accent color for highlights
- `info` - Informational state (blue)
- `success` - Success state (green)
- `warning` - Warning state (yellow/orange)
- `error` - Error state (red)

### Applying Colors to Components

**Pattern:** `{component}-{color}`

```typescript
// Buttons
'btn-primary'  'btn-secondary'  'btn-accent'  'btn-error'

// Inputs
'input-primary'  'input-error'  'input-success'

// Badges
'badge-primary'  'badge-secondary'  'badge-accent'

// Alerts
'alert-info'  'alert-success'  'alert-warning'  'alert-error'
```

## Size System

DaisyUI provides a **consistent size scale** across components:

### Standard Sizes

- `xs` - Extra small
- `sm` - Small
- `md` - Medium (usually default)
- `lg` - Large
- `xl` - Extra large (available on some components)

### Applying Sizes to Components

**Pattern:** `{component}-{size}`

```typescript
// Buttons
'btn-xs'  'btn-sm'  'btn-md'  'btn-lg'  'btn-xl'

// Inputs
'input-xs'  'input-sm'  'input-md'  'input-lg'

// Badges
'badge-xs'  'badge-sm'  'badge-md'  'badge-lg'
```

## Creating DaisyUI + CVA Components

### Standard Pattern

**ALWAYS follow this pattern when creating DaisyUI components:**

```typescript
import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

// 1. Define CVA variants with DaisyUI classes
export const componentVariants = cva({
    base: 'daisy-component',  // DaisyUI base class
    variants: {
        variant: {
            outline: 'component-outline',
            ghost: 'component-ghost',
            // ... other DaisyUI style variants
        },
        status: {
            primary: 'component-primary',
            secondary: 'component-secondary',
            // ... semantic colors
        },
        size: {
            xs: 'component-xs',
            sm: 'component-sm',
            md: 'component-md',
            lg: 'component-lg',
            // ... sizes
        }
    },
    defaultVariants: {
        status: 'primary',
        size: 'md'
    }
});

// 2. Props interface
interface ComponentProps
    extends React.HTMLAttributes<HTMLElement>,
        VariantProps<typeof componentVariants> {
    // Custom props if needed
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
                componentVariants({ variant, status, size }),
                className
            )}
            {...props}
        />
    );
}
```

### Form Component Pattern

**Form components require additional structure:**

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
            secondary: 'input-secondary',
            error: 'input-error',
            success: 'input-success'
        },
        bordered: { true: 'input-bordered' },
        ghost: { true: 'input-ghost' }
    },
    defaultVariants: {
        size: 'md',
        bordered: true
    }
});

interface TextInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
        VariantProps<typeof inputVariants> {
    label?: string;
    required?: boolean;
    error?: string;
    helperText?: string;
}

export function TextInput({
    label,
    required,
    error,
    helperText,
    size,
    color,
    bordered,
    ghost,
    className,
    id,
    ...props
}: TextInputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="form-control w-full">
            {label && (
                <label htmlFor={inputId} className="label">
                    <span className="label-text">
                        {label}
                        {required && <span className="text-error ml-1">*</span>}
                    </span>
                </label>
            )}
            <input
                id={inputId}
                className={cx(
                    inputVariants({
                        size,
                        color: error ? 'error' : color,
                        bordered,
                        ghost
                    }),
                    className
                )}
                {...props}
            />
            {(error || helperText) && (
                <label className="label">
                    <span
                        className={cx(
                            'label-text-alt',
                            error && 'text-error'
                        )}
                    >
                        {error || helperText}
                    </span>
                </label>
            )}
        </div>
    );
}
```

## Component Development Workflow

### Before Creating a Component

1. **Search DaisyUI documentation** using MCP tools
2. **Identify the base class** (e.g., `btn`, `input`, `card`)
3. **List available modifiers** from DaisyUI docs
4. **Plan variant structure** (variant, status, size, boolean modifiers)
5. **Check existing components** for similar patterns

### Creating the Component

1. **Start with CVA variant definition** using DaisyUI classes
2. **Create TypeScript interface** extending HTML attributes + `VariantProps`
3. **Implement component** with proper prop destructuring
4. **Test variant combinations** to ensure correct class application
5. **Document usage** if component has complex variants

### Example: Creating a Badge Component

```typescript
// Step 1: Search DaisyUI docs
mcp__daisyui__search_daisyui_documentation({ query: "badge component" })

// Step 2: Define CVA variants based on DaisyUI classes
export const badgeVariants = cva({
    base: 'badge',
    variants: {
        variant: {
            outline: 'badge-outline',
            ghost: 'badge-ghost'
        },
        status: {
            neutral: 'badge-neutral',
            primary: 'badge-primary',
            secondary: 'badge-secondary',
            accent: 'badge-accent',
            info: 'badge-info',
            success: 'badge-success',
            warning: 'badge-warning',
            error: 'badge-error'
        },
        size: {
            xs: 'badge-xs',
            sm: 'badge-sm',
            md: 'badge-md',
            lg: 'badge-lg'
        }
    },
    defaultVariants: {
        status: 'neutral',
        size: 'md'
    }
});

// Step 3: Create interface and component
interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof badgeVariants> {}

export function Badge({
    variant,
    status,
    size,
    className,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cx(badgeVariants({ variant, status, size }), className)}
            {...props}
        />
    );
}
```

## Best Practices

### ✅ Do's

1. **Use MCP tools** to fetch DaisyUI documentation before creating components
2. **Follow DaisyUI naming** exactly as documented (e.g., `btn-primary` not `button-primary`)
3. **Use semantic colors** consistently (`primary`, `error`, `success`, etc.)
4. **Provide sensible defaults** via `defaultVariants`
5. **Extend native HTML attributes** for proper prop passthrough
6. **Use form-control wrapper** for form inputs with labels
7. **Support error states** in form components
8. **Include required indicators** (`*`) for required form fields
9. **Use cx() for className merging** (not `cn()` or `clsx()`)
10. **Document complex components** with usage examples

### ❌ Don'ts

1. **Don't bypass DaisyUI classes** with custom CSS
2. **Don't create custom color names** - use semantic system
3. **Don't hardcode DaisyUI classes** - use CVA variants
4. **Don't forget accessibility** - labels, ARIA attributes, semantic HTML
5. **Don't mix size scales** - stick to DaisyUI's xs/sm/md/lg/xl
6. **Don't import from wrong packages** - use `~/cva.config` not `cva` directly
7. **Don't create components without checking docs first** - use MCP tools
8. **Don't skip form-control wrapper** on form inputs
9. **Don't forget disabled states** in interactive components
10. **Don't use custom class names** when DaisyUI provides them

## Troubleshooting

### Component Not Styling Correctly

1. **Verify base class** - Check DaisyUI docs for correct base class name
2. **Check modifier syntax** - Ensure `{component}-{modifier}` pattern
3. **Confirm DaisyUI version** - This project uses DaisyUI 5
4. **Test without CVA** - Try hardcoded classes first to isolate issue
5. **Check Tailwind config** - Ensure DaisyUI plugin is configured

### Missing Variants

1. **Search DaisyUI docs** - Use MCP tools to find available modifiers
2. **Check version compatibility** - Some modifiers are version-specific
3. **Verify class names** - Typos in DaisyUI class names fail silently

### Form Components Not Working

1. **Ensure form-control wrapper** - Required for DaisyUI form styling
2. **Check label structure** - Use `label` with `label-text` span
3. **Verify input attributes** - `id` should match `htmlFor` on label
4. **Test error states** - Error prop should apply `input-error` class

## Reference Implementations

### Canonical Components

- **Button**: `app/components/Button.tsx` - Complete button implementation
- **TextInput**: `app/components/TextInput.tsx` - Form input with label/error
- **Select**: `app/components/Select.tsx` - Select dropdown with variants
- **Checkbox**: `app/components/Checkbox.tsx` - Checkbox with label
- **Range**: `app/components/Range.tsx` - Range slider implementation
- **Textarea**: `app/components/Textarea.tsx` - Textarea with form-control

### Documentation References

- **Component Patterns**: `.github/instructions/component-patterns.instructions.md`
- **CVA Configuration**: `.github/instructions/cva.instructions.md`
- **Project Architecture**: `AGENTS.md`

## AI Assistant Guidelines

When working with DaisyUI components:

1. **ALWAYS search DaisyUI docs first** using MCP tools before creating components
2. **Follow the canonical pattern** established in `Button.tsx` and documented in `component-patterns.instructions.md`
3. **Use exact DaisyUI class names** from documentation - don't guess or approximate
4. **Suggest running MCP tools** when user asks about component capabilities
5. **Reference existing components** when similar patterns exist
6. **Remind about form-control wrapper** for form components
7. **Verify semantic color usage** matches DaisyUI's system
8. **Check size scale** matches DaisyUI's standard sizes
9. **Include accessibility features** (labels, ARIA, semantic HTML)
10. **Test variant combinations** mentally before suggesting code
