'use client'

interface TrendSparklineProps {
    data: number[]
    color: string
    height?: number
    showDots?: boolean
}

export default function TrendSparkline({
    data,
    color,
    height = 24,
    showDots = false,
}: TrendSparklineProps) {
    if (!data || data.length < 2) return null

    const width = 60
    const padding = 2
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    // Generate SVG path
    const points = data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2)
        const y = padding + (1 - (value - min) / range) * (height - padding * 2)
        return { x, y }
    })

    const pathD = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ')

    // Trend indicator
    const trend = data[data.length - 1] - data[0]
    const trendUp = trend > 0
    const trendNeutral = trend === 0

    return (
        <div className="flex items-center gap-1.5">
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="overflow-visible"
            >
                {/* Line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.8}
                />

                {/* Dots at each point */}
                {showDots && points.map((point, index) => (
                    <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r={index === points.length - 1 ? 2.5 : 1.5}
                        fill={color}
                        opacity={index === points.length - 1 ? 1 : 0.5}
                    />
                ))}

                {/* Last point dot (always visible) */}
                {!showDots && (
                    <circle
                        cx={points[points.length - 1].x}
                        cy={points[points.length - 1].y}
                        r={2}
                        fill={color}
                    />
                )}
            </svg>

            {/* Trend indicator */}
            <div
                className="text-[9px] font-medium"
                style={{
                    color: trendNeutral ? 'var(--text-muted)' : (trendUp ? 'var(--accent-sage)' : 'var(--accent-rose)'),
                }}
            >
                {trendNeutral ? '−' : (trendUp ? '↑' : '↓')}
            </div>
        </div>
    )
}
