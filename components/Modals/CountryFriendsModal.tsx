'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FriendCountryVisit, COUNTRY_NAMES } from '@/hooks/useTravelData'
import FriendCountryCard from '../Cards/FriendCountryCard'

interface CountryFriendsModalProps {
    isOpen: boolean
    onClose: () => void
    countryCode: string
    countryName: string
    getFriendsForCountry: (countryCode: string) => Promise<FriendCountryVisit[]>
}

// Get flag emoji from country code
const getFlagEmoji = (countryCode: string): string => {
    if (!countryCode) return '🏳️'
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}

export default function CountryFriendsModal({
    isOpen,
    onClose,
    countryCode,
    countryName,
    getFriendsForCountry
}: CountryFriendsModalProps) {
    const [friends, setFriends] = useState<FriendCountryVisit[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (isOpen && countryCode) {
            setIsLoading(true)
            getFriendsForCountry(countryCode)
                .then(setFriends)
                .finally(() => setIsLoading(false))
        }
    }, [isOpen, countryCode, getFriendsForCountry])

    if (!mounted || !isOpen) return null

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-end justify-center"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

            {/* Modal */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-h-[80vh] rounded-t-[32px] overflow-hidden"
                style={{
                    background: 'var(--bg-elevated)',
                    boxShadow: '0 -8px 40px rgba(0,0,0,0.2)'
                }}
            >
                {/* Drag handle */}
                <div className="w-10 h-1 rounded-full mx-auto mt-4 mb-2" style={{ background: 'var(--separator-color)' }} />

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{getFlagEmoji(countryCode)}</span>
                        <div>
                            <h2
                                className="text-lg font-light"
                                style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                            >
                                {countryName}
                            </h2>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                Amis qui ont visité ce pays
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: 'var(--hover-overlay)' }}
                    >
                        <i className="fa-solid fa-xmark text-sm" style={{ color: 'var(--text-tertiary)' }} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-5 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <i className="fa-solid fa-spinner fa-spin text-2xl" style={{ color: 'var(--text-tertiary)' }} />
                        </div>
                    ) : friends.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="fa-solid fa-users text-4xl mb-4 block" style={{ color: 'var(--text-tertiary)', opacity: 0.3 }} />
                            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                Aucun ami n'a visité ce pays
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                Invitez vos amis à rejoindre STATS !
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Friends count */}
                            <div className="mb-4 flex items-center gap-2">
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: 'var(--accent-sky)' }}
                                >
                                    {friends.length} ami{friends.length > 1 ? 's' : ''}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                    {friends.length > 1 ? 'ont' : 'a'} visité {countryName}
                                </span>
                            </div>

                            {/* Friends grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {friends.map((friend) => (
                                    <FriendCountryCard
                                        key={`${friend.user_id}-${friend.country_code}`}
                                        friend={friend}
                                        countryName={COUNTRY_NAMES[friend.country_code] || friend.country_code}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
