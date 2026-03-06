import type { UIMessage } from 'ai';
import z from 'zod';

import { rateLimit } from '~/lib/rate-limit.server';
import { getUserFromSession } from '~/models/session.server';
import {
    getThreadById,
    saveChat,
    updateThreadTitle,
} from '~/models/thread.server';
import { agent, memory } from '~/voltagent';
import type { Route } from './+types/chat';

const uiMessagePartSchema = z.object({
    type: z.string().max(50),
});

const uiMessageSchema = z.object({
    id: z.string().max(128),
    role: z.enum(['system', 'user', 'assistant']),
    parts: z.array(uiMessagePartSchema.passthrough()).max(100),
});

const chatRequestSchema = z.object({
    id: z.string().min(1).max(128),
    messages: z.array(uiMessageSchema.passthrough()).max(500),
});

function isDuplicateOpenAIItemError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    return /Duplicate item found with id/i.test(error.message);
}

export async function action({ request }: Route.ActionArgs) {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    let parsed: z.infer<typeof chatRequestSchema>;
    try {
        parsed = chatRequestSchema.parse(await request.json());
    } catch {
        return Response.json(
            { error: 'Invalid request body' },
            { status: 400 },
        );
    }

    const { messages: validatedMessages, id: threadId } = parsed;
    const messages = validatedMessages as UIMessage[];
    const user = await getUserFromSession(request);

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { success: withinLimit } = rateLimit({
        key: `chat:${user.id}`,
        maxRequests: 20,
        windowMs: 60_000,
    });

    if (!withinLimit) {
        return Response.json(
            { error: 'Too many requests. Please wait a moment.' },
            { status: 429 },
        );
    }

    const thread = await getThreadById(threadId);

    if (thread && thread.createdById !== user.id) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

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

            const title = (titleResult?.text ?? '')
                .trim()
                .replace(/^["']|["']$/g, '')
                .slice(0, 100);

            if (thread && title) {
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
            } catch (error) {
                console.error('Failed to save chat:', error);
            }
        },
    });
}
