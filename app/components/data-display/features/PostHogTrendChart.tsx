import { AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleLinear, scaleTime } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { useMemo } from 'react';

import { cx } from '~/cva.config';

interface TrendPoint {
    date: string;
    events: number;
    pageviews: number;
}

interface PostHogTrendChartProps {
    points: TrendPoint[];
    height?: number;
    className?: string;
}

const defaultMargin = { top: 12, right: 16, bottom: 28, left: 52 };

function parseISODateToLocalMidnight(isoDate: string): Date {
    const [year, month, day] = isoDate.split('-').map((part) => Number(part));
    if (
        !Number.isFinite(year) ||
        !Number.isFinite(month) ||
        !Number.isFinite(day)
    ) {
        return new Date(Number.NaN);
    }
    return new Date(year, month - 1, day);
}

function formatMonthDay(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
    }).format(date);
}

function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}

export function PostHogTrendChart({
    points,
    height = 220,
    className,
}: PostHogTrendChartProps) {
    return (
        <div className={cx('w-full', className)}>
            <ParentSize>
                {({ width }) => (
                    <PostHogTrendChartInner
                        width={width}
                        height={height}
                        points={points}
                    />
                )}
            </ParentSize>
        </div>
    );
}

function PostHogTrendChartInner({
    width,
    height,
    points,
}: {
    width: number;
    height: number;
    points: TrendPoint[];
}) {
    const parsedPoints = useMemo(() => {
        return points
            .map((p) => ({
                ...p,
                dateValue: parseISODateToLocalMidnight(p.date),
            }))
            .filter((p) => !Number.isNaN(p.dateValue.getTime()));
    }, [points]);

    if (width <= 0 || parsedPoints.length === 0) {
        return null;
    }

    const xMax = width - defaultMargin.left - defaultMargin.right;
    const yMax = height - defaultMargin.top - defaultMargin.bottom;

    const numXTicks =
        parsedPoints.length <= 1
            ? 1
            : Math.max(2, Math.min(6, Math.floor(width / 140)));
    const numYTicks = 5;

    const minX = Math.min(...parsedPoints.map((p) => p.dateValue.getTime()));
    const maxX = Math.max(...parsedPoints.map((p) => p.dateValue.getTime()));
    const domainX =
        minX === maxX
            ? ([
                  new Date(minX - 1000 * 60 * 60 * 24 * 15),
                  new Date(maxX + 1000 * 60 * 60 * 24 * 15),
              ] as [Date, Date])
            : ([new Date(minX), new Date(maxX)] as [Date, Date]);

    const maxY = Math.max(
        0,
        ...parsedPoints.map((p) => Math.max(p.events, p.pageviews)),
    );
    const paddedMaxY =
        maxY === 0 ? 1 : maxY + Math.max(1, Math.round(maxY * 0.1));

    const xScale = scaleTime<number>({
        domain: domainX,
        range: [0, xMax],
    });

    const yScale = scaleLinear<number>({
        domain: [0, paddedMaxY],
        nice: true,
        range: [yMax, 0],
    });

    const xTicks = xScale.ticks(numXTicks);
    const rotateXLabels = parsedPoints.length > 2;

    const axisColor = 'var(--color-base-content)';
    const eventsColor = 'var(--color-primary)';
    const pageviewsColor = 'var(--color-accent)';
    const gridColor = axisColor;
    const plotBg = 'var(--color-base-200)';
    const plotBgRing = 'var(--color-base-300)';
    const contrastStroke = axisColor;

    return (
        <svg width={width} height={height} role="img">
            <Group left={defaultMargin.left} top={defaultMargin.top}>
                <defs>
                    <clipPath id="posthog-trend-clip">
                        <rect width={xMax} height={yMax} />
                    </clipPath>
                </defs>

                <rect
                    x={0}
                    y={0}
                    width={xMax}
                    height={yMax}
                    rx={8}
                    fill={plotBg}
                    stroke={plotBgRing}
                    strokeWidth={1}
                />

                {yScale.ticks(numYTicks).map((tick) => (
                    <line
                        key={`grid-${tick}`}
                        x1={0}
                        x2={xMax}
                        y1={yScale(tick)}
                        y2={yScale(tick)}
                        stroke={gridColor}
                        strokeOpacity={0.12}
                        strokeWidth={1}
                    />
                ))}

                <AxisLeft
                    scale={yScale}
                    tickFormat={(v) => formatCompactNumber(Number(v))}
                    numTicks={numYTicks}
                    stroke={axisColor}
                    tickStroke={axisColor}
                    tickLabelProps={() => ({
                        fill: axisColor,
                        fontSize: 11,
                        textAnchor: 'end',
                        dx: '-0.25em',
                        dy: '0.25em',
                        opacity: 0.65,
                    })}
                />
                <line
                    x1={0}
                    x2={xMax}
                    y1={yMax}
                    y2={yMax}
                    stroke={axisColor}
                    strokeWidth={1}
                />
                {xTicks.map((tick) => {
                    const x = xScale(tick) ?? 0;
                    return (
                        <g
                            key={`x-tick-${tick.toISOString()}`}
                            transform={`translate(${x}, ${yMax})`}
                        >
                            <line
                                x1={0}
                                x2={0}
                                y1={0}
                                y2={6}
                                stroke={axisColor}
                                strokeWidth={1}
                            />
                            <text
                                fill={axisColor}
                                fontSize={11}
                                opacity={0.65}
                                textAnchor={rotateXLabels ? 'end' : 'middle'}
                                transform={rotateXLabels ? 'rotate(-35)' : undefined}
                                dx={rotateXLabels ? '-0.2em' : undefined}
                                dy={rotateXLabels ? '1.1em' : '1.25em'}
                            >
                                {formatMonthDay(tick)}
                            </text>
                        </g>
                    );
                })}

                <Group clipPath="url(#posthog-trend-clip)">
                    {/* Events line - solid */}
                    <LinePath
                        data={parsedPoints}
                        x={(d) => xScale(d.dateValue) ?? 0}
                        y={(d) => yScale(d.events) ?? 0}
                        curve={curveMonotoneX}
                        stroke={contrastStroke}
                        strokeOpacity={0.25}
                        strokeWidth={5}
                    />
                    <LinePath
                        data={parsedPoints}
                        x={(d) => xScale(d.dateValue) ?? 0}
                        y={(d) => yScale(d.events) ?? 0}
                        curve={curveMonotoneX}
                        stroke={eventsColor}
                        strokeWidth={2}
                    />

                    {/* Pageviews line - dashed */}
                    <LinePath
                        data={parsedPoints}
                        x={(d) => xScale(d.dateValue) ?? 0}
                        y={(d) => yScale(d.pageviews) ?? 0}
                        curve={curveMonotoneX}
                        stroke={contrastStroke}
                        strokeOpacity={0.25}
                        strokeWidth={5}
                        strokeDasharray="6 4"
                    />
                    <LinePath
                        data={parsedPoints}
                        x={(d) => xScale(d.dateValue) ?? 0}
                        y={(d) => yScale(d.pageviews) ?? 0}
                        curve={curveMonotoneX}
                        stroke={pageviewsColor}
                        strokeWidth={2}
                        strokeDasharray="6 4"
                    />

                    {/* Events dots */}
                    {parsedPoints.map((p) => (
                        <g
                            key={`dot-events-${p.date}`}
                            transform={`translate(${xScale(p.dateValue) ?? 0}, ${yScale(p.events) ?? 0})`}
                        >
                            <circle r={4} fill={eventsColor} />
                            <circle r={2} fill="var(--color-base-100)" />
                        </g>
                    ))}

                    {/* Pageviews dots */}
                    {parsedPoints.map((p) => (
                        <g
                            key={`dot-pageviews-${p.date}`}
                            transform={`translate(${xScale(p.dateValue) ?? 0}, ${yScale(p.pageviews) ?? 0})`}
                        >
                            <circle r={4} fill={pageviewsColor} />
                            <circle r={2} fill="var(--color-base-100)" />
                        </g>
                    ))}
                </Group>
            </Group>
        </svg>
    );
}
