import type { PropsWithChildren } from 'react';
import { cn } from '~/lib/utils';

interface ContainerProps {
    className?: string;
}

export function Container({
    children,
    className
}: PropsWithChildren<ContainerProps>) {
    return <div className={cn('container mx-auto', className)}>{children}</div>;
}
