import { CircleXIcon } from 'lucide-react';
import { cx } from 'cva.config';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
    message: string | null | undefined;
    className?: string;
}>;

export function FormAlert({ message, className, children }: Props) {
    if (!message) return null;

    return (
        <div role="alert" className={cx('alert alert-error', className)}>
            <CircleXIcon aria-hidden="true" className="h-6 w-6" />
            <span>{message}</span>
            {children}
        </div>
    );
}
