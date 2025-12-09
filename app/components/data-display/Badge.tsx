import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const badgeVariants = cva({
    base: 'badge',
    variants: {
        variant: {
            outline: 'badge-outline',
            dash: 'badge-dash',
            soft: 'badge-soft',
            ghost: 'badge-ghost',
        },
        color: {
            neutral: 'badge-neutral',
            primary: 'badge-primary',
            secondary: 'badge-secondary',
            accent: 'badge-accent',
            info: 'badge-info',
            success: 'badge-success',
            warning: 'badge-warning',
            error: 'badge-error',
        },
        size: {
            xs: 'badge-xs',
            sm: 'badge-sm',
            md: 'badge-md',
            lg: 'badge-lg',
            xl: 'badge-xl',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

interface BadgeProps
    extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
        VariantProps<typeof badgeVariants> {}

export function Badge({
    children,
    variant,
    color,
    size,
    className,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cx(
                badgeVariants({
                    variant,
                    color,
                    size,
                }),
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}
