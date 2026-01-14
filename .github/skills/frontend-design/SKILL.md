---
name: frontend-design
description: "Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics."
license: Complete terms in LICENSE.txt
---

# Frontend Design

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Iridium Architecture Context

This project uses a specific tech stack that must be respected while creating bold designs:

- **React Router 7** with config-based routing (routes defined in `app/routes.ts`)
- **DaisyUI 5** + Tailwind CSS 4 for component styling
- **CVA (Class Variance Authority)** for type-safe component variants
- **TypeScript** in strict mode with explicit types
- **React 19** with native meta tags (no `meta()` exports)

When implementing:

- Route files go in `app/routes/` with descriptive kebab-case names
- Components use CVA variants with daisyUI base classes
- Always use `cx()` from `~/cva.config` for className merging
- Import route types as `import type { Route } from './+types/[routeName]'`
- Follow existing component patterns (see `app/components/actions/Button.tsx`)

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:

- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font. In Iridium, add custom fonts via CSS imports or CDN links.
- **Color & Theme**: Commit to a cohesive aesthetic. **Work WITH daisyUI's theme system**: Use semantic color classes (`primary`, `secondary`, `accent`, `base-*`, `neutral`) so designs adapt to theme changes. Customize themes using `@plugin "daisyui/theme"` in CSS for bold color palettes. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Avoid raw Tailwind colors (`red-500`) for text/backgrounds—use daisyUI semantic colors.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions (Tailwind animation utilities, CSS transitions). Use Framer Motion for React when complex orchestration is needed. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density. Use Tailwind's `flex`, `grid`, `absolute`, `relative` positioning creatively. Make layouts responsive with Tailwind breakpoints (`sm:`, `md:`, `lg:`).
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Use daisyUI's `base-100`, `base-200`, `base-300` for layered surfaces. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes (Tailwind `bg-gradient-to-*`), noise textures, geometric patterns, layered transparencies, dramatic shadows (`shadow-*`), decorative borders (`border-*`), and grain overlays. Use Tailwind utilities creatively—stack multiple classes for complex effects.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

## Iridium Implementation Patterns

### Component Creation (CVA + DaisyUI)

All components follow the CVA pattern with daisyUI base classes:

```typescript
import type { VariantProps } from "cva";
import { cva, cx } from "~/cva.config";

// Define variants with daisyUI classes
export const componentVariants = cva({
    base: "btn", // daisyUI base class
    variants: {
        aesthetic: {
            // Custom aesthetic variants
            cosmic: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
            brutalist: "bg-black text-white font-mono uppercase tracking-widest",
            organic: "rounded-3xl bg-gradient-to-br from-green-400 to-blue-500"
        },
        size: {
            sm: "btn-sm",
            md: "btn-md",
            lg: "btn-lg"
        }
    },
    defaultVariants: {
        aesthetic: "cosmic",
        size: "md"
    }
});

interface ComponentProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof componentVariants> {
    // Additional props
}

export function Component({ aesthetic, size, className, children, ...props }: ComponentProps) {
    return (
        <button
            className={cx(componentVariants({ aesthetic, size }), className)}
            {...props}
        >
            {children}
        </button>
    );
}
```

### Route Creation (React Router 7)

1. Add route to `app/routes.ts`:

```typescript
route('/bold-page', 'routes/bold-page.tsx')
```

1. Create route file with distinctive design:

```tsx
import type { Route } from './+types/bold-page';
import { Container } from '~/components/layout/Container';

export default function BoldPage() {
    return (
        <>
            <title>Bold Page - Iridium</title>
            <meta name="description" content="A distinctive experience" />
            <Container className="min-h-screen bg-gradient-to-br from-base-300 to-base-100">
                {/* Your bold, creative interface */}
            </Container>
        </>
    );
}
```

### Working with DaisyUI Themes

For bold aesthetic directions, customize themes in `app/app.css`:

```css
@plugin "daisyui/theme" {
    name: 'cosmic';
    default: true;
    color-scheme: dark;
    
    --color-primary: oklch(65% 0.3 280);        /* Bold purple */
    --color-secondary: oklch(70% 0.25 320);     /* Vibrant pink */
    --color-accent: oklch(75% 0.3 200);         /* Electric cyan */
    --color-base-100: oklch(15% 0.02 280);      /* Deep space */
    --color-base-content: oklch(95% 0.01 280);  /* Bright white */
    
    --radius-field: 2rem;  /* Organic, rounded */
    --border: 0px;         /* Borderless for clean look */
}
```

### Key Implementation Rules

- **Components**: Always use CVA for variants, daisyUI classes for base styling
- **Colors**: Use semantic daisyUI colors (`primary`, `secondary`, `accent`, `base-*`) so designs work across themes
- **Spacing**: Use Tailwind utilities (`p-*`, `m-*`, `gap-*`, `space-*`)
- **Typography**: Import custom fonts, but use Tailwind text utilities (`text-*`, `font-*`, `leading-*`)
- **Animations**: Use Tailwind's `animate-*` classes or custom CSS animations
- **Layouts**: Leverage Tailwind's `flex`, `grid`, `absolute`, `relative` for creative compositions
- **Responsiveness**: Always consider mobile—use `sm:`, `md:`, `lg:` breakpoints
- **Accessibility**: Maintain proper ARIA attributes, semantic HTML, keyboard navigation
- **Atomic Classes Only**: NEVER use Tailwind's `@apply` directive. Always use atomic utility classes directly in JSX/HTML `className` attributes. This keeps styles colocated, maintainable, and leverages Tailwind's performance optimizations. If you need reusable styling patterns, use CVA variants or component composition.

### When to Break Patterns

Bold aesthetics sometimes require breaking conventions:

- **Custom CSS**: Write custom animations/effects when Tailwind utilities aren't enough
- **Override specificity**: Use `!` suffix on Tailwind classes to override daisyUI styles
- **Direct styling**: Use inline styles for dynamic, animated values
- **Custom components**: Build from scratch when daisyUI components constrain the vision

The key: know the patterns, follow them by default, break them intentionally for creative impact.
