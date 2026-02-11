---
applyTo: 'app/lib/ai*.ts,app/routes/api/chat.ts'
---

# AI Tool Calling Instructions

## Architecture

Three-layer separation:

```
1. TOOL DEFINITION (Server)     → app/lib/chat-tools.server.ts
   Define tools with Zod schemas, execute business logic, return typed output

2. TOOL UI CARDS (Components)   → app/components/data-display/features/[Tool]ToolCard.tsx
   Receive typed output, format/visualize data

3. TOOL RENDERING (Route)       → app/routes/thread.tsx
   Map tool names → UI cards, handle tool states
```

**Types live in:** `app/lib/chat-tools.types.ts`

## Tool States

Every tool invocation progresses: `input-streaming` → `input-available` → `output-available` | `output-error`

## Defining a Tool

```typescript
// app/lib/chat-tools.server.ts
import { tool } from 'ai';
import { z } from 'zod';
import type { RevenueMetricsOutput } from '~/lib/chat-tools.types';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const chatTools = {
    getRevenueMetrics: tool({
        description:
            'Get revenue metrics including total revenue, net revenue, orders, ' +
            'average order value, and gross margin. Defaults to last 3 months.',
        inputSchema: z.object({
            startDate: z.string().regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD').optional()
                .describe('Start date in YYYY-MM-DD format. Defaults to 3 months ago.'),
            endDate: z.string().regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD').optional()
                .describe('End date in YYYY-MM-DD format. Defaults to today.'),
        }),
        execute: async ({ startDate, endDate }) => {
            // Call model layer — NEVER call Prisma directly
            const metrics = await getRevenueMetrics({ startDate, endDate });
            const output: RevenueMetricsOutput = { /* ... */ };
            return output;
        },
    }),
};
```

**Key rules:**
- Clear, detailed `description` — the model reads this to decide when to call the tool
- Use `.describe()` on every schema field
- Call model layer functions, never Prisma directly
- Return typed outputs matching interfaces in `chat-tools.types.ts`

## Registering Tools in Chat API

```typescript
// app/routes/api/chat.ts
import { chatTools } from '~/lib/chat-tools.server';
import { convertToModelMessages, stepCountIs, streamText } from 'ai';

const result = streamText({
    model,
    messages: convertToModelMessages(messages),
    tools: chatTools,
    stopWhen: stepCountIs(5),  // Cap multi-step tool loops
});

return result.toUIMessageStreamResponse();
```

## Rendering Tool Cards

In `app/routes/thread.tsx`, map tool names to UI components:

```typescript
// Type guard for runtime validation
function isRevenueMetricsOutput(value: unknown): value is RevenueMetricsOutput {
    if (!isRecord(value)) return false;
    return typeof value.startDate === 'string' && isMoneyAmount(value.revenue);
}

// In message rendering loop
const tool = normalizeToolPart(part);
if (tool?.toolName === 'getRevenueMetrics' && tool.state === 'output-available'
    && isRevenueMetricsOutput(tool.output)) {
    return <RevenueMetricsToolCard output={tool.output} />;
}
```

**Rendering checklist:**
1. Extract tool info with `normalizeToolPart()` (handles both static and dynamic tools)
2. Check `state === 'output-available'` before rendering custom cards
3. Validate output with type guards
4. Provide fallback display for unknown tools

## Tool UI Card Pattern

```typescript
// app/components/data-display/features/RevenueMetricsToolCard.tsx
import type { RevenueMetricsOutput } from '~/lib/chat-tools.types';

export function RevenueMetricsToolCard({ output }: { output: RevenueMetricsOutput }) {
    return (
        <Card variant="border" className="bg-base-100 border-base-200" title="Revenue Overview">
            {/* DaisyUI stat components, responsive grids */}
        </Card>
    );
}
```

## Best Practices

- **Descriptions:** Explain what the tool returns, mention key fields, note defaults
- **Input validation:** Zod with regex, min/max, enums — use `.describe()` on all fields
- **Model layer:** Always call `app/models/` functions, never Prisma directly
- **Type safety:** Interface in types file → typed return in tool → type guard in UI → typed props in card
- **Error handling:** Wrap execute in try/catch, show `alert alert-error` for `output-error` state
- **Defaults:** Always provide sensible defaults for optional parameters
- **Max steps:** Use `stopWhen: stepCountIs(5)` to cap multi-step loops (raise carefully)
