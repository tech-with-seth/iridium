import { Agent, Memory, createTool } from '@voltagent/core';
import { PostgreSQLMemoryAdapter } from '@voltagent/postgres';
import { z } from 'zod';

import type { Note } from '~/generated/prisma/client';
import {
    createNote,
    getNotesByUserId,
    searchNotes,
} from '~/models/note.server';

function serializeNote(n: Note) {
    return {
        id: n.id,
        title: n.title,
        content: n.content,
        createdAt: n.createdAt,
    };
}

export const memory = new Memory({
    storage: new PostgreSQLMemoryAdapter({
        connection: process.env.DATABASE_URL!,
    }),
    workingMemory: {
        enabled: true,
        scope: 'user',
        schema: z.object({
            name: z.string().optional(),
            preferences: z.array(z.string()).optional(),
            topics: z.array(z.string()).optional(),
        }),
    },
});

const createNoteTool = createTool({
    name: 'create_note',
    description:
        'Create a new note for the user. Use when the user asks to save, remember, or jot down something.',
    parameters: z.object({
        title: z.string().describe('A short title for the note'),
        content: z.string().describe('The body content of the note'),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        if (!userId) throw new Error('User not authenticated');
        const note = await createNote({ ...args, userId });
        return serializeNote(note);
    },
});

const listNotesTool = createTool({
    name: 'list_notes',
    description:
        'List all notes for the current user. Use when the user wants to see their notes.',
    parameters: z.object({}),
    execute: async (_args, options) => {
        const userId = options?.userId;
        if (!userId) throw new Error('User not authenticated');
        const notes = await getNotesByUserId(userId);
        return { notes: notes.map(serializeNote) };
    },
});

const searchNotesTool = createTool({
    name: 'search_notes',
    description:
        "Search the user's notes by keyword. Use when the user wants to find a specific note.",
    parameters: z.object({
        query: z
            .string()
            .describe('Search term to match against note titles and content'),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        if (!userId) throw new Error('User not authenticated');
        const notes = await searchNotes({ userId, query: args.query });
        return { notes: notes.map(serializeNote) };
    },
});

export const agent = new Agent({
    name: 'Iridium',
    instructions:
        'You are a helpful assistant. You can create, list, and search notes for the user.',
    model: 'openai/gpt-4o-mini',
    tools: [createNoteTool, listNotesTool, searchNotesTool],
    memory,
});
