'use client'

import { useState, useMemo } from 'react'
import Modal from './Modal'
import { ThomasMorel } from '@/data/mockData'
import { useLanguage } from '@/contexts/LanguageContext'

interface FinancialProjectionsModalProps {
    isOpen: boolean
    onClose: () => void
}

interface FinancialGoal {
    id: string
    name: string
    icon: string
    target: number
    current: number
    color: string
}

export default function FinancialProjectionsModal({
    isOpen,
    onClose,
}: FinancialProjectionsModalProps) {
    const { t } = useLanguage()
    const [projectionYears, setProjectionYears] = useState(5)
    const [annualGrowth, setAnnualGrowth] = useState(5)
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null)

    const currentIncome = ThomasMorel.moduleC.revenus.totalNetAnnual
    const currentSavings = ThomasMorel.moduleC.revenus.totalGrossAnnual * 0.2 // Assume 20% savings

    // Financial goals
    const goals: FinancialGoal[] = [
        { id: 'house', name: 'House Down Payment', icon: 'fa-solid fa-house', target: 80000, current: 35000, color: 'var(--accent-gold)' },
        { id: 'emergency', name: 'Emergency Fund', icon: 'fa-solid fa-shield', target: 30000, current: 22000, color: 'var(--accent-sage)' },
        { id: 'retirement', name: 'Retirement', icon: 'fa-solid fa-umbrella-beach', target: 500000, current: 45000, color: 'var(--accent-sky)' },
        { id: 'travel', name: 'Travel Fund', icon: 'fa-solid fa-plane', target: 10000, current: 6500, color: 'var(--accent-lavender)' },
    ]

    // Calculate projections
    const projections = useMemo(() => {
        const data = []
        let current = currentSavings
        for (let year = 0; year <= projectionYears; year++) {
            data.push({
                year: new Date().getFullYear() + year,
                amount: Math.round(current),
            })
            current = current * (1 + annualGrowth / 100) + currentIncome * 0.15 // Add 15% of income as savings
        }
        return data
    }, [projectionYears, annualGrowth, currentIncome, currentSavings])

    // Generate chart points
    const chartPoints = useMemo(() => {
        if (projections.length < 2) return ''
        const maxAmount = Math.max(...projections.map(p => p.amount))
        const width = 280
        const height = 100
        const points = projections.map((p, i) => {
            const x = (i / (projections.length - 1)) * width
            const y = height - (p.amount / maxAmount) * height
            return `${x},${y}`
        })
        return points.join(' ')
    }, [projections])

    return (
        <Modal isOpen={isOpen} onClose={onClose} id="financial-projections-modal" title={t('financialOverview')}>
            {/* Current status */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(201, 169, 98, 0.08)' }}>
                    <div className="text-xl font-light" style={{ color: 'var(--accent-gold)' }}>
                        {Math.round(currentIncome / 1000)}k€
                    </div>
                    <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Net Income
                    </div>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(139, 168, 136, 0.08)' }}>
                    <div className="text-xl font-light" style={{ color: 'var(--accent-sage)' }}>
                        {Math.round(currentSavings / 1000)}k€
                    </div>
                    <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Savings
                    </div>
                </div>
            </div>

            {/* Projection chart */}
            <div
                className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                Savings Projection
            </div>
            <div
                className="rounded-2xl p-4 mb-4"
                style={{ background: 'rgba(0, 0, 0, 0.02)' }}
            >
                <svg viewBox="0 0 280 100" className="w-full h-24">
                    <defs>
                        <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-sage)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--accent-sage)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {chartPoints && (
                        <>
                            <polygon
                                points={`0,100 ${chartPoints} 280,100`}
                                fill="url(#projGrad)"
                            />
                            <polyline
                                points={chartPoints}
                                fill="none"
                                stroke="var(--accent-sage)"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            {projections.map((p, i) => {
                                const x = (i / (projections.length - 1)) * 280
                                const maxAmount = Math.max(...projections.map(pr => pr.amount))
                                const y = 100 - (p.amount / maxAmount) * 100
                                return (
                                    <circle
                                        key={i}
                                        cx={x}
                                        cy={y}
                                        r="4"
                                        fill="white"
                                        stroke="var(--accent-sage)"
                                        strokeWidth="2"
                                    />
                                )
                            })}
                        </>
                    )}
                </svg>
                <div className="flex justify-between text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
                    <span>{projections[0]?.year}</span>
                    <span className="font-medium" style={{ color: 'var(--accent-sage)' }}>
                        {Math.round(projections[projections.length - 1]?.amount / 1000)}k€
                    </span>
                    <span>{projections[projections.length - 1]?.year}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                    <div className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                        Years: {projectionYears}
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={projectionYears}
                        onChange={(e) => setProjectionYears(Number(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, var(--accent-sage) ${projectionYears * 5}%, rgba(0,0,0,0.1) ${projectionYears * 5}%)`,
                        }}
                    />
                </div>
                <div>
                    <div className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                        Growth: {annualGrowth}%
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="15"
                        value={annualGrowth}
                        onChange={(e) => setAnnualGrowth(Number(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, var(--accent-gold) ${annualGrowth * 6.67}%, rgba(0,0,0,0.1) ${annualGrowth * 6.67}%)`,
                        }}
                    />
                </div>
            </div>

            {/* Financial goals */}
            <div
                className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                Goals
            </div>
            <div className="space-y-2 mb-5">
                {goals.map((goal) => {
                    const progress = (goal.current / goal.target) * 100
                    return (
                        <button
                            key={goal.id}
                            onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
                            className="w-full rounded-xl p-3 text-left transition-all"
                            style={{
                                background: selectedGoal === goal.id ? `${goal.color}10` : 'rgba(0, 0, 0, 0.02)',
                                border: selectedGoal === goal.id ? `1px solid ${goal.color}30` : '1px solid transparent',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: `${goal.color}15` }}
                                >
                                    <i className={goal.icon} style={{ color: goal.color, fontSize: '12px' }} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {goal.name}
                                    </div>
                                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                        {Math.round(goal.current / 1000)}k / {Math.round(goal.target / 1000)}k€
                                    </div>
                                </div>
                                <span className="text-xs font-medium" style={{ color: goal.color }}>
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full mt-2" style={{ background: 'rgba(0, 0, 0, 0.04)' }}>
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${Math.min(100, progress)}%`, background: goal.color }}
                                />
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Close button */}
            <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl text-sm font-medium"
                style={{
                    background: 'var(--accent-gold)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(201, 169, 98, 0.3)',
                }}
            >
                {t('close')}
            </button>
        </Modal>
    )
}
