'use client'

import { useState, useMemo, useRef, useEffect } from 'react'

interface ModuleChartProps {
  data: number[]
  color: string
  friendsAvg?: number
  nationalAvg?: number
  worldwideAvg?: number
  height?: number
  /** Week labels for tooltips */
  weekLabels?: string[]
  /** Compact mode - no tooltips, thinner line, minimal UI */
  compact?: boolean
  /** Show average reference lines */
  showAverages?: boolean
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
  weekLabels,
  compact = false,
  showAverages = true
}: ModuleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(180)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  // Responsive width measurement
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Generate default week labels if not provided
  const weeks = useMemo(() => {
    if (weekLabels && weekLabels.length === data.length) {
      return weekLabels
    }
    return data.map((_, i) => `W${data.length - i}`)
  }, [weekLabels, data.length])

  // Dimensions
  const width = containerWidth
  const padding = compact ? 4 : (height >= 80 ? 12 : 8)
  const chartWidth = Math.max(width - 2 * padding, 50)
  const chartHeight = Math.max(height - 2 * padding, 20)

  // Data range with padding for visual balance
  const dataMax = Math.max(...data)
  const dataMin = Math.min(...data)
  const avgMax = showAverages ? Math.max(friendsAvg || 0, nationalAvg || 0, worldwideAvg || 0) : 0
  const avgMin = showAverages ? Math.min(
    friendsAvg || Infinity,
    nationalAvg || Infinity,
    worldwideAvg || Infinity
  ) : Infinity

  const maxValue = Math.max(dataMax, avgMax)
  const minValue = Math.min(dataMin, avgMin === Infinity ? dataMin : avgMin)
  const range = (maxValue - minValue) || 1

  // Add 10% padding to range for visual breathing room
  const paddedMin = minValue - range * 0.1
  const paddedRange = range * 1.2

  const getX = (index: number) => {
    if (data.length <= 1) return padding + chartWidth / 2
    return padding + (index * chartWidth / (data.length - 1))
  }

  const getY = (value: number) => {
    return padding + chartHeight - ((value - paddedMin) / paddedRange) * chartHeight
  }

  // Trend calculation for compact mode
  const trend = useMemo(() => {
    if (data.length < 2) return 0
    const recent = data.slice(-3)
    const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length
    const older = data.slice(0, -3)
    const avgOlder = older.length > 0
      ? older.reduce((a, b) => a + b, 0) / older.length
      : recent[0]
    return avgRecent - avgOlder
  }, [data])

  // Calculate tooltip data for hovered point
  const tooltipData: TooltipData | null = useMemo(() => {
    if (hoveredPoint === null || compact) return null

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
      showAbove: y > chartHeight / 2 + padding
    }
  }, [hoveredPoint, data, weeks, friendsAvg, worldwideAvg, chartHeight, padding, compact])

  // Generate smooth bezier curve path
  const generateSmoothPath = useMemo(() => {
    if (data.length < 2) {
      const x = getX(0)
      const y = getY(data[0] || 0)
      return { path: `M ${x} ${y}`, areaPath: '' }
    }

    const points = data.map((value, index) => ({
      x: getX(index),
      y: getY(value)
    }))

    // Create smooth bezier curve
    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const next = points[i + 1]
      const prev2 = points[i - 2]

      // Calculate control points for smooth curve
      const tension = 0.3

      let cp1x, cp1y, cp2x, cp2y

      if (i === 1) {
        // First segment
        cp1x = prev.x + (curr.x - prev.x) * tension
        cp1y = prev.y + (curr.y - prev.y) * tension
      } else {
        // Use previous point to calculate tangent
        cp1x = prev.x + (curr.x - prev2.x) * tension
        cp1y = prev.y + (curr.y - prev2.y) * tension
      }

      if (i === points.length - 1) {
        // Last segment
        cp2x = curr.x - (curr.x - prev.x) * tension
        cp2y = curr.y - (curr.y - prev.y) * tension
      } else {
        // Use next point to calculate tangent
        cp2x = curr.x - (next.x - prev.x) * tension
        cp2y = curr.y - (next.y - prev.y) * tension
      }

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
    }

    // Area path for gradient fill
    const lastPoint = points[points.length - 1]
    const firstPoint = points[0]
    const areaPath = `${path} L ${lastPoint.x} ${padding + chartHeight} L ${firstPoint.x} ${padding + chartHeight} Z`

    return { path, areaPath }
  }, [data, chartWidth, chartHeight, padding])

  // Point radius based on mode
  const getPointRadius = (index: number) => {
    if (compact) return 0
    const baseRadius = height >= 80 ? 3.5 : 2.5
    return hoveredPoint === index ? baseRadius + 2 : baseRadius
  }

  // Line width based on mode
  const strokeWidth = compact ? 1.5 : 2

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`areaGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Average lines - only in non-compact mode */}
        {!compact && showAverages && (
          <>
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
          </>
        )}

        {/* Area fill with gradient */}
        <path
          d={generateSmoothPath.areaPath}
          fill={`url(#areaGradient-${color.replace('#', '')})`}
        />

        {/* Main line - smooth bezier curve */}
        <path
          d={generateSmoothPath.path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: compact ? 'none' : `drop-shadow(0 1px 2px ${color}40)`
          }}
        />

        {/* Interactive points - only in non-compact mode */}
        {!compact && data.map((value, index) => (
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

        {/* Last point highlight in compact mode */}
        {compact && data.length > 0 && (
          <circle
            cx={getX(data.length - 1)}
            cy={getY(data[data.length - 1])}
            r={2}
            fill={color}
            stroke="white"
            strokeWidth={1}
          />
        )}
      </svg>

      {/* Trend indicator for compact mode */}
      {compact && Math.abs(trend) > 1 && (
        <div
          className="absolute top-0 right-0 text-[9px] font-medium"
          style={{
            color: trend > 0 ? 'var(--accent-sage)' : 'var(--accent-rose)',
          }}
        >
          {trend > 0 ? '↑' : '↓'}
        </div>
      )}

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
            className="px-2.5 py-2 rounded-xl shadow-lg"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(12px)',
              animation: 'fadeIn 0.15s ease-out',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Week label */}
            <div
              className="text-[9px] font-medium tracking-wide text-center mb-0.5"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              {tooltipData.week}
            </div>

            {/* Value */}
            <div
              className="text-base font-semibold text-center"
              style={{ color: 'white' }}
            >
              {tooltipData.value}%
            </div>

            {/* Deltas */}
            {(tooltipData.deltaFriends !== null || tooltipData.deltaGlobal !== null) && (
              <div className="flex flex-col items-center gap-0.5 mt-1">
                {tooltipData.deltaFriends !== null && (
                  <span
                    className="text-[8px] font-medium"
                    style={{
                      color: tooltipData.deltaFriends >= 0
                        ? 'rgba(139, 168, 136, 1)'
                        : 'rgba(212, 165, 165, 1)'
                    }}
                  >
                    {tooltipData.deltaFriends >= 0 ? '+' : ''}{tooltipData.deltaFriends} vs amis
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
              [tooltipData.showAbove ? 'borderTop' : 'borderBottom']: '5px solid rgba(0, 0, 0, 0.9)',
            }}
          />
        </div>
      )}
    </div>
  )
}
