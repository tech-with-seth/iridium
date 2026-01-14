---
name: dev-browser
description: Browse and debug web pages, check console errors, inspect DOM elements, and monitor network requests using Playwright. Use when the user says "debug", "browse", "check page", "inspect", or mentions UI issues.
---

# Browser Debugging with Playwright

Use Playwright MCP to browse web pages, debug UI issues, check console errors, inspect DOM elements, and monitor network requests during development.

## When to Use

- User reports UI bugs or visual issues
- Need to check browser console for JavaScript errors
- Debugging failed API requests or network issues
- Inspecting DOM structure, CSS styles, or element states
- Verifying functionality on localhost dev server
- Testing how pages render and behave

## Quick Start - Common Debugging Workflows

### 1. Debug Localhost App

```
- Navigate to http://localhost:5173
- Take snapshot for structural analysis
- Check console for errors
- Monitor network requests
```

### 2. Inspect Specific Element

```
- Navigate to page
- Take screenshot for visual reference
- Use browser_snapshot to get DOM structure
- Evaluate JavaScript to check element properties
```

### 3. Debug Failed Request

```
- Navigate to page
- Get network requests with browser_network_requests
- Check console messages for errors
- Analyze response codes and payloads
```

## Frontend Visual Debugging Workflows

For frontend developers working with CVA+DaisyUI components, layout issues, and visual regressions:

### Component Not Styling Correctly

```
1. Take screenshot to confirm visual issue
2. Use browser_evaluate to check classes:
   - Verify base class present (btn, input, card)
   - Check for variant conflicts (multiple sizes/colors)
   - Inspect cx() merged result
3. Check DaisyUI theme active
4. Fix: Add missing base class or resolve conflicts
```

**Quick pattern:**

```javascript
const el = document.querySelector('[selector]');
Array.from(el.classList)
```

### Layout Issues (Flexbox/Grid)

```
1. Take screenshot showing layout problem
2. Use browser_evaluate to inspect:
   - Flex/grid container configuration
   - Child element flex/grid properties
   - Z-index stacking contexts
3. Check responsive breakpoints
4. Fix: Adjust flex/grid classes or positioning
```

**Quick pattern:**

```javascript
const container = document.querySelector('[selector]');
const computed = getComputedStyle(container);
({
    display: computed.display,
    flexDirection: computed.flexDirection,
    gap: computed.gap
})
```

### Visual Regression Testing

```
1. Take baseline screenshot before changes
2. Make code changes
3. Take comparison screenshot
4. Document visual differences
5. Verify changes match intent
```

**Use cases:**

- Theme switching verification
- Component variant changes
- Responsive breakpoint testing
- Before/after bug fixes

## Critical Rules

- **ALWAYS** use `browser_snapshot` before `browser_take_screenshot` - Snapshot provides structured data the AI can analyze, screenshot is for visual confirmation only
- **Filter console messages** by level (`error`, `warning`, `info`) to reduce noise and focus on relevant issues
- **Use `includeStatic: false`** for network requests unless debugging asset loading issues (filters out CSS/JS/images)
- **Close browser** with `browser_close` when done to release resources and prevent hanging processes

## Available Playwright MCP Tools

### Navigation

- `browser_navigate` - Navigate to URL (localhost or external)
- `browser_navigate_back` - Go back in history
- `browser_tabs` - Manage tabs (list, create, close, select)

### Inspection

- `browser_snapshot` - Capture accessibility tree and DOM structure (best for AI analysis)
- `browser_take_screenshot` - Capture visual screenshot (for human confirmation)
- `browser_console_messages` - Get console logs/errors/warnings
- `browser_network_requests` - Get all network requests with timing/headers/bodies

### Interaction

- `browser_click` - Click elements
- `browser_type` - Type text into inputs
- `browser_hover` - Hover over elements
- `browser_fill_form` - Fill multiple form fields

### Advanced

- `browser_evaluate` - Execute JavaScript in page context
- `browser_wait_for` - Wait for conditions
- `browser_close` - Clean up browser session

### browser_evaluate Capabilities

The most powerful tool for DOM debugging. Execute JavaScript to inspect:

**Accessing Elements:**

- `document.querySelector('[selector]')` - Find single element
- `document.querySelectorAll('[selector]')` - Find multiple elements
- `element.classList` - Get all classes
- `element.getAttribute('name')` - Get attribute value

**Computed Styles:**

- `getComputedStyle(element)` - Get all computed CSS properties

### General Debugging

- [`debug-localhost.md`](./templates/debug-localhost.md) - Debug local dev server
- [`check-console-errors.md`](./templates/check-console-errors.md) - Find and fix console errors
- [`monitor-network.md`](./templates/monitor-network.md) - Debug API requests

### Visual/Frontend Debugging

- [`inspect-element.md`](./templates/inspect-element.md) - Inspect DOM/CSS, CVA variants, DaisyUI theme, form validation
- [`debug-layout-positioning.md`](./templates/debug-layout-positioning.md) - Flexbox, grid, z-index, responsive, sticky positioning
- [`visual-regression.md`](./templates/visual-regression.md) - Screenshot comparison, theme testing, responsive testing
- [`quick-patterns.md`](./templates/quick-patterns.md) - Copy-paste browser_evaluate snippe
- `element.getBoundingClientRect()` - Get position and size
- `element.clientWidth` / `element.scrollWidth` - Get dimensions
- `element.offsetTop` / `element.offsetLeft` - Get position

**DOM Traversal:**

- `element.parentElement` - Get parent
- `element.children` - Get children
- `Array.from(element.classList)` - Convert classList to array

**Page Information:**

- `window.innerWidth` / `window.innerHeight` - Viewport size
- `document.documentElement.getAttribute('data-theme')` - Get theme

See [quick-patterns.md](./templates/quick-patterns.md) for copy-paste examples.

## Checklist

- [ ] MCP server configured in `.vscode/mcp.json` with `"type": "stdio"`
- [ ] Navigate to target URL (localhost or external)
- [ ] Capture snapshot for structural analysis
- [ ] Check console messages for errors
- [ ] Monitor network requests if debugging API issues
- [ ] Take screenshot if visual confirmation needed
- [ ] Close browser to clean up resources

## Templates

- [`debug-localhost.md`](./templates/debug-localhost.md) - Debug local dev server
- [`check-console-errors.md`](./templates/check-console-errors.md) - Find and fix console errors
- [`inspect-element.md`](./templates/inspect-element.md) - Inspect DOM/CSS
- [`monitor-network.md`](./templates/monitor-network.md) - Debug API requests

## Common Debugging Scenarios

### React Router 7 Hydration Errors

```
Error: "Text content does not match server-rendered HTML"
```

1. Navigate to page with error
2. Check console messages for full stack trace
3. Use `browser_snapshot` to see page state
4. Look for client-only code running on server (`window`, `localStorage`, etc.)

### Missing Route Types

```
Error: "Cannot find module './+types/[route]'"
```

1. Verify route is registered in `app/routes.ts`
2. Run `npm run typecheck` to generate types
3. Check import uses `./+types/` (NOT `../+types/`)

### Failed API Requests

```
Error: 401 Unauthorized or 500 Internal Server Error
```

1. Navigate to page making request
2. Use `browser_network_requests` to find failed request
3. Check request headers (Authorization, Content-Type)
4. Inspect response body for error details
5. Verify API route exists in `app/routes/api/`

### DaisyUI Component Not Styled

```
Element renders but missing styles
```

1. Take screenshot to confirm visual issue
2. Use `browser_snapshot` to get element structure
3. Use `browser_evaluate` to check classes:

   ```javascript
   const el = document.querySelector('[selector]');
   Array.from(el.classList)
   ```

4. Verify base class exists (`btn`, `input`, `card`)
5. Check CVA variants applied correctly

## Advanced: TypeScript Utilities

For repeated tasks or token optimization, import utilities instead of inline code:

```bash
cd ~/.github/skills/dev-browser && npx tsx <<'EOF'
import { chromium } from 'playwright';
import { getOutline, waitForPageLoad } from './utils/index.ts';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('http://localhost:5173');
await waitForPageLoad(page);

const outline = await getOutline(page, { maxDepth: 4 });
console.log(outline);

await browser.close();
EOF
```

### Available Utilities

**Content Extraction (Token Efficient):**

- `getOutline(page, options)` - Element tree with IDs/classes/attributes
- `getInteractiveOutline(page, selector)` - Interactive elements + landmarks only
- `getVisibleText(page, options)` - Visible text, filtering hidden elements

**Page Load Detection:**

- `waitForPageLoad(page, options)` - Smart loading detection (filters ads/tracking)

**Element References:**

- `persistRefs(page, refs)` - Store element references in browser context
- `selectRef(page, refName)` - Retrieve stored element reference
- `listRefs(page)` - List all stored ref names
- `clearRefs(page)` - Clear all stored refs

### When to Use Utilities vs Inline

**Use Inline (Default):**

- First exploration or learning patterns
- Need to customize logic for specific case
- Want full transparency of what code does
- One-time debugging tasks

**Use Utilities (Advanced):**

- Repeated operations across multiple scripts
- Token budget matters (large debugging sessions)
- Type safety and autocomplete needed
- Production scripts that need tests

### Setup

Install dependencies (one-time):

```bash
cd ~/.github/skills/dev-browser
npm install
```

Run tests to verify utilities work:

```bash
npm test
```

## Full Reference

- **Playwright MCP:** <https://github.com/microsoft/playwright-mcp>
- **Playwright Docs:** <https://playwright.dev>
- **MCP Specification:** <https://modelcontextprotocol.io>
- **Iridium Docs:** See `.github/instructions/` for framework-specific patterns

## Integration with Existing Skills

- Use `create-e2e-test` for automated end-to-end testing
- Use `dev-browser` for ad-hoc debugging and investigation
- Use `create-unit-test` for testing individual functions/components
- Use `add-error-boundary` after identifying errors that need handling

## Best Practices

### 1. Start with Snapshot, Not Screenshot

`browser_snapshot` provides the accessibility tree - a structured representation of the page that's easier for AI to analyze than pixels.

### 2. Filter Data to Reduce Token Usage

- Console: `browser_console_messages({ level: "error" })`
- Network: `browser_network_requests({ includeStatic: false })`

### 3. Clean Up Resources

Always call `browser_close` when finished to prevent hanging browser processes.

### 4. Localhost Workflow

- Ensure dev server is running: `npm run dev`
- Default port: 5173 (React Router 7)
- Check `vite.config.ts` for custom port configuration

### 5. Debug in Context

When debugging, provide context about:

- What user action triggered the issue
- Expected vs actual behavior
- Browser environment (if external URL)
- Any recent code changes

## Example: Complete Debug Session

```markdown
User: "The login form isn't working"

1. Navigate to http://localhost:5173
2. Capture snapshot to see page structure
3. Check console for JavaScript errors
4. Monitor network requests during form submission
5. Identify issue: 401 from /api/auth/authenticate
6. Suggest fix: Check BetterAuth configuration
7. Close browser
```

## Visual Debugging Quick Reference

Common `browser_evaluate` patterns for Iridium debugging:

**Check element classes:**

```javascript
Array.from(document.querySelector('[selector]').classList)
```

**Check flex/grid container:**

```javascript
const s = getComputedStyle(document.querySelector('[selector]'));
({ display: s.display, flexDirection: s.flexDirection, gap: s.gap })
```

**Check theme:**

```javascript
document.documentElement.getAttribute('data-theme')
```

**Check responsive breakpoint:**

```javascript
const w = window.innerWidth;
w < 640 ? 'base' : w < 768 ? 'sm' : w < 1024 ? 'md' : w < 1280 ? 'lg' : 'xl'
```

See [quick-patterns.md](./templates/quick-patterns.md) for complete list of copy-paste snippets.

## Troubleshooting

### Visual Issue Decision Tree

**Component not styled correctly?**

1. Check classes with browser_evaluate: `Array.from(element.classList)`
2. Verify base class present (btn, input, card)
3. Check for variant conflicts (multiple sizes/colors)
4. Verify theme active: `document.documentElement.getAttribute('data-theme')`

**Layout broken?**

1. Check flex/grid on container: `getComputedStyle(container).display`
2. Check flex/grid properties (direction, gap, alignment)
3. Verify responsive classes match breakpoint
4. Check z-index stacking if elements overlap

**Theme colors wrong?**

1. Verify theme attribute: `document.documentElement.getAttribute('data-theme')`
2. Check CSS variables: `getComputedStyle(document.documentElement).getPropertyValue('--p')`
3. Verify element using theme colors not hard-coded values

**Element not visible?**

1. Check display/visibility: `getComputedStyle(element).display`
2. Check position and z-index
3. Check if in viewport: `element.getBoundingClientRect()`
4. Check parent overflow settings

### Playwright MCP Not Available

If Playwright tools aren't showing up:

1. Check `.vscode/mcp.json` has correct configuration:

   ```json
   "Playwright": {
       "type": "stdio",
       "command": "npx",
       "args": ["@playwright/mcp@latest"]
   }
   ```

2. Restart VS Code or Claude Code
3. Verify npx can run `@playwright/mcp@latest`

### Browser Hangs or Crashes

- Always call `browser_close` after debugging
- Check system resources (memory/CPU)
- Try with smaller viewport or single tab

### Cannot Connect to Localhost

- Verify dev server is running: `npm run dev`
- Check correct port (default 5173)
- Try `http://localhost:5173` not `https://`
