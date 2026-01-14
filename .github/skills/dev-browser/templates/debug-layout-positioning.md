# Debug Layout & Positioning Issues

A comprehensive guide for debugging flexbox, grid, z-index, responsive design, and positioning problems in Iridium apps.

## When to Use

- Elements not aligning properly (flexbox/grid)
- Modal or dropdown hidden behind other content (z-index)
- Sticky navbar not sticking
- Responsive layout breaks at certain screen sizes
- Content overflowing or clipping
- Elements positioned incorrectly (absolute/fixed)
- Spacing issues (gap, margin, padding)
- Drawer or sidebar positioning problems

## Workflow

### 1. Navigate & Visual Confirmation

Take a screenshot to confirm the visual issue.

```markdown
1. Navigate to http://localhost:5173/[route]
2. Take screenshot to see the layout problem
```

### 2. Get Page Structure

Use `browser_snapshot` to understand the DOM hierarchy.

```markdown
Capture snapshot to see element relationships
```

### 3. Inspect Layout Configuration

Use `browser_evaluate` to inspect layout properties.

## Layout Debugging Patterns

### A. Flexbox Container Inspection

Check if parent container is using flexbox and how items are configured.

```javascript
const container = document.querySelector('[selector]');
const computed = getComputedStyle(container);

({
    display: computed.display,                    // Should be 'flex'
    flexDirection: computed.flexDirection,        // row, column, row-reverse, column-reverse
    justifyContent: computed.justifyContent,      // Main axis alignment
    alignItems: computed.alignItems,              // Cross axis alignment
    alignContent: computed.alignContent,          // Multi-line alignment
    flexWrap: computed.flexWrap,                  // nowrap, wrap, wrap-reverse
    gap: computed.gap,                           // Space between items
    rowGap: computed.rowGap,
    columnGap: computed.columnGap
})
```

**Common issues:**

- `display` not set to `flex`
- Wrong `flexDirection` (expecting row but it's column)
- Missing `gap` causing items to touch
- `alignItems` not set causing vertical misalignment

### B. Flexbox Child Inspection

Check how child elements behave within flex container.

```javascript
const child = document.querySelector('[selector]');
const computed = getComputedStyle(child);

({
    flex: computed.flex,                    // Shorthand: flex-grow flex-shrink flex-basis
    flexGrow: computed.flexGrow,            // Can it grow? (0 = no, 1 = yes)
    flexShrink: computed.flexShrink,        // Can it shrink? (0 = no, 1 = yes)
    flexBasis: computed.flexBasis,          // Initial size
    alignSelf: computed.alignSelf,          // Override parent alignItems
    width: computed.width,
    minWidth: computed.minWidth,
    maxWidth: computed.maxWidth,
    margin: computed.margin,
    padding: computed.padding
})
```

**Common issues:**

- `flexShrink: 0` preventing element from shrinking in small viewports
- `flexGrow: 1` causing element to fill entire container
- Fixed width preventing responsive behavior
- Margin pushing element out of container

### C. Grid Container Inspection

Check grid configuration and track sizing.

```javascript
const container = document.querySelector('[selector]');
const computed = getComputedStyle(container);

({
    display: computed.display,                    // Should be 'grid'
    gridTemplateColumns: computed.gridTemplateColumns,  // Column tracks
    gridTemplateRows: computed.gridTemplateRows,        // Row tracks
    gridAutoFlow: computed.gridAutoFlow,                // row, column, dense
    gap: computed.gap,                                  // Space between cells
    rowGap: computed.rowGap,
    columnGap: computed.columnGap,
    justifyItems: computed.justifyItems,                // Horizontal alignment
    alignItems: computed.alignItems,                    // Vertical alignment
    justifyContent: computed.justifyContent,            // Grid alignment in container
    alignContent: computed.alignContent
})
```

**Common Iridium grid patterns:**

- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` - Responsive card grid
- `grid-cols-[auto_1fr]` - Sidebar + main content
- `gap-4` - Standard spacing between items

### D. Grid Child Inspection

Check how child elements are placed in grid.

```javascript
const child = document.querySelector('[selector]');
const computed = getComputedStyle(child);

({
    gridColumn: computed.gridColumn,        // Column placement
    gridRow: computed.gridRow,              // Row placement
    gridColumnStart: computed.gridColumnStart,
    gridColumnEnd: computed.gridColumnEnd,
    gridRowStart: computed.gridRowStart,
    gridRowEnd: computed.gridRowEnd,
    justifySelf: computed.justifySelf,      // Override parent justifyItems
    alignSelf: computed.alignSelf,          // Override parent alignItems
    width: computed.width,
    height: computed.height
})
```

**Common issues:**

- `grid-column: span 2` spanning more columns than expected
- Missing grid placement causing items to auto-place incorrectly
- Fixed width/height preventing responsive sizing

## Z-Index & Stacking Context Debugging

### Stacking Context Analysis

Walk up the DOM tree to find all stacking contexts affecting element.

```javascript
const element = document.querySelector('[selector]');

// Find all stacking contexts up to body
let current = element;
const stackingContexts = [];

while (current && current !== document.body) {
    const style = getComputedStyle(current);
    const position = style.position;
    const zIndex = style.zIndex;
    const opacity = parseFloat(style.opacity);
    const transform = style.transform;
    const willChange = style.willChange;
    
    // Check if this creates a stacking context
    const createsContext = 
        (position !== 'static' && zIndex !== 'auto') ||
        opacity < 1 ||
        (transform && transform !== 'none') ||
        willChange === 'transform' ||
        willChange === 'opacity';
    
    if (createsContext) {
        stackingContexts.push({
            element: current.tagName + (current.className ? '.' + current.className.split(' ').slice(0, 2).join('.') : ''),
            position,
            zIndex,
            opacity,
            transform: transform === 'none' ? 'none' : 'applied',
            depth: stackingContexts.length
        });
    }
    
    current = current.parentElement;
}

({
    elementZIndex: getComputedStyle(element).zIndex,
    elementPosition: getComputedStyle(element).position,
    stackingContexts,
    recommendation: stackingContexts.length === 0 
        ? 'Element not in any stacking context - set position and z-index on parent'
        : `Element is in ${stackingContexts.length} nested stacking context(s)`
})
```

**Common z-index issues in Iridium:**

- Modal z-index too low (DaisyUI modals default: `z-50`)
- Navbar sticky with low z-index (should be `z-50` or higher)
- Dropdown hidden behind sibling with higher z-index
- Transform creating unintended stacking context

**DaisyUI z-index scale:**

- `z-0` - Base layer
- `z-10` - Dropdowns, tooltips
- `z-20` - Sticky elements
- `z-30` - Fixed navigation
- `z-40` - Drawer overlay
- `z-50` - Modal backdrop
- `z-[999]` - Always on top

### Element Visibility Check

Comprehensive check for why element might not be visible.

```javascript
const element = document.querySelector('[selector]');
const computed = getComputedStyle(element);
const rect = element.getBoundingClientRect();

({
    // Display properties
    display: computed.display,           // 'none' hides element
    visibility: computed.visibility,     // 'hidden' hides but keeps space
    opacity: computed.opacity,           // '0' invisible but interactive
    
    // Position properties
    position: computed.position,
    top: computed.top,
    left: computed.left,
    right: computed.right,
    bottom: computed.bottom,
    
    // Overflow
    overflow: computed.overflow,
    clip: computed.clip,
    clipPath: computed.clipPath,
    
    // Dimensions
    width: computed.width,
    height: computed.height,
    
    // Viewport position
    inViewport: {
        horizontal: rect.left < window.innerWidth && rect.right > 0,
        vertical: rect.top < window.innerHeight && rect.bottom > 0,
        fully: rect.top >= 0 && rect.left >= 0 && 
               rect.bottom <= window.innerHeight && 
               rect.right <= window.innerWidth
    },
    
    // Attributes
    hidden: element.hasAttribute('hidden'),
    ariaHidden: element.getAttribute('aria-hidden')
})
```

## Responsive Design Debugging

### Check Active Breakpoint

Verify which Tailwind CSS breakpoint is currently active.

```javascript
const width = window.innerWidth;

({
    viewportWidth: width,
    viewportHeight: window.innerHeight,
    
    // Current breakpoint (Tailwind CSS defaults)
    currentBreakpoint: 
        width < 640 ? 'base (< 640px)' :
        width < 768 ? 'sm (640px - 767px)' :
        width < 1024 ? 'md (768px - 1023px)' :
        width < 1280 ? 'lg (1024px - 1279px)' :
        width < 1536 ? 'xl (1280px - 1535px)' : '2xl (>= 1536px)',
    
    // Breakpoint booleans
    breakpoints: {
        sm: width >= 640,
        md: width >= 768,
        lg: width >= 1024,
        xl: width >= 1280,
        '2xl': width >= 1536
    },
    
    // Device orientation
    orientation: width > window.innerHeight ? 'landscape' : 'portrait'
})
```

### Check Responsive Classes

Verify which responsive classes are applied to an element.

```javascript
const element = document.querySelector('[selector]');
const classes = Array.from(element.classList);

({
    allClasses: classes,
    
    // Base classes (no prefix)
    baseClasses: classes.filter(c => !c.includes(':')),
    
    // Responsive classes by breakpoint
    smClasses: classes.filter(c => c.startsWith('sm:')),
    mdClasses: classes.filter(c => c.startsWith('md:')),
    lgClasses: classes.filter(c => c.startsWith('lg:')),
    xlClasses: classes.filter(c => c.startsWith('xl:')),
    '2xlClasses': classes.filter(c => c.startsWith('2xl:')),
    
    // Mobile-first check
    hasMobileFirst: classes.some(c => !c.includes(':')) && 
                     classes.some(c => c.includes(':'))
})
```

**Common responsive issues:**

- Missing base class (mobile-first pattern broken)
- Wrong breakpoint used (should be `md:` but using `lg:`)
- Conflicting classes at different breakpoints
- Not using `container` wrapper for max-width

## Overflow & Scrolling Issues

### Container Overflow Debugging

Check if content is overflowing and how it's handled.

```javascript
const container = document.querySelector('[selector]');
const computed = getComputedStyle(container);

({
    // Overflow properties
    overflow: computed.overflow,
    overflowX: computed.overflowX,
    overflowY: computed.overflowY,
    
    // Dimensions
    clientWidth: container.clientWidth,      // Visible width
    scrollWidth: container.scrollWidth,      // Total width including overflow
    clientHeight: container.clientHeight,    // Visible height
    scrollHeight: container.scrollHeight,    // Total height including overflow
    
    // Is content overflowing?
    isOverflowing: {
        horizontal: container.scrollWidth > container.clientWidth,
        vertical: container.scrollHeight > container.clientHeight
    },
    
    // Scroll position
    scrollLeft: container.scrollLeft,
    scrollTop: container.scrollTop,
    
    // Width properties
    width: computed.width,
    maxWidth: computed.maxWidth,
    minWidth: computed.minWidth
})
```

**Common overflow issues:**

- `overflow: hidden` clipping content unintentionally
- Missing `overflow-x-auto` causing horizontal scroll
- `whitespace-nowrap` causing text to overflow
- Flex child too wide, no `min-w-0` to allow shrinking

## Positioning Issues

### Sticky Element Debugging

Check if sticky positioning is working correctly.

```javascript
const element = document.querySelector('[selector]');
const computed = getComputedStyle(element);
const rect = element.getBoundingClientRect();

({
    position: computed.position,         // Should be 'sticky'
    top: computed.top,                   // Offset from top (e.g., '0px')
    zIndex: computed.zIndex,             // Should be high enough
    
    // Parent container affects sticky
    parentOverflow: getComputedStyle(element.parentElement).overflow,  // Must not be 'hidden'
    parentHeight: element.parentElement.clientHeight,
    
    // Current position
    distanceFromTop: rect.top,
    isStuck: rect.top === parseInt(computed.top)
})
```

**Sticky not working?**

- Parent has `overflow: hidden`, `overflow: auto`, or `overflow: scroll`
- Missing `top`, `right`, `bottom`, or `left` value
- Parent height too short (no room to scroll)
- Element inside flex/grid container

### Absolute/Fixed Positioning

Check absolute or fixed positioning configuration.

```javascript
const element = document.querySelector('[selector]');
const computed = getComputedStyle(element);

// Find positioned ancestor
let positionedAncestor = element.parentElement;
while (positionedAncestor && positionedAncestor !== document.body) {
    const style = getComputedStyle(positionedAncestor);
    if (style.position !== 'static') break;
    positionedAncestor = positionedAncestor.parentElement;
}

({
    position: computed.position,
    top: computed.top,
    right: computed.right,
    bottom: computed.bottom,
    left: computed.left,
    transform: computed.transform,
    
    // Positioned ancestor (absolute relative to this)
    positionedAncestor: positionedAncestor ? {
        element: positionedAncestor.tagName + '.' + positionedAncestor.className.split(' ')[0],
        position: getComputedStyle(positionedAncestor).position
    } : 'body (no positioned ancestor)'
})
```

## Common Iridium Layout Patterns

### Navbar with Sticky Positioning

**Expected structure:**

```html
<nav class="navbar bg-base-200 sticky top-0 z-50">
  <div class="navbar-start">...</div>
  <div class="navbar-center">...</div>
  <div class="navbar-end">...</div>
</nav>
```

**Debug:**

```javascript
const navbar = document.querySelector('.navbar');
const computed = getComputedStyle(navbar);

({
    position: computed.position,  // Should be 'sticky'
    top: computed.top,            // Should be '0px'
    zIndex: computed.zIndex,      // Should be '50' or higher
    backgroundColor: computed.backgroundColor,
    display: computed.display     // Should be 'flex'
})
```

### Drawer Layout

**Expected structure:**

```html
<div class="drawer">
  <input type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">...</div>
  <div class="drawer-side">...</div>
</div>
```

**Debug:**

```javascript
const drawer = document.querySelector('.drawer');
const toggle = drawer.querySelector('.drawer-toggle');
const side = drawer.querySelector('.drawer-side');

({
    drawerDisplay: getComputedStyle(drawer).display,
    toggleChecked: toggle.checked,
    sideTransform: getComputedStyle(side).transform,
    sideWidth: getComputedStyle(side).width
})
```

### Modal Overlay

**Expected structure:**

```html
<dialog class="modal">
  <div class="modal-box">...</div>
  <form method="dialog" class="modal-backdrop">...</form>
</dialog>
```

**Debug:**

```javascript
const modal = document.querySelector('.modal');
const box = modal.querySelector('.modal-box');

({
    modalOpen: modal.open,
    modalDisplay: getComputedStyle(modal).display,
    modalZIndex: getComputedStyle(modal).zIndex,
    boxZIndex: getComputedStyle(box).zIndex,
    boxPosition: getComputedStyle(box).position
})
```

### Card Grid Layout

**Expected structure:**

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="card">...</div>
</div>
```

**Debug:**

```javascript
const grid = document.querySelector('.grid');
const computed = getComputedStyle(grid);

({
    display: computed.display,                      // Should be 'grid'
    gridTemplateColumns: computed.gridTemplateColumns,  // Check column count
    gap: computed.gap,
    childCount: grid.children.length
})
```

## Complete Example: Debug Modal Not Appearing

**User:** "Modal button does nothing, modal doesn't show"

### Step 1: Navigate & Screenshot

```markdown
1. Navigate to http://localhost:5173/dashboard
2. Click the "Open Modal" button
3. Take screenshot (confirms modal not visible)
```

### Step 2: Check if Modal Rendered

```javascript
const modal = document.querySelector('.modal');

({
    exists: !!modal,
    open: modal?.open,
    display: modal ? getComputedStyle(modal).display : 'not found'
})
```

**Finding:** Modal exists but `open` is `false`, `display` is `none`.

### Step 3: Check Z-Index & Stacking

```javascript
const modal = document.querySelector('.modal');
const backdrop = modal.querySelector('.modal-backdrop');

({
    modalZIndex: getComputedStyle(modal).zIndex,
    modalPosition: getComputedStyle(modal).position,
    backdropZIndex: backdrop ? getComputedStyle(backdrop).zIndex : 'not found',
    
    // Check if something is covering it
    elementAtCenter: document.elementFromPoint(
        window.innerWidth / 2, 
        window.innerHeight / 2
    ).className
})
```

**Finding:** Modal has `z-index: 50` but another element has `z-index: 100`.

### Step 4: Identify Issue

Modal not opening because:

1. JavaScript not calling `.showModal()`
2. Or modal z-index too low

### Step 5: Suggest Fix

```typescript
// Ensure modal opens
<button onclick="document.getElementById('my-modal').showModal()">
    Open Modal
</button>

// Increase z-index if needed
<dialog id="my-modal" class="modal z-[999]">
    <div class="modal-box">...</div>
</dialog>
```

## Tips for Layout Debugging

### 1. Start with Container, Then Children

Always check parent flex/grid configuration before debugging children.

### 2. Use Browser DevTools Alongside

Playwright debugging complements (not replaces) browser DevTools. Use both.

### 3. Check Responsive at Multiple Widths

Test at common breakpoints: 375px (mobile), 768px (tablet), 1280px (desktop).

### 4. Verify Mobile-First Pattern

Tailwind uses mobile-first. Base classes apply to all sizes, responsive prefixes override.

### 5. Draw Mental Box Model

Think about margin → border → padding → content for each element.

## After Finding the Issue

1. **Fix the code** - Update classes, add container, adjust positioning
2. **Test at multiple breakpoints** - Verify responsive behavior
3. **Check on mobile device** - Real device may differ from emulation
4. **Take comparison screenshot** - Before/after confirmation
5. **Add comments** - Document subtle layout decisions

## Integration with Other Templates

- **Component styles** → See [inspect-element.md](inspect-element.md)
- **Visual regression** → See [visual-regression.md](visual-regression.md)
- **Quick patterns** → See [quick-patterns.md](quick-patterns.md)

## Reference

- Tailwind Flexbox: <https://tailwindcss.com/docs/flex>
- Tailwind Grid: <https://tailwindcss.com/docs/grid-template-columns>
- DaisyUI Layout: <https://daisyui.com/components/>
- See `.github/instructions/component-patterns.instructions.md` for Iridium patterns
