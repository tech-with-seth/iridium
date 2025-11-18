import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, tool, stepCountIs } from 'ai';
import { withTracing } from '@posthog/ai';
import type { Route } from './+types/chat';
import type { UIMessage } from 'ai';
import z from 'zod';

import { getUserFromSession } from '~/lib/session.server';
import { postHogClient } from '~/lib/posthog';

const openAIClient = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function action({ request }: Route.ActionArgs) {
    if (request.method === 'POST') {
        const { messages }: { messages: UIMessage[] } = await request.json();

        const user = await getUserFromSession(request);

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const model = withTracing(openAIClient('gpt-5-mini'), postHogClient, {
            posthogDistinctId: user.id, // optional
            // posthogTraceId: 'trace_123', // optional
            // posthogProperties: { conversationId: 'abc123', paid: true }, // optional
            // posthogPrivacyMode: false, // optional
            // posthogGroups: { company: 'companyIdInYourDb' }, // optional
        });

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
                convertFahrenheitToCelsius: tool({
                    description:
                        'Convert a temperature in fahrenheit to celsius',
                    inputSchema: z.object({
                        temperature: z
                            .number()
                            .describe(
                                'The temperature in fahrenheit to convert',
                            ),
                    }),
                    execute: async ({ temperature }) => {
                        const celsius = Math.round(
                            (temperature - 32) * (5 / 9),
                        );

                        return {
                            celsius,
                        };
                    },
                }),
            },
        });

        return result.toUIMessageStreamResponse();
    }
}
