import { Card } from '~/components/data-display/Card';
import { RevenueTrendChart } from '~/components/data-display/RevenueTrendChart';
import type { RevenueTrendOutput } from '~/lib/chat-tools.types';

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

export function RevenueTrendToolCard({ output }: { output: RevenueTrendOutput }) {
    const totalRevenue = output.points.reduce(
        (sum, p) => sum + p.revenue.dollars,
        0,
    );
    const totalNetRevenue = output.points.reduce(
        (sum, p) => sum + p.netRevenue.dollars,
        0,
    );
    const totalOrders = output.points.reduce((sum, p) => sum + p.orders, 0);

    return (
        <Card
            variant="border"
            className="bg-base-100 border-base-200"
            title={
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                        <span>Revenue Trend</span>
                        <span className="badge badge-ghost badge-sm">
                            {output.interval}
                        </span>
                    </div>
                    <div className="text-xs opacity-70 font-normal">
                        {formatDateRange(output.startDate, output.endDate)}
                    </div>
                </div>
            }
        >
            <div className="flex flex-wrap gap-2">
                <div className="badge badge-primary badge-sm">
                    Revenue: {formatCurrency(totalRevenue)}
                </div>
                <div className="badge badge-accent badge-sm">
                    Net: {formatCurrency(totalNetRevenue)}
                </div>
                <div className="badge badge-ghost badge-sm">
                    Orders: {totalOrders}
                </div>
            </div>

            <div className="mt-3">
                <RevenueTrendChart points={output.points} height={240} />
            </div>
        </Card>
    );
}

