---
applyTo: 'app/lib/ai*.ts,app/routes/api/chat.ts'
---

# AI Tool Calling Instructions

## Overview

**Tool calling** enables AI models to invoke functions with structured inputs and return structured outputs. This pattern is fundamental to building AI assistants that can access data, perform calculations, and execute actions beyond text generation.

### Why Tool Calling?

- ✅ **Structured Data Access** - AI can query databases, APIs, and services
- ✅ **Type-Safe Integration** - Full TypeScript inference from definition to UI
- ✅ **Real-Time Feedback** - Stream tool execution states to users
- ✅ **Rich UI Rendering** - Transform tool outputs into custom components
- ✅ **Multi-Step Reasoning** - Models can chain multiple tool calls
- ✅ **Error Handling** - Graceful degradation with repair strategies

## When to Use Tool Calling

Use tool calling when your AI assistant needs to:

- **Access Real-Time Data** - Database queries, API calls, external services
- **Perform Calculations** - Analytics, metrics, aggregations
- **Execute Actions** - Send emails, create records, trigger workflows
- **Return Structured Data** - Complex objects that render as custom UI components
- **Chain Operations** - Multi-step workflows requiring sequential tool calls

## Architecture: Three-Layer Pattern

This application uses a clean separation between **tool definitions** (server), **tool UI cards** (components), and **tool rendering** (route).

```
┌─────────────────────────────────────────────────────────────┐
│ 1. TOOL DEFINITION (Server-Side)                            │
│    app/lib/chat-tools.server.ts                             │
│    ↳ Define tools with Zod schemas                          │
│    ↳ Execute business logic                                 │
│    ↳ Return structured output                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. TOOL UI CARDS (Components)                               │
│    app/components/data-display/features/[Tool]ToolCard.tsx  │
│    ↳ Receive typed output from tool                         │
│    ↳ Format and visualize data                              │
│    ↳ Provide rich, interactive UI                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. TOOL RENDERING (Route)                                   │
│    app/routes/thread.tsx                                    │
│    ↳ Map tool names to UI cards                             │
│    ↳ Handle tool states (streaming, success, error)         │
│    ↳ Integrate with chat UI                                 │
└─────────────────────────────────────────────────────────────┘
```

## Core Concepts

### Tool States

Every tool invocation progresses through these states:

- `input-streaming` - Model is generating tool parameters
- `input-available` - Tool parameters are ready, execution starting
- `output-available` - Tool execution completed successfully
- `output-error` - Tool execution failed with error

### Tool Structure

```typescript
tool({
    description: 'What the tool does (shown to the model)',
    inputSchema: z.object({ /* Zod validation schema */ }),
    execute: async (input) => { /* Business logic */ }
})
```

## Implementation Guide

### Step 1: Define Type Interfaces

**Location:** `app/lib/chat-tools.types.ts`

Define TypeScript interfaces for your tool outputs. This ensures type safety across the entire stack.

```typescript
export interface MoneyAmount {
    cents: number;
    dollars: number;
}

export interface RevenueMetricsOutput {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    orders: number;
    revenue: MoneyAmount;
    netRevenue: MoneyAmount;
    averageOrderValue: MoneyAmount;
    grossMargin: MoneyAmount;
    grossMarginPercentage: number; // 0-100
}

export interface UserAnalyticsOutput {
    dateRange: {
        startDate: string; // YYYY-MM-DD
        endDate: string; // YYYY-MM-DD
    };
    overview: {
        totalUsers: number;
        newUsersInRange: number;
        activeUsers: number;
        bannedUsers: number;
    };
    growth: {
        newUsersCount: number;
        growthRate: number; // Percentage
        growthRateFormatted: string; // e.g., "+23.5%"
    };
    roleDistribution: {
        userCount: number;
        editorCount: number;
        adminCount: number;
        userPercentage: number;
        editorPercentage: number;
        adminPercentage: number;
    };
    trend: Array<{
        date: string; // YYYY-MM-DD
        newUsers: number;
        cumulativeUsers: number;
    }>;
}
```

### Step 2: Create Tool Definition

**Location:** `app/lib/chat-tools.server.ts`

Define your tool with Zod input validation and typed output.

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import type { RevenueMetricsOutput, UserAnalyticsOutput } from '~/lib/chat-tools.types';
import { getUserAnalytics } from '~/models/analytics.server';
import { polarClient } from '~/lib/polar';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const dateRangeInputSchema = z.object({
    startDate: z
        .string()
        .regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD')
        .optional()
        .describe('Start date in YYYY-MM-DD format. Defaults to 3 months ago.'),
    endDate: z
        .string()
        .regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD')
        .optional()
        .describe('End date in YYYY-MM-DD format. Defaults to today.'),
});

export const chatTools = {
    getRevenueMetrics: tool({
        description:
            'Get core revenue and sales metrics including total revenue, net revenue, number of orders, average order value, and gross margin. Returns both cents and dollars. Defaults to last 3 months if no dates specified.',
        inputSchema: dateRangeInputSchema,
        execute: async ({ startDate, endDate }) => {
            const { start, end, startISO, endISO } = resolveDateRange({
                startDate,
                endDate,
            });

            const metrics = await polarClient.metrics.get({
                startDate: start,
                endDate: end,
                interval: 'month',
                organizationId: null,
            });

            const output: RevenueMetricsOutput = {
                startDate: startISO,
                endDate: endISO,
                orders: metrics.totals.orders,
                revenue: toMoneyAmount(metrics.totals.revenue),
                netRevenue: toMoneyAmount(metrics.totals.netRevenue),
                averageOrderValue: toMoneyAmount(metrics.totals.averageOrderValue),
                grossMargin: toMoneyAmount(metrics.totals.grossMargin),
                grossMarginPercentage: metrics.totals.grossMarginPercentage,
            };

            return output;
        },
    }),

    getUserAnalytics: tool({
        description:
            'Retrieves comprehensive user analytics including growth trends, role distribution, and account health metrics. Use this when the user asks about user counts, user growth, active users, role breakdowns, or overall user statistics.',
        inputSchema: z.object({
            startDate: z
                .string()
                .regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD')
                .optional()
                .describe('Start date in YYYY-MM-DD format. Defaults to 30 days ago.'),
            endDate: z
                .string()
                .regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD')
                .optional()
                .describe('End date in YYYY-MM-DD format. Defaults to today.'),
            includeInactive: z
                .boolean()
                .optional()
                .describe('Whether to include banned users in counts. Defaults to false.'),
        }),
        execute: async ({ startDate, endDate, includeInactive }) => {
            // Resolve date range (30 days default)
            const defaultEndDate = new Date();
            const defaultStartDate = new Date();
            defaultStartDate.setDate(defaultStartDate.getDate() - 30);

            const startISO = startDate ?? toISODate(defaultStartDate);
            const endISO = endDate ?? toISODate(defaultEndDate);

            const start = new Date(startISO);
            const end = new Date(endISO);

            // Calculate previous period for growth comparison
            const periodLength = differenceInDays(end, start);
            const previousStart = subDays(start, periodLength);

            // Call model layer function
            const analyticsData = await getUserAnalytics({
                startDate: start,
                endDate: end,
                includeInactive: includeInactive ?? false,
            });

            // Calculate previous period data for growth rate
            const previousPeriodData = await getUserAnalytics({
                startDate: previousStart,
                endDate: start,
                includeInactive: includeInactive ?? false,
            });

            // Calculate growth rate
            const growthRate = calculateGrowthRate(
                analyticsData.newUsersInRange,
                previousPeriodData.newUsersInRange,
            );

            // Format output
            const output: UserAnalyticsOutput = {
                dateRange: {
                    startDate: startISO,
                    endDate: endISO,
                },
                overview: {
                    totalUsers: analyticsData.totalUsers,
                    newUsersInRange: analyticsData.newUsersInRange,
                    activeUsers: analyticsData.activeUserIds.length,
                    bannedUsers: analyticsData.bannedUsers,
                },
                growth: {
                    newUsersCount: analyticsData.newUsersInRange,
                    growthRate,
                    growthRateFormatted: formatPercentage(growthRate, {
                        includeSign: true,
                    }),
                },
                roleDistribution: {
                    userCount: rolePercentages.USER.count,
                    editorCount: rolePercentages.EDITOR.count,
                    adminCount: rolePercentages.ADMIN.count,
                    userPercentage: rolePercentages.USER.percentage,
                    editorPercentage: rolePercentages.EDITOR.percentage,
                    adminPercentage: rolePercentages.ADMIN.percentage,
                },
                trend: formatUserTrendData(
                    analyticsData.dailyNewUsers,
                    analyticsData.totalUsersBeforeRange,
                ),
            };

            return output;
        },
    }),
};

// Helper functions
function toISODate(date: Date): string {
    return date.toISOString().split('T')[0]!;
}

function toMoneyAmount(cents: number): MoneyAmount {
    return {
        cents,
        dollars: cents / 100,
    };
}

function calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
}

function formatPercentage(
    value: number,
    options?: { includeSign?: boolean },
): string {
    const formatted = value.toFixed(1) + '%';
    if (options?.includeSign && value > 0) {
        return '+' + formatted;
    }
    return formatted;
}
```

**Key Patterns:**

- **Clear descriptions** - Model uses this to decide when to call the tool
- **Zod input schemas** - Validates parameters, generates TypeScript types
- **Model layer calls** - Never call Prisma directly; use model functions
- **Typed outputs** - Return interfaces defined in `chat-tools.types.ts`
- **Helper functions** - Extract formatting logic for reusability
- **Default values** - Provide sensible defaults for optional parameters

### Step 3: Create Tool UI Card

**Location:** `app/components/data-display/features/[Tool]ToolCard.tsx`

Create a React component that receives the tool output and renders it beautifully.

```typescript
import { Card } from '~/components/data-display/Card';
import { DonutProgress } from '~/components/data-display/DonutProgress';
import type { RevenueMetricsOutput } from '~/lib/chat-tools.types';

function formatDateRange(startDate: string, endDate: string): string {
    return `${startDate} → ${endDate}`;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatCompactCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(amount);
}

export function RevenueMetricsToolCard({ output }: { output: RevenueMetricsOutput }) {
    return (
        <Card
            variant="border"
            className="bg-base-100 border-base-200"
            title={
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                        <span>Revenue Overview</span>
                        <span className="badge badge-ghost badge-sm">
                            totals
                        </span>
                    </div>
                    <div className="text-xs opacity-70 font-normal">
                        {formatDateRange(output.startDate, output.endDate)}
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-center">
                <div className="flex justify-center sm:justify-start">
                    <DonutProgress
                        value={output.grossMarginPercentage}
                        label="margin"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">Revenue</div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl text-primary">
                            {formatCompactCurrency(output.revenue.dollars)}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">Net Revenue</div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl text-accent">
                            {formatCompactCurrency(output.netRevenue.dollars)}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">Orders</div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl">
                            {output.orders}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">Avg Order</div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl">
                            {formatCurrency(output.averageOrderValue.dollars)}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
```

**Component Patterns:**

- **Accepts typed output** - Props use interface from `chat-tools.types.ts`
- **Formatting helpers** - Convert raw data to user-friendly formats
- **DaisyUI components** - Use Card, stat, badge for consistent styling
- **Responsive grids** - Mobile-first design with Tailwind CSS
- **Visual hierarchy** - Important metrics stand out with size/color

### Step 4: Integrate with Chat API

**Location:** `app/routes/api/chat.ts`

Register your tools with the chat endpoint.

```typescript
import type { Route } from './+types/chat';
import { convertToModelMessages, streamText, Message } from 'ai';
import { ai } from '~/lib/ai';
import { requireUser } from '~/lib/session.server';
import { chatTools } from '~/lib/chat-tools.server';
import {
    createThreadMessage,
    getThreadById,
    updateThreadMessage,
} from '~/models/thread.server';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);

    const {
        threadId,
        messages,
    }: { threadId: string; messages: Message[] } = await request.json();

    // Verify thread ownership
    const thread = await getThreadById(threadId);
    if (!thread || thread.userId !== user.id) {
        throw new Response('Unauthorized', { status: 401 });
    }

    const result = streamText({
        model: ai('gpt-4o'),
        system: 'You are a helpful analytics assistant. Use the provided tools to answer user questions about their data.',
        messages: convertToModelMessages(messages),
        tools: chatTools, // ← Register all tools
        maxSteps: 5, // Allow multi-step tool calls
        onFinish: async ({ messages }) => {
            // Persist messages to database
            for (const message of messages) {
                const existing = await getThreadById(message.id);
                if (existing) {
                    await updateThreadMessage(message.id, {
                        content: JSON.stringify(message.parts),
                    });
                } else {
                    await createThreadMessage({
                        id: message.id,
                        threadId,
                        role: message.role.toUpperCase() as 'USER' | 'ASSISTANT' | 'SYSTEM',
                        content: JSON.stringify(message.parts),
                    });
                }
            }
        },
    });

    return result.toUIMessageStreamResponse();
}
```

**Key Configuration:**

- `tools: chatTools` - Pass your tool object
- `maxSteps: 5` - Allow multi-step tool execution (default is 1)
- `onFinish` - Persist messages after streaming completes
- `toUIMessageStreamResponse()` - Stream format compatible with `useChat`

### Step 5: Render Tools in Chat UI

**Location:** `app/routes/thread.tsx`

Map tool names to UI cards and handle tool states.

```typescript
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { RevenueMetricsToolCard } from '~/components/data-display/features/RevenueMetricsToolCard';
import { UserAnalyticsToolCard } from '~/components/data-display/features/UserAnalyticsToolCard';
import type {
    RevenueMetricsOutput,
    UserAnalyticsOutput,
} from '~/lib/chat-tools.types';

// Type guards for runtime validation
function isRevenueMetricsOutput(value: unknown): value is RevenueMetricsOutput {
    if (!isRecord(value)) return false;
    return (
        typeof value.startDate === 'string' &&
        typeof value.endDate === 'string' &&
        typeof value.orders === 'number' &&
        isMoneyAmount(value.revenue) &&
        isMoneyAmount(value.netRevenue)
    );
}

function isUserAnalyticsOutput(value: unknown): value is UserAnalyticsOutput {
    if (!isRecord(value)) return false;
    return (
        isRecord(value.dateRange) &&
        typeof value.dateRange.startDate === 'string' &&
        typeof value.dateRange.endDate === 'string' &&
        isRecord(value.overview) &&
        typeof value.overview.totalUsers === 'number'
    );
}

// Helper to extract tool information from message parts
function normalizeToolPart(part: unknown): NormalizedToolPart | null {
    if (!isRecord(part)) return null;

    // Handle dynamic tools (unknown at compile time)
    if (
        part.type === 'dynamic-tool' &&
        typeof part.toolName === 'string' &&
        typeof part.state === 'string'
    ) {
        return {
            toolName: part.toolName,
            state: part.state as ToolState,
            input: part.input,
            output: part.output,
            errorText: typeof part.errorText === 'string' ? part.errorText : undefined,
        };
    }

    // Handle static tools (known at compile time)
    if (
        typeof part.type === 'string' &&
        part.type.startsWith('tool-') &&
        typeof part.state === 'string'
    ) {
        return {
            toolName: part.type.slice('tool-'.length),
            state: part.state as ToolState,
            input: part.input,
            output: part.output,
            errorText: typeof part.errorText === 'string' ? part.errorText : undefined,
        };
    }

    return null;
}

export default function ThreadRoute() {
    const { messages, sendMessage, status } = useChat({
        id: threadId,
        transport: new DefaultChatTransport({ api: '/api/chat' }),
    });

    return (
        <div>
            {messages.flatMap((message) => {
                return message.parts.map((part, partIndex) => {
                    // Handle text parts
                    if (isTextPart(part)) {
                        return <div key={partIndex}>{part.text}</div>;
                    }

                    // Handle tool parts
                    const tool = normalizeToolPart(part);
                    if (tool) {
                        // Render RevenueMetrics tool card
                        if (
                            tool.toolName === 'getRevenueMetrics' &&
                            tool.state === 'output-available' &&
                            isRevenueMetricsOutput(tool.output)
                        ) {
                            return (
                                <RevenueMetricsToolCard
                                    key={partIndex}
                                    output={tool.output}
                                />
                            );
                        }

                        // Render UserAnalytics tool card
                        if (
                            tool.toolName === 'getUserAnalytics' &&
                            tool.state === 'output-available' &&
                            isUserAnalyticsOutput(tool.output)
                        ) {
                            return (
                                <UserAnalyticsToolCard
                                    key={partIndex}
                                    output={tool.output}
                                />
                            );
                        }

                        // Fallback: generic tool display
                        return (
                            <details key={partIndex} className="collapse">
                                <summary>
                                    tool: {tool.toolName} ({tool.state})
                                </summary>
                                {tool.state === 'input-available' && (
                                    <div>Running {tool.toolName}...</div>
                                )}
                                {tool.state === 'output-available' && (
                                    <pre>{JSON.stringify(tool.output, null, 2)}</pre>
                                )}
                                {tool.state === 'output-error' && (
                                    <div className="alert alert-error">
                                        Error: {tool.errorText}
                                    </div>
                                )}
                            </details>
                        );
                    }

                    return null;
                });
            })}
        </div>
    );
}
```

**Rendering Pattern:**

1. **Extract tool info** - Use `normalizeToolPart()` to handle both static and dynamic tools
2. **Check tool state** - Only render custom cards when `state === 'output-available'`
3. **Validate output** - Use type guards to ensure runtime type safety
4. **Render custom UI** - Map tool names to their corresponding UI cards
5. **Fallback display** - Show generic debug info for unknown tools

## Advanced Patterns

### Multi-Step Tool Execution

Enable the model to call multiple tools in sequence.

```typescript
const result = streamText({
    model: ai('gpt-4o'),
    tools: chatTools,
    maxSteps: 10, // Allow up to 10 sequential tool calls
    stopWhen: stepCountIs(10), // Alternative: explicit stop condition
    prompt: 'Compare revenue metrics for Q1 and Q2',
});
```

**How it works:**

1. Model calls `getRevenueMetrics` for Q1
2. Receives Q1 data
3. Calls `getRevenueMetrics` for Q2
4. Receives Q2 data
5. Generates comparison text

### Accessing Tool Call Metadata

Extract all tool calls from execution steps.

```typescript
const { steps } = await generateText({
    model: ai('gpt-4o'),
    tools: chatTools,
    stopWhen: stepCountIs(5),
    prompt: 'Show me user analytics',
});

// Get all tool calls across all steps
const allToolCalls = steps.flatMap(step => step.toolCalls);

for (const toolCall of allToolCalls) {
    if (toolCall.dynamic) {
        // Dynamic tool: input is 'unknown'
        console.log('Dynamic:', toolCall.toolName, toolCall.input);
        continue;
    }

    // Static tool: full type inference
    switch (toolCall.toolName) {
        case 'getUserAnalytics':
            console.log('Start date:', toolCall.input.startDate); // Type-safe!
            break;
    }
}
```

### Tool Choice Control

Force the model to use a specific tool.

```typescript
const result = await generateText({
    model: ai('gpt-4o'),
    tools: {
        getRevenueMetrics: chatTools.getRevenueMetrics,
    },
    toolChoice: 'required', // Force model to call a tool
    prompt: 'What is my revenue?',
});
```

**Options:**

- `'required'` - Model must call a tool
- `'auto'` - Model decides (default)
- `'none'` - Model cannot call tools
- `{ type: 'tool', toolName: 'getRevenueMetrics' }` - Force specific tool

### Error Repair Strategies

Automatically fix invalid tool calls.

**Strategy 1: Re-ask the model**

```typescript
const result = await generateText({
    model: ai('gpt-4o'),
    tools: chatTools,
    experimental_repairToolCall: async ({
        toolCall,
        tools,
        error,
        messages,
        system,
    }) => {
        // Re-prompt model with error context
        const result = await generateText({
            model: ai('gpt-4o'),
            system,
            messages: [
                ...messages,
                {
                    role: 'assistant',
                    content: [
                        {
                            type: 'tool-call',
                            toolCallId: toolCall.toolCallId,
                            toolName: toolCall.toolName,
                            input: toolCall.input,
                        },
                    ],
                },
                {
                    role: 'tool' as const,
                    content: [
                        {
                            type: 'tool-result',
                            toolCallId: toolCall.toolCallId,
                            toolName: toolCall.toolName,
                            output: error.message,
                        },
                    ],
                },
            ],
            tools,
        });

        // Extract corrected tool call
        const newToolCall = result.toolCalls.find(
            tc => tc.toolName === toolCall.toolName,
        );

        return newToolCall != null
            ? {
                  toolCallType: 'function' as const,
                  toolCallId: toolCall.toolCallId,
                  toolName: toolCall.toolName,
                  input: JSON.stringify(newToolCall.input),
              }
            : null;
    },
});
```

**Strategy 2: Use structured output**

```typescript
experimental_repairToolCall: async ({
    toolCall,
    tools,
    inputSchema,
    error,
}) => {
    if (NoSuchToolError.isInstance(error)) {
        return null; // Don't fix unknown tool names
    }

    const tool = tools[toolCall.toolName as keyof typeof tools];

    const { object: repairedArgs } = await generateObject({
        model: ai('gpt-4o-mini'),
        schema: tool.inputSchema,
        prompt: [
            `The model tried to call "${toolCall.toolName}" with:`,
            JSON.stringify(toolCall.input),
            `The tool accepts:`,
            JSON.stringify(inputSchema(toolCall)),
            'Please fix the inputs.',
        ].join('\n'),
    });

    return { ...toolCall, input: JSON.stringify(repairedArgs) };
},
```

### Typed Tool Sets

Create strongly-typed tool call handlers.

```typescript
import { TypedToolCall, TypedToolResult, generateText, tool } from 'ai';
import { z } from 'zod';

const myToolSet = {
    getRevenue: tool({
        description: 'Get revenue data',
        inputSchema: z.object({ period: z.string() }),
        execute: async ({ period }) => ({ revenue: 10000 }),
    }),
    getUsers: tool({
        description: 'Get user count',
        inputSchema: z.object({ active: z.boolean() }),
        execute: async ({ active }) => ({ count: 150 }),
    }),
};

type MyToolCall = TypedToolCall<typeof myToolSet>;
type MyToolResult = TypedToolResult<typeof myToolSet>;

async function generateAnalytics(prompt: string): Promise<{
    text: string;
    toolCalls: Array<MyToolCall>; // Strongly typed!
    toolResults: Array<MyToolResult>; // Strongly typed!
}> {
    return generateText({
        model: ai('gpt-4o'),
        tools: myToolSet,
        prompt,
    });
}
```

## Best Practices

### 1. Tool Descriptions

**Good descriptions help the model decide when to use tools.**

✅ **GOOD:**

```typescript
tool({
    description:
        'Get core revenue and sales metrics including total revenue, net revenue, ' +
        'number of orders, average order value, and gross margin. ' +
        'Returns both cents and dollars. Defaults to last 3 months if no dates specified.',
    // ...
})
```

❌ **BAD:**

```typescript
tool({
    description: 'Get revenue', // Too vague
    // ...
})
```

**Guidelines:**

- Explain what the tool returns
- Mention key metrics/fields
- Note default behavior
- Specify data formats

### 2. Input Validation

**Always use Zod schemas for input validation.**

✅ **GOOD:**

```typescript
inputSchema: z.object({
    startDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
        .optional()
        .describe('Start date in YYYY-MM-DD format'),
    limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe('Max results (1-100)'),
})
```

❌ **BAD:**

```typescript
inputSchema: z.object({
    startDate: z.string(), // No format validation
    limit: z.number(), // No bounds checking
})
```

**Use `.describe()` for all parameters - the model reads these descriptions!**

### 3. Model Layer Architecture

**Never call Prisma directly in tool execute functions.**

✅ **GOOD:**

```typescript
execute: async ({ startDate, endDate }) => {
    const analytics = await getUserAnalytics({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
    });
    return analytics;
}
```

❌ **BAD:**

```typescript
execute: async ({ startDate, endDate }) => {
    const users = await prisma.user.findMany({
        where: {
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        },
    });
    return { count: users.length };
}
```

**Always use model layer functions defined in `app/models/`.**

### 4. Type Safety

**Maintain type safety from definition to rendering.**

```typescript
// 1. Define interface
export interface RevenueMetricsOutput {
    startDate: string;
    revenue: MoneyAmount;
}

// 2. Return typed output from tool
execute: async (...) => {
    const output: RevenueMetricsOutput = { /* ... */ };
    return output;
}

// 3. Type guard for runtime validation
function isRevenueMetricsOutput(value: unknown): value is RevenueMetricsOutput {
    if (!isRecord(value)) return false;
    return (
        typeof value.startDate === 'string' &&
        isMoneyAmount(value.revenue)
    );
}

// 4. Use in component with proper typing
export function RevenueMetricsToolCard({ output }: { output: RevenueMetricsOutput }) {
    return <div>{output.revenue.dollars}</div>;
}
```

### 5. Error Handling

**Handle errors gracefully in both tools and UI.**

**Server-side:**

```typescript
execute: async ({ userId }) => {
    try {
        const user = await getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return { user };
    } catch (error) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}
```

**Client-side:**

```typescript
{tool.state === 'output-error' && (
    <div className="alert alert-error">
        <span>
            Something went wrong while running{' '}
            <span className="font-mono">{tool.toolName}</span>
            {tool.errorText ? `: ${tool.errorText}` : '.'}
        </span>
    </div>
)}
```

### 6. Default Values

**Provide sensible defaults for optional parameters.**

```typescript
execute: async ({ startDate, endDate, limit }) => {
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 3);

    const startISO = startDate ?? toISODate(defaultStartDate);
    const endISO = endDate ?? toISODate(defaultEndDate);
    const maxResults = limit ?? 10;

    // Use defaults...
}
```

### 7. Helper Functions

**Extract reusable logic into helper functions.**

```typescript
// Helper functions at bottom of chat-tools.server.ts
function toISODate(date: Date): string {
    return date.toISOString().split('T')[0]!;
}

function toMoneyAmount(cents: number): MoneyAmount {
    return {
        cents,
        dollars: cents / 100,
    };
}

function formatPercentage(value: number, options?: { includeSign?: boolean }): string {
    const formatted = value.toFixed(1) + '%';
    if (options?.includeSign && value > 0) {
        return '+' + formatted;
    }
    return formatted;
}

function calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
}
```

## Common Patterns

### Pattern: Date Range Tools

Many analytics tools need date ranges.

```typescript
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const dateRangeInputSchema = z.object({
    startDate: z
        .string()
        .regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD')
        .optional()
        .describe('Start date in YYYY-MM-DD format'),
    endDate: z
        .string()
        .regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD')
        .optional()
        .describe('End date in YYYY-MM-DD format'),
});

function resolveDateRange({
    startDate,
    endDate,
}: {
    startDate?: string;
    endDate?: string;
}): { start: Date; end: Date; startISO: string; endISO: string } {
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 3);

    const startISO = startDate ?? toISODate(defaultStartDate);
    const endISO = endDate ?? toISODate(defaultEndDate);

    return {
        start: new Date(startISO),
        end: new Date(endISO),
        startISO,
        endISO,
    };
}

// Reuse across tools
export const chatTools = {
    getRevenueMetrics: tool({
        inputSchema: dateRangeInputSchema,
        execute: async ({ startDate, endDate }) => {
            const { start, end } = resolveDateRange({ startDate, endDate });
            // ...
        },
    }),
    getUserAnalytics: tool({
        inputSchema: dateRangeInputSchema,
        execute: async ({ startDate, endDate }) => {
            const { start, end } = resolveDateRange({ startDate, endDate });
            // ...
        },
    }),
};
```

### Pattern: Pagination Tools

Tools that return lists should support pagination.

```typescript
getUsers: tool({
    inputSchema: z.object({
        page: z.number().min(1).default(1).describe('Page number (starts at 1)'),
        pageSize: z.number().min(1).max(100).default(20).describe('Results per page'),
        sortBy: z.enum(['name', 'createdAt', 'email']).optional(),
    }),
    execute: async ({ page, pageSize, sortBy }) => {
        const offset = (page - 1) * pageSize;
        const users = await getUsersPaginated({
            offset,
            limit: pageSize,
            sortBy,
        });

        return {
            users,
            pagination: {
                page,
                pageSize,
                totalUsers: await getTotalUserCount(),
                hasMore: users.length === pageSize,
            },
        };
    },
})
```

### Pattern: Search Tools

Tools for searching/filtering data.

```typescript
searchProducts: tool({
    inputSchema: z.object({
        query: z.string().min(1).describe('Search query'),
        category: z.string().optional().describe('Filter by category'),
        minPrice: z.number().optional().describe('Minimum price in dollars'),
        maxPrice: z.number().optional().describe('Maximum price in dollars'),
        inStock: z.boolean().optional().describe('Only show in-stock items'),
    }),
    execute: async ({ query, category, minPrice, maxPrice, inStock }) => {
        const products = await searchProducts({
            query,
            filters: {
                category,
                priceRange: minPrice || maxPrice ? [minPrice, maxPrice] : undefined,
                inStock,
            },
        });

        return {
            products,
            count: products.length,
            query,
        };
    },
})
```

### Pattern: Aggregate/Statistics Tools

Tools that calculate aggregates.

```typescript
getOrderStatistics: tool({
    inputSchema: dateRangeInputSchema.extend({
        groupBy: z.enum(['day', 'week', 'month']).default('month'),
    }),
    execute: async ({ startDate, endDate, groupBy }) => {
        const { start, end } = resolveDateRange({ startDate, endDate });

        const orders = await getOrders({ start, end });
        const groups = groupByPeriod(orders, groupBy);

        return {
            startDate: toISODate(start),
            endDate: toISODate(end),
            groupBy,
            statistics: groups.map(group => ({
                period: group.period,
                orderCount: group.orders.length,
                totalRevenue: sum(group.orders.map(o => o.total)),
                averageOrderValue: average(group.orders.map(o => o.total)),
            })),
        };
    },
})
```

## Troubleshooting

### Tool Not Being Called

**Problem:** Model doesn't call your tool even when it should.

**Solutions:**

1. **Improve description** - Be more specific about what the tool does
2. **Add examples** - Use `.describe()` on schema fields to guide the model
3. **Simplify schema** - Complex schemas confuse the model
4. **Use toolChoice** - Force tool usage with `toolChoice: 'required'`

```typescript
// ❌ BAD
tool({
    description: 'Get data',
    inputSchema: z.object({ id: z.string() }),
})

// ✅ GOOD
tool({
    description:
        'Retrieves user profile data including name, email, role, and account status. ' +
        'Use this when the user asks about their profile, account details, or user information.',
    inputSchema: z.object({
        userId: z.string().describe('The unique user ID to fetch profile for'),
    }),
})
```

### Type Guard Failing

**Problem:** Type guard returns false even though data looks correct.

**Solution:** Debug with detailed logging and check nested structures.

```typescript
function isRevenueMetricsOutput(value: unknown): value is RevenueMetricsOutput {
    if (!isRecord(value)) {
        console.log('❌ Not a record:', value);
        return false;
    }

    if (typeof value.startDate !== 'string') {
        console.log('❌ startDate not a string:', value.startDate);
        return false;
    }

    if (!isMoneyAmount(value.revenue)) {
        console.log('❌ revenue not MoneyAmount:', value.revenue);
        return false;
    }

    console.log('✅ Valid RevenueMetricsOutput');
    return true;
}
```

### Tool Card Not Rendering

**Problem:** Tool executes successfully but card doesn't appear.

**Checklist:**

1. ✅ Tool name matches exactly (case-sensitive)
2. ✅ Tool state is `'output-available'`
3. ✅ Type guard passes
4. ✅ Component is imported in route
5. ✅ Rendering condition is correct

```typescript
// Double-check all conditions
if (
    tool.toolName === 'getRevenueMetrics' &&  // ← Exact match
    tool.state === 'output-available' &&      // ← Right state
    isRevenueMetricsOutput(tool.output)       // ← Type guard passes
) {
    return <RevenueMetricsToolCard output={tool.output} />;
}
```

### Streaming Stops Unexpectedly

**Problem:** Tool execution interrupts the stream.

**Solutions:**

1. **Check maxSteps** - Increase if tools need multiple steps
2. **Handle errors** - Ensure execute doesn't throw unhandled exceptions
3. **Validate output** - Make sure tool returns valid data

```typescript
// Set appropriate maxSteps
const result = streamText({
    model: ai('gpt-4o'),
    tools: chatTools,
    maxSteps: 10, // ← Allow enough steps for your use case
});
```

### Tool Parameters Invalid

**Problem:** Model passes wrong parameter types or formats.

**Solutions:**

1. **Strengthen schema** - Add regex, min/max, enums
2. **Use .describe()** - Guide the model with clear descriptions
3. **Implement repair** - Use `experimental_repairToolCall`

```typescript
// Strengthen validation
inputSchema: z.object({
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
        .describe('Date in YYYY-MM-DD format (e.g., 2024-03-15)'),
    limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .describe('Number of results to return (1-100)'),
    status: z
        .enum(['active', 'inactive', 'pending'])
        .describe('Filter by status: active, inactive, or pending'),
})
```

## Reference Implementation

**Complete example:** `app/routes/thread.tsx`

See this file for the full implementation including:

- Type guards for all tool outputs
- Tool rendering logic
- State handling
- Error display
- Loading states

**Tool definitions:** `app/lib/chat-tools.server.ts`

**Tool UI cards:** `app/components/data-display/features/`

## Additional Resources

- **Vercel AI SDK Docs**: https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
- **Form Validation**: `.github/instructions/form-validation.instructions.md`
- **Component Patterns**: `.github/instructions/component-patterns.instructions.md`
- **CRUD Patterns**: `.github/instructions/crud-pattern.instructions.md`
