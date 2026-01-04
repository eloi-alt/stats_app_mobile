'use client'

import { useState } from 'react'
import Modal from './Modal'
import { ThomasMorel } from '@/data/mockData'
import { useLanguage } from '@/contexts/LanguageContext'

interface SkillEndorsementModalProps {
    isOpen: boolean
    onClose: () => void
    selectedSkill?: string
}

interface SkillData {
    name: string
    level: number
    endorsements: number
    verified: boolean
}

export default function SkillEndorsementModal({
    isOpen,
    onClose,
    selectedSkill,
}: SkillEndorsementModalProps) {
    const { t } = useLanguage()
    const skills = ThomasMorel.moduleC.career.skills
    const [activeSkill, setActiveSkill] = useState<string>(selectedSkill || skills[0])
    const [selfAssessment, setSelfAssessment] = useState(4)
    const [requestSent, setRequestSent] = useState(false)

    // Mock skill data with endorsements
    const getSkillData = (skillName: string): SkillData => {
        const index = skills.indexOf(skillName)
        return {
            name: skillName,
            level: 5 - (index % 3),
            endorsements: Math.max(0, 12 - index * 2),
            verified: index < 3,
        }
    }

    const skillData = getSkillData(activeSkill)

    // Mock contacts for endorsement requests
    const contacts = ThomasMorel.moduleE.contacts.slice(0, 4)

    const handleRequestEndorsement = () => {
        setRequestSent(true)
        setTimeout(() => setRequestSent(false), 2000)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} id="skill-endorsement-modal" title={t('skills')}>
            {/* Skill selector */}
            <div className="flex overflow-x-auto gap-2 pb-3 mb-4 -mx-2 px-2">
                {skills.map((skill) => {
                    const data = getSkillData(skill)
                    return (
                        <button
                            key={skill}
                            onClick={() => setActiveSkill(skill)}
                            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${activeSkill === skill ? 'ring-2 ring-purple-300' : ''
                                }`}
                            style={{
                                background: activeSkill === skill ? 'rgba(184, 165, 212, 0.15)' : 'rgba(0, 0, 0, 0.03)',
                                color: activeSkill === skill ? 'var(--accent-lavender)' : 'var(--text-secondary)',
                            }}
                        >
                            {skill}
                            {data.verified && (
                                <i className="fa-solid fa-check-circle text-[10px]" style={{ color: 'var(--accent-sage)' }} />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Skill detail */}
            <div
                className="rounded-2xl p-5 mb-5 text-center"
                style={{ background: 'rgba(184, 165, 212, 0.08)' }}
            >
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xl font-light" style={{ color: 'var(--accent-lavender)' }}>
                        {skillData.name}
                    </span>
                    {skillData.verified && (
                        <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-medium flex items-center gap-1"
                            style={{ background: 'rgba(139, 168, 136, 0.15)', color: 'var(--accent-sage)' }}
                        >
                            <i className="fa-solid fa-check" />
                            Verified
                        </span>
                    )}
                </div>
                <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <div
                            key={level}
                            className="w-6 h-2 rounded-full"
                            style={{
                                background: level <= skillData.level ? 'var(--accent-lavender)' : 'rgba(0, 0, 0, 0.06)',
                            }}
                        />
                    ))}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {skillData.endorsements} endorsements
                </div>
            </div>

            {/* Self-assessment */}
            <div
                className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                Self Assessment
            </div>
            <div className="mb-5">
                <div className="flex justify-between gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <button
                            key={level}
                            onClick={() => setSelfAssessment(level)}
                            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                            style={{
                                background: level <= selfAssessment ? 'var(--accent-lavender)' : 'rgba(0, 0, 0, 0.03)',
                                color: level <= selfAssessment ? 'white' : 'var(--text-muted)',
                            }}
                        >
                            {level}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Beginner</span>
                    <span>Expert</span>
                </div>
            </div>

            {/* Request endorsement */}
            <div
                className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                Request Endorsement
            </div>
            <div className="flex gap-2 mb-5">
                {contacts.map((contact) => (
                    <div key={contact.id} className="flex-1 text-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-1">
                            <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                            {contact.name.split(' ')[0]}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleRequestEndorsement}
                className="w-full py-3 rounded-2xl text-sm font-medium mb-5 transition-all"
                style={{
                    background: requestSent ? 'rgba(139, 168, 136, 0.15)' : 'rgba(184, 165, 212, 0.15)',
                    color: requestSent ? 'var(--accent-sage)' : 'var(--accent-lavender)',
                }}
            >
                {requestSent ? (
                    <>
                        <i className="fa-solid fa-check mr-2" />
                        Requests Sent!
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-paper-plane mr-2" />
                        Request Endorsement
                    </>
                )}
            </button>

            {/* Close button */}
            <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl text-sm font-medium"
                style={{
                    background: 'var(--accent-lavender)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(184, 165, 212, 0.3)',
                }}
            >
                {t('close')}
            </button>
        </Modal>
    )
}
