'use client'

import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import TrendSparkline from './TrendSparkline'

interface PhysioCardProps {
  icon: string
  label: string
  value: string
  valueColor?: string
  progress: number
  progressColor: string
  showProgress?: boolean
  goal?: number
  current?: number
  trendData?: number[]
  onClick?: () => void
  onGoalClick?: () => void
  style?: React.CSSProperties
}

export default function PhysioCard({
  icon,
  label,
  value,
  valueColor,
  progress,
  progressColor,
  showProgress = false,
  goal,
  current,
  trendData,
  onClick,
  onGoalClick,
  style,
}: PhysioCardProps) {
  const { t } = useLanguage()

  const handleGoalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onGoalClick) {
      onGoalClick()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <div
      className="rounded-2xl p-4 flex flex-col justify-between h-[140px] cursor-pointer fade-in transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${label}: ${value}`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-md)',
        backdropFilter: 'blur(20px)',
        ...style,
      }}
    >
      <div className="flex justify-between items-start">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${progressColor}15` }}
          aria-hidden="true"
        >
          <i
            className={`${icon} text-sm`}
            style={{ color: progressColor }}
            aria-hidden="true"
          />
        </div>
        {/* Trend sparkline */}
        {trendData && trendData.length > 1 && (
          <TrendSparkline data={trendData} color={progressColor} height={20} />
        )}
      </div>

      <div>
        <div
          className="text-[10px] uppercase tracking-[0.15em] font-medium mb-1"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {label}
        </div>
        <div
          className="text-2xl font-light text-display"
          style={{ color: valueColor || 'var(--text-primary)' }}
          role="status"
          aria-live="polite"
        >
          {value}
        </div>
      </div>

      {showProgress && (
        <div
          className="bar-bg mt-2"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} progress`}
        >
          <div
            className="bar-fill"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${progressColor}, ${progressColor}88)`,
            }}
          />
        </div>
      )}
      {!showProgress && goal && current !== undefined && (
        <button
          className="mt-2 text-[9px] cursor-pointer hover:opacity-80 transition-opacity text-left bg-transparent border-none p-0"
          style={{ color: progressColor }}
          onClick={handleGoalClick}
          aria-label={`Set goal for ${label}. Current: ${current} of ${goal}`}
        >
          <i className="fa-solid fa-bullseye mr-1" aria-hidden="true" />
          {current}/{goal} • {t('tapToSetGoal')}
        </button>
      )}
    </div>
  )
}
