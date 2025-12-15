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
