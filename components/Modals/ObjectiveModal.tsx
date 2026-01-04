'use client'

import { useMemo } from 'react'
import Modal from './Modal'
import { ThomasMorel } from '@/data/mockData'

interface ObjectiveModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  value: string
  subtitle: string
  color: string
}

// Generate fake history data
const generateHistory = (currentValue: number) => {
  const history = []
  let value = currentValue - Math.random() * 20
  for (let i = 6; i >= 0; i--) {
    value = Math.max(0, Math.min(100, value + (Math.random() - 0.3) * 10))
    history.push({
      week: `W${52 - i}`,
      value: Math.round(value),
    })
  }
  history[history.length - 1].value = currentValue
  return history
}

export default function ObjectiveModal({
  isOpen,
  onClose,
  title,
  value,
  subtitle,
  color,
}: ObjectiveModalProps) {
  const numericValue = parseInt(value) || 0
  const history = useMemo(() => generateHistory(numericValue), [numericValue])
  const maxValue = Math.max(...history.map(h => h.value))
  
  // Get trend
  const trend = history[history.length - 1].value - history[history.length - 2].value
  const trendText = trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : '='
  const trendColor = trend > 0 ? 'var(--accent-sage)' : trend < 0 ? 'var(--accent-rose)' : 'var(--text-muted)'

  // Tips based on module
  const tips = useMemo(() => {
    if (title.includes('Health')) {
      return [
        'Maintain a regular sleep schedule',
        'Stay hydrated (2-3L/day)',
        'Integrate active breaks into your day',
      ]
    }
    if (title.includes('Finance')) {
      return [
        'Diversify your investments',
        'Increase your savings rate by 2%',
        'Review your monthly bank fees',
      ]
    }
    if (title.includes('Circle')) {
      return [
        'Contact a friend you haven\'t seen in a while',
        'Organize a lunch this week',
        'Send a message of gratitude',
      ]
    }
    if (title.includes('World')) {
      return [
        'Plan your next trip',
        'Discover an unknown neighborhood in your city',
        'Learn a few words of a new language',
      ]
    }
    return [
      'Set an achievable goal this week',
      'Celebrate your small victories',
      'Share your progress with a loved one',
    ]
  }, [title])

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="modal-obj" title={title}>
      {/* Main score */}
      <div 
        className="rounded-2xl p-6 text-center mb-5"
        style={{ background: `${color}08` }}
      >
        <div className="relative inline-block mb-3">
          {/* Progress ring */}
          <svg width="120" height="120" className="transform -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="rgba(0, 0, 0, 0.04)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${numericValue * 3.27} 327`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span 
              className="text-4xl font-light text-display"
              style={{ color }}
            >
              {value}
            </span>
          </div>
        </div>
        
        <p 
          className="text-sm mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {subtitle}
        </p>
        
        <div 
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
          style={{ 
            background: `${trendColor}15`,
            color: trendColor,
          }}
        >
          <i className={`fa-solid fa-arrow-${trend > 0 ? 'up' : trend < 0 ? 'down' : 'right'} text-xs`} />
          {trendText} this week
        </div>
      </div>

      {/* History chart */}
      <div 
        className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Recent Evolution
      </div>

      <div 
        className="rounded-2xl p-4 mb-5"
        style={{ 
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid var(--border-light)',
        }}
      >
        <div className="h-28 flex items-end justify-between gap-2">
          {history.map((point, idx) => {
            const isLast = idx === history.length - 1
            const height = (point.value / maxValue) * 100
            
            return (
              <div key={point.week} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{ 
                    height: `${height}%`,
                    background: isLast ? color : 'rgba(0, 0, 0, 0.06)',
                    minHeight: '8px',
                  }}
                />
                <span 
                  className="text-[9px]"
                  style={{ color: isLast ? color : 'var(--text-muted)' }}
                >
                  {point.week}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tips */}
      <div 
        className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Tips to improve
      </div>

      <div className="space-y-2 mb-5">
        {tips.map((tip, idx) => (
          <div 
            key={idx}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(0, 0, 0, 0.02)' }}
          >
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: `${color}15` }}
            >
              <i 
                className="fa-solid fa-lightbulb text-[10px]"
                style={{ color }}
              />
            </div>
            <p 
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {tip}
            </p>
          </div>
        ))}
      </div>

      {/* Action button */}
      <button
        className="w-full py-3.5 rounded-2xl text-sm font-medium transition-all duration-200"
        style={{ 
          background: color,
          color: 'white',
          boxShadow: `0 4px 12px ${color}30`,
        }}
        onClick={onClose}
      >
        <i className="fa-solid fa-chart-line mr-2" />
        View full analysis
      </button>
    </Modal>
  )
}
