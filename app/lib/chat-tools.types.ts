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

export interface ProductMetricsOutput {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    oneTimeProducts: number;
    oneTimeProductsRevenue: MoneyAmount;
    oneTimeProductsNetRevenue: MoneyAmount;
    averageRevenuePerUser: MoneyAmount;
    activeUsersByEvent: number;
}

export interface ConversionMetricsOutput {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    checkouts: number;
    succeededCheckouts: number;
    checkoutConversion: number; // 0-1
    orders: number;
}

export interface RevenueTrendPoint {
    date: string; // YYYY-MM-DD
    revenue: MoneyAmount;
    netRevenue: MoneyAmount;
    orders: number;
}

export interface RevenueTrendOutput {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    interval: 'day' | 'month' | 'year';
    points: RevenueTrendPoint[];
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

// ============================================================================
// Engagement Metrics
// ============================================================================

export interface TopUser {
    userId: string;
    userName: string | null;
    userEmail: string;
    messageCount: number;
    threadCount: number;
}

export interface EngagementMetricsOutput {
    dateRange: {
        startDate: string; // YYYY-MM-DD
        endDate: string; // YYYY-MM-DD
    };
    overview: {
        totalThreads: number;
        totalMessages: number;
        userMessagesCount: number; // Messages with role=USER
        assistantMessagesCount: number; // Messages with role=ASSISTANT
        systemMessagesCount: number; // Messages with role=SYSTEM
    };
    averages: {
        messagesPerThread: number;
        messagesPerThreadFormatted: string; // e.g., "12.5 msgs/thread"
        threadsPerUser: number;
        threadsPerUserFormatted: string; // e.g., "3.2 threads/user"
        messagesPerUser: number;
        messagesPerUserFormatted: string; // e.g., "25.8 msgs/user"
    };
    distribution: {
        userMessagePercentage: number;
        assistantMessagePercentage: number;
        systemMessagePercentage: number;
    };
    topUsers: TopUser[];
    trend: Array<{
        date: string; // YYYY-MM-DD
        threads: number; // New threads on this day
        messages: number; // Messages sent on this day
    }>;
}
