import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';
import type { ReactNode } from 'react';

export const hoverCardVariants = cva({
    base: 'hover-3d',
    variants: {
        size: {
            xs: 'max-w-xs',
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

interface HoverCardProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
        VariantProps<typeof hoverCardVariants> {
    /**
     * The content to display with 3D hover effect.
     * IMPORTANT: Only use non-interactive content (images, cards, etc.)
     * Do not place buttons, links, or other interactive elements inside.
     */
    children: ReactNode;
    /**
     * Optional href to make the entire card clickable.
     * When provided, wraps the component in an anchor tag.
     */
    href?: string;
}

/**
 * HoverCard creates a 3D tilt effect that responds to mouse movement.
 *
 * The component uses 8 invisible hover zones to detect mouse position
 * and apply smooth rotation effects to create an interactive 3D experience.
 *
 * @example
 * // Basic usage with image
 * <HoverCard>
 *   <figure className="rounded-box">
 *     <img src="/image.jpg" alt="Description" />
 *   </figure>
 * </HoverCard>
 *
 * @example
 * // Clickable card
 * <HoverCard href="/destination">
 *   <Card title="Click me">Content</Card>
 * </HoverCard>
 *
 * @example
 * // Custom size
 * <HoverCard size="lg">
 *   <img src="/image.jpg" alt="Large card" />
 * </HoverCard>
 */
export function HoverCard({
    children,
    href,
    size,
    className,
    ...props
}: HoverCardProps) {
    const cardContent = (
        <div
            className={cx(hoverCardVariants({ size }), className)}
            {...props}
        >
            {children}
            {/* 8 empty divs required for hover detection zones */}
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
        </div>
    );

    // Wrap in anchor tag if href is provided
    if (href) {
        return <a href={href}>{cardContent}</a>;
    }

    return cardContent;
}
