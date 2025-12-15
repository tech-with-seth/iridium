import { Pie } from '@visx/shape';
import { Group } from '@visx/group';

interface DonutProgressProps {
    value: number; // 0..1
    size?: number;
    strokeWidth?: number;
    className?: string;
    label?: string;
}

function clamp01(value: number): number {
    if (Number.isNaN(value)) return 0;
    return Math.max(0, Math.min(1, value));
}

export function DonutProgress({
    value,
    size = 96,
    strokeWidth = 12,
    className,
    label,
}: DonutProgressProps) {
    const clamped = clamp01(value);
    const radius = size / 2;
    const innerRadius = radius - strokeWidth;

    const background = 'hsl(var(--b3))';
    const foreground = 'hsl(var(--p))';
    const textColor = 'hsl(var(--bc))';

    const data = [
        { key: 'value', v: clamped },
        { key: 'rest', v: 1 - clamped },
    ];

    return (
        <div className={className}>
            <svg width={size} height={size} role="img">
                <Group top={radius} left={radius}>
                    <Pie
                        data={data}
                        pieValue={(d) => d.v}
                        outerRadius={radius}
                        innerRadius={innerRadius}
                        startAngle={-Math.PI / 2}
                        endAngle={(3 * Math.PI) / 2}
                        padAngle={0}
                    >
                        {(pie) =>
                            pie.arcs.map((arc) => (
                                <path
                                    key={arc.data.key}
                                    d={pie.path(arc) ?? undefined}
                                    fill={
                                        arc.data.key === 'value'
                                            ? foreground
                                            : background
                                    }
                                />
                            ))
                        }
                    </Pie>

                    <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={textColor}
                        fontSize={14}
                        fontWeight={700}
                    >
                        {(clamped * 100).toFixed(0)}%
                    </text>
                    {label && (
                        <text
                            textAnchor="middle"
                            dominantBaseline="hanging"
                            y={14}
                            fill={textColor}
                            fontSize={10}
                            opacity={0.7}
                        >
                            {label}
                        </text>
                    )}
                </Group>
            </svg>
        </div>
    );
}

