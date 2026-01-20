import { Card } from '~/components/data-display/Card';
import { DonutProgress } from '~/components/data-display/DonutProgress';
import type { EngagementMetricsOutput } from '~/lib/chat-tools.types';

function formatDateRange(startDate: string, endDate: string): string {
    return `${startDate} → ${endDate}`;
}

export function EngagementMetricsToolCard({
    output,
}: {
    output: EngagementMetricsOutput;
}) {
    const { overview, averages, distribution, topUsers } = output;

    return (
        <Card
            variant="border"
            className="bg-base-100 border-base-200 rounded-field my-2"
            title={
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                        <span>Engagement Metrics</span>
                        <span className="badge badge-ghost badge-sm">
                            activity
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
                            Threads
                        </div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl text-primary">
                            {overview.totalThreads}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">
                            Messages
                        </div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl text-secondary">
                            {overview.totalMessages}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">
                            Active Users
                        </div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl text-accent">
                            {topUsers.length > 0
                                ? topUsers.length
                                : overview.userMessagesCount > 0
                                  ? '1+'
                                  : '0'}
                        </div>
                    </div>
                </div>

                {/* Averages */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">
                            Msgs/Thread
                        </div>
                        <div className="stat-value text-xl sm:text-2xl lg:text-3xl">
                            {averages.messagesPerThread.toFixed(1)}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">
                            Threads/User
                        </div>
                        <div className="stat-value text-xl sm:text-2xl lg:text-3xl">
                            {averages.threadsPerUser.toFixed(1)}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">
                            Msgs/User
                        </div>
                        <div className="stat-value text-xl sm:text-2xl lg:text-3xl">
                            {averages.messagesPerUser.toFixed(1)}
                        </div>
                    </div>
                </div>

                {/* Message Distribution */}
                <div className="flex flex-col gap-3">
                    <div className="text-sm font-semibold opacity-70">
                        Message Role Distribution
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <DonutProgress
                                value={distribution.userMessagePercentage / 100}
                                label="User"
                                size={80}
                            />
                            <div className="text-xs text-center">
                                <div className="font-semibold">
                                    {overview.userMessagesCount}
                                </div>
                                <div className="opacity-70">
                                    {distribution.userMessagePercentage.toFixed(
                                        1,
                                    )}
                                    %
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <DonutProgress
                                value={
                                    distribution.assistantMessagePercentage /
                                    100
                                }
                                label="Assistant"
                                size={80}
                            />
                            <div className="text-xs text-center">
                                <div className="font-semibold">
                                    {overview.assistantMessagesCount}
                                </div>
                                <div className="opacity-70">
                                    {distribution.assistantMessagePercentage.toFixed(
                                        1,
                                    )}
                                    %
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <DonutProgress
                                value={
                                    distribution.systemMessagePercentage / 100
                                }
                                label="System"
                                size={80}
                            />
                            <div className="text-xs text-center">
                                <div className="font-semibold">
                                    {overview.systemMessagesCount}
                                </div>
                                <div className="opacity-70">
                                    {distribution.systemMessagePercentage.toFixed(
                                        1,
                                    )}
                                    %
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Users */}
                {topUsers.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <div className="text-sm font-semibold opacity-70">
                            Most Active Users
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th className="text-right">Messages</th>
                                        <th className="text-right">Threads</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topUsers.map((user, index) => (
                                        <tr key={user.userId}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="avatar placeholder">
                                                        <div className="bg-neutral text-neutral-content w-8 rounded-full">
                                                            <span className="text-xs">
                                                                {index + 1}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="font-semibold text-sm">
                                                            {user.userName ||
                                                                'Anonymous'}
                                                        </div>
                                                        <div className="text-xs opacity-70">
                                                            {user.userEmail}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-right font-mono">
                                                {user.messageCount}
                                            </td>
                                            <td className="text-right font-mono">
                                                {user.threadCount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
