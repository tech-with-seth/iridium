# Visual Regression Testing Workflow

A guide for using screenshots to verify visual changes, test component variants, and catch unintended visual regressions.

## When to Use

- Verifying bug fix worked visually
- Testing theme switching (light/dark mode)
- Checking component variant changes (sizes, colors, states)
- Responsive design at different breakpoints
- Before/after comparison for refactoring
- Documenting visual issues for team
- Testing DaisyUI component customization

## Workflow

### Standard Visual Regression Flow

1. **Establish Baseline** - Take screenshot before changes
2. **Make Code Changes** - Implement feature/fix/refactor
3. **Capture Comparison** - Take screenshot after changes
4. **Analyze Differences** - Document visual changes
5. **Verify Intent** - Confirm changes match expectations

## Common Scenarios

### Scenario 1: Verify Bug Fix

**User reports:** "Button is too close to the input field"

#### Step 1: Capture Baseline (Bug State)

```markdown
1. Navigate to http://localhost:5173/forms
2. Take screenshot to capture current (buggy) state
```

**Save screenshot mentally or document:**

- Button and input field spacing
- Other elements for reference

#### Step 2: Apply Fix

```typescript
// Before (buggy)
<div>
    <input type="text" className="input" />
    <button className="btn">Submit</button>
</div>

// After (fixed)
<div className="space-y-4">
    <input type="text" className="input" />
    <button className="btn">Submit</button>
</div>
```

#### Step 3: Capture Comparison

```markdown
1. Reload page (or save file and wait for HMR)
2. Take screenshot of the fixed state
```

#### Step 4: Analyze Differences

Compare the two screenshots:

- ✅ Button now has proper spacing (1rem gap)
- ✅ Input field position unchanged
- ✅ No unintended side effects

#### Step 5: Document

**Finding:** Added `space-y-4` (1rem vertical gap) between input and button. Visual issue resolved.

---

### Scenario 2: Theme Switching

**Task:** Verify application works correctly in dark mode

#### Step 1: Capture Light Theme

```markdown
1. Navigate to http://localhost:5173/dashboard
2. Verify data-theme="light" on <html> element:
```

```javascript
document.documentElement.getAttribute('data-theme')
```

```markdown
3. Take screenshot of light theme
```

#### Step 2: Switch Theme

```javascript
// Switch to dark theme
document.documentElement.setAttribute('data-theme', 'dark')
```

#### Step 3: Capture Dark Theme

```markdown
Take screenshot of dark theme
```

#### Step 4: Verify Color Contrast

Check that UI is readable in both themes:

```javascript
// Check if background/foreground have proper contrast
const body = document.body;
const computed = getComputedStyle(body);

({
    backgroundColor: computed.backgroundColor,
    color: computed.color,
    theme: document.documentElement.getAttribute('data-theme')
})
```

#### Step 5: Test All Available Themes

DaisyUI includes multiple themes. Test key themes:

```javascript
const themes = ['light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave', 'cyberpunk'];

for (const theme of themes) {
    document.documentElement.setAttribute('data-theme', theme);
    // Take screenshot for each theme
}
```

**What to verify:**

- Text is readable (sufficient contrast)
- Interactive elements clearly visible
- Brand colors still recognizable
- No jarring color combinations
- Icons/images work on all backgrounds

---

### Scenario 3: Responsive Breakpoints

**Task:** Verify card grid layout at all breakpoints

#### Expected Behavior

- Mobile (< 640px): 1 column
- Tablet (640-1023px): 2 columns  
- Desktop (>= 1024px): 3 columns

#### Step 1: Mobile Viewport

```javascript
// Resize viewport to mobile
window.resizeTo(375, 812);  // iPhone X dimensions
```

```markdown
1. Take screenshot at 375px width
2. Verify single column layout
```

#### Step 2: Tablet Viewport

```javascript
window.resizeTo(768, 1024);  // iPad dimensions
```

```markdown
1. Take screenshot at 768px width
2. Verify two column layout
```

#### Step 3: Desktop Viewport

```javascript
window.resizeTo(1440, 900);  // Desktop dimensions
```

```markdown
1. Take screenshot at 1440px width
2. Verify three column layout
```

#### Step 4: Verify Grid Configuration

At each breakpoint, check the actual grid:

```javascript
const grid = document.querySelector('.grid');
const computed = getComputedStyle(grid);

({
    viewportWidth: window.innerWidth,
    gridTemplateColumns: computed.gridTemplateColumns,
    columnCount: computed.gridTemplateColumns.split(' ').length
})
```

**Expected results:**

- 375px: `gridTemplateColumns` = `1fr` (1 column)
- 768px: `gridTemplateColumns` = `1fr 1fr` (2 columns)
- 1440px: `gridTemplateColumns` = `1fr 1fr 1fr` (3 columns)

---

### Scenario 4: Component Variant Testing

**Task:** Test all button variants render correctly

#### Step 1: Navigate to Design System

```markdown
Navigate to http://localhost:5173/design
```

The `/design` route in Iridium shows all component variants for visual testing.

#### Step 2: Capture Variant Screenshots

Test each button variant:

```javascript
// Find all buttons
const buttons = document.querySelectorAll('.btn');

buttons.forEach((btn, i) => {
    console.log(`Button ${i}:`, {
        classes: Array.from(btn.classList),
        text: btn.textContent.trim()
    });
});
```

#### Step 3: Test Sizes

```markdown
1. Scroll to button size section
2. Take screenshot showing xs, sm, md, lg, xl buttons together
3. Verify size progression is consistent
```

#### Step 4: Test Colors/Status

```markdown
1. Scroll to button status section  
2. Take screenshot showing primary, secondary, accent, etc.
3. Verify colors match theme
```

#### Step 5: Test States

```markdown
1. Hover over button (use browser_hover)
2. Take screenshot of hover state
3. Click button (use browser_click)
4. Take screenshot of active state
5. Verify loading state if applicable
```

**Checklist for button variants:**

- [ ] All sizes render with correct proportions
- [ ] All colors have sufficient contrast
- [ ] Hover states are visually distinct
- [ ] Active/pressed states provide feedback
- [ ] Loading state shows spinner
- [ ] Disabled state is clearly muted

---

### Scenario 5: Before/After Refactoring

**Task:** Refactor component to use CVA, ensure no visual changes

#### Step 1: Baseline Before Refactoring

```markdown
1. Navigate to page using old component
2. Take screenshot of current state
3. Document any quirks or expected behavior
```

```javascript
// Capture old component classes
const oldButton = document.querySelector('.old-button');
({
    classes: Array.from(oldButton.classList),
    computedStyles: {
        padding: getComputedStyle(oldButton).padding,
        fontSize: getComputedStyle(oldButton).fontSize,
        borderRadius: getComputedStyle(oldButton).borderRadius,
        backgroundColor: getComputedStyle(oldButton).backgroundColor
    }
})
```

#### Step 2: Refactor Component

```typescript
// Before: Inline classes
<button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-focus">
    Click me
</button>

// After: CVA variant
<Button status="primary" size="md">
    Click me
</Button>
```

#### Step 3: Comparison Screenshot

```markdown
1. Reload page with new component
2. Take screenshot of new state
```

```javascript
// Capture new component classes
const newButton = document.querySelector('.btn');
({
    classes: Array.from(newButton.classList),
    computedStyles: {
        padding: getComputedStyle(newButton).padding,
        fontSize: getComputedStyle(newButton).fontSize,
        borderRadius: getComputedStyle(newButton).borderRadius,
        backgroundColor: getComputedStyle(newButton).backgroundColor
    }
})
```

#### Step 4: Verify Pixel-Perfect Match

**Must match:**

- Padding (should be identical)
- Font size (should be identical)
- Border radius (should be identical)
- Background color (should be identical)

**Can differ:**

- Class names (expected, using CVA now)
- HTML structure (if improved for accessibility)

---

### Scenario 6: Modal/Overlay Positioning

**Task:** Verify modal centers correctly at all viewport sizes

#### Step 1: Open Modal

```markdown
1. Navigate to page with modal
2. Click button to open modal
```

```javascript
document.getElementById('my-modal').showModal();
```

#### Step 2: Take Screenshots at Multiple Sizes

```javascript
const viewports = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1440, height: 900, name: 'Desktop' }
];

for (const vp of viewports) {
    window.resizeTo(vp.width, vp.height);
    // Take screenshot at this size
}
```

#### Step 3: Verify Modal Position

At each viewport size:

```javascript
const modal = document.querySelector('.modal-box');
const rect = modal.getBoundingClientRect();
const windowCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const modalCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

({
    viewport: { width: window.innerWidth, height: window.innerHeight },
    modalCenter,
    windowCenter,
    offset: {
        x: Math.abs(modalCenter.x - windowCenter.x),
        y: Math.abs(modalCenter.y - windowCenter.y)
    },
    isCentered: {
        horizontal: Math.abs(modalCenter.x - windowCenter.x) < 10,
        vertical: Math.abs(modalCenter.y - windowCenter.y) < 50  // Some vertical bias is OK
    }
})
```

**Expected:** Modal should be centered horizontally at all sizes, reasonably centered vertically (slight top bias is normal for better mobile UX).

---

## Testing Complex Interactions

### Animation/Transition Testing

**Task:** Verify drawer open/close animation

#### Step 1: Closed State

```markdown
1. Navigate to page with drawer
2. Take screenshot of closed state
```

#### Step 2: Open Drawer

```javascript
// Open drawer
document.getElementById('my-drawer').checked = true;
```

#### Step 3: Mid-Animation (Optional)

```javascript
// Wait for animation to start but not complete
setTimeout(() => {
    // Take screenshot during transition
}, 150);  // Adjust timing based on animation duration
```

#### Step 4: Fully Open State

```markdown
Take screenshot of fully open drawer
```

#### Step 5: Verify Transform

```javascript
const drawer = document.querySelector('.drawer-side');
const computed = getComputedStyle(drawer);

({
    transform: computed.transform,
    transition: computed.transition,
    visibility: computed.visibility
})
```

---

## Screenshot Comparison Checklist

When comparing before/after screenshots:

- [ ] **Layout** - Element positions match expectations?
- [ ] **Spacing** - Margins, padding, gaps correct?
- [ ] **Typography** - Font sizes, weights, line heights?
- [ ] **Colors** - Backgrounds, text, borders correct?
- [ ] **Borders** - Border width, radius, color?
- [ ] **Shadows** - Box shadows, text shadows?
- [ ] **Alignment** - Elements aligned properly?
- [ ] **Sizing** - Element dimensions correct?
- [ ] **Overflow** - No unexpected clipping or scrollbars?
- [ ] **Responsive** - Works at all breakpoints?

---

## Documenting Visual Changes

### Template for Reporting Visual Changes

```markdown
## Visual Change Report

**Component:** [Button / Modal / Card / etc.]
**Route:** /dashboard
**Viewport:** 1440x900 (Desktop)

### Before
[Screenshot or description]
- Classes: btn, btn-primary, btn-md
- Background: #570DF8 (primary color)
- Padding: 12px 16px

### After  
[Screenshot or description]
- Classes: btn, btn-secondary, btn-md
- Background: #F000B8 (secondary color)
- Padding: 12px 16px

### Changes
- ✅ **Intended:** Changed button color from primary to secondary
- ✅ **No side effects:** Padding, size, and border-radius unchanged

### Verification
- [ ] Tested in light theme
- [ ] Tested in dark theme  
- [ ] Tested on mobile (375px)
- [ ] Tested on tablet (768px)
- [ ] Tested on desktop (1440px)
```

---

## Integration with Other Skills

After visual regression testing:

- **Create E2E test** → Use `create-e2e-test` to automate checks
- **Fix layout issues** → See [debug-layout-positioning.md](debug-layout-positioning.md)
- **Inspect elements** → See [inspect-element.md](inspect-element.md)

---

## Tips for Effective Visual Testing

### 1. Test at Standard Viewport Sizes

Common sizes to test:

- **Mobile:** 375x667 (iPhone SE), 390x844 (iPhone 12/13)
- **Tablet:** 768x1024 (iPad), 820x1180 (iPad Air)
- **Desktop:** 1280x720, 1440x900, 1920x1080

### 2. Test All Interactive States

- Default (resting)
- Hover
- Active (pressed)
- Focus (keyboard navigation)
- Disabled
- Loading

### 3. Test Light and Dark Mode

Always verify both themes unless app is single-theme.

### 4. Take Notes During Testing

Document unexpected findings even if they're not bugs.

### 5. Use Consistent Testing Order

Develop a checklist and follow it every time for consistency.

### 6. Compare Screenshots Side-by-Side

Use an image diff tool or open screenshots in separate windows for comparison.

---

## Reference

- DaisyUI Themes: <https://daisyui.com/docs/themes/>
- Tailwind Responsive: <https://tailwindcss.com/docs/responsive-design>
- See `.github/instructions/component-patterns.instructions.md` for component standards
- See [quick-patterns.md](quick-patterns.md) for inspection snippets
