import type { Route } from './+types/chat';
import {
    streamText,
    type UIMessage,
    convertToModelMessages,
    tool,
    stepCountIs,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import z from 'zod';

export async function loader({ request }: Route.LoaderArgs) {
    return {};
}

export async function action({ request }: Route.ActionArgs) {
    if (request.method === 'POST') {
        const { messages }: { messages: UIMessage[] } = await request.json();

        const result = streamText({
            model: openai('gpt-4o'),
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
