/**
 * Chat tool type definitions.
 *
 * This file contains types for the 2 demo AI chat tools:
 * - getRevenueMetrics (uses MoneyAmount)
 * - getUserAnalytics (uses UserAnalyticsOutput)
 *
 * Add more types as you build additional tools.
 */

export interface MoneyAmount {
    cents: number;
    dollars: number;
}

export interface RevenueMetricsOutput {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    orders: number;
    revenue: MoneyAmount;
    netRevenue: MoneyAmount;
    averageOrderValue: MoneyAmount;
    netAverageOrderValue: MoneyAmount;
    grossMargin: MoneyAmount;
    grossMarginPercentage: number; // 0-1
    cashflow: MoneyAmount;
}

// ============================================================================
// User Analytics
// ============================================================================

export interface UserAnalyticsOutput {
    dateRange: {
        startDate: string; // YYYY-MM-DD
        endDate: string; // YYYY-MM-DD
    };
    overview: {
        totalUsers: number;
        newUsersInRange: number;
        activeUsers: number; // Users with sessions in date range
        bannedUsers: number;
    };
    growth: {
        newUsersCount: number;
        growthRate: number; // Percentage growth vs previous period
        growthRateFormatted: string; // e.g., "+23.5%"
    };
    roleDistribution: {
        userCount: number;
        editorCount: number;
        adminCount: number;
        userPercentage: number;
        editorPercentage: number;
        adminPercentage: number;
    };
    accountHealth: {
        activePercentage: number; // Active users / total users
        bannedPercentage: number; // Banned users / total users
        activePercentageFormatted: string;
        bannedPercentageFormatted: string;
    };
    trend: Array<{
        date: string; // YYYY-MM-DD
        newUsers: number;
        cumulativeUsers: number;
    }>;
}
