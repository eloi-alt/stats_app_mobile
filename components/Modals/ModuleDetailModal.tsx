'use client'

import { useMemo } from 'react'
import BottomSheet from '../UI/BottomSheet'
import ModuleChart from '../Cards/ModuleChart'
import LogarithmicHistoryChart from '../Charts/LogarithmicHistoryChart'
import { useLanguage } from '@/contexts/LanguageContext'

interface ModuleDetailModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    value: string
    subtitle: string
    color: string
    moduleId: string
    historyData: number[]
    weekLabels: string[]
    averages: {
        friends: number
        national: number
        worldwide: number
    }
}

export default function ModuleDetailModal({
    isOpen,
    onClose,
    title,
    value,
    subtitle,
    color,
    moduleId,
    historyData,
    weekLabels,
    averages
}: ModuleDetailModalProps) {
    const { t } = useLanguage()

    // Calculate trend
    const trend = historyData.length >= 2
        ? historyData[historyData.length - 1] - historyData[historyData.length - 2]
        : 0

    // Calculate week-over-week changes
    const weekChanges = useMemo(() => {
        return historyData.slice(1).map((val, i) => ({
            week: weekLabels[i + 1] || `S${i + 2}`,
            value: val,
            change: val - historyData[i]
        }))
    }, [historyData, weekLabels])

    // Stats calculations
    const stats = useMemo(() => ({
        max: Math.max(...historyData),
        min: Math.min(...historyData),
        avg: Math.round(historyData.reduce((a, b) => a + b, 0) / historyData.length)
    }), [historyData])

    // Get module icon
    const getModuleIcon = () => {
        switch (moduleId) {
            case 'A': return 'fa-heart-pulse'
            case 'B': return 'fa-globe'
            case 'C': return 'fa-chart-line'
            case 'D': return 'fa-trophy'
            case 'E': return 'fa-users'
            default: return 'fa-chart-simple'
        }
    }

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            initialHeight="75vh"
            maxHeight="92vh"
            showCloseButton={true}
        >
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                        background: `${color}20`,
                        border: `1px solid ${color}30`
                    }}
                >
                    <i className={`fa-solid ${getModuleIcon()} text-lg`} style={{ color }} />
                </div>
                <div className="flex-1">
                    <h2
                        className="text-xl font-light text-display mb-0.5"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {title}
                    </h2>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {subtitle}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-light text-display" style={{ color }}>
                        {value}
                    </div>
                    {trend !== 0 && (
                        <div
                            className="text-[10px] font-medium mt-0.5 flex items-center justify-end gap-1"
                            style={{ color: trend > 0 ? 'var(--accent-sage)' : 'var(--accent-rose)' }}
                        >
                            <i className={`fa-solid ${trend > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} text-[8px]`} />
                            {trend > 0 ? '+' : ''}{trend}%
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chart */}
            <div
                className="rounded-2xl p-4 mb-5"
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                }}
            >
                <div className="flex items-center justify-between mb-2">
                    <span
                        className="text-[9px] uppercase tracking-[0.15em] font-medium"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        {t('weeklyEvolution') || 'Évolution'}
                    </span>
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        {historyData.length} {t('weeks') || 'sem.'}
                    </span>
                </div>

                <div style={{ height: '220px' }}>
                    <LogarithmicHistoryChart
                        data={historyData}
                        color={color}
                        height={220}
                        weekLabels={weekLabels}
                        scale="log"
                        showAverages={true}
                    />
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-3 mt-3 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-0.5 rounded-full" style={{ background: color }} />
                        <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Vous</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-0.5 rounded-full" style={{ background: 'rgba(212, 165, 165, 0.7)' }} />
                        <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Amis {averages.friends}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-0.5 rounded-full" style={{ background: 'rgba(165, 196, 212, 0.7)' }} />
                        <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Global {averages.worldwide}%</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="rounded-xl p-3 text-center" style={{ background: `${color}10` }}>
                    <div className="text-base font-medium" style={{ color }}>{stats.max}%</div>
                    <div className="text-[8px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--text-muted)' }}>Max</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                    <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{stats.avg}%</div>
                    <div className="text-[8px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--text-muted)' }}>Moy.</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                    <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{stats.min}%</div>
                    <div className="text-[8px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--text-muted)' }}>Min</div>
                </div>
            </div>

            {/* Week by week breakdown */}
            <div className="mb-5">
                <div
                    className="text-[9px] uppercase tracking-[0.15em] font-medium mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                >
                    Historique récent
                </div>
                <div className="space-y-1.5">
                    {weekChanges.slice(-4).reverse().map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-2.5 rounded-xl"
                            style={{ background: 'rgba(0, 0, 0, 0.02)' }}
                        >
                            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                {item.week}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                                    {item.value}%
                                </span>
                                <span
                                    className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                                    style={{
                                        background: item.change >= 0
                                            ? 'rgba(139, 168, 136, 0.15)'
                                            : 'rgba(212, 165, 165, 0.15)',
                                        color: item.change >= 0 ? 'var(--accent-sage)' : 'var(--accent-rose)'
                                    }}
                                >
                                    {item.change >= 0 ? '+' : ''}{item.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Comparison bars */}
            <div
                className="rounded-xl p-4"
                style={{ background: 'rgba(0, 0, 0, 0.02)', border: '1px solid var(--border-subtle)' }}
            >
                <div
                    className="text-[9px] uppercase tracking-[0.15em] font-medium mb-3"
                    style={{ color: 'var(--text-tertiary)' }}
                >
                    Comparaison
                </div>

                {[
                    { label: 'vs Amis', avg: averages.friends },
                    { label: 'vs National', avg: averages.national },
                    { label: 'vs Mondial', avg: averages.worldwide },
                ].map((item, index) => {
                    const currentValue = historyData[historyData.length - 1] || 0
                    const diff = currentValue - item.avg
                    return (
                        <div key={index} className="mb-2.5 last:mb-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                <span
                                    className="text-[10px] font-medium"
                                    style={{ color: diff >= 0 ? 'var(--accent-sage)' : 'var(--accent-rose)' }}
                                >
                                    {diff >= 0 ? '+' : ''}{diff}%
                                </span>
                            </div>
                            <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
                                <div
                                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${item.avg}%`,
                                        background: 'rgba(0, 0, 0, 0.08)'
                                    }}
                                />
                                <div
                                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${currentValue}%`,
                                        background: `linear-gradient(90deg, ${color}, ${color}88)`
                                    }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Bottom spacing */}
            <div className="h-4" />
        </BottomSheet>
    )
}
