import type { UIMessage } from 'ai';
import { Agent } from '@voltagent/core';
import { DEFAULT_MODEL_ID } from '~/lib/ai-models';
import { updateThreadTitle } from '~/models/thread.server';

/**
 * A minimal agent for one-shot title generation: no memory, no tools, so the
 * Trigger.dev worker doesn't drag in the VoltAgent Postgres store.
 */
const titleAgent = new Agent({
    name: 'Thread Titler',
    instructions: 'You generate short, descriptive conversation titles.',
    model: DEFAULT_MODEL_ID,
    maxOutputTokens: 64,
});

/** Flatten the first few messages into a prompt-ready transcript. */
export function buildTitleContext(messages: UIMessage[]) {
    return messages
        .slice(0, 4)
        .map((msg) => {
            const textParts = msg.parts
                .filter((part) => part.type === 'text')
                .map((part) => ('text' in part ? part.text : ''))
                .join(' ');

            return `${msg.role}: ${textParts}`;
        })
        .join('\n');
}

export async function generateAndSaveThreadTitle({
    threadId,
    context,
}: {
    threadId: string;
    context: string;
}) {
    const result = await titleAgent.generateText(
        `Generate a concise, descriptive title (max 6 words) for this conversation. The title should capture the main topic or question being discussed.\n\nConversation:\n${context}\n\nGenerate only the title, no quotes or extra text.`,
    );

    const title = (result?.text ?? '')
        .trim()
        .replace(/^["']|["']$/g, '')
        .slice(0, 100);

    if (title) {
        await updateThreadTitle(threadId, title);
    }

    return title;
}
