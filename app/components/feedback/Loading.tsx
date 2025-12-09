import type { VariantProps } from 'cva';
import type { PropsWithChildren } from 'react';
import { cva, cx } from '~/cva.config';

export const loadingVariants = cva({
    base: 'loading',
    variants: {
        variant: {
            ball: 'loading-ball',
            bars: 'loading-bars',
            dots: 'loading-dots',
            infinity: 'loading-infinity',
            ring: 'loading-ring',
            spinner: 'loading-spinner',
        },
        status: {
            primary: 'text-primary',
            secondary: 'text-secondary',
            accent: 'text-accent',
            info: 'text-info',
            neutral: 'text-neutral',
            success: 'text-success',
            warning: 'text-warning',
            error: 'text-error',
        },
        size: {
            xs: 'loading-xs',
            sm: 'loading-sm',
            md: 'loading-md',
            lg: 'loading-lg',
            xl: 'loading-xl',
        },
    },
    defaultVariants: {
        size: 'md',
        variant: 'spinner',
        status: 'primary',
    },
});

interface SpinnerProps extends VariantProps<typeof loadingVariants> {
    className?: string;
}

export function Loading({
    className,
    size = 'md',
}: PropsWithChildren<SpinnerProps>) {
    return <span className={cx(loadingVariants({ size }), className)}></span>;
}
