'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import PublicCardDisplay, { PublicCardCategory, PublicCardStats } from '../Cards/PublicCardDisplay'
import { supabase } from '@/utils/supabase/client'
import { useFriendContextOptional } from '@/contexts/FriendContext'
import { generateUserProfileQR, shareUserProfile } from '@/utils/qrcode'
import haptics from '@/utils/haptics'
import { useLanguage } from '@/contexts/LanguageContext'

interface UserProfile {
    id: string
    username: string | null
    firstName: string | null
    lastName: string | null
    avatarUrl: string | null
    harmonyScore: number | null
}

interface PublicCard {
    imageUrl: string
    category: PublicCardCategory
    stats: PublicCardStats
}

interface FriendProfileModalProps {
    isOpen: boolean
    userId: string | null
    onClose: () => void
}

export default function FriendProfileModal({ isOpen, userId, onClose }: FriendProfileModalProps) {
    const [mounted, setMounted] = useState(false)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [publicCard, setPublicCard] = useState<PublicCard | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
    const [requestError, setRequestError] = useState<string | null>(null)
    const [showQRModal, setShowQRModal] = useState(false)
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
    const { t } = useLanguage()

    const friendContext = useFriendContextOptional()

    useEffect(() => {
        setMounted(true)
    }, [])

    // Load user profile when userId changes
    useEffect(() => {
        if (!userId || !isOpen) {
            setUserProfile(null)
            setPublicCard(null)
            setRequestStatus('idle')
            setRequestError(null)
            return
        }

        loadUserProfile(userId)
    }, [userId, isOpen])

    const loadUserProfile = async (id: string) => {
        setIsLoading(true)
        setRequestStatus('idle')
        setRequestError(null)

        try {
            // Load user profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, username, first_name, last_name, avatar_url, harmony_score')
                .eq('id', id)
                .single()

            if (profileError || !profileData) {
                console.error('[FriendProfileModal] Error loading profile:', profileError)
                setUserProfile(null)
                setIsLoading(false)
                return
            }

            setUserProfile({
                id: profileData.id,
                username: profileData.username,
                firstName: profileData.first_name,
                lastName: profileData.last_name,
                avatarUrl: profileData.avatar_url,
                harmonyScore: profileData.harmony_score
            })

            // Load public card
            const { data: cardData, error: cardError } = await supabase
                .from('public_cards')
                .select('image_url, category, stats_snapshot')
                .eq('user_id', id)
                .single()

            if (!cardError && cardData) {
                const category = cardData.category as PublicCardCategory
                const statsSnapshot = cardData.stats_snapshot || {}
                setPublicCard({
                    imageUrl: cardData.image_url,
                    category: category,
                    stats: { [category]: statsSnapshot }
                })
            } else {
                setPublicCard(null)
            }
        } catch (err) {
            console.error('[FriendProfileModal] Error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const getDisplayName = (profile: UserProfile): string => {
        if (profile.firstName && profile.lastName) {
            return `${profile.firstName} ${profile.lastName}`
        }
        if (profile.firstName) return profile.firstName
        if (profile.username) return profile.username
        return t('user')
    }

    const handleAddFriend = async () => {
        if (!userProfile || !friendContext) return

        setRequestStatus('sending')
        setRequestError(null)
        haptics.medium()

        const result = await friendContext.sendFriendRequest(userProfile.id)

        if (result.success) {
            setRequestStatus('sent')
            haptics.success()
            await friendContext.refetch()
        } else {
            setRequestStatus('error')
            setRequestError(result.error || 'Erreur inconnue')
            haptics.error()
        }
    }

    const handleShare = async () => {
        if (!userProfile) return

        haptics.medium()
        const result = await shareUserProfile(
            userProfile.id,
            userProfile.username,
            getDisplayName(userProfile)
        )

        if (result.success) {
            haptics.success()
            if (result.method === 'clipboard') {
                // Show a toast or feedback that link was copied
                setRequestError(null)
            }
        } else {
            haptics.error()
        }
    }

    const handleShowQR = async () => {
        if (!userProfile) return

        haptics.medium()
        try {
            const qrDataUrl = await generateUserProfileQR(userProfile.id, userProfile.username || undefined)
            setQrCodeDataUrl(qrDataUrl)
            setShowQRModal(true)
        } catch (error) {
            console.error('[FriendProfileModal] Error generating QR code:', error)
            haptics.error()
        }
    }

    const handleClose = useCallback(() => {
        setShowQRModal(false)
        setQrCodeDataUrl(null)
        onClose()
    }, [onClose])

    // Get relationship status
    const relationshipStatus = userProfile && friendContext
        ? friendContext.getRelationshipStatus(userProfile.id)
        : 'none'

    if (!mounted || !isOpen || !userId) return null

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-end justify-center"
            onClick={handleClose}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 backdrop-blur-md"
                style={{ background: 'var(--bg-overlay)' }}
            />

            {/* Modal */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-t-[32px] pb-safe pt-6 px-5 animate-slide-up"
                style={{
                    background: 'var(--bg-elevated)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.15)'
                }}
            >
                {/* Handle */}
                <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: 'var(--handle-bar)' }} />

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: 'var(--hover-overlay)', color: 'var(--text-tertiary)' }}
                >
                    <i className="fa-solid fa-xmark text-sm" />
                </button>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-16">
                        <div
                            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: 'var(--accent-lavender) transparent transparent transparent' }}
                        />
                    </div>
                )}

                {/* User Profile */}
                {!isLoading && userProfile && (
                    <>
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div
                                className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden"
                                style={{
                                    background: userProfile.avatarUrl ? 'transparent' : 'var(--bg-secondary)'
                                }}
                            >
                                {userProfile.avatarUrl ? (
                                    <img
                                        src={userProfile.avatarUrl}
                                        alt={getDisplayName(userProfile)}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <i
                                            className="fa-solid fa-user text-2xl"
                                            style={{ color: 'var(--text-muted)' }}
                                        />
                                    </div>
                                )}
                            </div>
                            <h3
                                className="text-lg font-medium"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {getDisplayName(userProfile)}
                            </h3>
                            {userProfile.username && (
                                <p
                                    className="text-sm"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    @{userProfile.username}
                                </p>
                            )}
                            {userProfile.harmonyScore !== null && userProfile.harmonyScore > 0 && (
                                <div
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full mt-2 text-sm"
                                    style={{
                                        background: 'rgba(139, 168, 136, 0.1)',
                                        color: 'var(--accent-sage)'
                                    }}
                                >
                                    <i className="fa-solid fa-star text-xs" />
                                    {userProfile.harmonyScore}% {t('harmony')}
                                </div>
                            )}
                        </div>

                        {/* Friend Management */}
                        {relationshipStatus === 'friends' && friendContext && (
                            <div className="mb-6">
                                {/* Rank Selector */}
                                <div
                                    className="text-[10px] uppercase tracking-[0.2em] font-medium mb-2 text-center"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    {t('proximity')}
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={async () => {
                                            if (userProfile && friendContext.getFriendRank(userProfile.id) !== 'cercle_proche') {
                                                haptics.medium()
                                                await friendContext.updateFriendRank(userProfile.id, 'cercle_proche')
                                            }
                                        }}
                                        className="flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all active:scale-95"
                                        style={{
                                            background: friendContext.getFriendRank(userProfile?.id || '') === 'cercle_proche'
                                                ? 'var(--accent-gold)'
                                                : 'var(--glass-bg)',
                                            color: friendContext.getFriendRank(userProfile?.id || '') === 'cercle_proche'
                                                ? 'white'
                                                : 'var(--text-secondary)',
                                            border: '1px solid ' + (friendContext.getFriendRank(userProfile?.id || '') === 'cercle_proche'
                                                ? 'transparent'
                                                : 'var(--border-light)')
                                        }}
                                    >
                                        <i className="fa-solid fa-star mr-2" />
                                        {t('closeFriend')}
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (userProfile && friendContext.getFriendRank(userProfile.id) !== 'amis') {
                                                haptics.medium()
                                                await friendContext.updateFriendRank(userProfile.id, 'amis')
                                            }
                                        }}
                                        className="flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all active:scale-95"
                                        style={{
                                            background: friendContext.getFriendRank(userProfile?.id || '') === 'amis'
                                                ? 'var(--accent-sage)'
                                                : 'var(--glass-bg)',
                                            color: friendContext.getFriendRank(userProfile?.id || '') === 'amis'
                                                ? 'white'
                                                : 'var(--text-secondary)',
                                            border: '1px solid ' + (friendContext.getFriendRank(userProfile?.id || '') === 'amis'
                                                ? 'transparent'
                                                : 'var(--border-light)')
                                        }}
                                    >
                                        <i className="fa-solid fa-user mr-2" />
                                        {t('amis')}
                                    </button>
                                </div>

                                {/* Current rank badge */}
                                <div className="flex justify-center mb-4">
                                    <div
                                        className="px-4 py-2 rounded-full text-sm flex items-center gap-2"
                                        style={{
                                            background: friendContext.getFriendRank(userProfile?.id || '') === 'cercle_proche'
                                                ? 'rgba(201, 169, 98, 0.15)'
                                                : 'rgba(139, 168, 136, 0.15)',
                                            color: friendContext.getFriendRank(userProfile?.id || '') === 'cercle_proche'
                                                ? 'var(--accent-gold)'
                                                : 'var(--accent-sage)'
                                        }}
                                    >
                                        <i className={`fa-solid ${friendContext.getFriendRank(userProfile?.id || '') === 'cercle_proche' ? 'fa-star' : 'fa-user-check'}`} />
                                        {friendContext.getFriendRank(userProfile?.id || '') === 'cercle_proche' ? t('closeFriend') : t('amis')}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Public Card */}
                        {publicCard && (
                            <div className="flex flex-col items-center mb-6">
                                <p
                                    className="text-xs uppercase tracking-widest mb-3"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {t('publicCard')}
                                </p>
                                <PublicCardDisplay
                                    imageUrl={publicCard.imageUrl}
                                    category={publicCard.category}
                                    stats={publicCard.stats}
                                    userName={getDisplayName(userProfile)}
                                    username={userProfile.username || undefined}
                                    avatarUrl={userProfile.avatarUrl || undefined}
                                    size="large"
                                />
                            </div>
                        )}

                        {/* No Public Card */}
                        {!publicCard && (
                            <div className="text-center py-8">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                                    style={{ background: 'var(--bg-secondary)' }}
                                >
                                    <i
                                        className="fa-solid fa-id-card text-xl"
                                        style={{ color: 'var(--text-muted)' }}
                                    />
                                </div>
                                <p
                                    className="text-sm"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    {t('noPublicCard')}
                                </p>
                                <p
                                    className="text-xs mt-1"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {t('noPublicCardDesc')}
                                </p>
                            </div>
                        )}

                        {/* Share Buttons */}
                        {relationshipStatus === 'friends' && (
                            <div className="mb-6">
                                <div
                                    className="text-[10px] uppercase tracking-[0.2em] font-medium mb-2 text-center"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    {t('shareProfile')}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleShare}
                                        className="flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                                        style={{
                                            background: 'var(--glass-bg)',
                                            color: 'var(--text-primary)',
                                            border: '1px solid var(--border-light)'
                                        }}
                                    >
                                        <i className="fa-solid fa-share-nodes" />
                                        {t('share')}
                                    </button>
                                    <button
                                        onClick={handleShowQR}
                                        className="flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
                                        style={{
                                            background: 'var(--glass-bg)',
                                            color: 'var(--text-primary)',
                                            border: '1px solid var(--border-light)'
                                        }}
                                    >
                                        <i className="fa-solid fa-qrcode" />
                                        QR Code
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Error message */}
                        {requestError && (
                            <div
                                className="mt-4 p-3 rounded-xl text-center"
                                style={{ background: 'rgba(220, 80, 80, 0.1)' }}
                            >
                                <p className="text-sm" style={{ color: '#DC5050' }}>
                                    <i className="fa-solid fa-circle-exclamation mr-2" />
                                    {requestError}
                                </p>
                            </div>
                        )}

                        {/* Action Button */}
                        {friendContext && (
                            <div className="mt-6 mb-4">
                                {relationshipStatus === 'friends' ? (
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleClose}
                                            className="w-full py-4 rounded-2xl text-sm font-medium transition-all active:scale-95"
                                            style={{
                                                background: 'var(--glass-bg)',
                                                color: 'var(--text-primary)',
                                                border: '1px solid var(--border-light)'
                                            }}
                                        >

                                            {t('close')}
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!userProfile) return
                                                if (confirm(t('confirmDeleteFriend'))) {
                                                    haptics.medium()
                                                    const result = await friendContext.deleteFriend(userProfile.id)
                                                    if (result.success) {
                                                        haptics.success()
                                                        handleClose()
                                                    } else {
                                                        haptics.error()
                                                        setRequestError(result.error || 'Erreur lors de la suppression')
                                                    }
                                                }
                                            }}
                                            className="w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-95"
                                            style={{
                                                background: 'rgba(220, 80, 80, 0.1)',
                                                color: '#DC5050'
                                            }}
                                        >
                                            <i className="fa-solid fa-user-minus mr-2" />
                                            {t('removeFriend')}
                                        </button>
                                    </div>
                                ) : relationshipStatus === 'pending_sent' || requestStatus === 'sent' ? (
                                    <div
                                        className="w-full py-4 rounded-2xl text-sm font-medium text-center"
                                        style={{
                                            background: 'rgba(184, 165, 212, 0.1)',
                                            color: 'var(--accent-lavender)'
                                        }}
                                    >
                                        <i className="fa-solid fa-clock mr-2" />
                                        {t('requestSent')}
                                    </div>
                                ) : relationshipStatus === 'pending_received' ? (
                                    <div
                                        className="w-full py-4 rounded-2xl text-sm font-medium text-center"
                                        style={{
                                            background: 'rgba(201, 169, 98, 0.1)',
                                            color: 'var(--accent-gold)'
                                        }}
                                    >
                                        <i className="fa-solid fa-inbox mr-2" />
                                        {t('hasSentRequest')}
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleAddFriend}
                                        disabled={requestStatus === 'sending'}
                                        className="w-full py-4 rounded-2xl text-sm font-medium transition-all active:scale-95"
                                        style={{
                                            background: 'var(--accent-sage)',
                                            color: 'white',
                                            opacity: requestStatus === 'sending' ? 0.7 : 1
                                        }}
                                    >
                                        {requestStatus === 'sending' ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin mr-2" />
                                                {t('sending')}
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-user-plus mr-2" />
                                                {t('addFriend')}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* User not found */}
                {!isLoading && !userProfile && (
                    <div className="text-center py-16">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                            style={{ background: 'var(--bg-secondary)' }}
                        >
                            <i
                                className="fa-solid fa-user-slash text-xl"
                                style={{ color: 'var(--text-muted)' }}
                            />
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {t('userNotFound')}
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>

            {/* QR Code Modal */}
            {showQRModal && qrCodeDataUrl && createPortal(
                <div
                    className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
                    onClick={() => setShowQRModal(false)}
                >
                    <div
                        className="absolute inset-0 backdrop-blur-md"
                        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
                    />
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
                        style={{ background: 'var(--bg-elevated)' }}
                    >
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                {getDisplayName(userProfile!)}
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                {t('scanToView')}
                            </p>
                        </div>
                        <div className="flex justify-center mb-4">
                            <img
                                src={qrCodeDataUrl}
                                alt="QR Code"
                                className="w-64 h-64 rounded-2xl"
                                style={{ background: 'white' }}
                            />
                        </div>
                        <button
                            onClick={() => setShowQRModal(false)}
                            className="w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-95"
                            style={{
                                background: 'var(--accent-lavender)',
                                color: 'white'
                            }}
                        >
                            {t('close')}
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>,
        document.body
    )
}
