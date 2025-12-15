import { RFCDate } from '@polar-sh/sdk/types/rfcdate.js';
import { tool } from 'ai';
import { differenceInDays, subDays } from 'date-fns';
import z from 'zod';

import type {
    EngagementMetricsOutput,
    MoneyAmount,
    RevenueTrendOutput,
    UserAnalyticsOutput,
} from '~/lib/chat-tools.types';
import { polarClient } from '~/lib/polar';
import {
    getEngagementMetrics,
    getUserAnalytics,
} from '~/models/analytics.server';
import { Role } from '~/generated/prisma/client';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function toISODate(date: Date): string {
    return date.toISOString().split('T')[0]!;
}

function toMoneyAmount(cents: number): MoneyAmount {
    return {
        cents,
        dollars: cents / 100,
    };
}

interface DateRangeArgs {
    startDate?: string;
    endDate?: string;
}

function resolveDateRange({
    startDate,
    endDate,
}: DateRangeArgs): { start: RFCDate; end: RFCDate; startISO: string; endISO: string } {
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 3);

    const startISO = startDate ?? toISODate(defaultStartDate);
    const endISO = endDate ?? toISODate(defaultEndDate);

    return {
        start: new RFCDate(startISO),
        end: new RFCDate(endISO),
        startISO,
        endISO,
    };
}

const dateRangeInputSchema = z.object({
    startDate: z
        .string()
        .regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD')
        .optional()
        .describe('Start date in YYYY-MM-DD format. Defaults to 3 months ago.'),
    endDate: z
        .string()
        .regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD')
        .optional()
        .describe('End date in YYYY-MM-DD format. Defaults to today.'),
});

export const chatTools = {
    getRevenueMetrics: tool({
        description:
            'Get core revenue and sales metrics including total revenue, net revenue, number of orders, average order value, and gross margin. Returns both cents and dollars. Defaults to last 3 months if no dates specified.',
        inputSchema: dateRangeInputSchema,
        execute: async ({ startDate, endDate }) => {
            const { start, end, startISO, endISO } = resolveDateRange({
                startDate,
                endDate,
            });

            const metrics = await polarClient.metrics.get({
                startDate: start,
                endDate: end,
                interval: 'month',
                organizationId: null,
            });

            return {
                startDate: startISO,
                endDate: endISO,
                orders: metrics.totals.orders,
                revenue: toMoneyAmount(metrics.totals.revenue),
                netRevenue: toMoneyAmount(metrics.totals.netRevenue),
                averageOrderValue: toMoneyAmount(metrics.totals.averageOrderValue),
                netAverageOrderValue: toMoneyAmount(
                    metrics.totals.netAverageOrderValue,
                ),
                grossMargin: toMoneyAmount(metrics.totals.grossMargin),
                grossMarginPercentage: metrics.totals.grossMarginPercentage,
                cashflow: toMoneyAmount(metrics.totals.cashflow),
            };
        },
    }),
    getProductMetrics: tool({
        description:
            'Get digital product sales metrics including number of one-time products sold, product revenue, and net product revenue. Returns both cents and dollars. Defaults to last 3 months if no dates specified.',
        inputSchema: dateRangeInputSchema,
        execute: async ({ startDate, endDate }) => {
            const { start, end, startISO, endISO } = resolveDateRange({
                startDate,
                endDate,
            });

            const metrics = await polarClient.metrics.get({
                startDate: start,
                endDate: end,
                interval: 'month',
                organizationId: null,
            });

            return {
                startDate: startISO,
                endDate: endISO,
                oneTimeProducts: metrics.totals.oneTimeProducts,
                oneTimeProductsRevenue: toMoneyAmount(
                    metrics.totals.oneTimeProductsRevenue,
                ),
                oneTimeProductsNetRevenue: toMoneyAmount(
                    metrics.totals.oneTimeProductsNetRevenue,
                ),
                averageRevenuePerUser: toMoneyAmount(
                    metrics.totals.averageRevenuePerUser,
                ),
                activeUsersByEvent: metrics.totals.activeUserByEvent,
            };
        },
    }),
    getConversionMetrics: tool({
        description:
            'Get checkout and conversion funnel metrics including total checkouts, succeeded checkouts, and conversion rate. Defaults to last 3 months if no dates specified.',
        inputSchema: dateRangeInputSchema,
        execute: async ({ startDate, endDate }) => {
            const { start, end, startISO, endISO } = resolveDateRange({
                startDate,
                endDate,
            });

            const metrics = await polarClient.metrics.get({
                startDate: start,
                endDate: end,
                interval: 'month',
                organizationId: null,
            });

            return {
                startDate: startISO,
                endDate: endISO,
                checkouts: metrics.totals.checkouts,
                succeededCheckouts: metrics.totals.succeededCheckouts,
                checkoutConversion: metrics.totals.checkoutsConversion,
                orders: metrics.totals.orders,
            };
        },
    }),
    getRevenueTrend: tool({
        description:
            'Get revenue trend data suitable for charting. Returns points with dates, revenue/netRevenue in cents and dollars, and orders. Defaults to last 3 months if no dates specified.',
        inputSchema: dateRangeInputSchema.extend({
            interval: z
                .enum(['day', 'month', 'year'])
                .optional()
                .describe("Aggregation interval. Defaults to 'month'."),
        }),
        execute: async ({ startDate, endDate, interval }) => {
            const { start, end, startISO, endISO } = resolveDateRange({
                startDate,
                endDate,
            });
            const resolvedInterval = interval ?? 'month';

            const metrics = await polarClient.metrics.get({
                startDate: start,
                endDate: end,
                interval: resolvedInterval,
                organizationId: null,
            });

            const output: RevenueTrendOutput = {
                startDate: startISO,
                endDate: endISO,
                interval: resolvedInterval,
                points: metrics.periods.map((period) => ({
                    date: toISODate(period.timestamp),
                    revenue: toMoneyAmount(period.revenue),
                    netRevenue: toMoneyAmount(period.netRevenue),
                    orders: period.orders,
                })),
            };

            return output;
        },
    }),
    // ========================================================================
    // User Analytics
    // ========================================================================
    getUserAnalytics: tool({
        description:
            'Retrieves comprehensive user analytics including growth trends, role distribution, and account health metrics. Use this when the user asks about user counts, user growth, active users, role breakdowns, or overall user statistics.',
        inputSchema: z.object({
            startDate: z
                .string()
                .regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD')
                .optional()
                .describe('Start date in YYYY-MM-DD format. Defaults to 30 days ago.'),
            endDate: z
                .string()
                .regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD')
                .optional()
                .describe('End date in YYYY-MM-DD format. Defaults to today.'),
            includeInactive: z
                .boolean()
                .optional()
                .describe(
                    'Whether to include banned users in counts. Defaults to false.',
                ),
        }),
        execute: async ({ startDate, endDate, includeInactive }) => {
            // Resolve date range (30 days default)
            const defaultEndDate = new Date();
            const defaultStartDate = new Date();
            defaultStartDate.setDate(defaultStartDate.getDate() - 30);

            const startISO = startDate ?? toISODate(defaultStartDate);
            const endISO = endDate ?? toISODate(defaultEndDate);

            const start = new Date(startISO);
            const end = new Date(endISO);

            // Calculate previous period for growth comparison
            const periodLength = differenceInDays(end, start);
            const previousStart = subDays(start, periodLength);

            // Call model layer function
            const analyticsData = await getUserAnalytics({
                startDate: start,
                endDate: end,
                includeInactive: includeInactive ?? false,
            });

            // Calculate previous period data for growth rate
            const previousPeriodData = await getUserAnalytics({
                startDate: previousStart,
                endDate: start,
                includeInactive: includeInactive ?? false,
            });

            // Calculate growth rate
            const growthRate = calculateGrowthRate(
                analyticsData.newUsersInRange,
                previousPeriodData.newUsersInRange,
            );

            // Calculate role percentages
            const rolePercentages = calculateRolePercentages(
                analyticsData.roleDistribution,
                analyticsData.totalUsers,
            );

            // Calculate account health percentages
            const activePercentage =
                analyticsData.totalUsers > 0
                    ? (analyticsData.activeUserIds.length /
                          analyticsData.totalUsers) *
                      100
                    : 0;
            const bannedPercentage =
                analyticsData.totalUsers > 0
                    ? (analyticsData.bannedUsers / analyticsData.totalUsers) * 100
                    : 0;

            // Format trend data
            const trend = formatUserTrendData(
                analyticsData.dailyNewUsers,
                analyticsData.totalUsersBeforeRange,
            );

            const output: UserAnalyticsOutput = {
                dateRange: {
                    startDate: startISO,
                    endDate: endISO,
                },
                overview: {
                    totalUsers: analyticsData.totalUsers,
                    newUsersInRange: analyticsData.newUsersInRange,
                    activeUsers: analyticsData.activeUserIds.length,
                    bannedUsers: analyticsData.bannedUsers,
                },
                growth: {
                    newUsersCount: analyticsData.newUsersInRange,
                    growthRate,
                    growthRateFormatted: formatPercentage(growthRate, {
                        includeSign: true,
                    }),
                },
                roleDistribution: {
                    userCount: rolePercentages.USER.count,
                    editorCount: rolePercentages.EDITOR.count,
                    adminCount: rolePercentages.ADMIN.count,
                    userPercentage: rolePercentages.USER.percentage,
                    editorPercentage: rolePercentages.EDITOR.percentage,
                    adminPercentage: rolePercentages.ADMIN.percentage,
                },
                accountHealth: {
                    activePercentage,
                    bannedPercentage,
                    activePercentageFormatted: formatPercentage(activePercentage),
                    bannedPercentageFormatted: formatPercentage(bannedPercentage),
                },
                trend,
            };

            return output;
        },
    }),
    // ========================================================================
    // Engagement Metrics
    // ========================================================================
    getEngagementMetrics: tool({
        description:
            'Retrieves engagement metrics for AI chat features including thread activity, message volume, conversation depth, and most active users. Use this when the user asks about chat engagement, message statistics, thread activity, or which users are most engaged with the AI assistant.',
        inputSchema: z.object({
            startDate: z
                .string()
                .regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD')
                .optional()
                .describe('Start date in YYYY-MM-DD format. Defaults to 30 days ago.'),
            endDate: z
                .string()
                .regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD')
                .optional()
                .describe('End date in YYYY-MM-DD format. Defaults to today.'),
            topUsersLimit: z
                .number()
                .min(1)
                .max(20)
                .optional()
                .describe(
                    'Number of top users to return (1-20). Defaults to 5.',
                ),
        }),
        execute: async ({ startDate, endDate, topUsersLimit }) => {
            // Resolve date range (30 days default)
            const defaultEndDate = new Date();
            const defaultStartDate = new Date();
            defaultStartDate.setDate(defaultStartDate.getDate() - 30);

            const startISO = startDate ?? toISODate(defaultStartDate);
            const endISO = endDate ?? toISODate(defaultEndDate);

            const start = new Date(startISO);
            const end = new Date(endISO);

            // Call model layer function
            const metricsData = await getEngagementMetrics({
                startDate: start,
                endDate: end,
                topUsersLimit: topUsersLimit ?? 5,
            });

            // Calculate averages
            const messagesPerThread =
                metricsData.totalThreads > 0
                    ? metricsData.totalMessages / metricsData.totalThreads
                    : 0;

            const threadsPerUser =
                metricsData.uniqueActiveUsers > 0
                    ? metricsData.totalThreads / metricsData.uniqueActiveUsers
                    : 0;

            const messagesPerUser =
                metricsData.uniqueActiveUsers > 0
                    ? metricsData.totalMessages / metricsData.uniqueActiveUsers
                    : 0;

            // Calculate message role distribution percentages
            const roleDistribution = calculateMessageRoleDistribution(
                metricsData.messagesByRole,
                metricsData.totalMessages,
            );

            // Format trend data
            const trend = formatEngagementTrend(
                metricsData.dailyThreads,
                metricsData.dailyMessages,
                start,
                end,
            );

            const output: EngagementMetricsOutput = {
                dateRange: {
                    startDate: startISO,
                    endDate: endISO,
                },
                overview: {
                    totalThreads: metricsData.totalThreads,
                    totalMessages: metricsData.totalMessages,
                    userMessagesCount: roleDistribution.USER.count,
                    assistantMessagesCount: roleDistribution.ASSISTANT.count,
                    systemMessagesCount: roleDistribution.SYSTEM.count,
                },
                averages: {
                    messagesPerThread,
                    messagesPerThreadFormatted: `${messagesPerThread.toFixed(1)} msgs/thread`,
                    threadsPerUser,
                    threadsPerUserFormatted: `${threadsPerUser.toFixed(1)} threads/user`,
                    messagesPerUser,
                    messagesPerUserFormatted: `${messagesPerUser.toFixed(1)} msgs/user`,
                },
                distribution: {
                    userMessagePercentage: roleDistribution.USER.percentage,
                    assistantMessagePercentage:
                        roleDistribution.ASSISTANT.percentage,
                    systemMessagePercentage: roleDistribution.SYSTEM.percentage,
                },
                topUsers: metricsData.topUsers,
                trend,
            };

            return output;
        },
    }),
};

// ============================================================================
// Helper Functions
// ============================================================================

function calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
}

function calculateRolePercentages(
    distribution: Array<{ role: Role; _count: { role: number } }>,
    total: number,
): Record<Role, { count: number; percentage: number }> {
    const result = {
        USER: { count: 0, percentage: 0 },
        EDITOR: { count: 0, percentage: 0 },
        ADMIN: { count: 0, percentage: 0 },
    };

    distribution.forEach((item) => {
        const count = item._count.role;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        result[item.role] = { count, percentage };
    });

    return result;
}

function calculateMessageRoleDistribution(
    roleData: Array<{ role: 'USER' | 'ASSISTANT' | 'SYSTEM'; _count: { role: number } }>,
    total: number,
): Record<'USER' | 'ASSISTANT' | 'SYSTEM', { count: number; percentage: number }> {
    const result = {
        USER: { count: 0, percentage: 0 },
        ASSISTANT: { count: 0, percentage: 0 },
        SYSTEM: { count: 0, percentage: 0 },
    };

    roleData.forEach((item) => {
        const count = item._count.role;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        result[item.role] = { count, percentage };
    });

    return result;
}

function formatUserTrendData(
    dailyNewUsers: Array<{ date: Date; count: number }>,
    startingTotal: number,
): Array<{ date: string; newUsers: number; cumulativeUsers: number }> {
    let cumulative = startingTotal;

    return dailyNewUsers.map((day) => {
        cumulative += day.count;
        return {
            date: toISODate(day.date),
            newUsers: day.count,
            cumulativeUsers: cumulative,
        };
    });
}

function formatEngagementTrend(
    dailyThreads: Array<{ date: Date; count: number }>,
    dailyMessages: Array<{ date: Date; count: number }>,
    startDate: Date,
    endDate: Date,
): Array<{ date: string; threads: number; messages: number }> {
    // Create a map of dates to data
    const threadMap = new Map<string, number>();
    const messageMap = new Map<string, number>();

    dailyThreads.forEach((item) => {
        threadMap.set(toISODate(item.date), item.count);
    });

    dailyMessages.forEach((item) => {
        messageMap.set(toISODate(item.date), item.count);
    });

    // Fill in all dates in range (even if no data)
    const result: Array<{ date: string; threads: number; messages: number }> = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateStr = toISODate(currentDate);
        result.push({
            date: dateStr,
            threads: threadMap.get(dateStr) ?? 0,
            messages: messageMap.get(dateStr) ?? 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
}

function formatPercentage(
    value: number,
    options?: { includeSign?: boolean },
): string {
    const formatted = value.toFixed(1) + '%';
    if (options?.includeSign && value > 0) {
        return '+' + formatted;
    }
    return formatted;
}

