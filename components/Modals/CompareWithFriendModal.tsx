'use client'

import { useState, useMemo } from 'react'
import Modal from './Modal'
import { Contact, ThomasMorel } from '@/data/mockData'
import { useLanguage } from '@/contexts/LanguageContext'

interface CompareWithFriendModalProps {
    isOpen: boolean
    onClose: () => void
    currentContact: Contact | null
    allContacts: Contact[]
}

// Mock user stats
const userStats = {
    finance: 75,
    sport: 90,
    sleep: 80,
    exploration: 85,
    connection: 80,
}

export default function CompareWithFriendModal({
    isOpen,
    onClose,
    currentContact,
    allContacts,
}: CompareWithFriendModalProps) {
    const { t } = useLanguage()
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(
        currentContact?.id || null
    )

    // Get selected friend data
    const selectedFriend = useMemo(() => {
        if (!selectedFriendId) return null
        const contact = allContacts.find(c => c.id === selectedFriendId)
        if (!contact) return null
        const fullContact = ThomasMorel.moduleE.contacts.find(c => c.id === selectedFriendId)
        return { contact, fullContact }
    }, [selectedFriendId, allContacts])

    // Generate mock friend stats based on their public stats
    const friendStats = useMemo(() => {
        if (!selectedFriend?.fullContact?.publicStats) {
            return { finance: 70, sport: 75, sleep: 72, exploration: 60, connection: 65 }
        }
        const ps = selectedFriend.fullContact.publicStats
        return {
            finance: Math.round(ps.globalPerformance * 0.85),
            sport: Math.round(ps.globalPerformance * 0.95),
            sleep: Math.round(ps.globalPerformance * 0.88),
            exploration: Math.min(100, ps.countriesVisited * 5),
            connection: Math.round(ps.globalPerformance * 0.75),
        }
    }, [selectedFriend])

    const categories = [
        { key: 'finance', icon: 'fa-solid fa-coins', color: 'var(--accent-gold)', labelKey: 'financeDimension' },
        { key: 'sport', icon: 'fa-solid fa-person-running', color: 'var(--accent-sage)', labelKey: 'sport' },
        { key: 'sleep', icon: 'fa-solid fa-moon', color: 'var(--accent-sky)', labelKey: 'sleep' },
        { key: 'exploration', icon: 'fa-solid fa-globe', color: 'var(--accent-lavender)', labelKey: 'exploration' },
        { key: 'connection', icon: 'fa-solid fa-link', color: 'var(--accent-rose)', labelKey: 'connection' },
    ]

    return (
        <Modal isOpen={isOpen} onClose={onClose} id="compare-friend-modal" title={t('compareStats')}>
            {/* Friend selector */}
            <div
                className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                {t('friends')}
            </div>

            <div
                className="rounded-2xl p-2 mb-5 overflow-x-auto"
                style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid var(--border-light)',
                }}
            >
                <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
                    {allContacts.slice(0, 6).map((contact) => (
                        <button
                            key={contact.id}
                            onClick={() => setSelectedFriendId(contact.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${selectedFriendId === contact.id ? 'ring-2 ring-yellow-500' : ''
                                }`}
                            style={{
                                background: selectedFriendId === contact.id ? 'rgba(201, 169, 98, 0.1)' : 'transparent',
                            }}
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                <img
                                    src={contact.avatar}
                                    alt={contact.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span
                                className="text-[10px] truncate max-w-[50px]"
                                style={{ color: selectedFriendId === contact.id ? 'var(--accent-gold)' : 'var(--text-tertiary)' }}
                            >
                                {contact.name.split(' ')[0]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Comparison header */}
            {selectedFriend && (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2" style={{ borderColor: 'var(--accent-gold)' }}>
                                <img src={ThomasMorel.identity.avatar} alt="You" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('you')}</span>
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>vs</div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{selectedFriend.contact.name.split(' ')[0]}</span>
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2" style={{ borderColor: 'var(--accent-lavender)' }}>
                                <img src={selectedFriend.contact.avatar} alt={selectedFriend.contact.name} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>

                    {/* Side by side comparison */}
                    <div className="space-y-4">
                        {categories.map((cat) => {
                            const myValue = userStats[cat.key as keyof typeof userStats]
                            const theirValue = friendStats[cat.key as keyof typeof friendStats]
                            const iWin = myValue > theirValue
                            const isDraw = myValue === theirValue

                            return (
                                <div key={cat.key} className="rounded-xl p-3" style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <i className={`${cat.icon} text-sm`} style={{ color: cat.color }} />
                                            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{t(cat.labelKey)}</span>
                                        </div>
                                        {!isDraw && (
                                            <span
                                                className="text-xs font-medium"
                                                style={{ color: iWin ? 'var(--accent-sage)' : 'var(--accent-rose)' }}
                                            >
                                                {iWin ? '+' : '-'}{Math.abs(myValue - theirValue)}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium w-10" style={{ color: cat.color }}>{myValue}%</span>
                                        <div className="flex-1 h-2 rounded-full relative" style={{ background: 'rgba(0, 0, 0, 0.04)' }}>
                                            {/* My bar (left) */}
                                            <div
                                                className="absolute left-0 top-0 h-full rounded-l-full transition-all duration-500"
                                                style={{
                                                    width: `${(myValue / (myValue + theirValue)) * 100}%`,
                                                    background: cat.color,
                                                }}
                                            />
                                            {/* Their bar (right) */}
                                            <div
                                                className="absolute right-0 top-0 h-full rounded-r-full transition-all duration-500 opacity-40"
                                                style={{
                                                    width: `${(theirValue / (myValue + theirValue)) * 100}%`,
                                                    background: 'var(--text-secondary)',
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium w-10 text-right" style={{ color: 'var(--text-muted)' }}>{theirValue}%</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Summary */}
                    <div
                        className="mt-5 p-4 rounded-2xl text-center"
                        style={{ background: 'rgba(139, 168, 136, 0.08)' }}
                    >
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {t('aheadIn')}{' '}
                            <span style={{ color: 'var(--accent-sage)', fontWeight: 500 }}>
                                {categories.filter(c => userStats[c.key as keyof typeof userStats] > friendStats[c.key as keyof typeof friendStats]).length}
                            </span>
                            {' '}{t('ofCategories')}
                        </span>
                    </div>
                </>
            )}

            {/* Close button */}
            <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl text-sm font-medium transition-all mt-5"
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
