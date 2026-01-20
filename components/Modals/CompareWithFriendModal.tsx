'use client'

import { useState, useMemo, useCallback } from 'react'
import Modal from './Modal'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFriendContextOptional } from '@/contexts/FriendContext'
import { Friendship } from '@/hooks/useFriendRequests'

// Props for flexibility - can be used standalone or from context
interface CompareWithFriendModalProps {
    isOpen: boolean
    onClose: () => void
    // Optional: specific friend to compare with (pre-selected)
    initialFriendId?: string
    // Optional: category to focus on
    focusCategory?: 'finance' | 'physio' | 'world' | 'career' | 'social' | 'all'
}

interface FriendStats {
    finance: number
    sport: number
    sleep: number
    exploration: number
    connection: number
}

export default function CompareWithFriendModal({
    isOpen,
    onClose,
    initialFriendId,
    focusCategory = 'all',
}: CompareWithFriendModalProps) {
    const { t } = useLanguage()
    const friendContext = useFriendContextOptional()

    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(
        initialFriendId || null
    )

    // Get friends from context
    const friends = friendContext?.friends || []

    // Current user stats (would come from user context/data in production)
    const userStats: FriendStats = useMemo(() => ({
        finance: 75,
        sport: 90,
        sleep: 80,
        exploration: 85,
        connection: 80,
    }), [])

    // Generate mock friend stats (in production, these would come from friend's data)
    const friendStats = useMemo((): FriendStats => {
        if (!selectedFriendId) {
            return { finance: 0, sport: 0, sleep: 0, exploration: 0, connection: 0 }
        }
        // Generate pseudo-random but consistent stats based on friendId
        const hash = selectedFriendId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        return {
            finance: 50 + (hash % 40),
            sport: 45 + ((hash * 2) % 45),
            sleep: 55 + ((hash * 3) % 35),
            exploration: 40 + ((hash * 4) % 50),
            connection: 60 + ((hash * 5) % 30),
        }
    }, [selectedFriendId])

    // Get selected friend data
    const selectedFriend = useMemo(() => {
        if (!selectedFriendId) return null
        return friends.find(f => f.friendId === selectedFriendId)
    }, [selectedFriendId, friends])

    // Handle clicking on friend avatar/name to open profile
    const handleOpenProfile = useCallback((friendId: string) => {
        if (friendContext?.openFriendProfile) {
            onClose() // Close comparison modal first
            // Small delay to allow modal to close smoothly
            setTimeout(() => {
                friendContext.openFriendProfile(friendId)
            }, 150)
        }
    }, [friendContext, onClose])

    // Category definitions
    const allCategories = useMemo(() => [
        { key: 'finance', icon: 'fa-solid fa-coins', color: 'var(--accent-gold)', labelKey: 'financeDimension', category: 'finance' },
        { key: 'sport', icon: 'fa-solid fa-person-running', color: 'var(--accent-sage)', labelKey: 'sport', category: 'physio' },
        { key: 'sleep', icon: 'fa-solid fa-moon', color: 'var(--accent-sky)', labelKey: 'sleep', category: 'physio' },
        { key: 'exploration', icon: 'fa-solid fa-globe', color: 'var(--accent-lavender)', labelKey: 'exploration', category: 'world' },
        { key: 'connection', icon: 'fa-solid fa-link', color: 'var(--accent-rose)', labelKey: 'connection', category: 'social' },
    ], [])

    // Filter categories based on focus
    const categories = useMemo(() => {
        if (focusCategory === 'all') return allCategories
        return allCategories.filter(c => c.category === focusCategory)
    }, [allCategories, focusCategory])

    // Can view category based on friend's privacy settings
    const canViewCategory = useCallback((category: string): boolean => {
        if (!selectedFriendId || !friendContext) return true // Default to visible if no context
        return friendContext.canViewFriendCategory(selectedFriendId, category as any)
    }, [selectedFriendId, friendContext])

    // Get friend display info
    const getFriendDisplay = (friend: Friendship) => {
        const firstName = friend.friendName?.split(' ')[0] ||
            friend.friendUsername ||
            'Ami'
        const avatar = friend.friendAvatarUrl || '/images/default-avatar.png'
        return { firstName, avatar }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} id="compare-friend-modal" title={t('compareStats')}>
            {/* Friend selector */}
            {friends.length > 0 ? (
                <>
                    <div
                        className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        {t('friends')}
                    </div>

                    <div
                        className="rounded-2xl p-2 mb-5 overflow-x-auto"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-light)',
                        }}
                    >
                        <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
                            {friends.slice(0, 8).map((friend) => {
                                const { firstName, avatar } = getFriendDisplay(friend)
                                const isSelected = selectedFriendId === friend.friendId

                                return (
                                    <button
                                        key={friend.friendId}
                                        onClick={() => setSelectedFriendId(friend.friendId)}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isSelected ? 'ring-2 ring-yellow-500' : ''
                                            }`}
                                        style={{
                                            background: isSelected ? 'rgba(201, 169, 98, 0.1)' : 'transparent',
                                        }}
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden">
                                            <img
                                                src={avatar}
                                                alt={firstName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/images/default-avatar.png'
                                                }}
                                            />
                                        </div>
                                        <span
                                            className="text-[10px] truncate max-w-[50px]"
                                            style={{ color: isSelected ? 'var(--accent-gold)' : 'var(--text-tertiary)' }}
                                        >
                                            {firstName}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
                    <i className="fa-solid fa-users text-4xl mb-3 block opacity-30" />
                    <p className="text-sm">{t('noFriendsYet') || 'Pas encore d\'amis'}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {t('addFriendsToCompare') || 'Ajoutez des amis pour comparer vos stats'}
                    </p>
                </div>
            )}

            {/* Comparison content */}
            {selectedFriend && (
                <>
                    {/* Header with clickable profiles */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-full overflow-hidden border-2"
                                style={{ borderColor: 'var(--accent-gold)' }}
                            >
                                <img
                                    src="/images/default-avatar.png"
                                    alt="You"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                {t('you')}
                            </span>
                        </div>

                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>vs</div>

                        {/* Friend - clickable to open profile */}
                        <button
                            onClick={() => handleOpenProfile(selectedFriend.friendId)}
                            className="flex items-center gap-2 p-1 rounded-lg transition-all hover:bg-black/5 active:scale-95"
                        >
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                {getFriendDisplay(selectedFriend).firstName}
                            </span>
                            <div
                                className="w-8 h-8 rounded-full overflow-hidden border-2"
                                style={{ borderColor: 'var(--accent-lavender)' }}
                            >
                                <img
                                    src={getFriendDisplay(selectedFriend).avatar}
                                    alt={getFriendDisplay(selectedFriend).firstName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/images/default-avatar.png'
                                    }}
                                />
                            </div>
                            <i className="fa-solid fa-chevron-right text-xs ml-1" style={{ color: 'var(--text-muted)' }} />
                        </button>
                    </div>

                    {/* Stats comparison */}
                    <div className="space-y-4">
                        {categories.map((cat) => {
                            const myValue = userStats[cat.key as keyof FriendStats]
                            const theirValue = friendStats[cat.key as keyof FriendStats]
                            const iWin = myValue > theirValue
                            const isDraw = myValue === theirValue
                            const isVisible = canViewCategory(cat.category)

                            if (!isVisible) {
                                return (
                                    <div
                                        key={cat.key}
                                        className="rounded-xl p-3"
                                        style={{ background: 'rgba(0, 0, 0, 0.02)' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <i className={`${cat.icon} text-sm opacity-30`} style={{ color: cat.color }} />
                                            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                                                {t(cat.labelKey)}
                                            </span>
                                            <i className="fa-solid fa-lock text-xs ml-auto" style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                            {t('dataPrivate') || 'Données privées'}
                                        </p>
                                    </div>
                                )
                            }

                            return (
                                <div key={cat.key} className="rounded-xl p-3" style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <i className={`${cat.icon} text-sm`} style={{ color: cat.color }} />
                                            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                                {t(cat.labelKey)}
                                            </span>
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
                                        <span className="text-sm font-medium w-10" style={{ color: cat.color }}>
                                            {myValue}%
                                        </span>
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
                                        <span className="text-sm font-medium w-10 text-right" style={{ color: 'var(--text-muted)' }}>
                                            {theirValue}%
                                        </span>
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
                                {categories.filter(c =>
                                    canViewCategory(c.category) &&
                                    userStats[c.key as keyof FriendStats] > friendStats[c.key as keyof FriendStats]
                                ).length}
                            </span>
                            {' '}{t('ofCategories')}
                        </span>
                    </div>

                    {/* View full profile button */}
                    <button
                        onClick={() => handleOpenProfile(selectedFriend.friendId)}
                        className="w-full py-3 rounded-2xl text-sm font-medium transition-all mt-4 flex items-center justify-center gap-2"
                        style={{
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-light)',
                        }}
                    >
                        <i className="fa-solid fa-user" />
                        {t('viewFullProfile') || 'Voir le profil complet'}
                    </button>
                </>
            )}

            {/* Close button */}
            <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl text-sm font-medium transition-all mt-4"
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
