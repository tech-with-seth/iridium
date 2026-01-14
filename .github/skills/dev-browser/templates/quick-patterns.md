# Quick Patterns: Copy-Paste Debugging Snippets

Ready-to-use `browser_evaluate` code snippets for common Iridium debugging tasks. Copy the pattern, replace `[selector]` with your actual selector, and paste into `browser_evaluate`.

## Two Approaches

### Inline (Default - Transparent)

Copy-paste JavaScript directly into `browser_evaluate`. Full code visibility, easy to customize.

**When to use:**

- First time exploring
- Need to customize logic
- Learning debugging patterns
- One-time tasks

### Utility (Advanced - Token Efficient)

Import TypeScript functions for token efficiency and reusability.

**When to use:**

- Repeated operations
- Token budget matters
- Type safety needed
- Production scripts

**Setup:**

```bash
cd ~/.github/skills/dev-browser && npm install
```

**Example:**

```typescript
import { getOutline } from './utils/outline.ts';
const outline = await getOutline(page, { maxDepth: 4 });
```

See [SKILL.md - Advanced: TypeScript Utilities](../SKILL.md#advanced-typescript-utilities) for complete reference.

---

## Component Debugging

### Check All Classes on Element

```javascript
const element = document.querySelector('[selector]');
Array.from(element.classList)
```

**Use case:** See what classes are actually applied to an element.

---

### Detect Class Conflicts

```javascript
const element = document.querySelector('[selector]');
const classes = Array.from(element.classList);

({
    allClasses: classes,
    
    // Size conflicts
    sizeClasses: classes.filter(c => 
        c.match(/^(btn|input|select|textarea|badge|avatar|card)-(xs|sm|md|lg|xl)$/)
    ),
    hasSizeConflict: classes.filter(c => 
        c.match(/^(btn|input|select|textarea|badge|avatar|card)-(xs|sm|md|lg|xl)$/)
    ).length > 1,
    
    // Color conflicts
    colorClasses: classes.filter(c => 
        c.match(/^(btn|input|badge|alert|badge)-(primary|secondary|accent|neutral|info|success|warning|error)$/)
    ),
    hasColorConflict: classes.filter(c => 
        c.match(/^(btn|input|badge|alert|badge)-(primary|secondary|accent|neutral|info|success|warning|error)$/)
    ).length > 1
})
```

**Use case:** Detect when multiple size or color classes are fighting (e.g., `btn-sm btn-lg` both applied).

---

### Verify DaisyUI Base Class

```javascript
const element = document.querySelector('[selector]');
const classes = Array.from(element.classList);

({
    classes,
    hasBaseClass: {
        btn: classes.includes('btn'),
        input: classes.includes('input'),
        select: classes.includes('select'),
        textarea: classes.includes('textarea'),
        card: classes.includes('card'),
        modal: classes.includes('modal'),
        drawer: classes.includes('drawer'),
        badge: classes.includes('badge'),
        alert: classes.includes('alert')
    }
})
```

**Use case:** Verify DaisyUI component has its base class (component won't style without it).

---

### CVA Merged Classes Inspection

```javascript
const element = document.querySelector('[selector]');
const classes = Array.from(element.classList);

({
    allClasses: classes,
    baseClasses: classes.filter(c => c.startsWith('btn') || c.startsWith('input')),
    variantClasses: classes.filter(c => 
        c.includes('-primary') || c.includes('-secondary') || 
        c.includes('-sm') || c.includes('-lg')
    ),
    customClasses: classes.filter(c => 
        !c.startsWith('btn') && !c.startsWith('input') && 
        !c.includes('daisy')
    )
})
```

**Use case:** See how `cx()` merged CVA variants with custom classes.

---

## Layout Debugging

### Flexbox Configuration

```javascript
const container = document.querySelector('[selector]');
const computed = getComputedStyle(container);

({
    display: computed.display,
    flexDirection: computed.flexDirection,
    justifyContent: computed.justifyContent,
    alignItems: computed.alignItems,
    flexWrap: computed.flexWrap,
    gap: computed.gap
})
```

**Use case:** Quick check of flex container configuration.

---

### Flexbox Child Properties

```javascript
const child = document.querySelector('[selector]');
const computed = getComputedStyle(child);

({
    flex: computed.flex,
    flexGrow: computed.flexGrow,
    flexShrink: computed.flexShrink,
    flexBasis: computed.flexBasis,
    alignSelf: computed.alignSelf,
    width: computed.width,
    minWidth: computed.minWidth,
    maxWidth: computed.maxWidth
})
```

**Use case:** Check how flex child is behaving in container.

---

### Grid Configuration

```javascript
const container = document.querySelector('[selector]');
const computed = getComputedStyle(container);

({
    display: computed.display,
    gridTemplateColumns: computed.gridTemplateColumns,
    gridTemplateRows: computed.gridTemplateRows,
    gap: computed.gap,
    columnCount: computed.gridTemplateColumns.split(' ').length
})
```

**Use case:** Quick grid layout check.

---

### Element Dimensions

```javascript
const element = document.querySelector('[selector]');
const rect = element.getBoundingClientRect();
const computed = getComputedStyle(element);

({
    // Bounding rect (position + size)
    rect,
    
    // Computed size
    width: computed.width,
    height: computed.height,
    
    // Content vs scroll
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    
    // Is overflowing?
    overflowing: {
        horizontal: element.scrollWidth > element.clientWidth,
        vertical: element.scrollHeight > element.clientHeight
    }
})
```

**Use case:** Get all dimension information for an element.

---

### Z-Index Stack

```javascript
const element = document.querySelector('[selector]');
let current = element;
const stack = [];

while (current && current !== document.body) {
    const style = getComputedStyle(current);
    if (style.position !== 'static' || style.zIndex !== 'auto') {
        stack.push({
            element: current.tagName + (current.className ? '.' + current.className.split(' ')[0] : ''),
            position: style.position,
            zIndex: style.zIndex
        });
    }
    current = current.parentElement;
}

stack
```

**Use case:** Find all stacking contexts affecting element z-index.

---

## Theme Debugging

### Current Theme

```javascript
({
    theme: document.documentElement.getAttribute('data-theme'),
    themeOnBody: document.body.getAttribute('data-theme')
})
```

**Use case:** Check which DaisyUI theme is active.

---

### CSS Variables (Colors)

```javascript
const root = getComputedStyle(document.documentElement);

({
    primary: root.getPropertyValue('--p'),
    secondary: root.getPropertyValue('--s'),
    accent: root.getPropertyValue('--a'),
    neutral: root.getPropertyValue('--n'),
    base100: root.getPropertyValue('--b1'),
    base200: root.getPropertyValue('--b2'),
    base300: root.getPropertyValue('--b3'),
    baseContent: root.getPropertyValue('--bc')
})
```

**Use case:** Check if theme CSS variables are set correctly.

---

### Element Computed Colors

```javascript
const element = document.querySelector('[selector]');
const computed = getComputedStyle(element);

({
    color: computed.color,
    backgroundColor: computed.backgroundColor,
    borderColor: computed.borderColor
})
```

**Use case:** See actual computed color values on element.

---

## Form Debugging

### Input Validation State

```javascript
const input = document.querySelector('input[selector]');
const container = input.closest('label') || input.parentElement;

({
    // Input properties
    value: input.value,
    disabled: input.disabled,
    required: input.required,
    
    // Validation
    valid: input.validity.valid,
    validationMessage: input.validationMessage,
    
    // Classes
    inputClasses: Array.from(input.classList),
    hasErrorClass: Array.from(input.classList).some(c => c.includes('error')),
    
    // ARIA
    ariaInvalid: input.getAttribute('aria-invalid'),
    ariaDescribedBy: input.getAttribute('aria-describedby'),
    
    // Error/helper text
    errorText: container?.querySelector('.text-error')?.textContent,
    helperText: container?.querySelector('.label-text-alt')?.textContent
})
```

**Use case:** Comprehensive input validation state check.

---

### Form Error Messages

```javascript
const form = document.querySelector('form[selector]');
const errors = form.querySelectorAll('.text-error, [role="alert"]');

({
    formValid: form.checkValidity(),
    errorCount: errors.length,
    errors: Array.from(errors).map(e => ({
        text: e.textContent.trim(),
        visible: getComputedStyle(e).display !== 'none'
    }))
})
```

**Use case:** Find all error messages in a form.

---

## Responsive Debugging

### Current Breakpoint

```javascript
const width = window.innerWidth;

({
    viewportWidth: width,
    viewportHeight: window.innerHeight,
    
    currentBreakpoint: 
        width < 640 ? 'base (< 640px)' :
        width < 768 ? 'sm (640-767px)' :
        width < 1024 ? 'md (768-1023px)' :
        width < 1280 ? 'lg (1024-1279px)' :
        width < 1536 ? 'xl (1280-1535px)' : '2xl (>= 1536px)',
    
    breakpoints: {
        sm: width >= 640,
        md: width >= 768,
        lg: width >= 1024,
        xl: width >= 1280,
        '2xl': width >= 1536
    }
})
```

**Use case:** Check which Tailwind breakpoint is active.

---

### Responsive Classes on Element

```javascript
const element = document.querySelector('[selector]');
const classes = Array.from(element.classList);

({
    baseClasses: classes.filter(c => !c.includes(':')),
    smClasses: classes.filter(c => c.startsWith('sm:')),
    mdClasses: classes.filter(c => c.startsWith('md:')),
    lgClasses: classes.filter(c => c.startsWith('lg:')),
    xlClasses: classes.filter(c => c.startsWith('xl:')),
    '2xlClasses': classes.filter(c => c.startsWith('2xl:'))
})
```

**Use case:** See what responsive classes are applied at different breakpoints.

---

## Visibility Debugging

### Why Element Not Visible

```javascript
const element = document.querySelector('[selector]');
const computed = getComputedStyle(element);
const rect = element.getBoundingClientRect();

({
    // Display/visibility
    display: computed.display,
    visibility: computed.visibility,
    opacity: computed.opacity,
    
    // Position
    position: computed.position,
    top: computed.top,
    left: computed.left,
    
    // Dimensions
    width: computed.width,
    height: computed.height,
    
    // In viewport?
    inViewport: 
        rect.top < window.innerHeight && 
        rect.bottom > 0 &&
        rect.left < window.innerWidth && 
        rect.right > 0,
    
    // Attributes
    hidden: element.hasAttribute('hidden'),
    ariaHidden: element.getAttribute('aria-hidden')
})
```

**Use case:** Comprehensive check for why element isn't visible.

---

## Accessibility Debugging

### ARIA Attributes

```javascript
const element = document.querySelector('[selector]');

({
    role: element.getAttribute('role'),
    ariaLabel: element.getAttribute('aria-label'),
    ariaLabelledBy: element.getAttribute('aria-labelledby'),
    ariaDescribedBy: element.getAttribute('aria-describedby'),
    ariaHidden: element.getAttribute('aria-hidden'),
    ariaExpanded: element.getAttribute('aria-expanded'),
    ariaPressed: element.getAttribute('aria-pressed'),
    ariaDisabled: element.getAttribute('aria-disabled'),
    ariaInvalid: element.getAttribute('aria-invalid'),
    tabIndex: element.tabIndex
})
```

**Use case:** Check accessibility attributes on element.

---

## Parent-Child Relationships

### Element Hierarchy

```javascript
const element = document.querySelector('[selector]');

({
    element: element.tagName + '.' + element.className.split(' ').slice(0, 2).join('.'),
    
    parent: element.parentElement ? {
        tag: element.parentElement.tagName,
        classes: Array.from(element.parentElement.classList).slice(0, 3)
    } : null,
    
    children: Array.from(element.children).map(child => ({
        tag: child.tagName,
        classes: Array.from(child.classList).slice(0, 2)
    })),
    
    siblings: Array.from(element.parentElement?.children || [])
        .filter(s => s !== element)
        .map(s => s.tagName + '.' + Array.from(s.classList).slice(0, 1))
})
```

**Use case:** Understand DOM structure around an element.

---

## Overflow & Scrolling

### Scrollable Container Check

```javascript
const container = document.querySelector('[selector]');
const computed = getComputedStyle(container);

({
    overflow: computed.overflow,
    overflowX: computed.overflowX,
    overflowY: computed.overflowY,
    
    dimensions: {
        clientWidth: container.clientWidth,
        scrollWidth: container.scrollWidth,
        clientHeight: container.clientHeight,
        scrollHeight: container.scrollHeight
    },
    
    isScrollable: {
        horizontal: container.scrollWidth > container.clientWidth,
        vertical: container.scrollHeight > container.clientHeight
    },
    
    scrollPosition: {
        left: container.scrollLeft,
        top: container.scrollTop
    }
})
```

**Use case:** Check if container is scrollable and by how much.

---

## Animation & Transitions

### Transition Properties

```javascript
const element = document.querySelector('[selector]');
const computed = getComputedStyle(element);

({
    transition: computed.transition,
    transitionProperty: computed.transitionProperty,
    transitionDuration: computed.transitionDuration,
    transitionTimingFunction: computed.transitionTimingFunction,
    transitionDelay: computed.transitionDelay,
    animation: computed.animation,
    transform: computed.transform
})
```

**Use case:** Check CSS transitions and animations on element.

---

## Usage Tips

### How to Use These Patterns

1. **Copy the pattern** from this file
2. **Replace `[selector]`** with your actual CSS selector:
   - `.btn-primary` - class
   - `#my-modal` - ID
   - `button[type="submit"]` - attribute
   - `.card .card-title` - descendant
3. **Use `browser_evaluate` tool** and paste the code
4. **Analyze the result** returned by the tool

### Common Selectors

```javascript
// By class
document.querySelector('.btn')
document.querySelector('.modal-box')

// By ID  
document.querySelector('#my-modal')
document.querySelector('#user-menu')

// By attribute
document.querySelector('button[type="submit"]')
document.querySelector('input[name="email"]')

// By data attribute
document.querySelector('[data-theme]')
document.querySelector('[data-tip]')

// Descendant
document.querySelector('.card .card-title')
document.querySelector('form .input-error')

// Multiple classes
document.querySelector('.btn.btn-primary')

// nth child
document.querySelector('.grid > div:first-child')
document.querySelector('.menu > li:nth-child(2)')
```

### Debugging Workflow

1. **Take screenshot** - Visual confirmation
2. **Capture snapshot** - DOM structure
3. **Use quick pattern** - Get detailed info
4. **Analyze results** - Identify issue
5. **Fix code** - Apply solution
6. **Verify** - Repeat quick pattern to confirm

---

## Reference

- See [debug-layout-positioning.md](debug-layout-positioning.md) for full layout debugging guide
- See [inspect-element.md](inspect-element.md) for comprehensive element inspection
- See [visual-regression.md](visual-regression.md) for screenshot testing workflow

---

## Token-Efficient Alternatives: TypeScript Utilities

For repeated operations or when token budgets matter, use TypeScript utilities instead of inline patterns.

### Get Element Outline Tree

**Inline Approach (Default):**

```javascript
// 60+ lines of code to walk DOM tree, format output, collapse repeats...
// (See patterns above for full implementation)
```

**Utility Approach (Token Efficient):**

```typescript
import { getOutline } from '~/.github/skills/dev-browser/utils/outline.ts';

// One line, same result
const outline = await getOutline(page, { 
  selector: 'body',
  maxDepth: 4
});
console.log(outline);
```

**Output:**

```
body
  header#main-header
    nav [role=navigation]
      a "Home" [href=/]
      a "Products" [href=/products] (×5)
  main
    div.product-list
      div.card (×24)
```

**Use when:** Exploring page structure, understanding layout hierarchy.

---

### Get Interactive Elements Only

**Inline Approach:** Complex DOM traversal filtering for interactive elements (~80 lines)

**Utility Approach:**

```typescript
import { getInteractiveOutline } from '~/.github/skills/dev-browser/utils/outline.ts';

const interactive = await getInteractiveOutline(page, 'body');
console.log(interactive);
```

**Output:**

```
header
  a "Home" [href=/]
  a "Products" [href=/products]
main
  button "Add to Cart"
  input [type=text] [placeholder="Search"]
footer
  a "Contact" [href=/contact]
```

**Use when:** Finding clickable elements, understanding page actions.

---

### Get Visible Text

**Inline Approach:** TreeWalker with visibility checks (~40 lines)

**Utility Approach:**

```typescript
import { getVisibleText } from '~/.github/skills/dev-browser/utils/text.ts';

const text = await getVisibleText(page, { limit: 5000 });
console.log(text);
```

**Use when:** Reading page content, searching for text, understanding information architecture.

---

### Wait for Page Load (Smart)

**Inline Approach:** Performance API monitoring, ad filtering (~100 lines)

**Utility Approach:**

```typescript
import { waitForPageLoad } from '~/.github/skills/dev-browser/utils/wait.ts';

await page.goto('http://localhost:5173');
const result = await waitForPageLoad(page);
console.log(`Loaded: ${result.success}, readyState: ${result.readyState}`);
```

**Use when:** Ensuring page fully loaded before inspecting, avoiding flaky timing.

---

### Element Reference Persistence

**Problem:** Element handles lost when Playwright reconnects

**Solution:** Store refs in browser context

```typescript
import { persistRefs, selectRef } from '~/.github/skills/dev-browser/utils/refs.ts';

// First script - store refs
const loginButton = await page.locator('button:has-text("Sign In")');
await persistRefs(page, { loginButton });

// Later script - retrieve refs (survives reconnection!)
const button = await selectRef(page, 'loginButton');
await button.click();
```

**Use when:** Multi-step debugging where you want to save element references.

---

### Setup Instructions

One-time setup:

```bash
cd ~/.github/skills/dev-browser
npm install
```

Run tests to verify:

```bash
npm test
```

### When to Use Utilities

**Choose Inline (Default):**

- ✅ First exploration
- ✅ Learning patterns
- ✅ Need to customize
- ✅ One-time task

**Choose Utilities:**

- ✅ Repeated operations
- ✅ Token budget matters
- ✅ Type safety needed
- ✅ Production scripts

### Complete Reference

See [SKILL.md - Advanced: TypeScript Utilities](../SKILL.md#advanced-typescript-utilities) for:

- Full API documentation
- Setup instructions
- Error handling
- Testing utilities
