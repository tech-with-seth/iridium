import { RFCDate } from '@polar-sh/sdk/types/rfcdate.js';
import { tool } from 'ai';
import z from 'zod';

import { polarClient } from '~/lib/polar';
import type { MoneyAmount, RevenueTrendOutput } from '~/lib/chat-tools.types';

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
};

