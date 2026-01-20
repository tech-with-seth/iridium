import { Card } from '~/components/data-display/Card';
import { ComparisonBars } from '~/components/data-display/ComparisonBars';
import { DonutProgress } from '~/components/data-display/DonutProgress';
import type { UserAnalyticsOutput } from '~/lib/chat-tools.types';

function formatDateRange(startDate: string, endDate: string): string {
    return `${startDate} → ${endDate}`;
}

export function UserAnalyticsToolCard({
    output,
}: {
    output: UserAnalyticsOutput;
}) {
    const { overview, growth, roleDistribution, accountHealth } = output;

    const inactiveUsers = overview.totalUsers - overview.activeUsers;

    return (
        <Card
            variant="border"
            className="bg-base-100 border-base-200 rounded-field my-2"
            title={
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                        <span>User Analytics</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">
                            Total Users
                        </div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl text-primary">
                            {overview.totalUsers}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">
                            New Users
                        </div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl text-secondary">
                            {overview.newUsersInRange}
                        </div>
                        {growth.growthRate !== 0 && (
                            <div className="stat-desc">
                                <span
                                    className={
                                        growth.growthRate > 0
                                            ? 'text-success'
                                            : 'text-error'
                                    }
                                >
                                    {growth.growthRateFormatted}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">
                            Active Users
                        </div>
                        <div className="stat-value text-2xl sm:text-3xl lg:text-4xl text-accent">
                            {overview.activeUsers}
                        </div>
                        <div className="stat-desc">
                            {accountHealth.activePercentageFormatted}
                        </div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3">
                        <div className="stat-title text-xs sm:text-sm">
                            Banned Users
                        </div>
                        <div
                            className={`stat-value text-2xl sm:text-3xl lg:text-4xl ${overview.bannedUsers > 0 ? 'text-warning' : ''}`}
                        >
                            {overview.bannedUsers}
                        </div>
                        {overview.bannedUsers > 0 && (
                            <div className="stat-desc text-warning">
                                {accountHealth.bannedPercentageFormatted}
                            </div>
                        )}
                    </div>
                </div>

                {/* Role Distribution */}
                <div className="flex flex-col gap-3">
                    <div className="text-sm font-semibold opacity-70">
                        Role Distribution
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <DonutProgress
                                value={roleDistribution.userPercentage / 100}
                                label="Users"
                                size={80}
                            />
                            <div className="text-xs text-center">
                                <div className="font-semibold">
                                    {roleDistribution.userCount}
                                </div>
                                <div className="opacity-70">
                                    {roleDistribution.userPercentage.toFixed(1)}
                                    %
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <DonutProgress
                                value={roleDistribution.editorPercentage / 100}
                                label="Editors"
                                size={80}
                            />
                            <div className="text-xs text-center">
                                <div className="font-semibold">
                                    {roleDistribution.editorCount}
                                </div>
                                <div className="opacity-70">
                                    {roleDistribution.editorPercentage.toFixed(
                                        1,
                                    )}
                                    %
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <DonutProgress
                                value={roleDistribution.adminPercentage / 100}
                                label="Admins"
                                size={80}
                            />
                            <div className="text-xs text-center">
                                <div className="font-semibold">
                                    {roleDistribution.adminCount}
                                </div>
                                <div className="opacity-70">
                                    {roleDistribution.adminPercentage.toFixed(
                                        1,
                                    )}
                                    %
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Health */}
                <div className="flex flex-col gap-3">
                    <div className="text-sm font-semibold opacity-70">
                        Account Health
                    </div>
                    <ComparisonBars
                        aLabel="Active Users"
                        aValue={overview.activeUsers}
                        bLabel="Inactive Users"
                        bValue={inactiveUsers}
                    />
                </div>
            </div>
        </Card>
    );
}
