'use client'

import { useMemo } from 'react'

export type PublicCardCategory = 'physio' | 'social' | 'world' | 'career' | 'finance'

export interface PublicCardStats {
    physio?: {
        weight?: number
        height?: number
        bmi?: number
        age?: number
    }
    social?: {
        friendsCount?: number
        harmonyScore?: number
    }
    world?: {
        countriesVisited?: number
        tripsCount?: number
    }
    career?: {
        jobTitle?: string
        industry?: string
        experienceYears?: number
    }
    finance?: {
        netWorth?: number
        savingsRate?: number
    }
}

interface PublicCardDisplayProps {
    imageUrl: string
    category: PublicCardCategory
    stats: PublicCardStats
    userName: string
    username?: string
    avatarUrl?: string
    size?: 'small' | 'medium' | 'large'
    onClick?: () => void
}

const categoryConfig: Record<PublicCardCategory, { icon: string; label: string; color: string }> = {
    physio: { icon: 'fa-heart-pulse', label: 'Santé', color: '#8BA888' },
    social: { icon: 'fa-users', label: 'Social', color: '#D4A5A5' },
    world: { icon: 'fa-globe', label: 'Monde', color: '#A5C4D4' },
    career: { icon: 'fa-briefcase', label: 'Carrière', color: '#B8A5D4' },
    finance: { icon: 'fa-coins', label: 'Finance', color: '#C9A962' }
}

export default function PublicCardDisplay({
    imageUrl,
    category,
    stats,
    userName,
    username,
    avatarUrl,
    size = 'medium',
    onClick
}: PublicCardDisplayProps) {
    const config = categoryConfig[category]

    const sizeStyles = useMemo(() => {
        switch (size) {
            case 'small':
                return { width: '160px', height: '200px', padding: '12px' }
            case 'large':
                return { width: '320px', height: '400px', padding: '24px' }
            default:
                return { width: '240px', height: '300px', padding: '16px' }
        }
    }, [size])

    const renderPhysioStats = () => {
        const data = stats.physio
        if (!data) return null
        return (
            <div className="grid grid-cols-2 gap-2">
                {data.weight && (
                    <div className="text-center">
                        <div className="text-xl font-light">{data.weight}</div>
                        <div className="text-[10px] opacity-80">kg</div>
                    </div>
                )}
                {data.height && (
                    <div className="text-center">
                        <div className="text-xl font-light">{data.height}</div>
                        <div className="text-[10px] opacity-80">cm</div>
                    </div>
                )}
                {data.bmi && (
                    <div className="text-center">
                        <div className="text-xl font-light">{data.bmi.toFixed(1)}</div>
                        <div className="text-[10px] opacity-80">IMC</div>
                    </div>
                )}
                {data.age && (
                    <div className="text-center">
                        <div className="text-xl font-light">{data.age}</div>
                        <div className="text-[10px] opacity-80">ans</div>
                    </div>
                )}
            </div>
        )
    }

    const renderSocialStats = () => {
        const data = stats.social
        if (!data) return null
        return (
            <div className="grid grid-cols-2 gap-2">
                {data.friendsCount !== undefined && (
                    <div className="text-center">
                        <div className="text-xl font-light">{data.friendsCount}</div>
                        <div className="text-[10px] opacity-80">amis</div>
                    </div>
                )}
                {data.harmonyScore !== undefined && (
                    <div className="text-center">
                        <div className="text-xl font-light">{data.harmonyScore}%</div>
                        <div className="text-[10px] opacity-80">harmonie</div>
                    </div>
                )}
            </div>
        )
    }

    const renderWorldStats = () => {
        const data = stats.world
        if (!data) return null
        return (
            <div className="grid grid-cols-2 gap-2">
                {data.countriesVisited !== undefined && (
                    <div className="text-center">
                        <div className="text-xl font-light">{data.countriesVisited}</div>
                        <div className="text-[10px] opacity-80">pays</div>
                    </div>
                )}
                {data.tripsCount !== undefined && (
                    <div className="text-center">
                        <div className="text-xl font-light">{data.tripsCount}</div>
                        <div className="text-[10px] opacity-80">voyages</div>
                    </div>
                )}
            </div>
        )
    }

    const renderCareerStats = () => {
        const data = stats.career
        if (!data) return null
        return (
            <div className="space-y-1">
                {data.jobTitle && (
                    <div className="text-center">
                        <div className="text-sm font-medium truncate">{data.jobTitle}</div>
                    </div>
                )}
                {data.industry && (
                    <div className="text-center">
                        <div className="text-xs opacity-80 truncate">{data.industry}</div>
                    </div>
                )}
                {data.experienceYears !== undefined && (
                    <div className="text-center">
                        <div className="text-lg font-light">{data.experienceYears} ans</div>
                        <div className="text-[10px] opacity-80">d'expérience</div>
                    </div>
                )}
            </div>
        )
    }

    const renderFinanceStats = () => {
        const data = stats.finance
        if (!data) return null
        return (
            <div className="grid grid-cols-1 gap-2">
                {data.netWorth !== undefined && (
                    <div className="text-center">
                        <div className="text-xl font-light">
                            {data.netWorth >= 1000
                                ? `${(data.netWorth / 1000).toFixed(0)}k€`
                                : `${data.netWorth}€`
                            }
                        </div>
                        <div className="text-[10px] opacity-80">patrimoine</div>
                    </div>
                )}
                {data.savingsRate !== undefined && (
                    <div className="text-center">
                        <div className="text-xl font-light">{data.savingsRate}%</div>
                        <div className="text-[10px] opacity-80">épargne</div>
                    </div>
                )}
            </div>
        )
    }

    const renderStats = () => {
        switch (category) {
            case 'physio': return renderPhysioStats()
            case 'social': return renderSocialStats()
            case 'world': return renderWorldStats()
            case 'career': return renderCareerStats()
            case 'finance': return renderFinanceStats()
            default: return null
        }
    }

    return (
        <div
            className="relative rounded-3xl overflow-hidden cursor-pointer transition-transform active:scale-95"
            style={{
                width: sizeStyles.width,
                height: sizeStyles.height,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
            }}
            onClick={onClick}
        >
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${imageUrl})`,
                    filter: 'brightness(0.85)'
                }}
            />

            {/* Gradient Overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
                }}
            />

            {/* Category Badge */}
            <div
                className="absolute top-3 right-3 px-2.5 py-1 rounded-full flex items-center gap-1.5"
                style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                }}
            >
                <i className={`fa-solid ${config.icon}`} style={{ color: 'white', fontSize: '10px' }} />
                <span className="text-white text-[10px] font-medium">{config.label}</span>
            </div>

            {/* Content - Bottom */}
            <div
                className="absolute bottom-0 left-0 right-0 text-white"
                style={{ padding: sizeStyles.padding }}
            >
                {/* Stats Section */}
                <div
                    className="rounded-2xl p-3 mb-3"
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)'
                    }}
                >
                    {renderStats()}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-2">
                    {avatarUrl && (
                        <img
                            src={avatarUrl}
                            alt={userName}
                            className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{userName}</div>
                        {username && (
                            <div className="text-[10px] opacity-70 truncate">@{username}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
