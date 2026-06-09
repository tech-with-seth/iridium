import { cx } from 'cva.config';

export function Skeleton({ className }: { className?: string }) {
    return <div className={cx('skeleton', className)} />;
}

export function SkeletonLines({
    count = 3,
    className,
}: {
    count?: number;
    className?: string;
}) {
    return (
        <div
            aria-hidden="true"
            className={cx('flex flex-col gap-2', className)}
        >
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="skeleton h-4 w-full" />
            ))}
        </div>
    );
}
