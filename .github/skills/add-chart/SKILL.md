---
name: add-chart
description: Add data visualizations with visx following DaisyUI theming. Use when displaying trends, comparisons, proportions, or funnel data.
---

# Add Chart

Creates data visualizations using visx (D3 primitives + React) with DaisyUI theme integration.

## When to Use

- Displaying time series (trends over time)
- Showing ratios/proportions (rates, margins)
- Comparing magnitudes (revenue vs net)
- Visualizing funnels/progress
- User asks to "add chart", "visualize data", or "show trend"

## When NOT to Use

- Single values (use stat tiles instead)
- Sparse/ambiguous data (use tables or summaries)
- Invented data points (tools must return real series)

## Installation

```bash
npm install --legacy-peer-deps @visx/axis @visx/group @visx/scale @visx/shape @visx/responsive @visx/curve
```

## Basic Line Chart

```tsx
// app/components/data-display/TrendChart.tsx
import { ParentSize } from '@visx/responsive';
import { LinePath } from '@visx/shape';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { curveMonotoneX } from '@visx/curve';

interface DataPoint {
    date: Date;
    value: number;
}

interface TrendChartProps {
    data: DataPoint[];
    width?: number;
    height?: number;
}

export function TrendChart({ data, width = 400, height = 200 }: TrendChartProps) {
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = scaleTime({
        domain: [Math.min(...data.map(d => d.date)), Math.max(...data.map(d => d.date))],
        range: [0, innerWidth],
    });

    const yScale = scaleLinear({
        domain: [0, Math.max(...data.map(d => d.value))],
        range: [innerHeight, 0],
        nice: true,
    });

    return (
        <svg width={width} height={height} role="img" aria-label="Trend chart">
            <rect
                width={width}
                height={height}
                fill="var(--color-base-200)"
                rx={8}
            />
            <Group left={margin.left} top={margin.top}>
                <AxisLeft
                    scale={yScale}
                    stroke="var(--color-base-content)"
                    strokeOpacity={0.3}
                    tickStroke="var(--color-base-content)"
                    tickLabelProps={{ fill: 'var(--color-base-content)', fontSize: 11 }}
                />
                <AxisBottom
                    scale={xScale}
                    top={innerHeight}
                    stroke="var(--color-base-content)"
                    strokeOpacity={0.3}
                    tickStroke="var(--color-base-content)"
                    tickLabelProps={{ fill: 'var(--color-base-content)', fontSize: 11 }}
                />
                <LinePath
                    data={data}
                    x={(d) => xScale(d.date) ?? 0}
                    y={(d) => yScale(d.value) ?? 0}
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    curve={curveMonotoneX}
                />
            </Group>
        </svg>
    );
}
```

## Responsive Chart Wrapper

```tsx
import { ParentSize } from '@visx/responsive';

export function ResponsiveTrendChart({ data }: { data: DataPoint[] }) {
    return (
        <ParentSize>
            {({ width }) => (
                <TrendChart data={data} width={width} height={200} />
            )}
        </ParentSize>
    );
}
```

## Donut/Proportion Chart

```tsx
import { Pie } from '@visx/shape';
import { Group } from '@visx/group';

interface DonutProgressProps {
    percentage: number;
    size?: number;
}

export function DonutProgress({ percentage, size = 100 }: DonutProgressProps) {
    const radius = size / 2;
    const innerRadius = radius * 0.7;

    const data = [
        { value: percentage, fill: 'var(--color-primary)' },
        { value: 100 - percentage, fill: 'var(--color-base-300)' },
    ];

    return (
        <svg width={size} height={size} role="img" aria-label={`${percentage}% complete`}>
            <Group top={radius} left={radius}>
                <Pie
                    data={data}
                    pieValue={(d) => d.value}
                    outerRadius={radius}
                    innerRadius={innerRadius}
                >
                    {(pie) =>
                        pie.arcs.map((arc, i) => (
                            <path
                                key={i}
                                d={pie.path(arc) ?? ''}
                                fill={data[i].fill}
                            />
                        ))
                    }
                </Pie>
                <text
                    textAnchor="middle"
                    dy=".3em"
                    fontSize={16}
                    fontWeight="bold"
                    fill="var(--color-base-content)"
                >
                    {percentage}%
                </text>
            </Group>
        </svg>
    );
}
```

## Theme Colors (DaisyUI 5)

Use CSS variables for theme-aware colors:

| Purpose | CSS Variable |
|---------|-------------|
| Primary series | `var(--color-primary)` |
| Secondary series | `var(--color-accent)` |
| Text/axes | `var(--color-base-content)` |
| Background | `var(--color-base-200)` |
| Track/inactive | `var(--color-base-300)` |

## Comparison Bars

```tsx
interface ComparisonBarsProps {
    value1: number;
    value2: number;
    label1: string;
    label2: string;
}

export function ComparisonBars({ value1, value2, label1, label2 }: ComparisonBarsProps) {
    const max = Math.max(value1, value2);

    return (
        <div className="space-y-2">
            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span>{label1}</span>
                    <span>{value1}</span>
                </div>
                <div className="h-3 bg-base-300 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary"
                        style={{ width: `${(value1 / max) * 100}%` }}
                    />
                </div>
            </div>
            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span>{label2}</span>
                    <span>{value2}</span>
                </div>
                <div className="h-3 bg-base-300 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-accent"
                        style={{ width: `${(value2 / max) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
```

## Tool Card Pattern

Charts should be wrapped in cards with context:

```tsx
import { Card } from '~/components';

export function RevenueTrendCard({ data, dateRange }) {
    return (
        <Card variant="border" className="bg-base-100">
            <div className="p-4">
                <h3 className="text-lg font-semibold">Revenue Trend</h3>
                <p className="text-sm text-base-content/60">{dateRange}</p>

                {/* KPI badges */}
                <div className="flex gap-2 my-3">
                    <Badge>Total: ${data.total}</Badge>
                    <Badge variant="accent">Growth: +{data.growth}%</Badge>
                </div>

                {/* Chart */}
                <ResponsiveTrendChart data={data.points} />
            </div>
        </Card>
    );
}
```

## Rules

1. Use React for rendering, not D3 DOM mutations
2. Keep charts responsive with `ParentSize`
3. Control tick density based on width
4. Add `role="img"` for accessibility
5. Match DaisyUI theme colors

## Anti-Patterns

- Using D3 to directly select/mutate DOM
- Hardcoded colors ignoring theme variables
- Charts without context (no labels/date range)
- Unbounded ticks that overlap
- Rendering raw JSON instead of visualizations

## Existing Components

Check these reference implementations:

- `app/components/data-display/RevenueTrendChart.tsx`
- `app/components/data-display/DonutProgress.tsx`
- `app/components/data-display/ComparisonBars.tsx`

## Full Reference

See `.github/instructions/charting.instructions.md` for comprehensive documentation.
