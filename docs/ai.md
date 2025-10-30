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

## Next Steps

- Replace the demo weather and temperature conversion tools with integrations relevant to your product.
- Mirror updates in the `/admin/chat` UI route so new tool result shapes are displayed correctly.
- Ensure rate limits and cost controls are configured in the OpenAI dashboard before exposing the chat endpoint publicly.
