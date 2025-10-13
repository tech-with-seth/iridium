import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';

export const tooltipVariants = cva({
    base: 'tooltip',
    variants: {
        position: {
            top: 'tooltip-top',
            bottom: 'tooltip-bottom',
            left: 'tooltip-left',
            right: 'tooltip-right'
        },
        color: {
            neutral: 'tooltip-neutral',
            primary: 'tooltip-primary',
            secondary: 'tooltip-secondary',
            accent: 'tooltip-accent',
            info: 'tooltip-info',
            success: 'tooltip-success',
            warning: 'tooltip-warning',
            error: 'tooltip-error'
        }
    },
    defaultVariants: {
        position: 'top'
    }
});

interface TooltipProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'>,
        VariantProps<typeof tooltipVariants> {
    /**
     * The tooltip text content (simple string-based tooltip)
     */
    tip?: string;
    /**
     * Whether to force the tooltip to be visible
     */
    open?: boolean;
    /**
     * Custom tooltip content as JSX (alternative to tip prop)
     * When provided, renders as tooltip-content div
     */
    content?: React.ReactNode;
    /**
     * The element that triggers the tooltip on hover
     */
    children: React.ReactNode;
}

/**
 * Tooltip component following DaisyUI patterns
 *
 * @example
 * // Simple text tooltip
 * <Tooltip tip="Hello world">
 *   <button className="btn">Hover me</button>
 * </Tooltip>
 *
 * @example
 * // Custom content tooltip
 * <Tooltip content={<div className="text-lg font-bold">Custom!</div>}>
 *   <button className="btn">Hover me</button>
 * </Tooltip>
 *
 * @example
 * // Positioned and colored tooltip
 * <Tooltip tip="Info" position="bottom" color="info" open>
 *   <button className="btn">Bottom tooltip</button>
 * </Tooltip>
 */
export function Tooltip({
    tip,
    content,
    open,
    position,
    color,
    className,
    children,
    ...props
}: TooltipProps) {
    return (
        <div
            className={cx(
                tooltipVariants({ position, color }),
                open && 'tooltip-open',
                className
            )}
            data-tip={tip}
            {...props}
        >
            {content && <div className="tooltip-content">{content}</div>}
            {children}
        </div>
    );
}
