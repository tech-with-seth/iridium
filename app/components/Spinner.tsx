import type { VariantProps } from 'cva';
import { cva, cx } from 'cva.config';

export const spinnerVariants = cva({
    base: 'loading loading-spinner',
    variants: {
        size: {
            xs: 'loading-xs',
            sm: 'loading-sm',
            md: 'loading-md',
            lg: 'loading-lg',
        },
    },
    defaultVariants: {
        size: 'sm',
    },
});

type Props = VariantProps<typeof spinnerVariants> & {
    /** Accessible status text; announce what is loading when it isn't obvious. */
    label?: string;
    className?: string;
};

export function Spinner({ label = 'Loading', size, className }: Props) {
    return (
        <span
            role="status"
            aria-label={label}
            className={cx(spinnerVariants({ size, className }))}
        />
    );
}
