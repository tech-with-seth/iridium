import { createOpenAI } from '@ai-sdk/openai';
import {
    streamText,
    convertToModelMessages,
    stepCountIs,
    generateText,
} from 'ai';
import { withTracing } from '@posthog/ai';
import type { UIMessage } from 'ai';
import z from 'zod';

import { getPostHogClient } from '~/lib/posthog';
import { getUserFromSession } from '~/lib/session.server';
import {
    getAllThreadsByUserId,
    getThreadById,
    saveChat,
    updateThreadTitle,
} from '~/models/thread.server';
import type { Route } from './+types/chat';
import { chatTools } from '~/lib/chat-tools.server';

const openAIClient = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

interface UIMessagesRequestJson {
    messages: UIMessage[];
    id: string;
}

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const threads = await getAllThreadsByUserId(user.id);

    return {
        threads,
    };
}

export async function action({ request }: Route.ActionArgs) {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    let parsed: UIMessagesRequestJson;
    try {
        parsed = z
            .object({
                id: z.string().min(1),
                messages: z.array(z.unknown()),
            })
            .parse(await request.json()) as UIMessagesRequestJson;
    } catch (error) {
        return Response.json(
            { error: 'Invalid request body' },
            { status: 400 },
        );
    }

    const { messages, id: threadId } = parsed;
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

    const thread = await getThreadById(threadId);

    if (messages.length > 3 && (thread?.title === 'Untitled' || !thread)) {
        try {
            // Extract text content from the first few messages to generate a meaningful title
            const conversationContext = messages
                .slice(0, 4) // Get first 4 messages for context
                .map((msg) => {
                    // Filter and extract text parts from UIMessage
                    const textParts = msg.parts
                        .filter((part) => part.type === 'text')
                        .map((part) => ('text' in part ? part.text : ''))
                        .join(' ');

                    return `${msg.role}: ${textParts}`;
                })
                .join('\n');

            const conversationPrompt = `Generate a concise, descriptive title (max 6 words) for this conversation. The title should capture the main topic or question being discussed.

Conversation:
${conversationContext}

Generate only the title, no quotes or extra text.`;

            const titleResult = await generateText({
                model,
                prompt: conversationPrompt,
            });

            const title = titleResult.text
                .trim()
                .replace(/^["']|["']$/g, '') // Remove surrounding quotes if present
                .slice(0, 100);

            if (thread) {
                await updateThreadTitle(threadId, title);
            }
        } catch (error) {
            // Handle error if needed
        }
    }

    const result = streamText({
        model,
        system: "You are a business data analyst AI assistant helping a digital downloads entrepreneur. Help analyze sales, revenue, and conversion metrics for their digital products. Provide clear, actionable insights based on the tools available to you.\n\nIMPORTANT: Tools return monetary values in BOTH cents and dollars. Prefer the `dollars` fields when presenting amounts to the user, and keep cents for exact calculations.\n\nIf the user's query is unrelated to business data analysis, politely inform them that you can only assist with business data-related questions.",
        messages: convertToModelMessages(messages),
        stopWhen: stepCountIs(5),
        tools: chatTools,
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
