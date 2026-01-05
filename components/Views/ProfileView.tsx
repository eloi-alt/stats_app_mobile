'use client'

import { useState, useRef } from 'react'
import Navbar from '../Navbar'
import BottomSheet from '../UI/BottomSheet'
import { ThomasMorel } from '@/data/mockData'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProfileViewProps {
    onOpenSettings: () => void
    onNavigate?: (viewId: string) => void
    onBack?: () => void
}

export default function ProfileView({ onOpenSettings, onNavigate, onBack }: ProfileViewProps) {
    const { t } = useLanguage()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [showQRSheet, setShowQRSheet] = useState(false)

    const user = ThomasMorel.identity
    const performance = ThomasMorel.performance

    // Generate QR code URL for profile
    const profileUrl = `https://statsapp.com/profile/${user.id}`
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`

    // Module colors for the radial chart
    const moduleColors = {
        A: '#8BA888', // Health
        B: '#A5C4D4', // World
        C: '#C9A962', // Finance
        D: '#B8A5D4', // Career
        E: '#D4A5A5', // Social
    }

    // Calculate radial chart segments
    const createRadialPath = (index: number, total: number, value: number, radius: number) => {
        const angle = (360 / total) * index - 90
        const endAngle = angle + (360 / total) * 0.85
        const startRad = (angle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180
        const innerRadius = radius * 0.6
        const outerRadius = radius * (0.6 + (value / 100) * 0.4)

        const x1 = 100 + Math.cos(startRad) * innerRadius
        const y1 = 100 + Math.sin(startRad) * innerRadius
        const x2 = 100 + Math.cos(startRad) * outerRadius
        const y2 = 100 + Math.sin(startRad) * outerRadius
        const x3 = 100 + Math.cos(endRad) * outerRadius
        const y3 = 100 + Math.sin(endRad) * outerRadius
        const x4 = 100 + Math.cos(endRad) * innerRadius
        const y4 = 100 + Math.sin(endRad) * innerRadius

        return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}`
    }

    return (
        <div ref={scrollContainerRef} className="px-4 pb-6">
            {/* Settings button - top right */}
            <div className="flex justify-end py-2">
                <button
                    onClick={onOpenSettings}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
                    style={{ background: 'var(--glass-bg)' }}
                >
                    <i className="fa-solid fa-gear text-sm" style={{ color: 'var(--text-secondary)' }} />
                </button>
            </div>

            {/* Hero Profile Section - Visual Focus */}
            <div className="relative mb-8">
                {/* Radial Performance Chart - Background */}
                <div className="flex justify-center items-center" style={{ height: '280px' }}>
                    <svg width="200" height="200" viewBox="0 0 200 200" className="absolute">
                        {/* Background circles */}
                        <circle cx="100" cy="100" r="80" fill="none" stroke="var(--border-subtle)" strokeWidth="1" opacity="0.3" />
                        <circle cx="100" cy="100" r="60" fill="none" stroke="var(--border-subtle)" strokeWidth="1" opacity="0.2" />

                        {/* Performance segments */}
                        {Object.entries(performance.byModule).map(([key, value], index) => (
                            <path
                                key={key}
                                d={createRadialPath(index, 5, value, 80)}
                                fill={moduleColors[key as keyof typeof moduleColors]}
                                opacity="0.7"
                                style={{ transition: 'all 0.5s ease' }}
                            />
                        ))}

                        {/* Center ring glow */}
                        <circle
                            cx="100"
                            cy="100"
                            r="48"
                            fill="url(#centerGlow)"
                        />
                        <defs>
                            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="var(--bg-primary)" />
                                <stop offset="70%" stopColor="var(--bg-primary)" />
                                <stop offset="100%" stopColor="transparent" />
                            </radialGradient>
                        </defs>
                    </svg>

                    {/* Avatar - Center */}
                    <div className="relative z-10">
                        <div
                            className="rounded-full overflow-hidden border-4"
                            style={{
                                width: '100px',
                                height: '100px',
                                borderColor: 'var(--bg-primary)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                            }}
                        >
                            <img
                                src={user.avatar}
                                className="w-full h-full object-cover"
                                alt="Profile"
                            />
                        </div>
                        {user.isVerified && (
                            <div
                                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, var(--accent-gold) 0%, #D4C4A8 100%)',
                                    boxShadow: '0 3px 12px rgba(201, 169, 98, 0.5)',
                                    border: '2px solid var(--bg-primary)',
                                }}
                            >
                                <i className="fa-solid fa-check text-white text-[10px]" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Name & Bio */}
                <div className="text-center -mt-4">
                    <h1
                        className="text-2xl font-light text-display mb-1"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {user.displayName}
                    </h1>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {ThomasMorel.identity.bio}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t('memberSince')} {new Date(user.joinedDate).getFullYear()}
                    </p>
                </div>
            </div>

            {/* Overall Score - Big Visual */}
            <div
                className="mx-auto mb-8 text-center py-6 px-8 rounded-3xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.1) 0%, rgba(184, 165, 212, 0.1) 100%)',
                    maxWidth: '280px'
                }}
            >
                <div
                    className="text-6xl font-extralight text-display mb-1"
                    style={{ color: 'var(--accent-gold)' }}
                >
                    {performance.overall}
                </div>
                <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Harmony Score
                </div>
            </div>

            {/* Module Legend - Horizontal */}
            <div className="flex justify-center gap-4 mb-8 flex-wrap px-4">
                {Object.entries(performance.byModule).map(([key, value]) => {
                    const names: Record<string, string> = { A: 'Santé', B: 'Monde', C: 'Finance', D: 'Carrière', E: 'Social' }
                    return (
                        <div key={key} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ background: moduleColors[key as keyof typeof moduleColors] }}
                            />
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {names[key]} <span style={{ color: 'var(--text-muted)' }}>{value}%</span>
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Action Buttons - Clean Row */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setShowQRSheet(true)}
                    className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-light)'
                    }}
                >
                    <i className="fa-solid fa-qrcode" style={{ color: 'var(--accent-gold)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>QR</span>
                </button>
                <button
                    className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-light)'
                    }}
                >
                    <i className="fa-solid fa-share-nodes" style={{ color: 'var(--accent-lavender)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('share')}</span>
                </button>
                <button
                    className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-light)'
                    }}
                >
                    <i className="fa-solid fa-pen" style={{ color: 'var(--accent-sage)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('edit')}</span>
                </button>
            </div>

            <div className="h-20" />

            {/* QR Code Bottom Sheet */}
            <BottomSheet
                isOpen={showQRSheet}
                onClose={() => setShowQRSheet(false)}
                initialHeight="55vh"
                maxHeight="65vh"
                showCloseButton={true}
            >
                <div className="text-center px-4">
                    <h3 className="text-lg font-light text-display mb-2" style={{ color: 'var(--text-primary)' }}>
                        {t('shareProfile')}
                    </h3>

                    <div
                        className="inline-block p-5 rounded-3xl mb-5"
                        style={{
                            background: 'white',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <img src={qrCodeUrl} alt="Profile QR Code" className="w-44 h-44" style={{ imageRendering: 'crisp-edges' }} />
                    </div>

                    <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        {user.displayName}
                    </p>
                    <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
                        {t('scanToView')}
                    </p>

                    <button
                        className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                        style={{
                            background: 'var(--text-primary)',
                        }}
                    >
                        <i className="fa-solid fa-share-nodes" style={{ color: 'var(--bg-primary)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--bg-primary)' }}>{t('share')}</span>
                    </button>
                </div>
            </BottomSheet>
        </div>
    )
}
