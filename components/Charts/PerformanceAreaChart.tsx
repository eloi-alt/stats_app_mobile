'use client'

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts'

interface PerformanceAreaChartProps {
    data: Array<{ label: string; value: number }>
    color: string
    height?: number
    showGrid?: boolean
    showXAxis?: boolean
    showYAxis?: boolean
    minY?: number
    maxY?: number
    referenceLines?: Array<{ y: number; label?: string; color?: string }>
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div
                className="px-3 py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-xl"
                style={{ background: 'rgba(0, 0, 0, 0.8)' }}
            >
                <p className="text-[10px] text-gray-400 mb-0.5 text-center uppercase tracking-wider">{label}</p>
                <p className="text-lg font-bold text-white text-center">
                    {payload[0].value}%
                </p>
            </div>
        )
    }
    return null
}

export default function PerformanceAreaChart({
    data,
    color,
    height = 200,
    showGrid = true,
    showXAxis = true,
    showYAxis = false,
    minY = 0,
    maxY = 100,
    referenceLines = []
}: PerformanceAreaChartProps) {
    const gradientId = `gradient-${color.replace('#', '')}`

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    {showGrid && (
                        <CartesianGrid
                            strokeDasharray="4 4"
                            vertical={false}
                            stroke="rgba(255,255,255,0.05)"
                        />
                    )}

                    {showXAxis && (
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                            dy={10}
                        />
                    )}

                    {showYAxis && (
                        <YAxis
                            hide={!showYAxis}
                            domain={[minY, maxY]}
                        />
                    )}

                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />

                    {referenceLines.map((line, idx) => (
                        <ReferenceLine
                            key={idx}
                            y={line.y}
                            stroke={line.color || 'rgba(255,255,255,0.2)'}
                            strokeDasharray="3 3"
                            label={line.label ? {
                                value: line.label,
                                position: 'insideRight',
                                fill: line.color || 'rgba(255,255,255,0.4)',
                                fontSize: 10
                            } : undefined}
                        />
                    ))}

                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#${gradientId})`}
                        animationDuration={1500}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
