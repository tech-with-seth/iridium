import { Card } from '~/components/data-display/Card';
import { ComparisonBars } from '~/components/data-display/ComparisonBars';
import type { ConversionMetricsOutput } from '~/lib/chat-tools.types';

function formatDateRange(startDate: string, endDate: string): string {
    return `${startDate} → ${endDate}`;
}

function formatPercent(value: number): string {
    const pct = Number.isFinite(value) ? value * 100 : 0;
    return `${pct.toFixed(1)}%`;
}

export function ConversionMetricsToolCard({
    output,
}: {
    output: ConversionMetricsOutput;
}) {
    return (
        <Card
            variant="border"
            className="bg-base-100 border-base-200"
            title={
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                        <span>Checkout Funnel</span>
                        <span className="badge badge-primary badge-sm">
                            {formatPercent(output.checkoutConversion)}
                        </span>
                    </div>
                    <div className="text-xs opacity-70 font-normal">
                        {formatDateRange(output.startDate, output.endDate)}
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <div className="bg-base-200 rounded-box p-3">
                    <div className="text-sm font-semibold mb-3">Progress</div>
                    <ComparisonBars
                        aLabel="Checkouts"
                        aValue={output.checkouts}
                        bLabel="Succeeded"
                        bValue={output.succeededCheckouts}
                        formatValue={(n) => n.toLocaleString()}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">Checkouts</div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl text-primary">
                            {output.checkouts.toLocaleString()}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">Succeeded</div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl text-accent">
                            {output.succeededCheckouts.toLocaleString()}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3 sm:col-span-2">
                        <div className="stat-title text-xs sm:text-sm">Orders</div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl">
                            {output.orders.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
