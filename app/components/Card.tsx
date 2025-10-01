import { cn } from '~/lib/utils';
import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    title?: string;
    actions?: ReactNode;
    image?: {
        src: string;
        alt: string;
        position?: 'top' | 'bottom';
    };
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    style?: 'border' | 'dash';
    modifier?: 'side' | 'image-full';
    width?: 'auto' | 'full' | 'fit';
    className?: string;
}

export function Card({
    children,
    title,
    actions,
    image,
    size = 'md',
    style,
    modifier,
    width = 'auto',
    className,
    ...rest
}: CardProps) {
    const widthClass = {
        auto: 'w-96',
        full: 'w-full',
        fit: 'w-fit'
    }[width];

    const imageAtBottom = image?.position === 'bottom';

    return (
        <div
            className={cn(
                'card bg-base-100',
                size !== 'md' && `card-${size}`,
                style && `card-${style}`,
                modifier && `card-${modifier}`,
                widthClass,
                className
            )}
            {...rest}
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
