'use client'

import { FriendCountryVisit } from '@/hooks/useTravelData'

interface FriendCountryCardProps {
    friend: FriendCountryVisit
    countryName?: string
    onClick?: () => void
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

export default function FriendCountryCard({ friend, countryName, onClick }: FriendCountryCardProps) {
    const hasPhoto = !!friend.trip_photo_url
    const visitYear = friend.last_visit_year || friend.first_visit_year

    return (
        <button
            onClick={onClick}
            className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden transition-all active:scale-95"
            style={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
        >
            {/* Background - Photo or gradient */}
            {hasPhoto ? (
                <img
                    src={friend.trip_photo_url}
                    alt={`${friend.full_name} - ${countryName}`}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : (
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(135deg, rgba(165, 196, 212, 0.3) 0%, rgba(139, 168, 136, 0.3) 100%)'
                    }}
                />
            )}

            {/* Overlay gradient */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)'
                }}
            />

            {/* Country flag badge */}
            <div
                className="absolute top-3 right-3 px-2 py-1 rounded-lg flex items-center gap-1.5"
                style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <span className="text-lg">{getFlagEmoji(friend.country_code)}</span>
                {visitYear && (
                    <span className="text-xs font-medium text-white opacity-80">
                        {visitYear}
                    </span>
                )}
            </div>

            {/* User info at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                        className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                        style={{
                            border: '2px solid rgba(255,255,255,0.3)'
                        }}
                    >
                        {friend.avatar_url ? (
                            <img
                                src={friend.avatar_url}
                                alt={friend.full_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-white text-sm font-medium"
                                style={{ background: 'rgba(165, 196, 212, 0.5)' }}
                            >
                                {friend.full_name?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>

                    {/* Name and username */}
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                            {friend.full_name}
                        </div>
                        <div className="text-xs text-white/60 truncate">
                            @{friend.username}
                        </div>
                    </div>
                </div>

                {/* Country name if provided */}
                {countryName && (
                    <div className="mt-2 text-xs text-white/50">
                        {countryName}
                    </div>
                )}
            </div>

            {/* No photo indicator */}
            {!hasPhoto && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                    <i className="fa-solid fa-image text-4xl text-white" />
                </div>
            )}
        </button>
    )
}
