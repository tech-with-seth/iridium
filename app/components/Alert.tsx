import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const alertVariants = cva({
    base: 'alert',
    variants: {
        variant: {
            outline: 'alert-outline',
            dash: 'alert-dash',
            soft: 'alert-soft',
        },
        status: {
            info: 'alert-info',
            success: 'alert-success',
            warning: 'alert-warning',
            error: 'alert-error',
        },
        direction: {
            vertical: 'alert-vertical',
            horizontal: 'alert-horizontal',
        },
    },
    defaultVariants: {
        direction: 'horizontal',
    },
    compoundVariants: [],
});

interface AlertProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof alertVariants> {
    icon?: React.ReactNode;
}

export function Alert({
    variant,
    status,
    direction,
    icon,
    className,
    children,
    ...props
}: AlertProps) {
    return (
        <div
            role="alert"
            className={cx(
                alertVariants({
                    variant,
                    status,
                    direction,
                }),
                className,
            )}
            {...props}
        >
            {icon && icon}
            {children}
        </div>
    );
}
