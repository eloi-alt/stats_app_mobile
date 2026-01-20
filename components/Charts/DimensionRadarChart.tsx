'use client'

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts'

interface DimensionData {
    subject: string
    A: number // User Score
    B?: number // Benchmark (optional)
    fullMark: number
}

interface DimensionRadarChartProps {
    data: DimensionData[]
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
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-xs font-medium" style={{ color: entry.color }}>
                        {entry.name === 'A' ? 'Moi' : 'Cible'}: {entry.value}%
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export default function DimensionRadarChart({
    data,
    color,
    height = 250
}: DimensionRadarChartProps) {
    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
                    />
                    <Radar
                        name="A"
                        dataKey="A"
                        stroke={color}
                        strokeWidth={2}
                        fill={color}
                        fillOpacity={0.4}
                    />
                    <Tooltip content={<CustomTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}
