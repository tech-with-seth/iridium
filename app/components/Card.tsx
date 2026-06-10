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
        bordered: {
            true: 'card-border',
        },
    },
    defaultVariants: {
        variant: 'darker',
    },
    compoundVariants: [],
});

type Props = VariantProps<typeof cardVariants> & {
    className?: string;
    title?: string;
};

export function Card({
    bordered,
    title,
    children,
    className,
    variant,
}: PropsWithChildren<Props>) {
    return (
        <div className={cx(cardVariants({ bordered, variant, className }))}>
            <div className="card-body min-h-0">
                {title && <h2 className="card-title">{title}</h2>}
                {children}
            </div>
        </div>
    );
}
