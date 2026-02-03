import { RFCDate } from '@polar-sh/sdk/types/rfcdate.js';
import { tool } from 'ai';
import { differenceInDays, subDays } from 'date-fns';
import z from 'zod';

import type { MoneyAmount, UserAnalyticsOutput } from '~/lib/chat-tools.types';
import { polarClient } from '~/lib/polar';
import { getUserAnalytics } from '~/models/analytics.server';
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

function resolveDateRange({ startDate, endDate }: DateRangeArgs): {
    start: RFCDate;
    end: RFCDate;
    startISO: string;
    endISO: string;
} {
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

/**
 * AI Chat Tools - Demo implementations for Polar billing and user analytics.
 *
 * These 2 tools demonstrate the pattern for building AI tools:
 * - getRevenueMetrics: External API integration (Polar billing)
 * - getUserAnalytics: Database queries (Prisma)
 *
 * Add more tools following these patterns as needed.
 */
export const chatTools = {
    // ========================================================================
    // Polar Billing Demo
    // ========================================================================
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
                averageOrderValue: toMoneyAmount(
                    metrics.totals.averageOrderValue,
                ),
                netAverageOrderValue: toMoneyAmount(
                    metrics.totals.netAverageOrderValue,
                ),
                grossMargin: toMoneyAmount(metrics.totals.grossMargin),
                grossMarginPercentage: metrics.totals.grossMarginPercentage,
                cashflow: toMoneyAmount(metrics.totals.cashflow),
            };
        },
    }),
    // ========================================================================
    // Database Analytics Demo
    // ========================================================================
    getUserAnalytics: tool({
        description:
            'Retrieves comprehensive user analytics including growth trends, role distribution, and account health metrics. Use this when the user asks about user counts, user growth, active users, role breakdowns, or overall user statistics.',
        inputSchema: z.object({
            startDate: z
                .string()
                .regex(ISO_DATE_REGEX, 'Expected YYYY-MM-DD')
                .optional()
                .describe(
                    'Start date in YYYY-MM-DD format. Defaults to 30 days ago.',
                ),
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
                    ? (analyticsData.bannedUsers / analyticsData.totalUsers) *
                      100
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
                    activePercentageFormatted:
                        formatPercentage(activePercentage),
                    bannedPercentageFormatted:
                        formatPercentage(bannedPercentage),
                },
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
