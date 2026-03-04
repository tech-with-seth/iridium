import { Agent, Memory } from '@voltagent/core';
import { PostgreSQLMemoryAdapter } from '@voltagent/postgres';
import { z } from 'zod';
import { createNoteTool, listNotesTool, searchNotesTool } from './tools/notes';
import { NotesRetriever } from './retrievers/notes';

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

const notesRetriever = new NotesRetriever();

export const agent = new Agent({
    name: 'Iris',
    instructions:
        'Your name is Iris. You are a helpful assistant. You can create, list, and search notes.',
    model: 'anthropic/claude-3-haiku-20240307',
    tools: [createNoteTool, listNotesTool, searchNotesTool],
    retriever: notesRetriever,
    memory,
});
