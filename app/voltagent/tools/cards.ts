import { createTool } from '@voltagent/core';
import { z } from 'zod';

const infoCard = z.object({
    variant: z.literal('info'),
    title: z.string().describe('Card heading'),
    description: z.string().describe('Short explanation or summary'),
    items: z
        .array(z.string())
        .optional()
        .describe('Optional bullet-point details'),
});

const stepsCard = z.object({
    variant: z.literal('steps'),
    title: z.string().describe('Heading for the step-by-step guide'),
    steps: z
        .array(z.string())
        .min(2)
        .describe('Ordered list of steps to follow'),
});

const prosConsCard = z.object({
    variant: z.literal('pros_cons'),
    title: z.string().describe('What is being evaluated'),
    pros: z.array(z.string()).describe('Advantages or arguments in favor'),
    cons: z.array(z.string()).describe('Disadvantages or arguments against'),
});

const cardSchema = z.discriminatedUnion('variant', [
    infoCard,
    stepsCard,
    prosConsCard,
]);

export type CardData = z.infer<typeof cardSchema>;

export const renderCardTool = createTool({
    name: 'render_card',
    description: [
        'Render a rich visual card inline in the chat.',
        'Use this when presenting structured information that benefits from visual formatting:',
        '- "info" for key facts, definitions, or summaries with optional bullet points',
        '- "steps" for how-to guides, tutorials, or sequential instructions',
        '- "pros_cons" for balanced evaluations, comparisons, or trade-off analysis',
        'Prefer this over plain text when the structure itself conveys meaning.',
    ].join(' '),
    parameters: cardSchema,
    execute: async (args) => {
        // The tool returns the structured data as-is; the React component
        // on the client renders it. This is VoltAgent's tool-driven
        // approach to generative UI.
        return args;
    },
});
