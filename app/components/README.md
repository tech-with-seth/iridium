# Component Library

A comprehensive collection of UI components built with DaisyUI 5, Tailwind CSS 4, and CVA (Class Variance Authority) for type-safe variant management.

## Organization

Components are organized by their primary function:

### 🎬 Actions (`actions/`)

Interactive elements that trigger user actions

- **Button** - Primary UI button with multiple variants and states
- **Modal** - Dialog/popup overlays

### 📊 Data Display (`data-display/`)

Components for presenting information to users

- **Accordion** - Collapsible content panels
- **Avatar** - User profile images/placeholders
- **Badge** - Status indicators and labels
- **Card** - Content containers with optional images/actions
- **ChatBubble** - Message bubbles for chat interfaces
- **ComparisonBars** - Side-by-side comparison visualization
- **Diff** - Side-by-side content comparison
- **DonutProgress** - Circular progress indicator
- **HoverCard** - Hover-triggered content overlay
- **Stats** - Statistical data display
- **Table** - Tabular data presentation
- **Timeline** - Chronological event display

#### Feature-Specific Components (`data-display/features/`)

Business logic components built on top of primitives:

- **ConversionMetricsToolCard** - Conversion metrics dashboard widget
- **ProductMetricsToolCard** - Product analytics display
- **RevenueMetricsToolCard** - Revenue statistics card
- **RevenueTrendChart** - Revenue trend visualization
- **RevenueTrendToolCard** - Revenue trend widget

### 📝 Data Input (`data-input/`)

Form elements for user input

- **Checkbox** - Boolean selection input
- **FileInput** - File upload control
- **Radio** - Single-choice selection
- **Range** - Slider input
- **Select** - Dropdown selection
- **Textarea** - Multi-line text input
- **TextInput** - Single-line text input with label/error support
- **Toggle** - Switch/toggle control

### 💬 Feedback (`feedback/`)

Components that provide user feedback

- **Alert** - Important message displays
- **Loading** - Loading state indicators
- **Tooltip** - Contextual hover information

### 📐 Layout (`layout/`)

Page structure and organization components

- **Container** - Content width wrapper
- **Drawer** - Slide-out side panel
- **Footer** - Page footer
- **Header** - Page header
- **Hero** - Large banner/hero section

### 🧭 Navigation (`navigation/`)

Navigation and routing components

- **Navbar** - Top navigation bar
- **Tabs** - Tabbed content navigation

### 🔌 Providers (`providers/`)

React context providers

- **PostHogProvider** - Analytics integration

### 🛠️ Utilities (`utilities/`)

Helper components and utilities

- **AdminPanel** - Admin dashboard component
- **ConditionalWrapper** - Conditional component wrapper
- **FlagsList** - Feature flags display
- **PolarLogo** - Polar.sh branding
- **ThemeSwitcher** - Theme toggle control
- **Turnstile** - CAPTCHA integration

## Usage Patterns

### Basic Import

```typescript
// Import from category
import { Button } from '~/components/actions';
import { Badge, Card } from '~/components/data-display';
import { TextInput } from '~/components/data-input';

// Or import from root barrel
import { Button, Badge, Card, TextInput } from '~/components';
```

### Component with Variants (CVA Pattern)

```tsx
import { Button } from '~/components/actions';

<Button
  variant="outline"
  status="primary"
  size="lg"
  loading={isSubmitting}
>
  Submit
</Button>
```

### Form Components with Validation

```tsx
import { TextInput } from '~/components/data-input';

<TextInput
  label="Email"
  type="email"
  placeholder="user@example.com"
  error={errors.email?.message}
  helperText="We'll never share your email"
  required
/>
```

### Composite Components

```tsx
import { Card, Badge, Button } from '~/components';

<Card
  title={
    <>
      Product Name
      <Badge color="success" size="sm">New</Badge>
    </>
  }
  image={{ src: '/product.jpg', alt: 'Product' }}
  actions={
    <Button status="primary">Add to Cart</Button>
  }
>
  Product description goes here
</Card>
```

## Conventions

### File Structure

- **Component files**: PascalCase (`Button.tsx`, `TextInput.tsx`)
- **Test files**: Co-located with `.test.tsx` suffix (`Button.test.tsx`)
- **Barrel exports**: `index.ts` in each category folder
- **Variants**: Exported alongside component (`buttonVariants`, `badgeVariants`)

### CVA (Class Variance Authority)

All components use CVA for type-safe variant management:

```typescript
import { cva, cx } from '~/cva.config';
import type { VariantProps } from 'cva';

export const componentVariants = cva({
  base: 'daisyui-base-class',
  variants: {
    size: {
      sm: 'size-sm',
      md: 'size-md',
      lg: 'size-lg'
    },
    status: {
      primary: 'status-primary',
      error: 'status-error'
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {}
```

### DaisyUI Integration

- Components use DaisyUI class names for theming consistency
- Always use `cx()` utility for className merging
- Respect DaisyUI naming conventions (e.g., `btn-primary`, `input-error`)

### TypeScript

- All components have explicit prop interfaces
- Extend HTML element types for proper type inference
- Export variant types alongside components
- Use `Omit` to exclude conflicting HTML attributes

### Accessibility

- Semantic HTML elements
- ARIA attributes where appropriate
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## Testing

Tests are co-located with components using the `.test.tsx` suffix:

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

Run tests:

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
```

## Component Preview

Visit `/admin/design` in development to preview all components with their variants.

## Adding a New Component

1. **Create component file** in appropriate category folder:

   ```typescript
   // components/actions/NewComponent.tsx
   import type { VariantProps } from 'cva';
   import { cva, cx } from '~/cva.config';

   export const newComponentVariants = cva({
     base: 'base-classes',
     variants: { /* ... */ },
     defaultVariants: { /* ... */ }
   });

   interface NewComponentProps
     extends React.HTMLAttributes<HTMLElement>,
       VariantProps<typeof newComponentVariants> {}

   export function NewComponent({ className, ...props }: NewComponentProps) {
     return <div className={cx(newComponentVariants(), className)} {...props} />;
   }
   ```

2. **Create test file**:

   ```typescript
   // components/actions/NewComponent.test.tsx
   import { render } from '@testing-library/react';
   import { NewComponent } from './NewComponent';

   describe('NewComponent', () => {
     it('renders', () => {
       render(<NewComponent />);
     });
   });
   ```

3. **Export from category index**:

   ```typescript
   // components/actions/index.ts
   export { NewComponent, newComponentVariants } from './NewComponent';
   ```

4. **Add to design preview** (optional):

   ```tsx
   // routes/design.tsx
   import { NewComponent } from '~/components/actions';
   ```

5. **Document usage** in component JSDoc

## Resources

- **DaisyUI Documentation**: <https://daisyui.com/>
- **CVA Documentation**: <https://cva.style/>
- **Tailwind CSS**: <https://tailwindcss.com/>
- **Project Architecture**: See `CLAUDE.md` and `AGENTS.md`

## Questions?

See `.github/instructions/component-patterns.instructions.md` for detailed component development patterns.
