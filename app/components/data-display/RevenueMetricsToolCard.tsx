import { Card } from '~/components/data-display/Card';
import { DonutProgress } from '~/components/data-display/DonutProgress';
import type { RevenueMetricsOutput } from '~/lib/chat-tools.types';

function formatDateRange(startDate: string, endDate: string): string {
    return `${startDate} → ${endDate}`;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatCompactCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(amount);
}

export function RevenueMetricsToolCard({ output }: { output: RevenueMetricsOutput }) {
    return (
        <Card
            variant="border"
            className="bg-base-100 border-base-200"
            title={
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                        <span>Revenue Overview</span>
                        <span className="badge badge-ghost badge-sm">
                            totals
                        </span>
                    </div>
                    <div className="text-xs opacity-70 font-normal">
                        {formatDateRange(output.startDate, output.endDate)}
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-center">
                <div className="flex justify-center sm:justify-start">
                    <DonutProgress
                        value={output.grossMarginPercentage}
                        label="margin"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title">Revenue</div>
                        <div className="stat-value text-primary">
                            {formatCompactCurrency(output.revenue.dollars)}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title">Net Revenue</div>
                        <div className="stat-value text-accent">
                            {formatCompactCurrency(output.netRevenue.dollars)}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title">Orders</div>
                        <div className="stat-value">{output.orders}</div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title">Avg Order</div>
                        <div className="stat-value">
                            {formatCurrency(output.averageOrderValue.dollars)}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

