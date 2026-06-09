import type { LucideIcon } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { cx } from 'cva.config';

type Props = {
    icon?: LucideIcon;
    title: string;
    description?: string;
    className?: string;
};

export function EmptyState({
    icon: Icon,
    title,
    description,
    className,
    children,
}: PropsWithChildren<Props>) {
    return (
        <div
            className={cx(
                'flex flex-col items-center justify-center gap-2 p-8 text-center',
                className,
            )}
        >
            {Icon && (
                <Icon
                    aria-hidden="true"
                    className="text-base-content/40 h-10 w-10"
                />
            )}
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
                <p className="text-base-content/60 text-sm">{description}</p>
            )}
            {children}
        </div>
    );
}
