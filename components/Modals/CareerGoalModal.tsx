'use client'

import { useState, useMemo } from 'react'
import Modal from './Modal'
import { CareerInfo } from '@/data/mockData'
import { useLanguage } from '@/contexts/LanguageContext'

interface CareerGoalModalProps {
    isOpen: boolean
    onClose: () => void
    careerInfo: CareerInfo
    onSave: (newGoal: string, timeline: number) => void
}

const positionOptions = [
    'Senior Developer',
    'Lead Developer',
    'Tech Lead',
    'Engineering Manager',
    'Architect',
    'CTO',
    'VP of Engineering',
]

export default function CareerGoalModal({
    isOpen,
    onClose,
    careerInfo,
    onSave,
}: CareerGoalModalProps) {
    const { t } = useLanguage()
    const [selectedGoal, setSelectedGoal] = useState(careerInfo.aspiringPosition)
    const [timeline, setTimeline] = useState(3) // years

    // Calculate probability based on position and timeline
    const probability = useMemo(() => {
        const baseProb = careerInfo.probability
        const positionIndex = positionOptions.indexOf(selectedGoal)
        const currentIndex = positionOptions.indexOf(careerInfo.currentPosition)
        const difficulty = Math.max(0, positionIndex - currentIndex)
        const timeBonus = Math.min(20, timeline * 5)
        return Math.min(95, Math.max(10, baseProb - difficulty * 10 + timeBonus))
    }, [selectedGoal, timeline, careerInfo])

    // Generate milestones
    const milestones = useMemo(() => {
        const items = []
        const yearsPerMilestone = timeline / 3

        items.push({
            year: Math.round(yearsPerMilestone),
            title: 'Master current role',
            status: 'current',
        })
        items.push({
            year: Math.round(yearsPerMilestone * 2),
            title: `Develop: ${careerInfo.missingSkill}`,
            status: 'pending',
        })
        items.push({
            year: timeline,
            title: selectedGoal,
            status: 'goal',
        })
        return items
    }, [timeline, selectedGoal, careerInfo.missingSkill])

    const handleSave = () => {
        onSave(selectedGoal, timeline)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} id="career-goal-modal" title={t('careerGoal')}>
            {/* Current position */}
            <div
                className="rounded-2xl p-4 mb-5 text-center"
                style={{ background: 'rgba(201, 169, 98, 0.08)' }}
            >
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
                    {t('currentPosition')}
                </div>
                <div className="text-lg font-light" style={{ color: 'var(--accent-gold)' }}>
                    {careerInfo.currentPosition}
                </div>
            </div>

            {/* Target position selector */}
            <div
                className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                Target Position
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
                {positionOptions.map((position) => (
                    <button
                        key={position}
                        onClick={() => setSelectedGoal(position)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${selectedGoal === position ? 'ring-2 ring-offset-1 ring-green-400' : ''
                            }`}
                        style={{
                            background: selectedGoal === position ? 'rgba(139, 168, 136, 0.15)' : 'rgba(0, 0, 0, 0.03)',
                            color: selectedGoal === position ? 'var(--accent-sage)' : 'var(--text-secondary)',
                        }}
                    >
                        {position}
                    </button>
                ))}
            </div>

            {/* Timeline slider */}
            <div
                className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                Timeline: {timeline} year{timeline > 1 ? 's' : ''}
            </div>
            <div className="px-2 mb-5">
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={timeline}
                    onChange={(e) => setTimeline(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, var(--accent-sage) ${timeline * 10}%, rgba(0,0,0,0.1) ${timeline * 10}%)`,
                    }}
                />
                <div className="flex justify-between text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    <span>1 yr</span>
                    <span>5 yrs</span>
                    <span>10 yrs</span>
                </div>
            </div>

            {/* Probability indicator */}
            <div
                className="rounded-2xl p-4 mb-5 text-center"
                style={{ background: 'rgba(139, 168, 136, 0.08)' }}
            >
                <div className="text-3xl font-light mb-1" style={{ color: 'var(--accent-sage)' }}>
                    {probability}%
                </div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {t('probability')}
                </div>
            </div>

            {/* Roadmap milestones */}
            <div
                className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                Roadmap
            </div>
            <div className="relative pl-6 mb-5">
                <div
                    className="absolute left-2 top-2 bottom-2 w-0.5"
                    style={{ background: 'var(--border-subtle)' }}
                />
                {milestones.map((milestone, idx) => (
                    <div key={idx} className="relative pb-4 last:pb-0">
                        <div
                            className="absolute -left-4 w-3 h-3 rounded-full border-2"
                            style={{
                                background: milestone.status === 'goal' ? 'var(--accent-sage)' : 'white',
                                borderColor: milestone.status === 'current' ? 'var(--accent-gold)' : 'var(--accent-sage)',
                            }}
                        />
                        <div className="ml-2">
                            <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                {milestone.title}
                            </div>
                            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                Year {milestone.year}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-2xl text-sm font-medium"
                    style={{ background: 'rgba(0, 0, 0, 0.04)', color: 'var(--text-secondary)' }}
                >
                    {t('cancel')}
                </button>
                <button
                    onClick={handleSave}
                    className="flex-1 py-3 rounded-2xl text-sm font-medium"
                    style={{
                        background: 'var(--accent-sage)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(139, 168, 136, 0.3)',
                    }}
                >
                    {t('save')}
                </button>
            </div>
        </Modal>
    )
}
