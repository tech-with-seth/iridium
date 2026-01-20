import { Card } from '~/components/data-display/Card';
import type { PostHogAnalyticsOutput } from '~/lib/chat-tools.types';
import { PostHogTrendChart } from './PostHogTrendChart';

function formatDateRange(startDate: string, endDate: string): string {
    return `${startDate} → ${endDate}`;
}

function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}

export function PostHogAnalyticsToolCard({
    output,
}: {
    output: PostHogAnalyticsOutput;
}) {
    const { overview, topEvents, trend } = output;

    return (
        <Card
            variant="border"
            className="bg-base-100 border-base-200 rounded-field my-2"
            title={
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                        <span>PostHog Analytics</span>
                        <span className="badge badge-ghost badge-sm">
                            overview
                        </span>
                    </div>
                    <div className="text-xs opacity-70 font-normal">
                        {formatDateRange(
                            output.dateRange.startDate,
                            output.dateRange.endDate,
                        )}
                    </div>
                </div>
            }
        >
            <div className="flex flex-col gap-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">
                            Total Events
                        </div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl text-primary">
                            {formatCompactNumber(overview.totalEvents)}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">
                            Unique Users
                        </div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl text-secondary">
                            {formatCompactNumber(overview.uniqueUsers)}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">
                            Pageviews
                        </div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl text-accent">
                            {formatCompactNumber(overview.pageviews)}
                        </div>
                    </div>
                </div>

                {/* Top Events */}
                {topEvents.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <div className="text-sm font-semibold opacity-70">
                            Top Events
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th className="text-left">Event</th>
                                        <th className="text-right">Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topEvents
                                        .slice(0, 10)
                                        .map((event, index) => (
                                            <tr key={`${event.event}-${index}`}>
                                                <td className="font-mono text-xs">
                                                    {event.event}
                                                </td>
                                                <td className="text-right">
                                                    {formatCompactNumber(
                                                        event.count,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Trend Chart */}
                {trend.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold opacity-70">
                                Daily Trend
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <span className="w-3 h-0.5 bg-primary rounded" />
                                    <span className="opacity-70">Events</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="w-3 h-0.5 bg-accent rounded border-dashed border-b" />
                                    <span className="opacity-70">
                                        Pageviews
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[240px]">
                            <PostHogTrendChart points={trend} height={240} />
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
