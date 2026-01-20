'use client'

import { useState, useRef, useEffect } from 'react'
import BottomSheet from '../UI/BottomSheet'
import AvatarUploader from '../Onboarding/AvatarUploader'
import ProfileEditModal from '../Modals/ProfileEditModal'
import PublicCardCreatorModal from '../Modals/PublicCardCreatorModal'
import PublicCardDisplay, { PublicCardCategory } from '../Cards/PublicCardDisplay'
import { useLanguage } from '@/contexts/LanguageContext'
import { useVisitor } from '@/contexts/VisitorContext'
import { useProfileData } from '@/hooks/useProfileData'
import { useTravelData } from '@/hooks/useTravelData'
import { supabase } from '@/utils/supabase/client'
import { ThomasMorel } from '@/data/mockData'

interface ProfileViewProps {
    onOpenSettings: () => void
    onNavigate?: (viewId: string) => void
    onBack?: () => void
    userProfile?: {
        id?: string
        firstName: string
        lastName: string
        avatarUrl: string
        username?: string
        harmonyScore?: number
        joinedDate?: string
        dateOfBirth?: string
        gender?: string
        height?: number
        weight?: number
    }
    onAvatarUpdated?: (newUrl: string) => void
    onProfileUpdated?: (updatedData: any) => void
}

export default function ProfileView({ onOpenSettings, onNavigate, onBack, userProfile, onAvatarUpdated, onProfileUpdated }: ProfileViewProps) {
    const { t } = useLanguage()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [showQRSheet, setShowQRSheet] = useState(false)
    const [showAvatarSheet, setShowAvatarSheet] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showPublicCardModal, setShowPublicCardModal] = useState(false)
    const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null)
    const [localProfileData, setLocalProfileData] = useState<typeof userProfile | null>(null)
    const [existingPublicCard, setExistingPublicCard] = useState<{
        imageUrl: string
        category: PublicCardCategory
    } | null>(null)
    const { isVisitor } = useVisitor()
    const profileHookData = useProfileData()
    const travelData = useTravelData()

    // Load existing public card
    useEffect(() => {
        const loadPublicCard = async () => {
            if (isVisitor) {
                // Demo mode: load from localStorage
                const demoCard = localStorage.getItem('demoPublicCard')
                if (demoCard) {
                    const parsed = JSON.parse(demoCard)
                    setExistingPublicCard({
                        imageUrl: parsed.imageUrl,
                        category: parsed.category
                    })
                }
            } else if (userProfile?.id) {
                // Auth mode: load from Supabase
                const { data } = await supabase
                    .from('public_cards')
                    .select('image_url, category')
                    .eq('user_id', userProfile.id)
                    .single()

                if (data) {
                    setExistingPublicCard({
                        imageUrl: data.image_url,
                        category: data.category as PublicCardCategory
                    })
                }
            }
        }
        loadPublicCard()
    }, [userProfile?.id, isVisitor])

    // Use local data if available, otherwise use props
    const currentProfile = localProfileData || userProfile

    const displayName = currentProfile?.firstName && currentProfile?.lastName
        ? `${currentProfile.firstName} ${currentProfile.lastName}`
        : 'Utilisateur'
    const avatarUrl = localAvatarUrl || currentProfile?.avatarUrl || undefined
    const username = currentProfile?.username || ''
    const harmonyScore = currentProfile?.harmonyScore ?? 72
    const isVerified = false // Only verified after certain criteria
    const joinedYear = currentProfile?.joinedDate
        ? new Date(currentProfile.joinedDate).getFullYear()
        : new Date().getFullYear()

    // Module performance (to be replaced with real data later)
    const performance = {
        byModule: { A: 78, B: 65, C: 72, D: 68, E: 82 }
    }

    // Generate QR code URL for profile - use local generation instead of external API
    const profileUrl = `https://statsapp.com/profile/${username || 'user'}`

    // QR code state for local generation
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)

    // Generate QR code when sheet opens
    useEffect(() => {
        if (showQRSheet && !qrCodeDataUrl) {
            import('@/utils/qrcode').then(({ generateQRCode }) => {
                generateQRCode(profileUrl, 200).then(setQrCodeDataUrl).catch(console.error)
            })
        }
    }, [showQRSheet, profileUrl, qrCodeDataUrl])

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

                    {/* Avatar - Center - Clickable */}
                    <div className="relative z-10">
                        <div
                            className="rounded-full overflow-hidden border-4 cursor-pointer"
                            style={{
                                width: '100px',
                                height: '100px',
                                borderColor: 'var(--bg-primary)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                            }}
                            onClick={() => userProfile?.id && setShowAvatarSheet(true)}
                        >
                            <img
                                src={avatarUrl}
                                className="w-full h-full object-cover"
                                alt="Profile"
                            />
                            {/* Edit overlay */}
                            <div
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                style={{ borderRadius: '50%' }}
                            >
                                <i className="fa-solid fa-camera text-white text-xl" />
                            </div>
                        </div>
                        {isVerified && (
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
                        {displayName}
                    </h1>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        {username ? (
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                @{username}
                            </p>
                        ) : (
                            <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                                Pas de pseudo
                            </p>
                        )}
                        {userProfile?.id && (
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90"
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
                            >
                                <i className="fa-solid fa-pen text-[10px]" style={{ color: 'var(--text-muted)' }} />
                            </button>
                        )}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t('memberSince')} {joinedYear}
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
                    {harmonyScore}
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
            </div>

            {/* Public Card Section */}
            <div className="mb-6">
                <div className="text-xs uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--text-muted)' }}>
                    Ma Carte Publique
                </div>
                {existingPublicCard ? (
                    <div className="flex flex-col items-center gap-3">
                        <PublicCardDisplay
                            imageUrl={existingPublicCard.imageUrl}
                            category={existingPublicCard.category}
                            stats={{
                                physio: {
                                    height: isVisitor
                                        ? ThomasMorel.moduleA.measurements[0]?.height || 183
                                        : (profileHookData.profile?.height || currentProfile?.height || 0),
                                    bmi: isVisitor
                                        ? 24.5
                                        : ((profileHookData.profile?.weight && profileHookData.profile?.height)
                                            ? profileHookData.profile.weight / ((profileHookData.profile.height / 100) ** 2)
                                            : 0),
                                    age: isVisitor
                                        ? 35
                                        : (profileHookData.profile?.dateOfBirth
                                            ? Math.floor((Date.now() - new Date(profileHookData.profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                                            : undefined),
                                    activityLevel: isVisitor
                                        ? 3
                                        : (profileHookData.profile?.activityLevel || 0)
                                },
                                social: {
                                    friendsCount: isVisitor ? 148 : 12,
                                    harmonyScore: harmonyScore
                                },
                                world: {
                                    countriesVisited: isVisitor
                                        ? ThomasMorel.moduleB.countriesVisited.length
                                        : travelData.countries.length,
                                    tripsCount: isVisitor
                                        ? ThomasMorel.moduleB.trips.length
                                        : travelData.totalTrips
                                },
                                career: {
                                    jobTitle: isVisitor
                                        ? ThomasMorel.moduleC.career.currentPosition
                                        : (profileHookData.profile?.jobTitle || 'Non renseigné'),
                                    industry: isVisitor
                                        ? ThomasMorel.moduleC.career.industry
                                        : (profileHookData.profile?.industry || 'Non renseigné'),
                                    experienceYears: isVisitor
                                        ? ThomasMorel.moduleC.career.totalYearsExperience
                                        : (profileHookData.profile?.experienceYears || 0)
                                },
                                finance: {
                                    netWorth: isVisitor
                                        ? 85000
                                        : (profileHookData.profile?.netWorthEstimate || 0),
                                    savingsRate: isVisitor
                                        ? 22
                                        : (profileHookData.profile?.savingsRate || 0)
                                }
                            }}
                            userName={displayName}
                            username={username}
                            avatarUrl={avatarUrl}
                            size="medium"
                        />
                        <button
                            onClick={() => setShowPublicCardModal(true)}
                            className="text-xs font-medium py-2 px-4 rounded-full transition-all active:scale-95"
                            style={{
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-light)'
                            }}
                        >
                            <i className="fa-solid fa-pen mr-2" />Modifier
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowPublicCardModal(true)}
                        className="w-full py-5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.1) 0%, rgba(184, 165, 212, 0.1) 100%)',
                            border: '2px dashed var(--border-light)'
                        }}
                    >
                        <i className="fa-solid fa-id-card text-xl" style={{ color: 'var(--accent-gold)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            Créer ma carte publique
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Partagez vos stats avec une belle carte visuelle
                        </span>
                    </button>
                )}
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
                        {qrCodeDataUrl ? (
                            <img src={qrCodeDataUrl} alt="Profile QR Code" className="w-44 h-44" style={{ imageRendering: 'crisp-edges' }} />
                        ) : (
                            <div className="w-44 h-44 flex items-center justify-center">
                                <div
                                    className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                                    style={{ borderColor: 'var(--accent-gold) transparent transparent transparent' }}
                                />
                            </div>
                        )}
                    </div>

                    <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        {displayName}
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

            {/* Avatar Change BottomSheet */}
            <BottomSheet isOpen={showAvatarSheet} onClose={() => setShowAvatarSheet(false)}>
                <div className="flex flex-col items-center py-4">
                    <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                        Changer de photo
                    </h2>

                    {userProfile?.id && (
                        <AvatarUploader
                            userId={userProfile.id}
                            currentAvatarUrl={avatarUrl}
                            showCameraOption={true}
                            compact={true}
                            onUploadComplete={async (newUrl) => {
                                console.log('[ProfileView] New avatar uploaded:', newUrl)

                                // Update local state immediately for instant feedback
                                setLocalAvatarUrl(newUrl)

                                // Update the profile in Supabase
                                try {
                                    const { error } = await supabase
                                        .from('profiles')
                                        .update({
                                            avatar_url: newUrl,
                                            updated_at: new Date().toISOString()
                                        })
                                        .eq('id', userProfile.id)

                                    if (error) {
                                        console.error('[ProfileView] Failed to update profile:', error)
                                    } else {
                                        console.log('[ProfileView] Profile updated successfully')
                                        onAvatarUpdated?.(newUrl)
                                    }
                                } catch (err) {
                                    console.error('[ProfileView] Error updating profile:', err)
                                }

                                // Close the sheet
                                setShowAvatarSheet(false)
                            }}
                        />
                    )}
                </div>
            </BottomSheet>

            {/* Profile Edit Modal - Username only */}
            {userProfile?.id && (
                <ProfileEditModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    userId={userProfile.id}
                    currentUsername={currentProfile?.username}
                    onSave={(newUsername) => {
                        // Update local state for immediate feedback
                        setLocalProfileData(prev => ({
                            ...prev,
                            ...userProfile,
                            username: newUsername,
                        }))
                        onProfileUpdated?.({ username: newUsername })
                    }}
                />
            )}

            {/* Public Card Creator Modal */}
            <PublicCardCreatorModal
                isOpen={showPublicCardModal}
                onClose={() => setShowPublicCardModal(false)}
                userId={userProfile?.id}
                isDemo={isVisitor}
                userStats={{
                    physio: {
                        height: isVisitor
                            ? ThomasMorel.moduleA.measurements[0]?.height || 183
                            : (profileHookData.profile?.height || currentProfile?.height || 0),
                        bmi: isVisitor
                            ? 24.5
                            : ((profileHookData.profile?.weight && profileHookData.profile?.height)
                                ? profileHookData.profile.weight / ((profileHookData.profile.height / 100) ** 2)
                                : 0),
                        age: isVisitor
                            ? 35
                            : (profileHookData.profile?.dateOfBirth
                                ? Math.floor((Date.now() - new Date(profileHookData.profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                                : undefined),
                        activityLevel: isVisitor
                            ? 3
                            : (profileHookData.profile?.activityLevel || 0)
                    },
                    social: {
                        friendsCount: isVisitor ? 148 : 12,
                        harmonyScore: harmonyScore
                    },
                    world: {
                        countriesVisited: isVisitor
                            ? ThomasMorel.moduleB.countriesVisited.length
                            : travelData.countries.length,
                        tripsCount: isVisitor
                            ? ThomasMorel.moduleB.trips.length
                            : travelData.totalTrips
                    },
                    career: {
                        jobTitle: isVisitor
                            ? ThomasMorel.moduleC.career.currentPosition
                            : (profileHookData.profile?.jobTitle || 'Non renseigné'),
                        industry: isVisitor
                            ? ThomasMorel.moduleC.career.industry
                            : (profileHookData.profile?.industry || 'Non renseigné'),
                        experienceYears: isVisitor
                            ? ThomasMorel.moduleC.career.totalYearsExperience
                            : (profileHookData.profile?.experienceYears || 0)
                    },
                    finance: {
                        netWorth: isVisitor
                            ? 85000
                            : (profileHookData.profile?.netWorthEstimate || 0),
                        savingsRate: isVisitor
                            ? 22
                            : (profileHookData.profile?.savingsRate || 0)
                    }
                }}
                userName={displayName}
                username={username}
                avatarUrl={avatarUrl}
                onCardCreated={(card) => {
                    setExistingPublicCard(card)
                }}
            />
        </div>
    )
}
