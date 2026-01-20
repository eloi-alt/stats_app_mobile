'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import PerformanceAreaChart from '../Charts/PerformanceAreaChart'

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
  // Prep data for Recharts
  const chartData = useMemo(() => {
    return data.map((value, index) => ({
      label: weekLabels && weekLabels[index] ? weekLabels[index] : `W${data.length - index}`,
      value
    }))
  }, [data, weekLabels])

  // Reference lines
  const referenceLines = useMemo(() => {
    const lines = []
    if (showAverages && !compact) {
      if (friendsAvg) lines.push({ y: friendsAvg, label: 'Amis', color: 'rgba(212, 165, 165, 0.5)' })
      if (nationalAvg) lines.push({ y: nationalAvg, label: 'Nat.', color: 'rgba(184, 165, 212, 0.4)' })
      if (worldwideAvg) lines.push({ y: worldwideAvg, label: 'Monde', color: 'rgba(165, 196, 212, 0.3)' })
    }
    return lines
  }, [friendsAvg, nationalAvg, worldwideAvg, showAverages, compact])

  // Trend for compact mode
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

  if (compact) {
    return (
      <div className="relative w-full" style={{ height }}>
        <PerformanceAreaChart
          data={chartData}
          color={color}
          height={height}
          showGrid={false}
          showXAxis={false}
          showYAxis={false}
        />

        {Math.abs(trend) > 1 && (
          <div
            className="absolute top-0 right-0 text-[9px] font-medium"
            style={{
              color: trend > 0 ? 'var(--accent-sage)' : 'var(--accent-rose)',
            }}
          >
            {trend > 0 ? '↑' : '↓'}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <PerformanceAreaChart
        data={chartData}
        color={color}
        height={height}
        showGrid={true}
        showXAxis={true}
        showYAxis={false}
        referenceLines={referenceLines}
      />
    </div>
  )
}
