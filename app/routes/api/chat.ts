import { createOpenAI } from '@ai-sdk/openai';
import {
    streamText,
    convertToModelMessages,
    tool,
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
import { polarClient } from '~/lib/polar';
import { RFCDate } from '@polar-sh/sdk/types/rfcdate.js';

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
    if (request.method === 'POST') {
        const { messages, id: threadId }: UIMessagesRequestJson =
            await request.json();
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

                const titleResult = await generateText({
                    model,
                    prompt: `Generate a concise, descriptive title (max 6 words) for this conversation. The title should capture the main topic or question being discussed.

Conversation:
${conversationContext}

Generate only the title, no quotes or extra text.`,
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
            system: "You are a business data analyst AI assistant helping a digital downloads entrepreneur. Help analyze sales, revenue, and conversion metrics for their digital products. Provide clear, actionable insights based on the tools available to you. IMPORTANT: All monetary values returned by the tools are in cents. You MUST divide them by 100 to convert to dollars before displaying to the user. For example, if revenue is 48900, display it as $489.00, not $48,900. If the user's query is unrelated to business data analysis, politely inform them that you can only assist with business data-related questions.",
            messages: convertToModelMessages(messages),
            stopWhen: stepCountIs(5),
            tools: {
                getRevenueMetrics: tool({
                    description:
                        'Get core revenue and sales metrics including total revenue, net revenue, number of orders, average order value, and gross margin. Defaults to last 3 months if no dates specified.',
                    inputSchema: z.object({
                        startDate: z
                            .string()
                            .optional()
                            .describe(
                                'Start date in YYYY-MM-DD format. Defaults to 3 months ago.',
                            ),
                        endDate: z
                            .string()
                            .optional()
                            .describe(
                                'End date in YYYY-MM-DD format. Defaults to today.',
                            ),
                    }),
                    execute: async ({ startDate, endDate }) => {
                        const defaultEndDate = new Date();
                        const defaultStartDate = new Date();
                        defaultStartDate.setMonth(
                            defaultStartDate.getMonth() - 3,
                        );

                        const start = startDate
                            ? new RFCDate(startDate)
                            : new RFCDate(
                                  defaultStartDate.toISOString().split('T')[0],
                              );
                        const end = endDate
                            ? new RFCDate(endDate)
                            : new RFCDate(
                                  defaultEndDate.toISOString().split('T')[0],
                              );

                        const metrics = await polarClient.metrics.get({
                            startDate: start,
                            endDate: end,
                            interval: 'month',
                            organizationId: null,
                        });

                        return {
                            averageOrderValue: metrics.totals.averageOrderValue,
                            cashflow: metrics.totals.cashflow,
                            grossMargin: metrics.totals.grossMargin,
                            grossMarginPercentage:
                                metrics.totals.grossMarginPercentage,
                            netAverageOrderValue:
                                metrics.totals.netAverageOrderValue,
                            netRevenue: metrics.totals.netRevenue,
                            orders: metrics.totals.orders,
                            revenue: metrics.totals.revenue,
                        };
                    },
                }),
                getProductMetrics: tool({
                    description:
                        'Get digital product sales metrics including number of one-time products sold, product revenue, and net product revenue. Use this for analyzing individual product performance. Defaults to last 3 months if no dates specified.',
                    inputSchema: z.object({
                        startDate: z
                            .string()
                            .optional()
                            .describe(
                                'Start date in YYYY-MM-DD format. Defaults to 3 months ago.',
                            ),
                        endDate: z
                            .string()
                            .optional()
                            .describe(
                                'End date in YYYY-MM-DD format. Defaults to today.',
                            ),
                    }),
                    execute: async ({ startDate, endDate }) => {
                        const defaultEndDate = new Date();
                        const defaultStartDate = new Date();
                        defaultStartDate.setMonth(
                            defaultStartDate.getMonth() - 3,
                        );

                        const start = startDate
                            ? new RFCDate(startDate)
                            : new RFCDate(
                                  defaultStartDate.toISOString().split('T')[0],
                              );
                        const end = endDate
                            ? new RFCDate(endDate)
                            : new RFCDate(
                                  defaultEndDate.toISOString().split('T')[0],
                              );

                        const metrics = await polarClient.metrics.get({
                            startDate: start,
                            endDate: end,
                            interval: 'month',
                            organizationId: null,
                        });

                        return {
                            oneTimeProducts: metrics.totals.oneTimeProducts,
                            oneTimeProductsRevenue:
                                metrics.totals.oneTimeProductsRevenue,
                            oneTimeProductsNetRevenue:
                                metrics.totals.oneTimeProductsNetRevenue,
                            averageRevenuePerUser:
                                metrics.totals.averageRevenuePerUser,
                            activeUsersByEvent:
                                metrics.totals.activeUserByEvent,
                        };
                    },
                }),
                getConversionMetrics: tool({
                    description:
                        'Get checkout and conversion funnel metrics including total checkouts, succeeded checkouts, and conversion rate. Use this to analyze sales funnel performance. Defaults to last 3 months if no dates specified.',
                    inputSchema: z.object({
                        startDate: z
                            .string()
                            .optional()
                            .describe(
                                'Start date in YYYY-MM-DD format. Defaults to 3 months ago.',
                            ),
                        endDate: z
                            .string()
                            .optional()
                            .describe(
                                'End date in YYYY-MM-DD format. Defaults to today.',
                            ),
                    }),
                    execute: async ({ startDate, endDate }) => {
                        const defaultEndDate = new Date();
                        const defaultStartDate = new Date();
                        defaultStartDate.setMonth(
                            defaultStartDate.getMonth() - 3,
                        );

                        const start = startDate
                            ? new RFCDate(startDate)
                            : new RFCDate(
                                  defaultStartDate.toISOString().split('T')[0],
                              );
                        const end = endDate
                            ? new RFCDate(endDate)
                            : new RFCDate(
                                  defaultEndDate.toISOString().split('T')[0],
                              );

                        const metrics = await polarClient.metrics.get({
                            startDate: start,
                            endDate: end,
                            interval: 'month',
                            organizationId: null,
                        });

                        return {
                            checkouts: metrics.totals.checkouts,
                            succeededCheckouts:
                                metrics.totals.succeededCheckouts,
                            checkoutConversion:
                                metrics.totals.checkoutsConversion,
                            orders: metrics.totals.orders,
                        };
                    },
                }),
            },
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
}
