import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';
import type { ReactNode } from 'react';

export const cardVariants = cva({
    base: 'card',
    variants: {
        variant: {
            border: 'card-border',
            dash: 'card-dash',
        },
        size: {
            xs: 'card-xs',
            sm: 'card-sm',
            md: 'card-md',
            lg: 'card-lg',
            xl: 'card-xl',
        },
        side: {
            true: 'card-side',
        },
        imageFull: {
            true: 'image-full',
        },
    },
    defaultVariants: {
        size: 'md',
    },
    compoundVariants: [],
});

interface CardProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
        VariantProps<typeof cardVariants> {
    title?: ReactNode;
    actions?: ReactNode;
    image?: {
        src: string;
        alt: string;
        position?: 'top' | 'bottom';
    };
}

export function Card({
    children,
    title,
    actions,
    image,
    size,
    variant,
    side,
    imageFull,
    className,
    ...props
}: CardProps) {
    const imageAtBottom = image?.position === 'bottom';

    return (
        <div
            className={cx(
                cardVariants({
                    size,
                    variant,
                    side,
                    imageFull,
                }),
                className,
            )}
            {...props}
        >
            {image && !imageAtBottom && (
                <figure>
                    <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-auto object-cover"
                    />
                </figure>
            )}

            <div className="card-body">
                {title && <h2 className="card-title">{title}</h2>}
                {children}
                {actions && (
                    <div className="card-actions justify-end">{actions}</div>
                )}
            </div>

            {image && imageAtBottom && (
                <figure>
                    <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-auto object-cover"
                    />
                </figure>
            )}
        </div>
    );
}
