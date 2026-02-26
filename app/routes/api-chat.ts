import type { UIMessage } from 'ai';
import z from 'zod';

import { getUserFromSession } from '~/models/session.server';
import {
    getThreadById,
    saveChat,
    updateThreadTitle,
} from '~/models/thread.server';
import { agent, memory } from '~/voltagent';
import type { Route } from './+types/chat';

interface UIMessagesRequestJson {
    messages: UIMessage[];
    id: string;
}

function isDuplicateOpenAIItemError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    return /Duplicate item found with id/i.test(error.message);
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
    } catch {
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

    const thread = await getThreadById(threadId);

    // Auto-generate thread title after a few messages
    if (messages.length > 3 && (thread?.title === 'Untitled' || !thread)) {
        try {
            const conversationContext = messages
                .slice(0, 4)
                .map((msg) => {
                    const textParts = msg.parts
                        .filter((part) => part.type === 'text')
                        .map((part) => ('text' in part ? part.text : ''))
                        .join(' ');

                    return `${msg.role}: ${textParts}`;
                })
                .join('\n');

            const titleResult = await agent.generateText(
                `Generate a concise, descriptive title (max 6 words) for this conversation. The title should capture the main topic or question being discussed.\n\nConversation:\n${conversationContext}\n\nGenerate only the title, no quotes or extra text.`,
            );

            const title = titleResult.text
                .trim()
                .replace(/^["']|["']$/g, '')
                .slice(0, 100);

            if (thread) {
                await updateThreadTitle(threadId, title);
            }
        } catch {
            // Title generation is best-effort
        }
    }

    // Only send the latest user message — VoltAgent memory provides
    // conversation context and regenerate may end with an assistant message.
    const latestUserMessage = [...messages]
        .reverse()
        .find((message) => message.role === 'user');

    if (!latestUserMessage) {
        return Response.json(
            { error: 'No user message found in request' },
            { status: 400 },
        );
    }

    let result;
    try {
        result = await agent.streamText([latestUserMessage], {
            userId: user.id,
            conversationId: threadId,
        });
    } catch (error) {
        if (!isDuplicateOpenAIItemError(error)) throw error;

        // Self-heal corrupted/stale provider item references in conversation memory.
        await memory.clearMessages(user.id, threadId);

        result = await agent.streamText([latestUserMessage], {
            userId: user.id,
            conversationId: threadId,
        });
    }

    return result.toUIMessageStreamResponse({
        originalMessages: messages,
        onFinish: async ({ messages }) => {
            try {
                await saveChat({
                    messages,
                    threadId,
                    userId: user.id,
                });
            } catch {
                throw new Response('Failed to save chat', { status: 500 });
            }
        },
    });
}
