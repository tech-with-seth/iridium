# dev-browser TypeScript Utilities

Optional token-efficient alternatives to inline JavaScript patterns.

## Philosophy

The dev-browser skill uses **markdown templates with inline JavaScript** as the primary approach for educational debugging. These utilities provide **optional TypeScript helpers** for token-heavy operations without replacing the template-based workflow.

### When to Use

**Use Inline Patterns (Default):**

- First exploration or learning
- Need to customize logic
- Want full code transparency
- One-time debugging tasks

**Use TypeScript Utilities (Advanced):**

- Repeated operations
- Token budget matters
- Type safety and autocomplete needed
- Production scripts requiring tests

## Available Utilities

### Content Extraction

**`getOutline(page, options?)`**

Token-efficient DOM tree with IDs, classes, and attributes. Collapses repeated siblings.

```typescript
import { getOutline } from './outline';

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
    div.product-list ... (24)
```

**`getInteractiveOutline(page, selector?)`**

Shows only interactive elements and landmarks. Best for understanding page actions.

```typescript
import { getInteractiveOutline } from './outline';

const interactive = await getInteractiveOutline(page);
console.log(interactive);
```

**Output:**

```
header
  a "Home" [href=/]
main
  button "Add to Cart"
  input [type=text] [placeholder="Search"]
```

**`getVisibleText(page, options?)`**

Extracts visible text, filtering hidden elements.

```typescript
import { getVisibleText } from './text';

const text = await getVisibleText(page, { limit: 5000 });
console.log(text);
```

### Page Load Detection

**`waitForPageLoad(page, options?)`**

Smart page load detection using document.readyState and Performance API. Filters out ads, tracking, and non-critical resources.

```typescript
import { waitForPageLoad } from './wait';

await page.goto('http://localhost:5173');
const result = await waitForPageLoad(page);

console.log(`Success: ${result.success}`);
console.log(`Ready state: ${result.readyState}`);
console.log(`Pending requests: ${result.pendingRequests}`);
```

**Options:**

- `timeout` - Max wait time (default: 10000ms)
- `pollInterval` - Check frequency (default: 50ms)
- `minimumWait` - Min wait even if ready (default: 100ms)
- `waitForNetworkIdle` - Wait for no pending requests (default: true)

### Element References

**`persistRefs(page, refs)`**

Store element references in browser context to survive Playwright reconnections.

```typescript
import { persistRefs, selectRef } from './refs';

// First script - store refs
await persistRefs(page, {
  loginButton: await page.locator('button:has-text("Sign In")'),
  emailInput: await page.locator('input[type="email"]')
});

// Later script - retrieve refs
const button = await selectRef(page, 'loginButton');
await button.click();
```

**`selectRef(page, refName)`**

Retrieve stored element reference by name.

**`listRefs(page)`**

List all stored ref names.

**`clearRefs(page)`**

Clear all stored refs.

## Setup

Install dependencies (one-time):

```bash
cd ~/.github/skills/dev-browser
npm install
```

## Testing

Run Vitest tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Type check without running tests:

```bash
npm run typecheck
```

## Architecture

**No Server Infrastructure:**

- These are simple importable TypeScript functions
- No HTTP server, no persistent daemon, no state management
- Work with existing Playwright `Page` objects
- AVOID the full MCP server pattern from INSPECT_ME

**Stateless Utilities:**

- Each function takes a Playwright `Page` as input
- Returns processed data (strings, objects)
- No global state or singleton services

**TypeScript Modules:**

- `outline.ts` - DOM tree extraction
- `text.ts` - Visible text extraction
- `wait.ts` - Smart page load detection
- `refs.ts` - Element reference persistence
- `index.ts` - Re-exports all utilities

## Integration with Templates

Templates should show **both** approaches:

````markdown
## Pattern Name

### Inline Approach (Default)

Use `browser_evaluate` with this code:

```javascript
const element = document.querySelector('[selector]');
// ... full implementation
```

**Use when:** First exploration, learning patterns

### Utility Approach (Advanced)

Use TypeScript helper:

```typescript
import { utilityName } from '~/.github/skills/dev-browser/utils';
const result = await utilityName(page, options);
```

**Use when:** Repeated use, token efficiency matters
````

## Token Comparison

| Operation | Inline | Utility | Savings |
|-----------|--------|---------|---------|
| Element outline | ~800 tokens | ~50 tokens | 94% |
| Interactive outline | ~1000 tokens | ~50 tokens | 95% |
| Visible text | ~600 tokens | ~50 tokens | 92% |
| Page load wait | ~1200 tokens | ~60 tokens | 95% |

## Design Decisions

### Why Not a Full MCP Server?

INSPECT_ME uses a full MCP server with HTTP API, persistent browser daemon, named page registry, and WebSocket connections. This is **too complex** for an educational debugging skill.

**Reasons to avoid server pattern:**

- ❌ Process management burden (start, stop, restart)
- ❌ Port conflicts and setup complexity
- ❌ Reduces transparency (code hidden in server)
- ❌ Overkill for debugging workflows
- ❌ Harder for users to understand and modify

**Our lightweight approach:**

- ✅ Simple importable functions
- ✅ No background processes
- ✅ Full code visibility
- ✅ Easy to customize
- ✅ Works with existing Playwright instances

### Why Keep Inline Patterns Primary?

**Educational Value:**

- Templates teach debugging patterns, not just "call this function"
- Users learn what code does by seeing it
- Easy to customize for specific cases
- Lower barrier to entry

**Transparency:**

- LLMs can read and adapt inline code
- Clear what's happening in browser context
- No "magic" hidden in utilities

**Flexibility:**

- Each use case can customize logic
- No rigid API to learn
- Adapts to specific debugging needs

### When Utilities Make Sense

**Token Efficiency:**

- Repeated operations (checking same pattern 5+ times)
- Large debugging sessions with token limits
- Production scripts that run frequently

**Code Reuse:**

- Standard operations that don't need customization
- Well-tested functionality (outline, text, wait)
- Cross-script element references

**Type Safety:**

- Production scripts that need reliability
- Integration with TypeScript codebases
- IDE autocomplete and refactoring

## Contributing

When adding new utilities:

1. **Extract from proven inline patterns** - Don't create new logic
2. **Keep functions stateless** - Accept `Page`, return data
3. **Add TypeScript types** - Full type safety
4. **Write Vitest tests** - Cover happy path and errors
5. **Document in README** - Usage examples and when to use
6. **Update templates** - Show both inline and utility approaches

## License

MIT - Same as Iridium project
