'use client'

import {
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
    ResponsiveContainer
} from 'recharts'

interface MetricRadialChartProps {
    value: number
    maxValue: number
    color: string
    size?: number
}

export default function MetricRadialChart({
    value,
    maxValue,
    color,
    size = 120
}: MetricRadialChartProps) {
    const data = [{
        name: 'Progress',
        value: value,
        fill: color
    }]

    return (
        <div style={{ width: size, height: size, position: 'relative' }}>
            <ResponsiveContainer>
                <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="80%"
                    outerRadius="100%"
                    barSize={10}
                    data={data}
                    startAngle={90}
                    endAngle={-270}
                >
                    <PolarAngleAxis
                        type="number"
                        domain={[0, maxValue]}
                        angleAxisId={0}
                        tick={false}
                    />
                    <RadialBar
                        background={{ fill: 'rgba(0,0,0,0.04)' }}
                        dataKey="value"
                        cornerRadius={10}
                        animationDuration={1500}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
                <span
                    className="text-3xl font-light text-display"
                    style={{ color }}
                >
                    {value}
                </span>
            </div>
        </div>
    )
}
