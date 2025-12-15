# Charting Instructions (visx)

## Overview

This document defines the **canonical charting patterns** for Iridium.

Iridium uses **visx** (D3 primitives + React rendering) to render charts inside **tool output cards**. Charts should feel native to the DaisyUI theme and must not expose raw JSON in the UI.

## When to Add a Chart

Add a chart when the tool output is:

- ✅ A time series (trend over time)
- ✅ A ratio/proportion (conversion rate, margin)
- ✅ A comparison of two magnitudes (revenue vs net revenue)
- ✅ A funnel/progress view (step counts)

Do **not** add a chart when:

- ❌ It would duplicate a single value (use a stat tile instead)
- ❌ The data is sparse/ambiguous (show a table or narrative summary)
- ❌ The model would have to invent datapoints (tools must return real series)

## Architecture: Tools → Typed Output → Tool Cards

### Tool Output Contract

Tools should return **UI-first shapes**, not raw vendor responses.

- Define output types in `app/lib/chat-tools.types.ts`
- Return `MoneyAmount` as `{ cents, dollars }` (UI should display `dollars`, keep `cents` for exact math)
- For trends, return chart-ready points: `{ date: YYYY-MM-DD, … }`

Reference implementations:

- Tool definitions: `app/lib/chat-tools.server.ts`
- Output types: `app/lib/chat-tools.types.ts`

### Rendering in Thread

`app/routes/thread.tsx` should:

1. Normalize tool parts
2. Narrow `tool.output` via type guards
3. Render a **specialized card component** for known tools
4. Fall back to generic tool rendering only when needed

## UI Standards (DaisyUI)

### Tool Cards

Tool outputs should render as **cards** using the existing component system:

- Use `Card` from `app/components/data-display/Card.tsx`
- Prefer `variant="border"` with `bg-base-100 border-base-200`
- Include:
  - Clear title
  - Date range/context (small, muted)
  - Small KPI badges or stat tiles
  - One chart (when it adds clarity)

Avoid:

- ❌ “Output:” labels
- ❌ Tool names in the UI (“tool: getRevenueTrend”)
- ❌ Raw JSON / “Raw data” collapses in production UI

### Theme Colors

Charts should match DaisyUI theme variables.

Prefer:

- Containers: `bg-base-200`, `bg-base-300`
- Primary series: `text-primary`, `bg-primary` (or CSS `hsl(var(--p))`)
- Secondary series: `text-accent`, `bg-accent` (or CSS `hsl(var(--a))`)
- Text: `text-base-content` with `opacity-*` for de-emphasis

In SVG, use DaisyUI theme variables (DaisyUI 5):

- `var(--color-primary)` for primary series
- `var(--color-accent)` for secondary series
- `var(--color-base-content)` for axes/text (apply opacity via `strokeOpacity`/`fillOpacity`)
- `var(--color-base-200)` / `var(--color-base-300)` for plot backgrounds

## visx Patterns

### Rules

- Use React for rendering; do not mutate DOM with D3 selections.
- Keep charts **responsive** using `ParentSize`.
- Control tick density based on available width to avoid label overlap.
- Provide accessible `role="img"` on the `<svg>`.

### Canonical Components

- Line trend: `app/components/data-display/RevenueTrendChart.tsx`
  - Two-series line chart (solid + dashed)
  - Plot background + subtle grid lines
  - Responsive tick count and rotated x-labels

- Donut/proportion: `app/components/data-display/DonutProgress.tsx`
  - Use for rates like `grossMarginPercentage` or conversion rates

- Comparison bars: `app/components/data-display/ComparisonBars.tsx`
  - Use for comparing two values (revenue vs net, checkouts vs succeeded)
  - Use `bg-base-300` track and `bg-primary`/`bg-accent` fills

### Example: Tool Card Composition

Tool cards should compose:

- a title + date range
- KPI badges/stat tiles
- a chart component

Reference:

- `app/components/data-display/RevenueTrendToolCard.tsx`
- `app/components/data-display/RevenueMetricsToolCard.tsx`
- `app/components/data-display/ProductMetricsToolCard.tsx`
- `app/components/data-display/ConversionMetricsToolCard.tsx`

## Dependency Notes (React 19)

Some `@visx/*` packages currently have peer deps that don’t list React 19.

If npm blocks install due to peer deps, use:

```bash
npm install --legacy-peer-deps @visx/axis @visx/group @visx/scale @visx/shape @visx/responsive @visx/curve
```

## Anti-Patterns to Avoid

- ❌ Rendering tool JSON in the normal UX path
- ❌ Using D3 to directly select/mutate DOM
- ❌ Charts without context (no date range / no labels)
- ❌ Unbounded axis ticks that overlap and become unreadable
- ❌ Hardcoded colors that ignore DaisyUI theme variables
