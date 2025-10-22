# 004: DaisyUI

## Status

Accepted

## Context

We needed a component library that:

- Provides pre-built UI components
- Works with Tailwind CSS
- Offers good customization
- Has consistent design system
- Reduces custom CSS writing
- Supports theming
- Maintains small bundle size

Building every component from scratch is time-consuming and leads to inconsistencies. A component library accelerates development while maintaining design consistency.

## Decision

We chose DaisyUI as our component library.

DaisyUI is a plugin for Tailwind CSS that adds semantic component classes without JavaScript dependencies.

### Key Features

**Semantic Component Classes**:

```html
<button class="btn btn-primary">Click me</button>
<div class="card shadow-xl">...</div>
```

**Tailwind Integration**: Built on Tailwind, works with existing utilities

**Multiple Themes**: Pre-built themes with custom theme support

**Zero JavaScript**: Pure CSS components

**Small Bundle**: Only CSS, no JavaScript overhead

## Consequences

### Positive

- **Fast Development**: Pre-built components ready to use
- **Consistent Design**: Unified design system across application
- **Tailwind Compatible**: Works seamlessly with Tailwind utilities
- **Customizable**: Easy to override and extend
- **Great Documentation**: Clear examples and API reference
- **Theme Support**: Multiple themes out of the box
- **No JavaScript**: Lighter bundle compared to JS component libraries
- **Accessibility**: Components follow accessibility best practices
- **Responsive**: Mobile-first design built-in

### Negative

- **Tailwind Dependency**: Requires Tailwind CSS
- **Class-Based**: More verbose than styled components
- **Learning Curve**: Need to learn DaisyUI class names
- **Customization Limits**: Some components harder to customize deeply
- **Bundle Size**: Adds to CSS bundle (though opt-in per component)

### Neutral

- **CSS-Only**: No component logic provided
- **Component Variants**: Limited compared to full component libraries
- **Design Opinions**: Follows specific design language

## Alternatives Considered

### Headless UI

**Pros:**

- Complete component logic
- Framework agnostic
- Full customization
- Accessibility built-in

**Cons:**

- No styling provided
- More setup required
- Need to style everything
- More code to write

**Why not chosen:** Requires too much custom styling. DaisyUI provides ready-to-use components.

### Chakra UI

**Pros:**

- Complete component library
- Great TypeScript support
- Composable components
- Built-in theming

**Cons:**

- JavaScript dependencies
- Larger bundle size
- Runtime styling overhead
- Different from Tailwind approach

**Why not chosen:** Heavier than DaisyUI. We prefer Tailwind-first approach.

### shadcn/ui

**Pros:**

- Copy-paste components
- Full TypeScript
- Highly customizable
- No package dependency

**Cons:**

- More setup required
- Need to maintain copied code
- Requires Radix UI
- More complex

**Why not chosen:** More maintenance overhead. DaisyUI is simpler and requires less setup.

### Material UI

**Pros:**

- Comprehensive components
- Mature and stable
- Great documentation
- Large community

**Cons:**

- Heavy bundle size
- Complex API
- Material Design specific
- Not Tailwind-based

**Why not chosen:** Too heavy and opinionated. Does not work with Tailwind.

### Bootstrap

**Pros:**

- Widely known
- Comprehensive components
- Large ecosystem
- Battle-tested

**Cons:**

- Not Tailwind-based
- Dated design
- JavaScript dependencies
- Harder to customize

**Why not chosen:** Does not integrate with Tailwind. Less modern approach.

### Custom Components

**Pros:**

- Complete control
- Exact design match
- No external dependency

**Cons:**

- Time-consuming
- Maintenance burden
- Consistency challenges
- Reinventing the wheel

**Why not chosen:** Development time better spent on features. DaisyUI provides quality components.

## Implementation Details

### Installation

```bash
npm install -D daisyui
```

### Configuration

```typescript
// tailwind.config.ts
import daisyui from "daisyui";

export default {
  plugins: [daisyui],
  daisyui: {
    themes: ["light", "dark"],
  },
};
```

### Usage Examples

**Button**:

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
```

**Card**:

```html
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Card Title</h2>
    <p>Card content</p>
    <div class="card-actions">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>
```

**Form**:

```html
<div class="form-control">
  <label class="label">
    <span class="label-text">Email</span>
  </label>
  <input type="email" class="input input-bordered" />
</div>
```

### Custom Theming

```typescript
daisyui: {
  themes: [
    {
      mytheme: {
        primary: "#570df8",
        secondary: "#f000b8",
        accent: "#1dcdbc",
        neutral: "#2b3440",
        "base-100": "#ffffff",
      },
    },
  ],
}
```

## Component Coverage

DaisyUI provides:

- **Actions**: Button, Dropdown, Modal, Swap
- **Data Display**: Card, Badge, Avatar, Table
- **Data Input**: Input, Textarea, Checkbox, Radio, Select
- **Navigation**: Navbar, Menu, Tabs, Breadcrumbs
- **Feedback**: Alert, Toast, Progress, Loading
- **Layout**: Drawer, Divider, Stack, Container

## Customization Strategy

1. Use DaisyUI classes for base styling
2. Add Tailwind utilities for customization
3. Override with custom CSS when needed
4. Use CVA for complex variants (see ADR 005)

## Performance Considerations

- Only includes CSS for used components (with PurgeCSS)
- No JavaScript runtime overhead
- Optimized for production builds
- Minimal impact on bundle size

## References

- [DaisyUI Documentation](https://daisyui.com/)
- [DaisyUI Themes](https://daisyui.com/docs/themes/)
- [Component Examples](https://daisyui.com/components/)
- [Components Guide](../components.md)
- [CVA Decision](./005-cva.md)
