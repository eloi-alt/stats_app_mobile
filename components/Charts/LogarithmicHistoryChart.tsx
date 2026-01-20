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
import { useMemo } from 'react'

interface LogarithmicHistoryChartProps {
    data: number[]
    weekLabels?: string[]
    color: string
    height?: number
    scale?: 'linear' | 'log'
    showAverages?: boolean
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

export default function LogarithmicHistoryChart({
    data,
    weekLabels,
    color,
    height = 200,
    scale = 'log',
    showAverages = false
}: LogarithmicHistoryChartProps) {

    // Prepare data for Recharts
    const chartData = useMemo(() => {
        return data.map((value, index) => ({
            // Use provided label or generic 'Week X'
            name: weekLabels ? weekLabels[index] : `W${index + 1}`,
            value: value,
            // Logarithmic adjustment for visual "amplitude" if needed
            // Note: Recharts 'scale="log"' handles the axis, but sometimes
            // visual transformation is preferred for specific effects.
            // Here we trust the YAxis scale prop.
        }))
    }, [data, weekLabels])

    const gradientId = `log-gradient-${color.replace('#', '')}`

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(255,255,255,0.05)"
                    />

                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                        dy={10}
                        interval="preserveStartEnd"
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                        domain={[0, 100]}
                        // Log scale integration
                        scale={scale === 'log' ? 'sqrt' : 'linear'}
                    // Note: 'sqrt' often looks better than pure 'log' for 0-100 data 
                    // as it emphasizes low end without distorting 0 values (log(0) is -Infinity).
                    // Recharts supports 'sqrt', 'log', 'linear', 'pow', etc.
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />

                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill={`url(#${gradientId})`}
                        animationDuration={1500}
                        activeDot={{ r: 6, strokeWidth: 4, stroke: 'var(--bg-card)' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
