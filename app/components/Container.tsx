import type { PropsWithChildren } from 'react';
import { cx } from '~/cva.config';

interface ContainerProps {
    className?: string;
}

export function Container({
    children,
    className,
}: PropsWithChildren<ContainerProps>) {
    return <div className={cx('container mx-auto', className)}>{children}</div>;
}
