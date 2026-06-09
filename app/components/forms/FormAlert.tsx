import { CircleXIcon } from 'lucide-react';
import { cx } from 'cva.config';

type Props = {
    message: string | null | undefined;
    className?: string;
};

export function FormAlert({ message, className }: Props) {
    if (!message) return null;

    return (
        <div role="alert" className={cx('alert alert-error', className)}>
            <CircleXIcon aria-hidden="true" className="h-6 w-6" />
            <span>{message}</span>
        </div>
    );
}
