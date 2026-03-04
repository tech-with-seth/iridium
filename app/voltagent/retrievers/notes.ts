import {
    BaseRetriever,
    type BaseMessage,
    type RetrieveOptions,
} from '@voltagent/core';
import { searchNotes } from '~/models/note.server';

export class NotesRetriever extends BaseRetriever {
    constructor() {
        super({
            toolName: 'search_notes_context',
            toolDescription: "Search the user's notes for relevant context.",
        });
    }

    async retrieve(
        input: string | BaseMessage[],
        options: RetrieveOptions,
    ): Promise<string> {
        const { userId } = options;
        if (!userId) return '';

        const query =
            typeof input === 'string'
                ? input
                : String((input.at(-1) as { content?: string })?.content ?? '');

        if (!query.trim()) return '';

        const notes = await searchNotes({ userId, query });
        if (!notes.length) return '';

        return notes.map((n) => `## ${n.title}\n${n.content}`).join('\n\n');
    }
}
