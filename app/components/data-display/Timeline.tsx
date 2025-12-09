import type { VariantProps } from 'cva';
import { cva, cx } from '~/cva.config';
import type { ReactNode } from 'react';

export const timelineVariants = cva({
    base: 'timeline',
    variants: {
        direction: {
            vertical: 'timeline-vertical',
            horizontal: 'timeline-horizontal',
        },
        snapIcon: {
            true: 'timeline-snap-icon',
        },
        compact: {
            true: 'timeline-compact',
        },
    },
    defaultVariants: {
        direction: 'horizontal',
    },
});

interface TimelineProps
    extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'>,
        VariantProps<typeof timelineVariants> {
    /**
     * Timeline items (TimelineItem components)
     */
    children: ReactNode;
}

/**
 * Timeline displays chronological events in a connected visual format.
 * Supports both horizontal and vertical layouts with flexible content positioning.
 *
 * @example
 * // Basic horizontal timeline
 * <Timeline>
 *   <TimelineItem
 *     start="1984"
 *     middle={<Icon />}
 *     end="First Apple Macintosh"
 *     boxEnd
 *   />
 * </Timeline>
 *
 * @example
 * // Vertical timeline with snapped icons
 * <Timeline direction="vertical" snapIcon>
 *   <TimelineItem middle={<Icon />} end="Event description" boxEnd />
 * </Timeline>
 *
 * @example
 * // Responsive timeline
 * <Timeline direction="vertical" className="lg:timeline-horizontal">
 *   {items}
 * </Timeline>
 */
export function Timeline({
    direction,
    snapIcon,
    compact,
    className,
    children,
    ...props
}: TimelineProps) {
    return (
        <ul
            className={cx(
                timelineVariants({ direction, snapIcon, compact }),
                className,
            )}
            {...props}
        >
            {children}
        </ul>
    );
}

interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {
    /**
     * Content positioned at the start (left/top) of the timeline
     */
    start?: ReactNode;
    /**
     * Content positioned in the middle (typically icons/markers)
     */
    middle?: ReactNode;
    /**
     * Content positioned at the end (right/bottom) of the timeline
     */
    end?: ReactNode;
    /**
     * Apply timeline-box styling (card-like appearance) to start content
     */
    boxStart?: boolean;
    /**
     * Apply timeline-box styling (card-like appearance) to end content
     */
    boxEnd?: boolean;
    /**
     * Whether to show the connecting line (hr element) before content
     * @default false
     */
    lineBefore?: boolean;
    /**
     * Whether to show the connecting line (hr element) after content
     * @default true
     */
    lineAfter?: boolean;
}

/**
 * TimelineItem represents a single event/milestone in the Timeline.
 * Can contain content at start, middle, and/or end positions.
 *
 * @example
 * // Item with all sections
 * <TimelineItem
 *   start="2020"
 *   middle={<svg>...</svg>}
 *   end="Product launch"
 *   boxEnd
 * />
 *
 * @example
 * // Item with only middle and end
 * <TimelineItem
 *   middle={<CheckIcon />}
 *   end={<div>Completed task</div>}
 *   boxEnd
 * />
 */
export function TimelineItem({
    start,
    middle,
    end,
    boxStart = false,
    boxEnd = false,
    lineBefore = false,
    lineAfter = true,
    className,
    ...props
}: TimelineItemProps) {
    return (
        <li className={className} {...props}>
            {lineBefore && <hr />}
            {start && (
                <div className={cx('timeline-start', boxStart && 'timeline-box')}>
                    {start}
                </div>
            )}
            {middle && <div className="timeline-middle">{middle}</div>}
            {end && (
                <div className={cx('timeline-end', boxEnd && 'timeline-box')}>
                    {end}
                </div>
            )}
            {lineAfter && <hr />}
        </li>
    );
}
