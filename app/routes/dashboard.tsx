import { useState, type ReactNode } from 'react';
import { Badge } from '~/components/Badge';
import { TrendingUp, Repeat, Users, Clipboard } from 'lucide-react';
import { Card } from '~/components/Card';
import { Container } from '~/components/Container';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from '~/components/Table';
import { Tab, TabContent, Tabs } from '~/components/Tabs';
import { Timeline, TimelineItem } from '~/components/Timeline';
import { StatsBox, StatsContainer } from '~/components/Stats';
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';

type TrendTone = 'positive' | 'negative' | 'neutral';

interface KpiCard {
    id: string;
    label: string;
    value: string;
    helper: string;
    trendLabel: string;
    trendTone: TrendTone;
    icon: ReactNode;
}

interface CustomerRow {
    id: string;
    company: string;
    owner: string;
    plan: string;
    seats: number;
    mrr: string;
    health: 'Healthy' | 'At Risk' | 'Renewal';
    healthTone: TrendTone;
}

type UsageViewKey = 'usage' | 'adoption' | 'churn';

interface UsageView {
    label: string;
    summary: string;
    metrics: Array<{
        id: string;
        label: string;
        value: string;
        helper: string;
        tone: TrendTone;
    }>;
    callout: {
        headline: string;
        detail: string;
        tone: TrendTone;
    };
}

interface TimelineEntry {
    id: string;
    title: string;
    timestamp: string;
    description: string;
    tone: TrendTone;
}

interface MilestoneEntry {
    id: string;
    targetDate: string;
    name: string;
    description: string;
    owner: string;
    tone: TrendTone;
}

const TREND_BADGE_COLORS: Record<TrendTone, 'success' | 'error' | 'neutral'> = {
    positive: 'success',
    negative: 'error',
    neutral: 'neutral',
};

const KPI_CARDS: KpiCard[] = [
    {
        id: 'mrr',
        label: 'Monthly Recurring Revenue',
        value: '$84.2K',
        helper: 'vs. last 30 days',
        trendLabel: '+8.4%',
        trendTone: 'positive',
        icon: <TrendingUp className="h-10 w-10 stroke-current" />,
    },
    {
        id: 'net-retention',
        label: 'Net Revenue Retention',
        value: '112%',
        helper: 'Rolling 90 day cohort',
        trendLabel: '+5.2 pts',
        trendTone: 'positive',
        icon: <Repeat className="h-10 w-10 stroke-current" />,
    },
    {
        id: 'active-users',
        label: 'Weekly Active Users',
        value: '9,742',
        helper: 'Across all workspaces',
        trendLabel: '+14%',
        trendTone: 'positive',
        icon: <Users className="h-10 w-10 stroke-current" />,
    },
    {
        id: 'support-backlog',
        label: 'Support Backlog',
        value: '18 open',
        helper: 'SLA breaches: 0',
        trendLabel: '-6 since Monday',
        trendTone: 'positive',
        icon: <Clipboard className="h-10 w-10 stroke-current" />,
    },
];

const TOP_CUSTOMERS: CustomerRow[] = [
    {
        id: 'acme',
        company: 'Acme Robotics',
        owner: 'Jamie Rivera',
        plan: 'Enterprise',
        seats: 260,
        mrr: '$12.4K',
        health: 'Healthy',
        healthTone: 'positive',
    },
    {
        id: 'aurora',
        company: 'Aurora Analytics',
        owner: 'Priya Desai',
        plan: 'Scale',
        seats: 142,
        mrr: '$8.9K',
        health: 'Renewal',
        healthTone: 'neutral',
    },
    {
        id: 'lumen',
        company: 'Lumen Finance',
        owner: 'Chris Fowler',
        plan: 'Enterprise',
        seats: 310,
        mrr: '$10.1K',
        health: 'At Risk',
        healthTone: 'negative',
    },
    {
        id: 'northwind',
        company: 'Northwind Labs',
        owner: 'Anita Patel',
        plan: 'Growth',
        seats: 88,
        mrr: '$4.7K',
        health: 'Healthy',
        healthTone: 'positive',
    },
    {
        id: 'harper',
        company: 'Harper & Co.',
        owner: 'Sofia Martinez',
        plan: 'Scale',
        seats: 74,
        mrr: '$3.2K',
        health: 'Healthy',
        healthTone: 'positive',
    },
    {
        id: 'zenith',
        company: 'Zenith Media',
        owner: 'Evan Brooks',
        plan: 'Growth',
        seats: 46,
        mrr: '$2.1K',
        health: 'Renewal',
        healthTone: 'neutral',
    },
    {
        id: 'orion',
        company: 'Orion Security',
        owner: 'Lena Cho',
        plan: 'Enterprise',
        seats: 198,
        mrr: '$9.6K',
        health: 'At Risk',
        healthTone: 'negative',
    },
    {
        id: 'veridian',
        company: 'Veridian Dynamics',
        owner: 'Marcus Liu',
        plan: 'Enterprise',
        seats: 134,
        mrr: '$7.8K',
        health: 'Healthy',
        healthTone: 'positive',
    },
    {
        id: 'solstice',
        company: 'Solstice Health',
        owner: 'Nina Gomez',
        plan: 'Scale',
        seats: 59,
        mrr: '$2.9K',
        health: 'Renewal',
        healthTone: 'neutral',
    },
];

const USAGE_VIEWS: Record<UsageViewKey, UsageView> = {
    usage: {
        label: 'Usage',
        summary:
            'Active workspaces created 643 new projects over the last 14 days.',
        metrics: [
            {
                id: 'projects',
                label: 'Active Projects',
                value: '643',
                helper: '+18% vs prior period',
                tone: 'positive',
            },
            {
                id: 'sessions',
                label: 'Average Session Length',
                value: '12m 34s',
                helper: '+1m 12s week-over-week',
                tone: 'positive',
            },
            {
                id: 'automation',
                label: 'Automation Runs',
                value: '3,482',
                helper: 'On pace with forecast',
                tone: 'neutral',
            },
        ],
        callout: {
            headline: 'Design teams are your power users this week.',
            detail: 'Blueprint templates were launched in 61% of new projects.',
            tone: 'positive',
        },
    },
    adoption: {
        label: 'Adoption',
        summary:
            'Feature adoption for workflow automation continues to trend upward.',
        metrics: [
            {
                id: 'feature',
                label: 'Automation Adoption',
                value: '76%',
                helper: '+5 pts in 7 days',
                tone: 'positive',
            },
            {
                id: 'activation',
                label: 'Week-1 Activation',
                value: '68%',
                helper: '2 pts below target',
                tone: 'negative',
            },
            {
                id: 'integrations',
                label: 'Integrations Enabled',
                value: '412',
                helper: '+24 new installs',
                tone: 'positive',
            },
        ],
        callout: {
            headline: 'Onboarding drop-off happens on the permissions step.',
            detail: 'Consider simplifying the service-account handoff for admins.',
            tone: 'negative',
        },
    },
    churn: {
        label: 'Churn',
        summary:
            'Cancellation cues remain low but seat contractions surfaced in two key accounts.',
        metrics: [
            {
                id: 'logo-churn',
                label: 'Logo Churn',
                value: '0.6%',
                helper: '-0.2 pts vs trendline',
                tone: 'positive',
            },
            {
                id: 'seat-change',
                label: 'Seat Contractions',
                value: '42',
                helper: '+9 seats week-over-week',
                tone: 'negative',
            },
            {
                id: 'renewals',
                label: 'Renewals This Month',
                value: '17',
                helper: '12 signed / 5 in redline',
                tone: 'neutral',
            },
        ],
        callout: {
            headline: 'Schedule an executive QBR with Lumen Finance.',
            detail: 'They reduced 35 seats after a security review flagged SSO gaps.',
            tone: 'negative',
        },
    },
};

const RECENT_ACTIVITY: TimelineEntry[] = [
    {
        id: 'activity-1',
        title: 'Automation beta rolled out to Aurora',
        timestamp: 'Today · 09:40',
        description: 'Usage spiked 31% within the first hour of rollout.',
        tone: 'positive',
    },
    {
        id: 'activity-2',
        title: 'Invoice #3488 sent to Northwind',
        timestamp: 'Today · 08:10',
        description: 'Auto-collected via Stripe sync, awaiting receipt.',
        tone: 'neutral',
    },
    {
        id: 'activity-3',
        title: 'Security review requested by Lumen',
        timestamp: 'Yesterday · 18:22',
        description:
            'Customer success looped in legal + security for follow-up.',
        tone: 'negative',
    },
    {
        id: 'activity-4',
        title: 'New workspace: Harper & Co.',
        timestamp: 'Yesterday · 14:05',
        description: 'Created via self-serve plan with 18 invited teammates.',
        tone: 'positive',
    },
];

const UPCOMING_MILESTONES: MilestoneEntry[] = [
    {
        id: 'milestone-1',
        targetDate: 'Nov 14',
        name: 'Automation analytics GA',
        description: 'Finalize documentation and publish to help center.',
        owner: 'Product Marketing',
        tone: 'positive',
    },
    {
        id: 'milestone-2',
        targetDate: 'Nov 19',
        name: 'SOC 2 Type II audit close',
        description: 'External auditors in final fieldwork review.',
        owner: 'Security',
        tone: 'neutral',
    },
    {
        id: 'milestone-3',
        targetDate: 'Nov 27',
        name: 'Usage-based billing pilot',
        description: 'Enable meter tracking for 4 beta accounts.',
        owner: 'Billing',
        tone: 'positive',
    },
];

const TIMELINE_INDICATOR_CLASSES: Record<TrendTone, string> = {
    positive: 'bg-success',
    negative: 'bg-error',
    neutral: 'bg-info',
};

export default function Dashboard() {
    const { user } = useAuthenticatedContext();
    const [activeUsageTab, setActiveUsageTab] = useState<UsageViewKey>('usage');
    const usageKeys = Object.keys(USAGE_VIEWS) as UsageViewKey[];
    const activeUsageView = USAGE_VIEWS[activeUsageTab];

    return (
        <>
            <title>Dashboard | Iridium</title>
            <meta
                name="description"
                content="Overview of your Iridium account and activity."
            />
            <Container className="space-y-10 px-4 pb-16 pt-12">
                <header className="space-y-3">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Good to see you, {user?.name || user?.email}
                    </h1>
                    <p className="max-w-2xl text-base text-base-content/70">
                        A quick snapshot of revenue, adoption, and account
                        health to guide today&apos;s follow-ups.
                    </p>
                </header>

                <section>
                    <StatsContainer>
                        {KPI_CARDS.map((kpi) => (
                            <StatsBox key={kpi.id}>
                                <div className="stat-figure text-primary">
                                    {kpi.icon}
                                </div>
                                <div className="stat-title">{kpi.label}</div>
                                <div className="stat-value">{kpi.value}</div>
                                <div className="stat-desc flex items-center gap-2">
                                    <Badge
                                        variant="soft"
                                        color={
                                            TREND_BADGE_COLORS[kpi.trendTone]
                                        }
                                        className="font-medium"
                                    >
                                        {kpi.trendLabel}
                                    </Badge>
                                    <span>{kpi.helper}</span>
                                </div>
                            </StatsBox>
                        ))}
                    </StatsContainer>
                </section>
                <section className="grid gap-6 xl:grid-cols-3">
                    <Card
                        title="Top Customers"
                        variant="border"
                        className="bg-base-100 xl:col-span-2 overflow-hidden"
                    >
                        <p className="flex-none text-sm text-base-content/70">
                            Largest accounts ranked by current MRR and seat
                            utilization.
                        </p>
                        <div className="mt-4">
                            <Table zebra scrollable>
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>
                                            Company
                                        </TableHeaderCell>
                                        <TableHeaderCell>Owner</TableHeaderCell>
                                        <TableHeaderCell>Plan</TableHeaderCell>
                                        <TableHeaderCell>Seats</TableHeaderCell>
                                        <TableHeaderCell className="text-right">
                                            MRR
                                        </TableHeaderCell>
                                        <TableHeaderCell>
                                            Status
                                        </TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {TOP_CUSTOMERS.map((customer) => (
                                        <TableRow key={customer.id} hover>
                                            <TableCell className="font-medium">
                                                {customer.company}
                                            </TableCell>
                                            <TableCell>
                                                {customer.owner}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="soft"
                                                    color="primary"
                                                >
                                                    {customer.plan}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {customer.seats}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {customer.mrr}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="soft"
                                                    color={
                                                        TREND_BADGE_COLORS[
                                                            customer.healthTone
                                                        ]
                                                    }
                                                >
                                                    {customer.health}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                    <Card
                        title="Product Pulse"
                        variant="border"
                        className="bg-base-100 overflow-hidden"
                    >
                        <Tabs variant="border">
                            {usageKeys.map((key) => {
                                const view = USAGE_VIEWS[key];
                                return (
                                    <Tab
                                        key={key}
                                        active={key === activeUsageTab}
                                        onClick={() => setActiveUsageTab(key)}
                                    >
                                        {view.label}
                                    </Tab>
                                );
                            })}
                        </Tabs>
                        <TabContent className="mt-4 space-y-4">
                            <p className="text-sm text-base-content/70">
                                {activeUsageView.summary}
                            </p>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {activeUsageView.metrics.map((metric) => (
                                    <div
                                        key={metric.id}
                                        className="rounded-box bg-base-200/40 p-4"
                                    >
                                        <p className="text-xs uppercase tracking-wide text-base-content/60">
                                            {metric.label}
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-base-content">
                                            {metric.value}
                                        </p>
                                        <p className="mt-1 text-sm text-base-content/70">
                                            {metric.helper}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="rounded-box border border-dashed border-base-300 p-4">
                                <div className="flex items-center gap-3">
                                    <Badge
                                        variant="soft"
                                        color={
                                            TREND_BADGE_COLORS[
                                                activeUsageView.callout.tone
                                            ]
                                        }
                                    >
                                        {activeUsageView.callout.tone ===
                                        'positive'
                                            ? 'Opportunity'
                                            : activeUsageView.callout.tone ===
                                                'negative'
                                              ? 'Attention'
                                              : 'Observation'}
                                    </Badge>
                                    <p className="font-medium text-base-content">
                                        {activeUsageView.callout.headline}
                                    </p>
                                </div>
                                <p className="mt-2 text-sm text-base-content/70">
                                    {activeUsageView.callout.detail}
                                </p>
                            </div>
                            {/* Mock chart area so the card has visible content in demos */}
                            <div className="mt-4 rounded-box bg-base-200 p-4">
                                <p className="mb-2 text-sm text-base-content/70">
                                    Trend (mock)
                                </p>
                                <div className="flex items-end gap-2 h-28">
                                    <div
                                        className="w-6 rounded bg-primary"
                                        style={{ height: '24%' }}
                                    />
                                    <div
                                        className="w-6 rounded bg-primary/90"
                                        style={{ height: '46%' }}
                                    />
                                    <div
                                        className="w-6 rounded bg-primary/80"
                                        style={{ height: '58%' }}
                                    />
                                    <div
                                        className="w-6 rounded bg-primary/70"
                                        style={{ height: '36%' }}
                                    />
                                    <div
                                        className="w-6 rounded bg-primary/60"
                                        style={{ height: '72%' }}
                                    />
                                    <div
                                        className="w-6 rounded bg-primary/50"
                                        style={{ height: '52%' }}
                                    />
                                    <div
                                        className="w-6 rounded bg-primary/40"
                                        style={{ height: '84%' }}
                                    />
                                </div>
                            </div>
                        </TabContent>
                    </Card>
                </section>
                <section className="grid gap-6 lg:grid-cols-2">
                    <Card
                        title="Recent Activity"
                        variant="border"
                        className="bg-base-100 overflow-hidden"
                    >
                        <div className="mt-2">
                            <Timeline direction="vertical" snapIcon>
                                {RECENT_ACTIVITY.map((entry, index) => (
                                    <TimelineItem
                                        key={entry.id}
                                        start={
                                            <span className="text-sm font-medium text-base-content/70">
                                                {entry.timestamp}
                                            </span>
                                        }
                                        middle={
                                            <span
                                                className={`inline-flex h-3 w-3 rounded-full ${TIMELINE_INDICATOR_CLASSES[entry.tone]}`}
                                            />
                                        }
                                        end={
                                            <div className="space-y-1">
                                                <p className="font-medium text-base-content">
                                                    {entry.title}
                                                </p>
                                                <p className="text-sm text-base-content/70">
                                                    {entry.description}
                                                </p>
                                            </div>
                                        }
                                        boxEnd
                                        lineBefore={index !== 0}
                                        lineAfter={
                                            index !== RECENT_ACTIVITY.length - 1
                                        }
                                    />
                                ))}
                            </Timeline>
                        </div>
                    </Card>
                    <Card
                        title="Upcoming Milestones"
                        variant="border"
                        className="bg-base-100"
                    >
                        <div className="mt-2 overflow-x-scroll">
                            <Timeline
                                direction="vertical"
                                className="lg:timeline-horizontal"
                            >
                                {UPCOMING_MILESTONES.map((milestone, index) => (
                                    <TimelineItem
                                        key={milestone.id}
                                        start={
                                            <span className="text-sm font-semibold text-base-content">
                                                {milestone.targetDate}
                                            </span>
                                        }
                                        middle={
                                            <span
                                                className={`inline-flex h-3 w-3 rounded-full ${TIMELINE_INDICATOR_CLASSES[milestone.tone]}`}
                                            />
                                        }
                                        end={
                                            <div className="space-y-1">
                                                <p className="font-medium text-base-content">
                                                    {milestone.name}
                                                </p>
                                                <p className="text-sm text-base-content/70">
                                                    {milestone.description}
                                                </p>
                                                <Badge
                                                    variant="soft"
                                                    color="secondary"
                                                >
                                                    {milestone.owner}
                                                </Badge>
                                            </div>
                                        }
                                        boxEnd
                                        lineBefore={index !== 0}
                                        lineAfter={
                                            index !==
                                            UPCOMING_MILESTONES.length - 1
                                        }
                                    />
                                ))}
                            </Timeline>
                        </div>
                    </Card>
                </section>
            </Container>
        </>
    );
}
