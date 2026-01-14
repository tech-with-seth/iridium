# Inspect DOM Element or CSS Styles

A guide for debugging visual issues, layout problems, and CSS styling with Playwright MCP tools.

## When to Use

- Element not appearing as expected
- CSS styles not applying correctly
- Layout issues (positioning, sizing, overflow, alignment)
- z-index or visibility problems
- Responsive design not working
- DaisyUI or Tailwind classes not working
- Component variants not applying

## Workflow

### 1. Navigate & Screenshot

Start by taking a screenshot to visually identify the element with issues.

```markdown
1. Navigate to http://localhost:5173/[route]
2. Take screenshot to see current visual state
```

**Why screenshot first:**

- Confirms the visual issue exists
- Provides reference for comparison
- Helps identify the element location
- Useful for before/after comparisons

### 2. Get Page Structure

Use `browser_snapshot` to get the DOM tree and locate the element.

```markdown
Capture snapshot to get DOM structure
```

**What to look for:**

- Element exists in DOM?
- Correct nesting/hierarchy?
- Text content matches expected?
- ARIA roles and attributes correct?

**Ways to locate elements:**

- By text content
- By role (button, link, heading)
- By ARIA label
- By class names
- By data attributes

### 3. Inspect Element Properties

Use `browser_evaluate` to run JavaScript and get detailed element information.

#### Get Computed Styles

```javascript
const el = document.querySelector('[selector]');
const computed = window.getComputedStyle(el);
({
    display: computed.display,
    visibility: computed.visibility,
    opacity: computed.opacity,
    position: computed.position,
    top: computed.top,
    left: computed.left,
    width: computed.width,
    height: computed.height,
    zIndex: computed.zIndex,
    overflow: computed.overflow,
    backgroundColor: computed.backgroundColor,
    color: computed.color
})
```

#### Get Element Dimensions

```javascript
const el = document.querySelector('[selector]');
el.getBoundingClientRect()
```

Returns: `{ x, y, width, height, top, right, bottom, left }`

#### Get Applied Classes

```javascript
const el = document.querySelector('[selector]');
Array.from(el.classList)
```

#### Get All Attributes

```javascript
const el = document.querySelector('[selector]');
Object.fromEntries([...el.attributes].map(a => [a.name, a.value]))
```

#### Get Parent/Child Elements

```javascript
const el = document.querySelector('[selector]');
({
    parent: el.parentElement?.className,
    children: Array.from(el.children).map(c => c.className),
    siblings: Array.from(el.parentElement?.children || [])
        .filter(c => c !== el)
        .map(c => c.className)
})
```

## CVA & Component Variant Debugging

### Detect Variant Conflicts

When CVA components don't display correctly, check for class conflicts.

```javascript
const element = document.querySelector('[selector]');
const classes = Array.from(element.classList);

({
    allClasses: classes,
    
    // Check for size conflicts (multiple size classes)
    sizeClasses: classes.filter(c => 
        c.match(/^(btn|input|select|textarea|badge|avatar|card)-(xs|sm|md|lg|xl)$/)
    ),
    hasSizeConflict: classes.filter(c => 
        c.match(/^(btn|input|select|textarea|badge|avatar|card)-(xs|sm|md|lg|xl)$/)
    ).length > 1,
    
    // Check for color conflicts (multiple color classes)
    colorClasses: classes.filter(c => 
        c.match(/^(btn|input|badge|alert)-(primary|secondary|accent|neutral|info|success|warning|error)$/)
    ),
    hasColorConflict: classes.filter(c => 
        c.match(/^(btn|input|badge|alert)-(primary|secondary|accent|neutral|info|success|warning|error)$/)
    ).length > 1,
    
    // Check for style conflicts
    styleClasses: classes.filter(c => 
        c.match(/^(btn|input)-(outline|ghost|link)$/)
    ),
    hasStyleConflict: classes.filter(c => 
        c.match(/^(btn|input)-(outline|ghost|link)$/)
    ).length > 1
})
```

**Common conflicts:**

- `btn-sm btn-lg` - Multiple sizes
- `btn-primary btn-secondary` - Multiple colors
- `btn-outline btn-ghost` - Multiple styles

### Verify Base Class + Modifiers

DaisyUI requires base class + optional modifiers.

```javascript
const element = document.querySelector('[selector]');
const classes = Array.from(element.classList);

({
    classes,
    
    // Check for base classes
    hasBaseClass: {
        btn: classes.includes('btn'),
        input: classes.includes('input'),
        select: classes.includes('select'),
        textarea: classes.includes('textarea'),
        card: classes.includes('card'),
        modal: classes.includes('modal'),
        badge: classes.includes('badge'),
        alert: classes.includes('alert')
    },
    
    // Check for modifiers
    hasModifiers: {
        size: classes.some(c => c.match(/-(xs|sm|md|lg|xl)$/)),
        color: classes.some(c => c.match(/-(primary|secondary|accent|neutral|info|success|warning|error)$/)),
        style: classes.some(c => c.match(/-(outline|ghost|link|bordered)$/))
    },
    
    // Pattern check
    followsPattern: classes.includes('btn') || classes.includes('input') ? 
        'Has base class' : 'Missing base class - component will not style!'
})
```

**Fix:** Ensure component has base class:

```typescript
// ❌ WRONG - Missing base class
<button className="primary">Click me</button>

// ✅ CORRECT - Has base class + modifier
<button className="btn btn-primary">Click me</button>
```

### Inspect cx() Merged Result

Check how `cx()` utility merged CVA variants with custom classes.

```javascript
const element = document.querySelector('[selector]');
const classes = Array.from(element.classList);

({
    allClasses: classes,
    
    // CVA base classes
    cvaBase: classes.filter(c => 
        c.match(/^(btn|input|select|card|modal|badge)$/)
    ),
    
    // CVA variant classes
    cvaVariants: classes.filter(c => 
        c.match(/^(btn|input|select|card|modal|badge)-(xs|sm|md|lg|xl|primary|secondary|accent|outline|ghost)$/)
    ),
    
    // Custom Tailwind classes
    customClasses: classes.filter(c => 
        !c.startsWith('btn') && 
        !c.startsWith('input') &&
        !c.startsWith('select') &&
        !c.includes('daisy')
    ),
    
    // Check for overrides
    hasCustomOverrides: classes.some(c => 
        c.includes('!') || c.match(/^(bg-|text-|border-|rounded-)/)
    )
})
```

**Use case:** Verify CVA generated correct classes and custom classes didn't conflict.

## DaisyUI Theme Debugging

### Check Active Theme

```javascript
({
    htmlTheme: document.documentElement.getAttribute('data-theme'),
    bodyTheme: document.body.getAttribute('data-theme'),
    effectiveTheme: document.documentElement.getAttribute('data-theme') || 'light (default)'
})
```

**Expected:** Theme attribute should be on `<html>` element, not `<body>`.

### Check CSS Variables

DaisyUI themes use CSS variables for colors.

```javascript
const root = getComputedStyle(document.documentElement);

({
    // Primary colors
    primary: root.getPropertyValue('--p'),
    primaryContent: root.getPropertyValue('--pc'),
    secondary: root.getPropertyValue('--s'),
    secondaryContent: root.getPropertyValue('--sc'),
    accent: root.getPropertyValue('--a'),
    accentContent: root.getPropertyValue('--ac'),
    
    // Neutral colors
    neutral: root.getPropertyValue('--n'),
    neutralContent: root.getPropertyValue('--nc'),
    
    // Base colors
    base100: root.getPropertyValue('--b1'),
    base200: root.getPropertyValue('--b2'),
    base300: root.getPropertyValue('--b3'),
    baseContent: root.getPropertyValue('--bc'),
    
    // Semantic colors
    info: root.getPropertyValue('--in'),
    success: root.getPropertyValue('--su'),
    warning: root.getPropertyValue('--wa'),
    error: root.getPropertyValue('--er')
})
```

**Use case:** Verify theme CSS variables are loaded correctly. Empty values mean theme not applied.

### Element Using Theme Colors

Check if element is using theme colors correctly.

```javascript
const element = document.querySelector('[selector]');
const computed = getComputedStyle(element);

({
    backgroundColor: computed.backgroundColor,
    color: computed.color,
    borderColor: computed.borderColor,
    
    // Check if using CSS variables
    backgroundColorVar: computed.getPropertyValue('background-color'),
    colorVar: computed.getPropertyValue('color')
})
```

## Form Validation State Debugging

### Input Validation State

Comprehensive check of input field validation state.

```javascript
const input = document.querySelector('input[selector]');
const label = input.closest('label');
const formControl = input.closest('.form-control');

({
    // Input properties
    input: {
        value: input.value,
        disabled: input.disabled,
        required: input.required,
        type: input.type,
        name: input.name
    },
    
    // Validation
    validity: {
        valid: input.validity.valid,
        valueMissing: input.validity.valueMissing,
        typeMismatch: input.validity.typeMismatch,
        patternMismatch: input.validity.patternMismatch,
        tooShort: input.validity.tooShort,
        tooLong: input.validity.tooLong,
        validationMessage: input.validationMessage
    },
    
    // Classes
    inputClasses: Array.from(input.classList),
    hasErrorClass: Array.from(input.classList).some(c => c.includes('error')),
    hasSuccessClass: Array.from(input.classList).some(c => c.includes('success')),
    
    // ARIA attributes
    aria: {
        invalid: input.getAttribute('aria-invalid'),
        describedBy: input.getAttribute('aria-describedby'),
        required: input.getAttribute('aria-required')
    },
    
    // Error/helper text
    errorText: formControl?.querySelector('.text-error, .label-text-alt.text-error')?.textContent?.trim(),
    helperText: formControl?.querySelector('.label-text-alt:not(.text-error)')?.textContent?.trim(),
    
    // Label
    labelText: label?.querySelector('.label-text')?.textContent?.trim(),
    hasRequiredIndicator: label?.querySelector('.text-error')?.textContent?.includes('*')
})
```

**Use case:** Debug why validation error messages aren't showing or styles not applying.

### Form Error Messages

Find all error messages in a form.

```javascript
const form = document.querySelector('form[selector]');
const inputs = form.querySelectorAll('input, select, textarea');
const errors = form.querySelectorAll('.text-error, [role="alert"]');

({
    formValid: form.checkValidity(),
    
    inputs: Array.from(inputs).map(input => ({
        name: input.name,
        type: input.type,
        valid: input.validity.valid,
        value: input.value
    })),
    
    errorCount: errors.length,
    errors: Array.from(errors).map(e => ({
        text: e.textContent.trim(),
        visible: getComputedStyle(e).display !== 'none',
        classes: Array.from(e.classList)
    }))
})
```

## Accessibility Tree Debugging

### ARIA Attributes

Check accessibility attributes on interactive elements.

```javascript
const element = document.querySelector('[selector]');

({
    // Basic attributes
    role: element.getAttribute('role') || element.tagName.toLowerCase(),
    tabIndex: element.tabIndex,
    
    // Labels
    ariaLabel: element.getAttribute('aria-label'),
    ariaLabelledBy: element.getAttribute('aria-labelledby'),
    ariaDescribedBy: element.getAttribute('aria-describedby'),
    
    // States
    ariaHidden: element.getAttribute('aria-hidden'),
    ariaDisabled: element.getAttribute('aria-disabled'),
    ariaExpanded: element.getAttribute('aria-expanded'),
    ariaPressed: element.getAttribute('aria-pressed'),
    ariaChecked: element.getAttribute('aria-checked'),
    ariaSelected: element.getAttribute('aria-selected'),
    
    // Validation
    ariaInvalid: element.getAttribute('aria-invalid'),
    ariaRequired: element.getAttribute('aria-required'),
    
    // Semantic text content
    textContent: element.textContent.trim().substring(0, 100)
})
```

**Use case:** Verify element is accessible to screen readers and keyboard navigation.

### Button Accessibility

```javascript
const button = document.querySelector('button[selector]');

({
    // Button properties
    type: button.type,
    disabled: button.disabled,
    name: button.name,
    value: button.value,
    
    // ARIA
    role: button.getAttribute('role'),
    ariaLabel: button.getAttribute('aria-label'),
    ariaPressed: button.getAttribute('aria-pressed'),
    ariaExpanded: button.getAttribute('aria-expanded'),
    
    // Focus
    tabIndex: button.tabIndex,
    canFocus: button.tabIndex >= 0 && !button.disabled,
    
    // Text
    textContent: button.textContent.trim(),
    hasText: button.textContent.trim().length > 0,
    hasAriaLabel: !!button.getAttribute('aria-label'),
    
    // Accessible name
    accessibleName: button.textContent.trim() || button.getAttribute('aria-label') || 'No accessible name!'
})
```

### 4. Check Element State

Based on the issue, check specific properties:

#### Visibility Issues

```javascript
const el = document.querySelector('[selector]');
({
    display: getComputedStyle(el).display,           // 'none' hides element
    visibility: getComputedStyle(el).visibility,     // 'hidden' hides but keeps space
    opacity: getComputedStyle(el).opacity,           // '0' invisible but interactive
    hidden: el.hasAttribute('hidden'),               // HTML hidden attribute
    ariaHidden: el.getAttribute('aria-hidden')       // Screen reader hidden
})
```

#### Positioning Issues

```javascript
const el = document.querySelector('[selector]');
({
    position: getComputedStyle(el).position,    // static, relative, absolute, fixed, sticky
    top: getComputedStyle(el).top,
    left: getComputedStyle(el).left,
    right: getComputedStyle(el).right,
    bottom: getComputedStyle(el).bottom,
    zIndex: getComputedStyle(el).zIndex,
    transform: getComputedStyle(el).transform
})
```

#### Size/Overflow Issues

```javascript
const el = document.querySelector('[selector]');
({
    width: getComputedStyle(el).width,
    height: getComputedStyle(el).height,
    maxWidth: getComputedStyle(el).maxWidth,
    maxHeight: getComputedStyle(el).maxHeight,
    overflow: getComputedStyle(el).overflow,
    overflowX: getComputedStyle(el).overflowX,
    overflowY: getComputedStyle(el).overflowY,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight
})
```

## Common Issues in Iridium Apps

### DaisyUI Component Not Styled

**Symptom:** Button renders but looks like plain text, no styles applied

**Debug:**

1. Take screenshot to confirm no styling
2. Get element classes:

   ```javascript
   document.querySelector('button').classList
   ```

**Common causes:**

- Missing base class (`btn`, `input`, `card`)
- CVA variants not applying
- Tailwind classes not merged correctly with `cx()`

**Example fix:**

```typescript
// ❌ WRONG - Missing base class
<button className="primary">Click me</button>

// ✅ CORRECT - Includes base class
<button className="btn btn-primary">Click me</button>

// ✅ CORRECT - Using CVA helper
import { buttonVariants } from '~/components/Button';
<button className={buttonVariants({ status: 'primary' })}>Click me</button>
```

### Element Hidden or Not Visible

**Symptom:** Element exists in DOM but not visible on page

**Debug:**

1. Check if element is in viewport:

   ```javascript
   const el = document.querySelector('[selector]');
   const rect = el.getBoundingClientRect();
   ({
       inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
       rect
   })
   ```

2. Check visibility styles:

   ```javascript
   const el = document.querySelector('[selector]');
   ({
       display: getComputedStyle(el).display,
       visibility: getComputedStyle(el).visibility,
       opacity: getComputedStyle(el).opacity
   })
   ```

**Common causes:**

- `hidden` attribute or `display: none`
- Conditional rendering hides element
- Middleware/auth check prevents rendering
- Element positioned off-screen
- Parent overflow hidden

### Layout Not Working as Expected

**Symptom:** Elements not positioning correctly, overlapping, or misaligned

**Debug:**

1. Check parent container:

   ```javascript
   const el = document.querySelector('[selector]');
   const parent = el.parentElement;
   ({
       parentDisplay: getComputedStyle(parent).display,      // flex, grid, block?
       parentFlexDirection: getComputedStyle(parent).flexDirection,
       parentJustifyContent: getComputedStyle(parent).justifyContent,
       parentAlignItems: getComputedStyle(parent).alignItems,
       parentGap: getComputedStyle(parent).gap
   })
   ```

2. Check element itself:

   ```javascript
   const el = document.querySelector('[selector]');
   ({
       flex: getComputedStyle(el).flex,
       flexGrow: getComputedStyle(el).flexGrow,
       flexShrink: getComputedStyle(el).flexShrink,
       alignSelf: getComputedStyle(el).alignSelf,
       margin: getComputedStyle(el).margin,
       padding: getComputedStyle(el).padding
   })
   ```

**Common causes:**

- Parent not using flex or grid
- Missing container classes (`container`, `max-w-*`)
- Conflicting margin/padding
- Missing responsive breakpoints (`sm:`, `md:`, `lg:`)

### Responsive Design Issues

**Symptom:** Layout breaks at certain screen sizes

**Debug:**

1. Check viewport size:

   ```javascript
   ({
       width: window.innerWidth,
       height: window.innerHeight,
       breakpoint: window.innerWidth < 640 ? 'sm' :
                   window.innerWidth < 768 ? 'md' :
                   window.innerWidth < 1024 ? 'lg' :
                   window.innerWidth < 1280 ? 'xl' : '2xl'
   })
   ```

2. Check media query application:

   ```javascript
   const el = document.querySelector('[selector]');
   Array.from(el.classList).filter(c =>
       c.startsWith('sm:') || c.startsWith('md:') || c.startsWith('lg:')
   )
   ```

**Common causes:**

- Missing responsive classes
- Wrong breakpoint used
- Mobile-first not followed (missing base class)

## DaisyUI-Specific Debugging

### Check Theme Application

```javascript
({
    theme: document.documentElement.getAttribute('data-theme'),
    availableThemes: ['light', 'dark', 'cupcake', 'bumblebee', /* etc */]
})
```

### Check Component Variants

DaisyUI components have specific modifier classes:

- **Buttons:** `btn-primary`, `btn-secondary`, `btn-accent`, `btn-ghost`
- **Sizes:** `btn-sm`, `btn-md`, `btn-lg`
- **States:** `btn-disabled`, `btn-loading`, `btn-active`
- **Input:** `input-bordered`, `input-primary`, `input-error`
- **Card:** `card-bordered`, `card-compact`, `card-side`

### Check Conflicting Classes

```javascript
const el = document.querySelector('[selector]');
const classes = Array.from(el.classList);

// Look for conflicts
({
    hasMultipleSizes: classes.filter(c => c.match(/btn-(sm|md|lg)/)).length > 1,
    hasMultipleColors: classes.filter(c => c.match(/btn-(primary|secondary|accent)/)).length > 1,
    hasDisplay: classes.filter(c => c.match(/^(block|inline|flex|grid)/)).length > 1
})
```

## Complete Example: Debug Button Not Styled

**User:** "The save button on the profile page looks like plain text"

### Step 1: Navigate & Visual Confirmation

```markdown
1. Navigate to http://localhost:5173/portal
2. Take screenshot to see the unstyled button
```

### Step 2: Get Page Structure

```markdown
Capture snapshot and locate the button element
```

### Step 3: Inspect Classes

```javascript
const btn = document.querySelector('button[type="submit"]');
({
    classes: Array.from(btn.classList),
    text: btn.textContent
})
```

**Finding:**

```json
{
    "classes": ["primary"],
    "text": "Save Changes"
}
```

### Step 4: Check Computed Styles

```javascript
const btn = document.querySelector('button[type="submit"]');
const styles = window.getComputedStyle(btn);
({
    display: styles.display,
    backgroundColor: styles.backgroundColor,
    padding: styles.padding,
    borderRadius: styles.borderRadius
})
```

**Finding:**

All styles are default browser button styles. No DaisyUI styles applied.

### Step 5: Identify Issue

Missing `btn` base class. DaisyUI requires base class + modifier.

### Step 6: Suggest Fix

```typescript
// ❌ WRONG - Missing base class
<Button className="primary" type="submit">
    Save Changes
</Button>

// ✅ CORRECT - Include base class
<Button className="btn btn-primary" type="submit">
    Save Changes
</Button>

// ✅ BETTER - Use CVA variant
<Button status="primary" type="submit">
    Save Changes
</Button>
```

## Tips for Element Inspection

### 1. Start Broad, Then Narrow

1. Screenshot - Visual confirmation
2. Snapshot - DOM structure
3. Evaluate - Specific properties

### 2. Check Parent and Children

Issues often come from parent containers or child element conflicts.

### 3. Use Browser DevTools Terminology

Refer to styles as "computed" vs "inline" vs "stylesheet" styles.

### 4. Consider Specificity

Multiple classes or inline styles may override each other. Higher specificity wins.

### 5. Check Pseudo-Classes and States

Hover, focus, active states may behave differently. Check with:

```javascript
const el = document.querySelector('[selector]');
({
    hover: el.matches(':hover'),
    focus: el.matches(':focus'),
    active: el.matches(':active'),
    disabled: el.disabled
})
```

## After Finding the Issue

1. **Fix the code** - Update component or styles
2. **Verify fix** - Take screenshot again to confirm
3. **Check other instances** - Search for similar issues
4. **Update component** - If CVA component, update variants
5. **Add documentation** - Note any subtle behavior

## Integration with Other Templates

- **Layout issues** → See [debug-layout-positioning.md](debug-layout-positioning.md)
- **Visual regression** → See [visual-regression.md](visual-regression.md)
- **Quick patterns** → See [quick-patterns.md](quick-patterns.md)
- **Console errors** → See [check-console-errors.md](check-console-errors.md)
- **Component not rendering** → See [debug-localhost.md](debug-localhost.md)
- **API data issues** → See [monitor-network.md](monitor-network.md)

## Reference

- DaisyUI Components: <https://daisyui.com/components/>
- Tailwind CSS Docs: <https://tailwindcss.com/docs>
- CVA Documentation: <https://cva.style/docs>
- See `.github/instructions/component-patterns.instructions.md` for component patterns
- See `.github/instructions/cva.instructions.md` for CVA usage
