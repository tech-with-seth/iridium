---
name: create-ai-tool
description: Create AI chat tools with the Vercel AI SDK for structured data access and actions. Use when adding tools for the AI assistant to call databases, APIs, or perform calculations.
---

# Create AI Tool

Creates AI chat tools using Vercel AI SDK with Zod validation and typed outputs.

## When to Use

- Adding new capabilities to the AI assistant
- Enabling AI to query databases or APIs
- Creating analytics/metrics tools
- User asks to "add AI tool", "chat tool", or "enable AI to access..."

## Architecture

```
1. Tool Definition (app/lib/chat-tools.server.ts)
   ↓
2. Tool UI Card (app/components/data-display/features/)
   ↓
3. Tool Rendering (app/routes/thread.tsx)
```

## Step 1: Define Types

**Location:** `app/lib/chat-tools.types.ts`

```typescript
export interface UserAnalyticsOutput {
    dateRange: {
        startDate: string; // YYYY-MM-DD
        endDate: string;
    };
    overview: {
        totalUsers: number;
        newUsersInRange: number;
        activeUsers: number;
    };
    trend: Array<{
        date: string;
        newUsers: number;
    }>;
}
```

## Step 2: Create Tool Definition

**Location:** `app/lib/chat-tools.server.ts`

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import type { UserAnalyticsOutput } from '~/lib/chat-tools.types';
import { getUserAnalytics } from '~/models/analytics.server';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const chatTools = {
    getUserAnalytics: tool({
        description:
            'Retrieves user analytics including growth trends and role distribution. ' +
            'Use when the user asks about user counts, growth, or statistics.',
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
        }),
        execute: async ({ startDate, endDate }) => {
            // Resolve defaults
            const end = endDate ? new Date(endDate) : new Date();
            const start = startDate
                ? new Date(startDate)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            // Call model layer (NEVER Prisma directly)
            const data = await getUserAnalytics({ startDate: start, endDate: end });

            const output: UserAnalyticsOutput = {
                dateRange: {
                    startDate: start.toISOString().split('T')[0]!,
                    endDate: end.toISOString().split('T')[0]!,
                },
                overview: {
                    totalUsers: data.totalUsers,
                    newUsersInRange: data.newUsersInRange,
                    activeUsers: data.activeUserIds.length,
                },
                trend: data.dailyNewUsers,
            };

            return output;
        },
    }),
};
```

## Step 3: Create UI Card

**Location:** `app/components/data-display/features/UserAnalyticsToolCard.tsx`

```tsx
import { Card } from '~/components/data-display/Card';
import type { UserAnalyticsOutput } from '~/lib/chat-tools.types';

export function UserAnalyticsToolCard({ output }: { output: UserAnalyticsOutput }) {
    return (
        <Card variant="border" className="bg-base-100">
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">User Analytics</h3>
                    <span className="text-sm opacity-70">
                        {output.dateRange.startDate} → {output.dateRange.endDate}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title">Total Users</div>
                        <div className="stat-value text-primary">
                            {output.overview.totalUsers}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title">New Users</div>
                        <div className="stat-value text-accent">
                            {output.overview.newUsersInRange}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title">Active</div>
                        <div className="stat-value">
                            {output.overview.activeUsers}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
```

## Step 4: Add Type Guard

**Location:** `app/routes/thread.tsx`

```typescript
function isUserAnalyticsOutput(value: unknown): value is UserAnalyticsOutput {
    if (!isRecord(value)) return false;
    return (
        isRecord(value.dateRange) &&
        typeof value.dateRange.startDate === 'string' &&
        isRecord(value.overview) &&
        typeof value.overview.totalUsers === 'number'
    );
}
```

## Step 5: Render Tool Card

**Location:** `app/routes/thread.tsx`

```tsx
import { UserAnalyticsToolCard } from '~/components/data-display/features/UserAnalyticsToolCard';

// In render logic:
if (
    tool.toolName === 'getUserAnalytics' &&
    tool.state === 'output-available' &&
    isUserAnalyticsOutput(tool.output)
) {
    return <UserAnalyticsToolCard output={tool.output} />;
}
```

## Tool Description Best Practices

**Good:**
```typescript
description:
    'Retrieves user analytics including growth trends, role distribution, ' +
    'and account health metrics. Use when the user asks about user counts, ' +
    'growth, active users, or role breakdowns.'
```

**Bad:**
```typescript
description: 'Get users'  // Too vague
```

## Input Schema Best Practices

```typescript
inputSchema: z.object({
    startDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
        .optional()
        .describe('Start date in YYYY-MM-DD format'),  // ← .describe() helps the model
    limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe('Max results (1-100)'),
})
```

## Common Patterns

### Date Range Tools

```typescript
const dateRangeSchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
```

### Pagination Tools

```typescript
inputSchema: z.object({
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(20),
})
```

### Search Tools

```typescript
inputSchema: z.object({
    query: z.string().min(1),
    filters: z.object({
        category: z.string().optional(),
        status: z.enum(['active', 'inactive']).optional(),
    }).optional(),
})
```

## Tool States

| State | Meaning |
|-------|---------|
| `input-streaming` | Model generating parameters |
| `input-available` | Ready to execute |
| `output-available` | Execution complete |
| `output-error` | Execution failed |

## Anti-Patterns

- Calling Prisma directly in `execute` (use model layer)
- Vague tool descriptions
- Missing `.describe()` on schema fields
- Not handling error states in UI
- Type guards that don't validate nested structures

## Full Reference

See `.github/instructions/ai-tool-calling.instructions.md` for comprehensive documentation.
