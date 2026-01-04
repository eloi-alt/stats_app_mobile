'use client'

import { useState, useMemo } from 'react'

interface ModuleChartProps {
  data: number[]
  color: string
  friendsAvg?: number
  nationalAvg?: number
  worldwideAvg?: number
  height?: number
  /** Week labels for tooltips */
  weekLabels?: string[]
}

interface TooltipData {
  x: number
  y: number
  value: number
  week: string
  deltaFriends: number | null
  deltaGlobal: number | null
  showAbove: boolean
}

export default function ModuleChart({
  data,
  color,
  friendsAvg,
  nationalAvg,
  worldwideAvg,
  height = 60,
  weekLabels
}: ModuleChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  // Generate default week labels if not provided
  const weeks = useMemo(() => {
    if (weekLabels && weekLabels.length === data.length) {
      return weekLabels
    }
    // Generate W-X labels counting back from current week
    return data.map((_, i) => `W${data.length - i}`)
  }, [weekLabels, data.length])

  // Width adaptatif selon la hauteur pour un meilleur ratio
  const width = height >= 80 ? 180 : 160
  const padding = height >= 80 ? 12 : 8
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  const maxValue = Math.max(...data, friendsAvg || 0, nationalAvg || 0, worldwideAvg || 0)
  const minValue = Math.min(...data, friendsAvg || 0, nationalAvg || 0, worldwideAvg || 0)
  const range = maxValue - minValue || 1

  const getX = (index: number) => padding + (index * chartWidth / (data.length - 1))
  const getY = (value: number) => padding + chartHeight - ((value - minValue) / range) * chartHeight

  // Calculate tooltip data for hovered point
  const tooltipData: TooltipData | null = useMemo(() => {
    if (hoveredPoint === null) return null

    const value = data[hoveredPoint]
    const x = getX(hoveredPoint)
    const y = getY(value)

    return {
      x,
      y,
      value,
      week: weeks[hoveredPoint],
      deltaFriends: friendsAvg ? Math.round(value - friendsAvg) : null,
      deltaGlobal: worldwideAvg ? Math.round(value - worldwideAvg) : null,
      showAbove: y > chartHeight / 2 + padding // Show above if point is in lower half
    }
  }, [hoveredPoint, data, weeks, friendsAvg, worldwideAvg, chartHeight, padding])

  // Generate path
  const path = data.map((value, index) => {
    const x = getX(index)
    const y = getY(value)
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')

  // Generate area path (for fill)
  const areaPath = `${path} L ${getX(data.length - 1)} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`

  // Point radius based on height and hover state
  const getPointRadius = (index: number) => {
    const baseRadius = height >= 80 ? 3.5 : 2.5
    return hoveredPoint === index ? baseRadius + 2 : baseRadius
  }

  return (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {/* Average lines */}
        {worldwideAvg && (
          <line
            x1={padding}
            y1={getY(worldwideAvg)}
            x2={width - padding}
            y2={getY(worldwideAvg)}
            stroke="rgba(165, 196, 212, 0.3)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        )}
        {nationalAvg && (
          <line
            x1={padding}
            y1={getY(nationalAvg)}
            x2={width - padding}
            y2={getY(nationalAvg)}
            stroke="rgba(184, 165, 212, 0.4)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        )}
        {friendsAvg && (
          <line
            x1={padding}
            y1={getY(friendsAvg)}
            x2={width - padding}
            y2={getY(friendsAvg)}
            stroke="rgba(212, 165, 165, 0.5)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        )}

        {/* Area fill */}
        <path
          d={areaPath}
          fill={`${color}20`}
        />

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive points */}
        {data.map((value, index) => (
          <g key={index}>
            {/* Invisible larger hit area for easier hovering */}
            <circle
              cx={getX(index)}
              cy={getY(value)}
              r="12"
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
              onTouchStart={() => setHoveredPoint(index)}
              onTouchEnd={() => setHoveredPoint(null)}
            />
            {/* Visible point */}
            <circle
              cx={getX(index)}
              cy={getY(value)}
              r={getPointRadius(index)}
              fill={hoveredPoint === index ? 'white' : color}
              stroke={hoveredPoint === index ? color : 'white'}
              strokeWidth={height >= 80 ? 2 : 1.5}
              style={{
                transition: 'all 0.15s ease-out',
                pointerEvents: 'none'
              }}
            />
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {tooltipData && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: tooltipData.x,
            top: tooltipData.showAbove ? tooltipData.y - 8 : tooltipData.y + 8,
            transform: `translate(-50%, ${tooltipData.showAbove ? '-100%' : '0'})`,
          }}
        >
          <div
            className="px-2 py-1.5 rounded-lg shadow-lg"
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              animation: 'fadeIn 0.15s ease-out',
            }}
          >
            {/* Week label */}
            <div
              className="text-[9px] font-medium tracking-wide text-center mb-0.5"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            >
              {tooltipData.week}
            </div>

            {/* Value */}
            <div
              className="text-sm font-semibold text-center"
              style={{ color: 'white' }}
            >
              {tooltipData.value}%
            </div>

            {/* Deltas */}
            {(tooltipData.deltaFriends !== null || tooltipData.deltaGlobal !== null) && (
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                {tooltipData.deltaFriends !== null && (
                  <span
                    className="text-[8px] font-medium"
                    style={{
                      color: tooltipData.deltaFriends >= 0
                        ? 'rgba(139, 168, 136, 1)'
                        : 'rgba(212, 165, 165, 1)'
                    }}
                  >
                    {tooltipData.deltaFriends >= 0 ? '+' : ''}{tooltipData.deltaFriends} vs friends
                  </span>
                )}
                {tooltipData.deltaGlobal !== null && (
                  <span
                    className="text-[8px] font-medium"
                    style={{
                      color: tooltipData.deltaGlobal >= 0
                        ? 'rgba(139, 168, 136, 1)'
                        : 'rgba(212, 165, 165, 1)'
                    }}
                  >
                    {tooltipData.deltaGlobal >= 0 ? '+' : ''}{tooltipData.deltaGlobal} vs global
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              [tooltipData.showAbove ? 'bottom' : 'top']: '-4px',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              [tooltipData.showAbove ? 'borderTop' : 'borderBottom']: '5px solid rgba(0, 0, 0, 0.85)',
            }}
          />
        </div>
      )}
    </div>
  )
}

