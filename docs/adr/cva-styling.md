# CVA for Component Variants

**Status**: Accepted

**Date**: 2025-01-15

## Context

React component libraries need a way to manage styling variants (sizes, colors, states, etc.). Options considered:

1. **Inline Ternaries**: `className={size === 'lg' ? 'text-lg' : 'text-sm'}`
2. **classnames/clsx**: `className={clsx('btn', isLarge && 'btn-lg')}`
3. **Tailwind Variants (TV)**: Popular but adds extra dependency
4. **CVA (Class Variance Authority)**: Type-safe variant management
5. **Styled Components**: CSS-in-JS approach

Requirements:
- Type-safe variants
- DaisyUI integration
- Composable variants
- Class name merging (avoid conflicts)
- Minimal bundle size

## Decision

Use **CVA (Class Variance Authority)** configured with `tailwind-merge` for component variant management.

Configuration in `app/cva.config.ts`:
```typescript
import { compose } from 'cva';
import { twMerge } from 'tailwind-merge';

export { cva, compose, type VariantProps } from 'cva';
export const cx = compose(twMerge);
```

Pattern:
```typescript
export const buttonVariants = cva({
  base: 'btn',
  variants: {
    status: {
      primary: 'btn-primary',
      error: 'btn-error'
    },
    size: {
      sm: 'btn-sm',
      lg: 'btn-lg'
    }
  },
  defaultVariants: {
    status: 'primary',
    size: 'md'
  }
});
```

## Consequences

### Positive

- **Type Safety**: TypeScript knows all valid variant combinations
- **DRY**: Variants defined once, reused everywhere
- **Composable**: `compose()` allows combining multiple CVAs
- **Class Merging**: `cx()` with `tailwind-merge` prevents class conflicts
- **IntelliSense**: Full autocomplete for variant props
- **DaisyUI Compatible**: Works perfectly with DaisyUI classes
- **Small Bundle**: Minimal runtime overhead
- **Standards**: Using beta.cva.style (newer API)

### Negative

- **Learning Curve**: Team must learn CVA patterns
- **Extra Config**: Requires setup in `cva.config.ts`
- **Beta Version**: Using CVA beta (1.0.0-beta.4) - API may change
- **Not Pure Tailwind**: Adds abstraction layer over Tailwind

### Neutral

- **Replaces cn()**: Uses `cx()` instead of traditional `cn()` utility
- **Framework Agnostic**: CVA works with any framework
- **DaisyUI Integration**: Complements (not replaces) DaisyUI component classes
