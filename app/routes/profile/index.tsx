import { Link } from 'react-router';
import { Avatar } from '~/components/Avatar';
import { Badge } from '~/components/Badge';
import { buttonVariants } from '~/components/Button';
import { Card } from '~/components/Card';
import { Container } from '~/components/Container';
import { cx } from '~/cva.config';
import { Paths } from '~/constants';
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';

type UserWithRole = {
    role?: string | null;
};

const formatDate = (value?: Date | string | null) => {
    if (!value) {
        return '—';
    }

    const dateValue =
        value instanceof Date ? value : new Date(value ?? undefined);

    if (Number.isNaN(dateValue.getTime())) {
        return '—';
    }

    return dateValue.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatRole = (value?: string | null) => {
    if (!value) {
        return 'Member';
    }

    return value
        .split(/[_\s]/)
        .filter(Boolean)
        .map(
            (segment) =>
                segment.charAt(0).toUpperCase() +
                segment.slice(1).toLowerCase(),
        )
        .join(' ');
};

const getInitials = (value: string) => {
    const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);

    if (parts.length === 0) {
        return value.slice(0, 2).toUpperCase();
    }

    return parts.map((segment) => segment.charAt(0).toUpperCase()).join('');
};

export default function ProfileRoute() {
    const { user } = useAuthenticatedContext();
    const joinedDate = formatDate(user?.createdAt);
    const displayName = user?.name || 'Your profile';
    const initials = getInitials(user?.name || user?.email || 'You');
    const editPath = `${Paths.PROFILE}${Paths.PROFILE_EDIT}`;
    const userRole = (user as UserWithRole | undefined)?.role ?? null;
    const resolvedRoleLabel = formatRole(userRole);

    const completedFields = [
        Boolean(user?.name),
        Boolean(user?.image),
        Boolean(user?.email),
    ].filter(Boolean).length;
    const completionPercentage = Math.round((completedFields / 3) * 100);
    const missingFields: string[] = [];

    if (!user?.name) {
        missingFields.push('name');
    }

    if (!user?.image) {
        missingFields.push('photo');
    }

    const completionMessage =
        missingFields.length === 0
            ? 'Everything looks up to date.'
            : `Add your ${missingFields.join(' and ')} to complete your profile.`;

    const profileDetails = [
        {
            label: 'Full name',
            value: user?.name ?? 'Add your name',
        },
        {
            label: 'Email address',
            value: user?.email ?? 'Not set',
        },
        {
            label: 'Member since',
            value: joinedDate,
        },
        {
            label: 'Account ID',
            value: user?.id ?? '—',
        },
    ];

    return (
        <Container className="space-y-8 px-4 pb-8">
            <title>Profile | Iridium</title>
            <meta
                name="description"
                content="Review and manage your Iridium profile."
            />

            <Card className="border border-base-200 bg-base-100/80 shadow-xl shadow-base-300/50 ring-1 ring-base-200/50">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 items-center gap-4">
                        <Avatar
                            src={user?.image ?? undefined}
                            alt={displayName}
                            size="w-20 h-20"
                            shape="circle"
                            placeholder={!user?.image}
                            className="ring ring-primary/20 ring-offset-2 ring-offset-base-100"
                        >
                            <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/20 text-xl font-semibold uppercase text-primary">
                                {initials}
                            </span>
                        </Avatar>
                        <div className="space-y-1">
                            <p className="text-sm uppercase tracking-wide text-base-content/50">
                                Account
                            </p>
                            <p className="text-2xl font-semibold tracking-tight text-base-content">
                                {displayName}
                            </p>
                            <p className="text-base-content/70">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge
                            variant="soft"
                            color="success"
                            className="uppercase tracking-wide"
                        >
                            Active member
                        </Badge>
                        <Link
                            to={editPath}
                            className={cx(
                                buttonVariants({
                                    status: 'primary',
                                }),
                                'no-underline',
                            )}
                        >
                            Edit profile
                        </Link>
                    </div>
                </div>
                <p className="text-sm text-base-content/70">
                    Keep your core details polished so billing, notifications,
                    and collaboration stay effortless.
                </p>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card
                    title="Profile details"
                    className="border border-base-200 bg-base-100/80 shadow-lg"
                >
                    <div className="grid gap-4">
                        {profileDetails.map((detail) => (
                            <div
                                key={detail.label}
                                className="rounded-xl border border-base-200/70 p-4"
                            >
                                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                                    {detail.label}
                                </p>
                                <p className="mt-1 text-base font-medium text-base-content">
                                    {detail.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card
                    title="Profile health"
                    className="border border-base-200 bg-base-100/70 shadow-lg"
                >
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-base-content">
                                        Profile completeness
                                    </p>
                                    <p className="text-sm text-base-content/70">
                                        {completionMessage}
                                    </p>
                                </div>
                                <span className="text-3xl font-semibold text-base-content">
                                    {completionPercentage}%
                                </span>
                            </div>
                            <progress
                                className="progress progress-primary w-full"
                                value={completionPercentage}
                                max={100}
                                aria-label="Profile completeness"
                            />
                        </div>

                        <div className="rounded-xl bg-base-200/70 px-4 py-4 text-sm text-base-content/80">
                            <p className="font-semibold text-base-content">
                                Current role
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge variant="soft" color="primary">
                                    {resolvedRoleLabel}
                                </Badge>
                                <span className="text-base-content/70">
                                    Access is aligned with workspace standards.
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </Container>
    );
}
