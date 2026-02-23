import type { VariantProps } from 'cva';
import { cva, cx } from 'cva.config';
import type { PropsWithChildren } from 'react';

export const cardVariants = cva({
    base: 'card',
    variants: {
        variant: {
            darken: 'bg-base-100',
            darker: 'bg-base-200',
            darkest: 'bg-base-300',
        },
        bordererd: {
            true: 'card-border',
        },
    },
    defaultVariants: {
        variant: 'darker',
    },
    compoundVariants: [],
});

interface CardProps extends VariantProps<typeof cardVariants> {
    className?: string;
    title?: string;
}

export function Card({
    bordererd,
    title,
    children,
    className,
    variant,
}: PropsWithChildren<CardProps>) {
    return (
        <div className={cx(cardVariants({ bordererd, variant, className }))}>
            <div className="card-body">
                {title && <h2 className="card-title">{title}</h2>}
                {children}
            </div>
        </div>
    );
}
