# AI Chat Integration

Iridium bundles a ready-to-use chat experience built on the [Vercel AI SDK](https://sdk.vercel.ai/docs) and OpenAI. This guide explains how the pieces fit together and how to extend the endpoint for your own use cases.

## Architecture Overview

| Layer        | Responsibility                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| API Route    | `app/routes/api/chat.ts` handles POST requests, orchestrates the model call, and streams responses.        |
| Model Client | `@ai-sdk/openai` provides the OpenAI provider that the Vercel AI SDK targets (`openai('gpt-4o')`).         |
| SDK Helpers  | `convertToModelMessages`, `streamText`, `stepCountIs`, and `tool` manage message formatting and tooling.    |
| Frontend     | `@ai-sdk/react`'s `useChat` hook sends messages and renders streaming updates in real time.                |
| UI Layer     | Components such as `ChatBubble` provide the visual presentation for chat transcripts.                      |

The flow looks like this:

1. The client calls `useChat()` (defaults to `/api/chat`) and sends `UIMessage[]` payloads when the user submits input.
2. The server action converts those UI messages into model-friendly messages and starts a streaming `streamText()` response.
3. Tool calls are resolved on the server (sample weather + temperature conversion tools ship as examples).
4. The response is streamed back to the browser with `toUIMessageStreamResponse()`, keeping the UI responsive.

## Server Endpoint (`app/routes/api/chat.ts`)

```ts
import type { Route } from './+types/chat';
import {
    streamText,
    convertToModelMessages,
    tool,
    stepCountIs,
    type UIMessage,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import z from 'zod';

export async function action({ request }: Route.ActionArgs) {
    if (request.method !== 'POST') {
        return null;
    }

    const { messages }: { messages: UIMessage[] } = await request.json();

    const result = streamText({
        model: openai('gpt-4o'),
        messages: convertToModelMessages(messages),
        stopWhen: stepCountIs(5),
        tools: {
            weather: tool({
                description: 'Get the weather in a location (fahrenheit)',
                inputSchema: z.object({
                    location: z.string().describe(
                        'The location to get the weather for',
                    ),
                }),
                execute: async ({ location }) => {
                    const temperature = Math.round(Math.random() * (90 - 32) + 32);
                    return { location, temperature };
                },
            }),
            convertFahrenheitToCelsius: tool({
                description: 'Convert a temperature in fahrenheit to celsius',
                inputSchema: z.object({
                    temperature: z
                        .number()
                        .describe('The temperature in fahrenheit to convert'),
                }),
                execute: async ({ temperature }) => ({
                    celsius: Math.round((temperature - 32) * (5 / 9)),
                }),
            }),
        },
    });

    return result.toUIMessageStreamResponse();
}
```

### Key Practices

- **Always** parse incoming payloads as `UIMessage[]` and feed them through `convertToModelMessages()` so the SDK can emit structured UI parts.
- Keep `stepCountIs(5)` (or a comparable guard) in place to prevent runaway tool loops. Increase only if you understand the reasoning cost implications.
- Tool `execute` handlers must return JSON-serialisable values; enrich them with real data sources when moving beyond the demo implementation.
- The endpoint streams increments via `toUIMessageStreamResponse()`. Switching to a buffered response will break `useChat()`.

## Frontend Integration

The admin demo route at `app/routes/admin/chat.tsx` demonstrates how to read streamed messages and render them with the shared UI components:

```tsx
import { useChat } from '@ai-sdk/react';
import {
    ChatBubble,
    ChatBubbleMessage,
} from '~/components/ChatBubble';

export default function ChatRoute() {
    const { messages, sendMessage } = useChat();

    // ...render TextInput and stream ChatBubble messages
}
```

`useChat()` talks to `/api/chat` by default. Pass a custom `api` option if you stand up another endpoint. The hook emits an array of message objects whose `parts` map directly to the segments produced by the server (text, tool invocations, etc.).

## Customising the Model or Tools

- **Model**: Change `openai('gpt-4o')` to any other OpenAI-compatible model identifier supported by the Vercel AI SDK. Keep the provider import aligned (`@ai-sdk/openai`).
- **System Prompt**: Add a `system` part to the `messages` array or inject a `system` string via `streamText({ model, system: '...' })`.
- **Tools**: Expand the `tools` object with additional entries. Each tool must supply a `description`, a Zod `inputSchema`, and an async `execute` that returns serialisable output.
- **Stop Conditions**: Replace `stepCountIs(5)` with other guards (e.g., `maxOutputTokens`) if your use case requires longer reasoning chains.

## Environment Variables

Set `OPENAI_API_KEY` in your `.env` file (development) and hosting provider (production). The key is loaded automatically by `@ai-sdk/openai` and the fallback singleton in `app/lib/ai.ts`.

```env
OPENAI_API_KEY=sk-proj-your-key
```

## Testing Tips

- Unit test pure helper utilities and tool `execute` handlers in isolation.
- Use Vitest to mock the Vercel AI SDK if you need to cover request validation without hitting the network.
- For end-to-end validation, run the dev server and exercise `/admin/chat` to confirm streaming behaviour.

## LLM Analytics with PostHog

Iridium includes built-in LLM analytics powered by PostHog's `@posthog/ai` package. This automatically captures detailed metrics about every AI generation, including latency, token usage, costs, and more.

### How It Works

The chat endpoint wraps the OpenAI client with PostHog's `withTracing()` function:

```typescript
import { withTracing } from '@posthog/ai';
import { createOpenAI } from '@ai-sdk/openai';
import { postHogClient } from '~/lib/posthog';

const openAIClient = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogProperties: { conversationId: 'abc123', feature: 'chat' },
});
```

This wrapper automatically captures an `$ai_generation` event for every LLM call with rich metadata.

### Captured Data

Each `$ai_generation` event includes:

- **$ai_model** - The specific model used (e.g., "gpt-4o", "gpt-4o-mini")
- **$ai_latency** - Response time in seconds
- **$ai_input_tokens** - Number of tokens in the prompt
- **$ai_output_tokens** - Number of tokens in the completion
- **$ai_total_cost_usd** - Estimated cost in USD (input + output)
- **$ai_tools** - Tools/functions available to the model
- **$ai_input** - The actual prompt/messages sent
- **$ai_output_choices** - Response choices from the LLM
- Custom properties passed via `posthogProperties`

### Viewing Analytics

1. Navigate to **LLM Analytics** in your PostHog dashboard
2. View the **Generations** tab for individual LLM calls
3. View the **Traces** tab for conversation-level analytics
4. Filter by user, model, cost, latency, or custom properties

### Enriching Events

Pass additional context to make analytics more useful:

```typescript
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogTraceId: `conversation-${conversationId}`,  // Group related calls
    posthogProperties: {
        conversationId,
        feature: 'customer-support',
        userPlan: user.plan,
        intent: 'troubleshooting',
    },
    posthogGroups: {
        company: user.organizationId,  // Organization-level analytics
    },
});
```

### Privacy Mode

Enable privacy mode to exclude sensitive prompt/response data:

```typescript
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogPrivacyMode: true,  // Excludes $ai_input and $ai_output_choices
});
```

This still captures tokens, latency, and cost while protecting sensitive content.

### Trace-Level Analytics

Group multiple LLM calls into a single conversation trace:

```typescript
// Generate unique trace ID for the conversation
const traceId = `chat-${Date.now()}-${user.id}`;

// All calls with the same traceId are grouped together
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogTraceId: traceId,
    posthogProperties: { conversationId: conversation.id },
});
```

View conversation-level metrics in the **Traces** tab:

- Total conversation cost
- Average latency per message
- Total tokens used
- Tool usage patterns

### Cost Monitoring

Track AI spending across users, features, or time periods:

```typescript
// In your analytics dashboard, query for:
// SELECT 
//   sum($ai_total_cost_usd) as total_cost,
//   avg($ai_latency) as avg_latency,
//   count(*) as call_count
// FROM $ai_generation
// WHERE timestamp > now() - interval '30 days'
// GROUP BY $ai_model
```

### Feature Flag Integration

Use PostHog feature flags to control AI features:

```typescript
import { usePostHog } from 'posthog-js/react';

const posthog = usePostHog();
const enableAdvancedAI = posthog?.isFeatureEnabled('advanced-ai-features');

const modelName = enableAdvancedAI ? 'gpt-4o' : 'gpt-4o-mini';

const model = withTracing(openAIClient(modelName), postHogClient, {
    posthogDistinctId: user.id,
    posthogProperties: { model: modelName, featureFlag: 'advanced-ai-features' },
});
```

### Anonymous Usage

Track LLM calls without identifying the user:

```typescript
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    // Don't pass posthogDistinctId for anonymous tracking
    posthogProperties: { feature: 'public-demo' },
});
```

### Environment Variables

Add PostHog credentials to your `.env` file:

```bash
# PostHog (required for LLM analytics)
POSTHOG_API_KEY="phc_your-posthog-project-api-key"
POSTHOG_HOST="https://us.i.posthog.com"  # or "https://eu.i.posthog.com"

# OpenAI (required for AI features)
OPENAI_API_KEY="sk-proj-your-openai-api-key"
```

Note: The server-side `POSTHOG_API_KEY` (without `VITE_` prefix) is different from the client-side key used for web analytics.

### Best Practices

1. **Always pass distinct ID** - Enables user-level analytics and cohort analysis
2. **Use trace IDs** - Group related LLM calls into conversations
3. **Add custom properties** - Include feature names, user plans, intents for better filtering
4. **Enable privacy mode** - For sensitive use cases (medical, legal, financial)
5. **Monitor costs** - Set up alerts for unusual spending patterns
6. **Track tools used** - Identify which tools are most valuable
7. **Measure latency** - Optimize user experience by tracking response times

### Common Use Cases

#### Customer Support Chat

```typescript
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogTraceId: `support-${ticketId}`,
    posthogProperties: {
        feature: 'customer-support',
        ticketId,
        priority: ticket.priority,
        category: ticket.category,
    },
    posthogGroups: { company: user.organizationId },
});
```

#### Code Generation

```typescript
const model = withTracing(openAIClient('gpt-4o'), postHogClient, {
    posthogDistinctId: user.id,
    posthogTraceId: `codegen-${sessionId}`,
    posthogProperties: {
        feature: 'code-generation',
        language: 'typescript',
        framework: 'react',
        complexity: 'advanced',
    },
});
```

#### Content Generation

```typescript
const model = withTracing(openAIClient('gpt-4o-mini'), postHogClient, {
    posthogDistinctId: user.id,
    posthogProperties: {
        feature: 'content-generation',
        contentType: 'blog-post',
        wordCount: 1000,
        tone: 'professional',
    },
});
```

### Troubleshooting

#### Events not appearing in PostHog

1. Verify `POSTHOG_API_KEY` is set (server-side, no `VITE_` prefix)
2. Check `POSTHOG_HOST` matches your PostHog region
3. Ensure PostHog client is initialized (`~/lib/posthog.ts`)
4. Events may take 1-2 minutes to appear in dashboard

#### Missing cost data

- Cost estimation requires accurate token counts from the OpenAI API
- Costs are approximate based on published OpenAI pricing
- Custom models may not have cost data

#### Privacy mode not working

- Ensure `posthogPrivacyMode: true` is set in `withTracing()` options
- Verify you're checking the right events in PostHog
- Privacy mode only affects `$ai_input` and `$ai_output_choices` properties

### Additional Resources

- [PostHog LLM Analytics Docs](https://posthog.com/docs/llm-analytics)
- [Vercel AI SDK Integration](https://posthog.com/docs/llm-analytics/installation/vercel-ai)
- [PostHog Node SDK](https://posthog.com/docs/libraries/node)
- [OpenAI Pricing](https://openai.com/api/pricing/)

## Next Steps

- Replace the demo weather and temperature conversion tools with integrations relevant to your product.
- Mirror updates in the `/admin/chat` UI route so new tool result shapes are displayed correctly.
- Set up PostHog alerts for high AI costs or latency spikes.
- Create PostHog dashboards to track AI usage trends.
- Ensure rate limits and cost controls are configured in the OpenAI dashboard before exposing the chat endpoint publicly.
