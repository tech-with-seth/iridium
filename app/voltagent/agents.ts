import { Agent, Memory, createTool } from '@voltagent/core';
import { PostgreSQLMemoryAdapter } from '@voltagent/postgres';
import Stripe from 'stripe';
import invariant from 'tiny-invariant';
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

let stripeClient: Stripe | null = null;

function getStripeClient() {
    if (stripeClient) return stripeClient;

    const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
    invariant(secretKey, 'STRIPE_SECRET_KEY is not configured');
    invariant(
        secretKey.startsWith('sk_'),
        'STRIPE_SECRET_KEY must start with "sk_"',
    );

    stripeClient = new Stripe(secretKey);
    return stripeClient;
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
        invariant(userId, 'User not authenticated');

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
        invariant(userId, 'User not authenticated');

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
        invariant(userId, 'User not authenticated');

        const notes = await searchNotes({ userId, query: args.query });

        return { notes: notes.map(serializeNote) };
    },
});

const createStripePaymentLinkTool = createTool({
    name: 'create_stripe_payment_link',
    description:
        'Create a Stripe payment link for a one-time purchase. Use only when the user explicitly asks to create a payment link.',
    parameters: z.object({
        productName: z
            .string()
            .min(1)
            .max(120)
            .describe('Product name shown during checkout'),
        unitAmount: z
            .number()
            .int()
            .positive()
            .describe('Amount in the smallest currency unit (for USD, cents)'),
        currency: z
            .string()
            .length(3)
            .default('usd')
            .transform((value) => value.toLowerCase())
            .refine((value) => /^[a-z]{3}$/.test(value), {
                message: 'Currency must be a 3-letter ISO code',
            })
            .describe('3-letter ISO currency code, such as usd'),
        quantity: z
            .number()
            .int()
            .min(1)
            .max(10)
            .default(1)
            .describe('Default quantity shown on the payment link'),
        allowPromotionCodes: z
            .boolean()
            .default(false)
            .describe('Whether customers can apply promotion codes'),
        afterCompletionUrl: z
            .string()
            .url()
            .optional()
            .describe(
                'Optional URL to redirect users to after successful checkout',
            ),
    }),
    execute: async (args, options) => {
        const userId = options?.userId;
        invariant(userId, 'User not authenticated');

        const stripe = getStripeClient();

        try {
            const paymentLink = await stripe.paymentLinks.create(
                {
                    allow_promotion_codes: args.allowPromotionCodes,
                    line_items: [
                        {
                            quantity: args.quantity,
                            price_data: {
                                currency: args.currency,
                                unit_amount: args.unitAmount,
                                product_data: {
                                    name: args.productName,
                                    metadata: {
                                        createdByUserId: userId,
                                    },
                                },
                            },
                        },
                    ],
                    after_completion: args.afterCompletionUrl
                        ? {
                              type: 'redirect',
                              redirect: {
                                  url: args.afterCompletionUrl,
                              },
                          }
                        : undefined,
                    metadata: {
                        createdBy: 'iridium-agent',
                        createdByUserId: userId,
                    },
                },
                {
                    idempotencyKey: `iridium-payment-link-${options?.toolContext?.callId ?? `${userId}-${Date.now()}`}`,
                },
            );

            return {
                paymentLinkId: paymentLink.id,
                url: paymentLink.url,
                productName: args.productName,
                unitAmount: args.unitAmount,
                currency: args.currency,
                quantity: args.quantity,
            };
        } catch (error) {
            if (error instanceof Stripe.errors.StripeError) {
                if (error instanceof Stripe.errors.StripeAuthenticationError) {
                    throw new Error(
                        'Stripe authentication failed. Check STRIPE_SECRET_KEY and restart the server.',
                    );
                }

                const code = error.code ?? error.type ?? 'unknown_error';
                throw new Error(`Stripe error (${code})`);
            }

            throw error;
        }
    },
});

export const agent = new Agent({
    name: 'Iridium',
    instructions:
        'You are a helpful assistant. You can create, list, and search notes, and you can create Stripe payment links when explicitly requested.',
    model: 'openai/gpt-4o-mini',
    tools: [
        createNoteTool,
        listNotesTool,
        searchNotesTool,
        createStripePaymentLinkTool,
    ],
    memory,
});
