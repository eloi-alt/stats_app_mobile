'use client'

import { useMemo } from 'react'
import Modal from './Modal'
import { useLanguage } from '@/contexts/LanguageContext'

interface RankingDetailModalProps {
    isOpen: boolean
    onClose: () => void
    category: string
    icon: string
    iconColor: string
    userValue: number
    comparisonValue: number
    comparisonType: 'friends' | 'country' | 'world'
    displayValue: string
}

export default function RankingDetailModal({
    isOpen,
    onClose,
    category,
    icon,
    iconColor,
    userValue,
    comparisonValue,
    comparisonType,
    displayValue,
}: RankingDetailModalProps) {
    const { t } = useLanguage()

    // Generate mock historical data
    const historyData = useMemo(() => {
        const data = []
        let value = userValue - 15
        for (let i = 7; i >= 0; i--) {
            value = Math.max(0, Math.min(100, value + (Math.random() - 0.3) * 10))
            data.push({ week: `W${52 - i}`, value: Math.round(value) })
        }
        data[data.length - 1].value = userValue
        return data
    }, [userValue])

    // Calculate percentile
    const percentile = useMemo(() => {
        if (userValue >= comparisonValue) {
            return Math.min(99, Math.round(50 + (userValue - comparisonValue) * 2))
        }
        return Math.max(1, Math.round(50 - (comparisonValue - userValue) * 2))
    }, [userValue, comparisonValue])

    const isAhead = userValue >= comparisonValue
    const difference = Math.abs(userValue - comparisonValue)

    const comparisonLabel = {
        friends: t('friends'),
        country: t('national'),
        world: t('world'),
    }[comparisonType]

    const maxHistValue = Math.max(...historyData.map(h => h.value))

    return (
        <Modal isOpen={isOpen} onClose={onClose} id="ranking-detail-modal" title={category}>
            {/* Header with icon and rank */}
            <div className="flex items-center gap-4 mb-6">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `${iconColor}15` }}
                >
                    <i className={`${icon} text-xl`} style={{ color: iconColor }} />
                </div>
                <div className="flex-1">
                    <div className="text-2xl font-light text-display" style={{ color: iconColor }}>
                        {displayValue}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {t('yourStats')}
                    </div>
                </div>
                <div
                    className="px-4 py-2 rounded-xl text-sm font-medium"
                    style={{
                        background: isAhead ? 'rgba(139, 168, 136, 0.15)' : 'rgba(212, 165, 165, 0.15)',
                        color: isAhead ? 'var(--accent-sage)' : 'var(--accent-rose)',
                    }}
                >
                    <i className={`fa-solid fa-arrow-${isAhead ? 'up' : 'down'} mr-1`} />
                    Top {percentile}%
                </div>
            </div>

            {/* Comparison section */}
            <div
                className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                {t('ranking')} vs {comparisonLabel}
            </div>

            <div
                className="rounded-2xl p-4 mb-5"
                style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid var(--border-light)',
                }}
            >
                {/* Visual comparison bars */}
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: 'var(--text-primary)' }}>{t('you')}</span>
                            <span style={{ color: iconColor }}>{userValue}%</span>
                        </div>
                        <div className="h-3 rounded-full" style={{ background: 'rgba(0, 0, 0, 0.04)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${userValue}%`, background: iconColor }}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: 'var(--text-tertiary)' }}>{comparisonLabel} avg</span>
                            <span style={{ color: 'var(--text-muted)' }}>{comparisonValue}%</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: 'rgba(0, 0, 0, 0.04)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-700 opacity-40"
                                style={{ width: `${comparisonValue}%`, background: 'var(--text-secondary)' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Difference indicator */}
                <div
                    className="mt-4 pt-4 flex items-center justify-center gap-2"
                    style={{ borderTop: '1px solid var(--border-light)' }}
                >
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {isAhead ? 'You are' : 'Behind by'}
                    </span>
                    <span
                        className="text-sm font-medium"
                        style={{ color: isAhead ? 'var(--accent-sage)' : 'var(--accent-rose)' }}
                    >
                        {isAhead ? `+${difference}% ahead` : `${difference}%`}
                    </span>
                </div>
            </div>

            {/* Historical trend */}
            <div
                className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                8-Week Trend
            </div>

            <div
                className="rounded-2xl p-4 mb-5"
                style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid var(--border-light)',
                }}
            >
                <div className="h-24 flex items-end justify-between gap-1.5">
                    {historyData.map((point, idx) => {
                        const isLast = idx === historyData.length - 1
                        const height = (point.value / maxHistValue) * 100

                        return (
                            <div key={point.week} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                    className="w-full rounded-t transition-all duration-500"
                                    style={{
                                        height: `${height}%`,
                                        background: isLast ? iconColor : 'rgba(0, 0, 0, 0.08)',
                                        minHeight: '4px',
                                    }}
                                />
                                <span
                                    className="text-[8px]"
                                    style={{ color: isLast ? iconColor : 'var(--text-muted)' }}
                                >
                                    {point.week}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Distribution curve */}
            <div
                className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                {comparisonLabel} Distribution
            </div>

            <div
                className="rounded-2xl p-4 mb-5 relative"
                style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid var(--border-light)',
                }}
            >
                {/* Bell curve SVG */}
                <svg viewBox="0 0 200 60" className="w-full h-16">
                    <defs>
                        <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={iconColor} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={iconColor} stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                    {/* Bell curve path */}
                    <path
                        d="M 0 55 Q 50 55, 70 45 Q 90 30, 100 15 Q 110 30, 130 45 Q 150 55, 200 55"
                        fill="url(#curveGradient)"
                        stroke={iconColor}
                        strokeWidth="1.5"
                        strokeOpacity="0.5"
                    />
                    {/* User position marker */}
                    <circle
                        cx={percentile * 2}
                        cy={percentile > 50 ? 25 : 45}
                        r="5"
                        fill={iconColor}
                    />
                    <line
                        x1={percentile * 2}
                        y1={percentile > 50 ? 30 : 50}
                        x2={percentile * 2}
                        y2="55"
                        stroke={iconColor}
                        strokeWidth="1.5"
                        strokeDasharray="3,2"
                    />
                </svg>
                <div className="flex justify-between text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                </div>
            </div>

            {/* Close button */}
            <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl text-sm font-medium transition-all"
                style={{
                    background: iconColor,
                    color: 'white',
                    boxShadow: `0 4px 12px ${iconColor}30`,
                }}
            >
                {t('close')}
            </button>
        </Modal>
    )
}
