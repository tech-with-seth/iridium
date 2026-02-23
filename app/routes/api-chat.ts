import { createOpenAI } from '@ai-sdk/openai';
import {
    streamText,
    convertToModelMessages,
    stepCountIs,
    generateText,
} from 'ai';
import type { UIMessage } from 'ai';
import z from 'zod';

import { getUserFromSession } from '~/models/session.server';
import {
    getAllThreadsByUserId,
    getThreadById,
    saveChat,
    updateThreadTitle,
} from '~/models/thread.server';
import type { Route } from './+types/chat';

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

    const model = openAIClient('gpt-4o-mini');
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
        system: "You are a helpful assistant that provides concise and accurate answers. If you don't know the answer, say you don't know.",
        messages: await convertToModelMessages(messages),
        stopWhen: stepCountIs(5),
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
                throw new Response('Failed to save chat', { status: 500 });
            }
        },
    });
}
