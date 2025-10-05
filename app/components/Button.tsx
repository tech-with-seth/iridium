import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const buttonVariants = cva({
    base: 'btn',
    variants: {
        variant: {
            outline: 'btn-outline',
            dash: 'btn-dash',
            soft: 'btn-soft',
            ghost: 'btn-ghost',
            link: 'btn-link'
        },
        status: {
            neutral: 'btn-neutral',
            primary: 'btn-primary',
            secondary: 'btn-secondary',
            accent: 'btn-accent',
            info: 'btn-info',
            success: 'btn-success',
            warning: 'btn-warning',
            error: 'btn-error'
        },
        size: {
            sm: 'btn-sm',
            md: 'btn-md',
            lg: 'btn-lg',
            xl: 'btn-xl'
        },
        active: {
            true: 'btn-active'
        },
        disabled: {
            true: 'btn-disabled'
        },
        wide: {
            true: 'btn-wide'
        },
        block: {
            true: 'btn-block'
        },
        circle: { true: 'btn-circle' },
        square: { true: 'btn-square' }
    },
    defaultVariants: {
        size: 'md'
    },
    compoundVariants: []
});

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    loading?: boolean;
}

export function Button({
    active,
    block,
    children,
    circle,
    className,
    disabled,
    loading,
    size,
    square,
    status,
    type = 'button',
    variant,
    wide,
    ...props
}: ButtonProps) {
    const resolvedDisabled = Boolean(disabled || loading);

    return (
        <button
            type={type}
            disabled={resolvedDisabled}
            className={cx(
                buttonVariants({
                    active,
                    block,
                    circle,
                    disabled: resolvedDisabled,
                    size,
                    square,
                    status,
                    variant,
                    wide
                }),
                className
            )}
            {...props}
        >
            {loading ? (
                <span className="loading loading-spinner loading-md"></span>
            ) : (
                children
            )}
        </button>
    );
}
