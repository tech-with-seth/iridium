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
        }
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
    children,
    className,
    loading,
    variant,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cx(buttonVariants({ variant }), className)}
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
