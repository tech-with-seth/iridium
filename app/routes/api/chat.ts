import { createOpenAI } from '@ai-sdk/openai';
import {
    streamText,
    convertToModelMessages,
    tool,
    stepCountIs,
    generateText,
} from 'ai';
import { withTracing } from '@posthog/ai';
import type { UIMessage } from 'ai';
import z from 'zod';

import { getPostHogClient } from '~/lib/posthog';
import { getUserFromSession } from '~/lib/session.server';
import { saveChat } from '~/models/thread.server';
import type { Route } from './+types/chat';

const openAIClient = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

interface UIMessagesRequestJson {
    messages: UIMessage[];
    id: string;
}

export async function action({ request }: Route.ActionArgs) {
    if (request.method === 'POST') {
        const { messages, id: threadId }: UIMessagesRequestJson =
            await request.json();
        const user = await getUserFromSession(request);

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const postHogClient = getPostHogClient();
        const baseModel = openAIClient('gpt-5-mini');

        const model = postHogClient
            ? withTracing(baseModel, postHogClient, {
                  posthogDistinctId: user.id, // optional
                  // posthogTraceId: 'trace_123', // optional
                  // posthogProperties: { conversationId: 'abc123', paid: true }, // optional
                  // posthogPrivacyMode: false, // optional
                  // posthogGroups: { company: 'companyIdInYourDb' }, // optional
              })
            : baseModel;

        const result = streamText({
            model,
            messages: convertToModelMessages(messages),
            stopWhen: stepCountIs(5),
            tools: {
                weather: tool({
                    description: 'Get the weather in a location (fahrenheit)',
                    inputSchema: z.object({
                        location: z
                            .string()
                            .describe('The location to get the weather for'),
                    }),
                    execute: async ({ location }) => {
                        const temperature = Math.round(
                            Math.random() * (90 - 32) + 32,
                        );
                        return {
                            location,
                            temperature,
                        };
                    },
                }),
            },
        });

        return result.toUIMessageStreamResponse({
            originalMessages: messages,
            onFinish: async ({ messages }) => {
                try {
                    await saveChat({
                        messages,
                        threadId,
                        userId: user.id,
                    });
                } catch (error) {
                    postHogClient?.captureException(error, user.id, {
                        context: { threadId },
                    });
                }
            },
        });
    }
}
