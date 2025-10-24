# Custom Theming

This guide covers creating and customizing themes for Iridium using DaisyUI and Tailwind CSS.

## Overview

Iridium uses DaisyUI for theming, which provides a powerful system for customizing colors, spacing, and visual styles across your entire application. Custom themes allow you to:

- Define brand colors consistently
- Support light and dark modes
- Customize component appearances
- Maintain design system consistency
- Create multiple theme variants

## DaisyUI Theme System

DaisyUI uses CSS custom properties (CSS variables) to define themes. Each theme includes semantic color tokens that map to component styles.

### Theme Structure

A theme consists of:

- **Base colors**: Background and content colors
- **Semantic colors**: Primary, secondary, accent
- **State colors**: Info, success, warning, error
- **Utility values**: Border radius, sizes, effects

## Creating a Custom Theme

### Configuration Method

Define custom themes in `tailwind.config.ts`:

```typescript
import daisyui from 'daisyui';

export default {
    plugins: [daisyui],
    daisyui: {
        themes: [
            {
                mytheme: {
                    // Base colors
                    'base-100': '#ffffff',
                    'base-200': '#f7f7f7',
                    'base-300': '#e5e5e5',
                    'base-content': '#1f2937',

                    // Brand colors
                    primary: '#570df8',
                    'primary-content': '#ffffff',

                    secondary: '#f000b8',
                    'secondary-content': '#ffffff',

                    accent: '#1dcdbc',
                    'accent-content': '#ffffff',

                    // Neutral
                    neutral: '#2b3440',
                    'neutral-content': '#ffffff',

                    // State colors
                    info: '#3abff8',
                    'info-content': '#ffffff',

                    success: '#36d399',
                    'success-content': '#ffffff',

                    warning: '#fbbd23',
                    'warning-content': '#1f2937',

                    error: '#f87272',
                    'error-content': '#ffffff',
                },
            },
            'light',
            'dark',
        ],
    },
};
```

### Plugin Method (Advanced)

For more control, use the DaisyUI theme plugin with OKLCH color space:

```css
@plugin "daisyui/theme" {
    name: 'mytheme';
    default: true;
    prefersdark: false;
    color-scheme: light;

    /* Base colors - Clean white with subtle grays */
    --color-base-100: oklch(100% 0 0); /* Pure white */
    --color-base-200: oklch(97% 0.005 240); /* Very light gray */
    --color-base-300: oklch(92% 0.01 240); /* Light gray for borders */
    --color-base-content: oklch(25% 0.02 260); /* Dark blue-gray text */

    /* Primary - Deep blue */
    --color-primary: oklch(45% 0.15 260);
    --color-primary-content: oklch(100% 0 0);

    /* Secondary - Vibrant teal */
    --color-secondary: oklch(65% 0.14 190);
    --color-secondary-content: oklch(100% 0 0);

    /* Accent - Magenta-pink */
    --color-accent: oklch(60% 0.2 330);
    --color-accent-content: oklch(100% 0 0);

    /* Neutral - Medium blue-gray */
    --color-neutral: oklch(40% 0.05 250);
    --color-neutral-content: oklch(100% 0 0);

    /* State colors */
    --color-info: oklch(60% 0.18 240);
    --color-info-content: oklch(100% 0 0);

    --color-success: oklch(65% 0.18 160);
    --color-success-content: oklch(100% 0 0);

    --color-warning: oklch(75% 0.15 70);
    --color-warning-content: oklch(20% 0.05 70);

    --color-error: oklch(60% 0.22 20);
    --color-error-content: oklch(100% 0 0);

    /* Border radius - Modern, rounded */
    --radius-selector: 0.75rem;
    --radius-field: 0.5rem;
    --radius-box: 1rem;

    /* Base sizes */
    --size-selector: 0.25rem;
    --size-field: 0.25rem;

    /* Border size */
    --border: 1px;

    /* Effects */
    --depth: 2;
    --noise: 0;
}
```

## Color System

### OKLCH Color Space

OKLCH provides perceptually uniform colors:

- **L**: Lightness (0-100%)
- **C**: Chroma/saturation (0-0.4+)
- **H**: Hue (0-360 degrees)

#### Benefits of OKLCH

- Perceptually uniform (equal steps look equally different)
- Predictable lightness
- Better color mixing
- Wider color gamut
- Future-proof for modern displays

#### OKLCH Examples

```css
/* Syntax: oklch(lightness chroma hue) */
--color-primary: oklch(45% 0.15 260);
/*                      ↑    ↑    ↑
/*                      L    C    H
/*                   Dark  Saturated Blue
```

### Semantic Color Tokens

#### Base Colors

Used for backgrounds and surfaces:

- `base-100`: Main background
- `base-200`: Slightly darker background
- `base-300`: Borders and dividers
- `base-content`: Text color on base backgrounds

#### Brand Colors

Define your brand identity:

- `primary`: Main brand color (CTAs, links)
- `secondary`: Secondary actions and accents
- `accent`: Highlights and emphasis
- `neutral`: Neutral UI elements

#### State Colors

Communicate status:

- `info`: Informational messages
- `success`: Success states
- `warning`: Warning messages
- `error`: Error states

#### Content Colors

Each color has a `-content` variant for text that appears on that color:

- `primary-content`: Text on primary background
- `base-content`: Text on base background

## Theme Application

### Setting the Active Theme

Set theme on the HTML element:

```html
<html data-theme="mytheme">
    <!-- Your app -->
</html>
```

### Dynamic Theme Switching

```typescript
function ThemeSelector() {
  function setTheme(theme: string) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  return (
    <select onChange={(e) => setTheme(e.target.value)} className="select">
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="mytheme">Custom</option>
    </select>
  );
}
```

### Persisting Theme Selection

```typescript
// app/root.tsx
export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const theme = cookieHeader?.match(/theme=([^;]+)/)?.[1] || "light";

  return { theme };
}

export default function Root({ loaderData }: Route.ComponentProps) {
  return (
    <html lang="en" data-theme={loaderData.theme}>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
```

## Dark Mode Support

### Creating Dark Theme Variant

```typescript
daisyui: {
  themes: [
    {
      light: {
        "base-100": "#ffffff",
        "base-content": "#1f2937",
        primary: "#570df8",
        // ... other colors
      },
      dark: {
        "base-100": "#1f2937",
        "base-content": "#ffffff",
        primary: "#a991f7",
        // ... other colors
      },
    },
  ],
}
```

### System Preference Detection

```typescript
function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    function updateTheme() {
      const theme = prefersDark.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
    }

    prefersDark.addEventListener("change", updateTheme);
    updateTheme();

    return () => prefersDark.removeEventListener("change", updateTheme);
  }, []);

  return <>{children}</>;
}
```

## Customization Options

### Border Radius

Control the roundness of components:

```css
--radius-selector: 0.75rem; /* Checkboxes, radios */
--radius-field: 0.5rem; /* Input fields */
--radius-box: 1rem; /* Cards, modals */
```

### Border Width

```css
--border: 1px; /* Standard borders */
```

### Effects

```css
--depth: 2; /* Shadow depth (0-4) */
--noise: 0; /* Texture noise (0-1) */
```

## Component Examples

### Using Theme Colors

```typescript
function ThemedButton() {
  return (
    <button className="btn btn-primary">
      Primary Button
    </button>
  );
}

function ThemedCard() {
  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-primary">Title</h2>
        <p className="text-base-content">Content</p>
      </div>
    </div>
  );
}
```

### Custom Component with Theme Colors

```typescript
import { cva } from "cva";

const alertVariants = cva({
  base: "alert",
  variants: {
    variant: {
      info: "alert-info",
      success: "alert-success",
      warning: "alert-warning",
      error: "alert-error",
    },
  },
});

function Alert({ variant, children }: AlertProps) {
  return (
    <div className={alertVariants({ variant })}>
      {children}
    </div>
  );
}
```

## Testing Themes

### Visual Testing

1. Check all components with each theme
2. Verify contrast ratios for accessibility
3. Test light and dark modes
4. Check color consistency

### Accessibility Testing

Ensure adequate contrast:

- WCAG AA: 4.5:1 for normal text
- WCAG AA: 3:1 for large text
- WCAG AAA: 7:1 for normal text

Tools:

- Chrome DevTools Lighthouse
- WebAIM Contrast Checker
- DaisyUI built-in contrast checking

## Best Practices

1. **Use Semantic Tokens**: Use `primary` instead of hardcoded colors
2. **Test Contrast**: Ensure readable text on all backgrounds
3. **Support Dark Mode**: Provide dark theme variant
4. **Consistent Spacing**: Use consistent border radius values
5. **Document Colors**: Keep a color palette reference
6. **Limit Colors**: Too many colors create confusion
7. **Test Accessibility**: Verify WCAG compliance
8. **Consider Color Blindness**: Test with color blindness simulators

## Color Palette Generation

### Tools for Creating Palettes

- [Coolors](https://coolors.co/) - Color scheme generator
- [Adobe Color](https://color.adobe.com/) - Color wheel and harmony rules
- [Paletton](https://paletton.com/) - Color scheme designer
- [OKLCH Color Picker](https://oklch.com/) - OKLCH-specific picker

### Color Harmony Rules

- **Monochromatic**: Variations of one hue
- **Analogous**: Adjacent hues on color wheel
- **Complementary**: Opposite hues
- **Triadic**: Three evenly-spaced hues

## Troubleshooting

### Theme Not Applying

1. Verify `data-theme` attribute on HTML element
2. Check theme name matches configuration
3. Ensure DaisyUI plugin is loaded
4. Clear browser cache

### Colors Look Different

1. Verify color values in configuration
2. Check for CSS overrides
3. Test in different browsers
4. Verify OKLCH support in browser

### Dark Mode Issues

1. Check both light and dark theme definitions
2. Verify system preference detection
3. Test theme persistence
4. Check contrast ratios

## Migration from Existing Themes

### From Tailwind Colors

```typescript
// Before: Using Tailwind colors
<div className="bg-blue-500 text-white">

// After: Using theme colors
<div className="bg-primary text-primary-content">
```

### From Custom CSS

```css
/* Before: Custom CSS */
.my-button {
    background-color: #570df8;
    color: white;
}

/* After: Theme colors */
.my-button {
    background-color: oklch(var(--p));
    color: oklch(var(--pc));
}
```

## Advanced Techniques

### Multiple Theme Variants

```typescript
daisyui: {
  themes: [
    "light",
    "dark",
    "cupcake",
    "corporate",
    {
      brand: { /* custom theme */ },
    },
  ],
}
```

### Theme-Specific Overrides

```css
[data-theme='dark'] .special-element {
    opacity: 0.8;
}

[data-theme='light'] .special-element {
    opacity: 1;
}
```

### CSS Variable Access

```typescript
function MyComponent() {
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--p");

  return <div style={{ borderColor: `oklch(${primaryColor})` }} />;
}
```

## Reference Implementation

See the default theme implementation in `tailwind.config.ts` for a complete working example.

## Further Reading

- [DaisyUI Themes Documentation](https://daisyui.com/docs/themes/)
- [DaisyUI Colors](https://daisyui.com/docs/colors/)
- [OKLCH Color Space](https://oklch.com/)
- [Components Guide](./components.md)
- [DaisyUI Decision](./decisions/004-daisyui.md)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
