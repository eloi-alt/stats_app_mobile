'use client'

import { useState, useEffect } from 'react'
import Modal from './Modal'
import { useLanguage } from '@/contexts/LanguageContext'

interface GoalSettingModalProps {
    isOpen: boolean
    onClose: () => void
    metricId: string
    metricLabel: string
    currentValue: number
    currentTarget: number
    unit: string
    color: string
    onSave: (metricId: string, newTarget: number) => void
}

export default function GoalSettingModal({
    isOpen,
    onClose,
    metricId,
    metricLabel,
    currentValue,
    currentTarget,
    unit,
    color,
    onSave,
}: GoalSettingModalProps) {
    const { t } = useLanguage()
    const [target, setTarget] = useState(currentTarget)

    // Reset target when modal opens with new metric
    useEffect(() => {
        setTarget(currentTarget)
    }, [currentTarget, metricId])

    const progressPercent = target > 0 ? Math.min((currentValue / target) * 100, 100) : 0

    const handleSave = () => {
        onSave(metricId, target)
        onClose()
    }

    // Get step and range based on metric type
    const getInputConfig = () => {
        switch (metricId.toLowerCase()) {
            case 'sleep':
                return { min: 4, max: 12, step: 0.5 }
            case 'activity':
                return { min: 30, max: 600, step: 15 }
            case 'steps':
                return { min: 1000, max: 20000, step: 500 }
            case 'weight':
                return { min: 40, max: 150, step: 0.5 }
            case 'hrv':
                return { min: 20, max: 100, step: 1 }
            case 'hydration':
                return { min: 0.5, max: 5, step: 0.1 }
            default:
                return { min: 0, max: 100, step: 1 }
        }
    }

    const config = getInputConfig()

    return (
        <Modal isOpen={isOpen} onClose={onClose} id="goal-setting-modal" title={t('setGoal')}>
            {/* Metric label */}
            <div className="text-center mb-6">
                <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                    style={{ background: `${color}15`, color }}
                >
                    <i className="fa-solid fa-bullseye" />
                    {metricLabel}
                </div>
            </div>

            {/* Current progress visualization */}
            <div
                className="rounded-2xl p-6 text-center mb-6"
                style={{ background: `${color}08` }}
            >
                <div className="relative inline-block mb-4">
                    {/* Progress ring */}
                    <svg width="140" height="140" className="transform -rotate-90">
                        <circle
                            cx="70"
                            cy="70"
                            r="60"
                            fill="none"
                            stroke="rgba(0, 0, 0, 0.04)"
                            strokeWidth="10"
                        />
                        <circle
                            cx="70"
                            cy="70"
                            r="60"
                            fill="none"
                            stroke={color}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${progressPercent * 3.77} 377`}
                            className="transition-all duration-500 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                            className="text-3xl font-light text-display"
                            style={{ color }}
                        >
                            {currentValue.toFixed(metricId === 'steps' ? 0 : 1)}
                        </span>
                        <span className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                            {t('current')}
                        </span>
                    </div>
                </div>

                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {Math.round(progressPercent)}% {t('ofGoal')}
                </div>
            </div>

            {/* Goal input section */}
            <div
                className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                {t('targetGoal')}
            </div>

            <div
                className="rounded-2xl p-4 mb-6"
                style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid var(--border-light)',
                }}
            >
                {/* Slider */}
                <div className="mb-4">
                    <input
                        type="range"
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        value={target}
                        onChange={(e) => setTarget(parseFloat(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, ${color} 0%, ${color} ${((target - config.min) / (config.max - config.min)) * 100}%, rgba(0,0,0,0.08) ${((target - config.min) / (config.max - config.min)) * 100}%, rgba(0,0,0,0.08) 100%)`,
                        }}
                    />
                </div>

                {/* Value display with manual input */}
                <div className="flex items-center justify-center gap-2">
                    <input
                        type="number"
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        value={target}
                        onChange={(e) => setTarget(Math.max(config.min, Math.min(config.max, parseFloat(e.target.value) || config.min)))}
                        className="w-24 px-3 py-2 rounded-xl text-center text-xl font-light text-display"
                        style={{
                            background: 'rgba(0, 0, 0, 0.03)',
                            border: '1px solid var(--border-light)',
                            color,
                        }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        {unit}
                    </span>
                </div>
            </div>

            {/* Quick presets */}
            <div className="flex gap-2 mb-6">
                {[0.8, 1, 1.2].map((multiplier) => (
                    <button
                        key={multiplier}
                        onClick={() => setTarget(Math.round(currentTarget * multiplier * (1 / config.step)) * config.step)}
                        className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                        style={{
                            background: target === Math.round(currentTarget * multiplier * (1 / config.step)) * config.step
                                ? `${color}20`
                                : 'rgba(0, 0, 0, 0.03)',
                            color: target === Math.round(currentTarget * multiplier * (1 / config.step)) * config.step
                                ? color
                                : 'var(--text-secondary)',
                            border: '1px solid var(--border-light)',
                        }}
                    >
                        {multiplier === 0.8 ? '-20%' : multiplier === 1 ? t('keep') : '+20%'}
                    </button>
                ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-medium transition-all"
                    style={{
                        background: 'rgba(0, 0, 0, 0.04)',
                        color: 'var(--text-secondary)',
                    }}
                >
                    {t('cancel')}
                </button>
                <button
                    onClick={handleSave}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-medium transition-all"
                    style={{
                        background: color,
                        color: 'white',
                        boxShadow: `0 4px 12px ${color}30`,
                    }}
                >
                    <i className="fa-solid fa-check mr-2" />
                    {t('save')}
                </button>
            </div>

            <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          cursor: pointer;
          border: 2px solid ${color};
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          cursor: pointer;
          border: 2px solid ${color};
        }
      `}</style>
        </Modal>
    )
}
