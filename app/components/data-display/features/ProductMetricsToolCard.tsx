import { Card } from '~/components/data-display/Card';
import { ComparisonBars } from '~/components/data-display/ComparisonBars';
import type { ProductMetricsOutput } from '~/lib/chat-tools.types';

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

export function ProductMetricsToolCard({ output }: { output: ProductMetricsOutput }) {
    return (
        <Card
            variant="border"
            className="bg-base-100 border-base-200"
            title={
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                        <span>Digital Products</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="stat bg-base-200 rounded-box p-3">
                    <div className="stat-title text-xs sm:text-sm">Units Sold</div>
                    <div className="stat-value text-2xl sm:text-3xl lg:text-4xl text-primary">
                        {output.oneTimeProducts}
                    </div>
                    <div className="stat-desc">
                        Avg per user:{' '}
                        <span className="font-mono">
                            {formatCurrency(output.averageRevenuePerUser.dollars)}
                        </span>
                    </div>
                </div>

                <div className="bg-base-200 rounded-box p-3">
                    <div className="text-sm font-semibold mb-3">
                        Revenue vs Net
                    </div>
                    <ComparisonBars
                        aLabel="Revenue"
                        aValue={output.oneTimeProductsRevenue.dollars}
                        bLabel="Net revenue"
                        bValue={output.oneTimeProductsNetRevenue.dollars}
                        formatValue={formatCurrency}
                    />
                </div>
            </div>
        </Card>
    );
}

