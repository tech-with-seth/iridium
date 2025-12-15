import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleLinear, scaleTime } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { useMemo } from 'react';

import type { RevenueTrendPoint } from '~/lib/chat-tools.types';
import { cx } from '~/cva.config';

interface RevenueTrendChartProps {
    points: RevenueTrendPoint[];
    height?: number;
    className?: string;
}

const defaultMargin = { top: 12, right: 16, bottom: 28, left: 52 };

function formatMonthDay(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
    }).format(date);
}

function formatCompactCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(amount);
}

export function RevenueTrendChart({
    points,
    height = 220,
    className,
}: RevenueTrendChartProps) {
    return (
        <div className={cx('w-full', className)}>
            <ParentSize>
                {({ width }) => (
                    <RevenueTrendChartInner
                        width={width}
                        height={height}
                        points={points}
                    />
                )}
            </ParentSize>
        </div>
    );
}

function RevenueTrendChartInner({
    width,
    height,
    points,
}: {
    width: number;
    height: number;
    points: RevenueTrendPoint[];
}) {
    const parsedPoints = useMemo(() => {
        return points
            .map((p) => ({
                ...p,
                dateValue: new Date(p.date),
                revenueDollars: p.revenue.dollars,
                netRevenueDollars: p.netRevenue.dollars,
            }))
            .filter((p) => !Number.isNaN(p.dateValue.getTime()));
    }, [points]);

    if (width <= 0 || parsedPoints.length === 0) {
        return null;
    }

    const xMax = width - defaultMargin.left - defaultMargin.right;
    const yMax = height - defaultMargin.top - defaultMargin.bottom;

    const numXTicks = Math.max(2, Math.min(6, Math.floor(width / 140)));
    const numYTicks = 5;

    const domainX = [
        Math.min(...parsedPoints.map((p) => p.dateValue.getTime())),
        Math.max(...parsedPoints.map((p) => p.dateValue.getTime())),
    ].map((t) => new Date(t)) as [Date, Date];

    const maxY = Math.max(
        0,
        ...parsedPoints.map((p) => Math.max(p.revenueDollars, p.netRevenueDollars)),
    );

    const xScale = scaleTime<number>({
        domain: domainX,
        range: [0, xMax],
    });

    const yScale = scaleLinear<number>({
        domain: [0, maxY],
        nice: true,
        range: [yMax, 0],
    });

    const axisColor = 'hsl(var(--bc) / 0.35)';
    const revenueColor = 'hsl(var(--p))';
    const netRevenueColor = 'hsl(var(--a))';
    const gridColor = 'hsl(var(--bc) / 0.1)';
    const plotBg = 'hsl(var(--b2))';

    return (
        <svg width={width} height={height} role="img">
            <Group left={defaultMargin.left} top={defaultMargin.top}>
                <defs>
                    <clipPath id="revenue-trend-clip">
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
                />

                {yScale.ticks(numYTicks).map((tick) => (
                    <line
                        key={`grid-${tick}`}
                        x1={0}
                        x2={xMax}
                        y1={yScale(tick)}
                        y2={yScale(tick)}
                        stroke={gridColor}
                        strokeWidth={1}
                    />
                ))}

                <AxisLeft
                    scale={yScale}
                    tickFormat={(v) => formatCompactCurrency(Number(v))}
                    numTicks={numYTicks}
                    stroke={axisColor}
                    tickStroke={axisColor}
                    tickLabelProps={() => ({
                        fill: axisColor,
                        fontSize: 11,
                        textAnchor: 'end',
                        dx: '-0.25em',
                        dy: '0.25em',
                    })}
                />
                <AxisBottom
                    top={yMax}
                    scale={xScale}
                    numTicks={numXTicks}
                    tickFormat={(v) => {
                        const date =
                            v instanceof Date ? v : new Date(v.valueOf());
                        return formatMonthDay(date);
                    }}
                    stroke={axisColor}
                    tickStroke={axisColor}
                    tickLabelProps={() => ({
                        fill: axisColor,
                        fontSize: 11,
                        textAnchor: 'end',
                        transform: 'rotate(-35)',
                        dx: '-0.2em',
                        dy: '0.4em',
                    })}
                />

                <Group clipPath="url(#revenue-trend-clip)">
                    <LinePath
                        data={parsedPoints}
                        x={(d) => xScale(d.dateValue) ?? 0}
                        y={(d) => yScale(d.revenueDollars) ?? 0}
                        curve={curveMonotoneX}
                        stroke={revenueColor}
                        strokeWidth={2}
                    />
                    <LinePath
                        data={parsedPoints}
                        x={(d) => xScale(d.dateValue) ?? 0}
                        y={(d) => yScale(d.netRevenueDollars) ?? 0}
                        curve={curveMonotoneX}
                        stroke={netRevenueColor}
                        strokeWidth={2}
                        strokeDasharray="6 4"
                    />
                </Group>
            </Group>
        </svg>
    );
}
