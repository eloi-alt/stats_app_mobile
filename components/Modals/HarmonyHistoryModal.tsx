'use client'

import { useState, useMemo } from 'react'
import Modal from './Modal'
import { generateHarmonyHistory, getCurrentHarmonyScore } from '@/utils/harmonyCalculator'
import { useLanguage } from '@/contexts/LanguageContext'

interface HarmonyHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HarmonyHistoryModal({ isOpen, onClose }: HarmonyHistoryModalProps) {
  const { t } = useLanguage()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')
  const history = useMemo(() => generateHarmonyHistory(), [])
  const currentScore = getCurrentHarmonyScore()

  // Calculate averages
  const avgScore = useMemo(() => {
    return Math.round(history.reduce((acc, h) => acc + h.value, 0) / history.length)
  }, [history])

  const maxValue = Math.max(...history.map(h => Math.max(h.value, h.friendsAvg, h.nationalAvg, h.worldwideAvg)))
  const minValue = Math.min(...history.map(h => Math.min(h.value, h.friendsAvg, h.nationalAvg, h.worldwideAvg)))

  const chartHeight = 200
  const chartWidth = 300
  const padding = 20

  const getX = (index: number) => padding + (index * (chartWidth - 2 * padding) / (history.length - 1))
  const getY = (value: number) => chartHeight - padding - ((value - minValue) / (maxValue - minValue)) * (chartHeight - 2 * padding)

  // Generate path for line chart
  const generatePath = (data: number[]) => {
    return data.map((value, index) => {
      const x = getX(index)
      const y = getY(value)
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    }).join(' ')
  }

  const userPath = generatePath(history.map(h => h.value))
  const friendsPath = generatePath(history.map(h => h.friendsAvg))
  const nationalPath = generatePath(history.map(h => h.nationalAvg))
  const worldwidePath = generatePath(history.map(h => h.worldwideAvg))

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="modal-harmony-history" title="Harmony History">
      <div className="mb-6">
        {/* Current score */}
        <div className="text-center mb-6">
          <div className="text-4xl font-light text-display mb-2" style={{ color: 'var(--accent-gold)' }}>
            {currentScore}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Current Harmony Score
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Average: {avgScore}
          </div>
        </div>

        {/* Period selector */}
        <div className="flex gap-2 mb-5">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: selectedPeriod === period ? 'var(--accent-gold)' : 'rgba(0, 0, 0, 0.04)',
                color: selectedPeriod === period ? 'white' : 'var(--text-secondary)',
              }}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
          <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((value) => {
              const y = getY(value)
              return (
                <line
                  key={value}
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="rgba(0, 0, 0, 0.05)"
                  strokeWidth="1"
                />
              )
            })}

            {/* Lines */}
            <path
              d={worldwidePath}
              fill="none"
              stroke="rgba(165, 196, 212, 0.4)"
              strokeWidth="2"
            />
            <path
              d={nationalPath}
              fill="none"
              stroke="rgba(184, 165, 212, 0.5)"
              strokeWidth="2"
            />
            <path
              d={friendsPath}
              fill="none"
              stroke="rgba(212, 165, 165, 0.6)"
              strokeWidth="2"
            />
            <path
              d={userPath}
              fill="none"
              stroke="var(--accent-gold)"
              strokeWidth="3"
            />

            {/* Points */}
            {history.map((point, index) => (
              <circle
                key={index}
                cx={getX(index)}
                cy={getY(point.value)}
                r="4"
                fill="var(--accent-gold)"
              />
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ background: 'var(--accent-gold)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ background: 'rgba(212, 165, 165, 0.6)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Friends Avg</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ background: 'rgba(184, 165, 212, 0.5)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>National Avg</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ background: 'rgba(165, 196, 212, 0.4)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Worldwide Avg</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(201, 169, 98, 0.1)' }}>
            <div className="text-lg font-light" style={{ color: 'var(--accent-gold)' }}>{currentScore}</div>
            <div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Current</div>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(139, 168, 136, 0.1)' }}>
            <div className="text-lg font-light" style={{ color: 'var(--accent-sage)' }}>{avgScore}</div>
            <div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Average</div>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(165, 196, 212, 0.1)' }}>
            <div className="text-lg font-light" style={{ color: 'var(--accent-sky)' }}>
              {Math.max(...history.map(h => h.value))}
            </div>
            <div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Peak</div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

