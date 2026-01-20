'use client'

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts'

interface PortfolioPieChartProps {
    data: Array<{ name: string; value: number; color: string; percentage: number }>
    height?: number
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div
                className="px-3 py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-xl"
                style={{ background: 'rgba(0, 0, 0, 0.8)' }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: data.color }} />
                    <p className="text-[10px] text-gray-300 uppercase tracking-wider">{data.name}</p>
                </div>
                <p className="text-lg font-bold text-white text-center">
                    {data.percentage}%
                </p>
                <p className="text-xs text-center text-gray-400">
                    {(data.value / 1000).toFixed(0)}k€
                </p>
            </div>
        )
    }
    return null
}

const RenderLegend = (props: any) => {
    const { payload } = props;

    return (
        <div className="flex flex-wrap justify-center gap-3 mt-2">
            {payload.map((entry: any, index: number) => (
                <div key={`item-${index}`} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[10px] text-gray-400">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

export default function PortfolioPieChart({
    data,
    height = 250
}: PortfolioPieChartProps) {
    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1500}
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<RenderLegend />} verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
