'use client'

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

interface ProjectionAreaChartProps {
    data: Array<{ year: number; amount: number }>
    color: string
    height?: number
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
                    {Math.round(payload[0].value / 1000)}k€
                </p>
            </div>
        )
    }
    return null
}

export default function ProjectionAreaChart({
    data,
    color,
    height = 200
}: ProjectionAreaChartProps) {
    const gradientId = `proj-gradient-${color.replace('#', '')}`

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="rgba(255,255,255,0.05)"
                    />

                    <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                        dy={10}
                        minTickGap={30}
                    />

                    <YAxis
                        hide={true}
                        domain={['auto', 'auto']}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />

                    <Area
                        type="monotone"
                        dataKey="amount"
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
