'use client'

import { useState, useEffect, useCallback } from 'react'
import BottomSheet from '../UI/BottomSheet'
import PublicCardDisplay, { PublicCardCategory, PublicCardStats } from '../Cards/PublicCardDisplay'
import { supabase } from '@/utils/supabase/client'
import { useFriendRequests } from '@/hooks/useFriendRequests'
import haptics from '@/utils/haptics'

interface UserSearchResult {
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

interface UserSearchModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectUser?: (user: UserSearchResult) => void
}

export default function UserSearchModal({
    isOpen,
    onClose,
    onSelectUser
}: UserSearchModalProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState<UserSearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null)
    const [selectedUserCard, setSelectedUserCard] = useState<PublicCard | null>(null)
    const [isLoadingCard, setIsLoadingCard] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
    const [requestError, setRequestError] = useState<string | null>(null)

    // Get current user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUserId(user?.id || null)
        }
        getUser()
    }, [])

    // Friend requests hook
    const { sendFriendRequest, getRelationshipStatus, refetch } = useFriendRequests(currentUserId || undefined)

    // Debounced search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setResults([])
            setHasSearched(false)
            return
        }

        const timer = setTimeout(() => {
            searchUsers(searchQuery.trim())
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const searchUsers = useCallback(async (query: string) => {
        if (!query || query.length < 2) {
            setResults([])
            return
        }

        setIsLoading(true)
        setHasSearched(true)

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, first_name, last_name, avatar_url, harmony_score')
                .or(`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
                .neq('id', currentUserId || '')
                .limit(10)

            if (error) {
                console.error('[UserSearch] Error:', error)
                setResults([])
                return
            }

            const formattedResults: UserSearchResult[] = (data || []).map(u => ({
                id: u.id,
                username: u.username,
                firstName: u.first_name,
                lastName: u.last_name,
                avatarUrl: u.avatar_url,
                harmonyScore: u.harmony_score
            }))

            setResults(formattedResults)
        } catch (err) {
            console.error('[UserSearch] Error:', err)
            setResults([])
        } finally {
            setIsLoading(false)
        }
    }, [currentUserId])

    const loadUserPublicCard = useCallback(async (user: UserSearchResult) => {
        setIsLoadingCard(true)
        setSelectedUser(user)
        setSelectedUserCard(null)
        setRequestStatus('idle')
        setRequestError(null)

        try {
            const { data, error } = await supabase
                .from('public_cards')
                .select('image_url, category, stats_snapshot')
                .eq('user_id', user.id)
                .single()

            if (error || !data) {
                setSelectedUserCard(null)
            } else {
                // Build stats object from stats_snapshot
                const category = data.category as PublicCardCategory
                const statsSnapshot = data.stats_snapshot || {}

                // Create proper stats structure with category-specific data
                const stats: PublicCardStats = {
                    [category]: statsSnapshot
                }

                setSelectedUserCard({
                    imageUrl: data.image_url,
                    category: category,
                    stats: stats
                })
            }
        } catch (err) {
            console.error('[UserSearch] Error loading public card:', err)
        } finally {
            setIsLoadingCard(false)
        }
    }, [])

    const handleSelectUser = (user: UserSearchResult) => {
        haptics.light()
        loadUserPublicCard(user)
    }

    const handleBackToResults = () => {
        setSelectedUser(null)
        setSelectedUserCard(null)
        setRequestStatus('idle')
        setRequestError(null)
    }

    const handleAddFriend = async () => {
        if (!selectedUser || !currentUserId) return

        setRequestStatus('sending')
        setRequestError(null)
        haptics.medium()

        const result = await sendFriendRequest(selectedUser.id)

        if (result.success) {
            setRequestStatus('sent')
            haptics.success()
            await refetch()
        } else {
            setRequestStatus('error')
            setRequestError(result.error || 'Erreur inconnue')
            haptics.error()
        }
    }

    const getDisplayName = (user: UserSearchResult): string => {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`
        }
        if (user.firstName) return user.firstName
        if (user.username) return user.username
        return 'Utilisateur'
    }

    // Get relationship status for selected user
    const relationshipStatus = selectedUser ? getRelationshipStatus(selectedUser.id) : 'none'

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('')
            setResults([])
            setHasSearched(false)
            setSelectedUser(null)
            setSelectedUserCard(null)
            setRequestStatus('idle')
            setRequestError(null)
        }
    }, [isOpen])

    // Render user profile view
    const renderUserProfileView = () => {
        if (!selectedUser) return null

        return (
            <div className="px-2">
                {/* Back button */}
                <button
                    onClick={handleBackToResults}
                    className="flex items-center gap-2 mb-4 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    <i className="fa-solid fa-chevron-left" />
                    <span>Retour aux résultats</span>
                </button>

                {/* Loading */}
                {isLoadingCard && (
                    <div className="flex items-center justify-center py-12">
                        <div
                            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: 'var(--accent-lavender) transparent transparent transparent' }}
                        />
                    </div>
                )}

                {/* User Profile Header */}
                {!isLoadingCard && (
                    <div className="text-center mb-6">
                        <div
                            className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden"
                            style={{
                                background: selectedUser.avatarUrl ? 'transparent' : 'var(--bg-secondary)'
                            }}
                        >
                            {selectedUser.avatarUrl ? (
                                <img
                                    src={selectedUser.avatarUrl}
                                    alt={getDisplayName(selectedUser)}
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
                            {getDisplayName(selectedUser)}
                        </h3>
                        {selectedUser.username && (
                            <p
                                className="text-sm"
                                style={{ color: 'var(--text-tertiary)' }}
                            >
                                @{selectedUser.username}
                            </p>
                        )}
                        {selectedUser.harmonyScore !== null && selectedUser.harmonyScore > 0 && (
                            <div
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full mt-2 text-sm"
                                style={{
                                    background: 'rgba(139, 168, 136, 0.1)',
                                    color: 'var(--accent-sage)'
                                }}
                            >
                                <i className="fa-solid fa-star text-xs" />
                                {selectedUser.harmonyScore}% Harmonie
                            </div>
                        )}
                    </div>
                )}

                {/* Public Card */}
                {!isLoadingCard && selectedUserCard && (
                    <div className="flex flex-col items-center">
                        <p
                            className="text-xs uppercase tracking-widest mb-3"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Carte Publique
                        </p>
                        <PublicCardDisplay
                            imageUrl={selectedUserCard.imageUrl}
                            category={selectedUserCard.category}
                            stats={selectedUserCard.stats}
                            userName={getDisplayName(selectedUser)}
                            username={selectedUser.username || undefined}
                            avatarUrl={selectedUser.avatarUrl || undefined}
                            size="large"
                        />
                    </div>
                )}

                {/* No Public Card */}
                {!isLoadingCard && !selectedUserCard && (
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
                            Pas de carte publique
                        </p>
                        <p
                            className="text-xs mt-1"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Cet utilisateur n'a pas encore créé de carte
                        </p>
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

                {/* Add Friend Button - contextual */}
                {!isLoadingCard && currentUserId && (
                    <div className="mt-6">
                        {relationshipStatus === 'friends' ? (
                            <div
                                className="w-full py-4 rounded-2xl text-sm font-medium text-center"
                                style={{
                                    background: 'rgba(139, 168, 136, 0.1)',
                                    color: 'var(--accent-sage)'
                                }}
                            >
                                <i className="fa-solid fa-check mr-2" />
                                Déjà amis
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
                                Demande envoyée
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
                                        Envoi...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-user-plus mr-2" />
                                        Ajouter en ami
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                <div className="h-8" />
            </div>
        )
    }

    // Render search view
    const renderSearchView = () => (
        <div className="px-2">
            <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                Rechercher un utilisateur
            </h2>

            <div className="relative mb-4">
                <div
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                >
                    <i className="fa-solid fa-magnifying-glass text-sm" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nom d'utilisateur, prénom ou nom..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                    style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-primary)'
                    }}
                    autoFocus
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <i className="fa-solid fa-xmark text-sm" />
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <div
                        className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: 'var(--accent-lavender) transparent transparent transparent' }}
                    />
                </div>
            )}

            {!isLoading && results.length > 0 && (
                <div className="space-y-1">
                    {results.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => handleSelectUser(user)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-98"
                            style={{
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--border-light)'
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
                                style={{
                                    background: user.avatarUrl ? 'transparent' : 'var(--bg-secondary)'
                                }}
                            >
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={getDisplayName(user)}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <i
                                        className="fa-solid fa-user text-lg"
                                        style={{ color: 'var(--text-muted)' }}
                                    />
                                )}
                            </div>

                            <div className="flex-1 text-left">
                                <div
                                    className="font-medium text-sm"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {getDisplayName(user)}
                                </div>
                                {user.username && (
                                    <div
                                        className="text-xs"
                                        style={{ color: 'var(--text-tertiary)' }}
                                    >
                                        @{user.username}
                                    </div>
                                )}
                            </div>

                            {user.harmonyScore !== null && user.harmonyScore > 0 && (
                                <div
                                    className="px-2 py-1 rounded-full text-xs font-medium"
                                    style={{
                                        background: 'rgba(139, 168, 136, 0.1)',
                                        color: 'var(--accent-sage)'
                                    }}
                                >
                                    {user.harmonyScore}%
                                </div>
                            )}

                            <i
                                className="fa-solid fa-chevron-right text-xs"
                                style={{ color: 'var(--text-muted)' }}
                            />
                        </button>
                    ))}
                </div>
            )}

            {!isLoading && hasSearched && results.length === 0 && searchQuery.length >= 2 && (
                <div className="text-center py-8">
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
                        Aucun utilisateur trouvé
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Essayez un autre nom d'utilisateur
                    </p>
                </div>
            )}

            {!isLoading && !hasSearched && (
                <div className="text-center py-8">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ background: 'rgba(184, 165, 212, 0.1)' }}
                    >
                        <i
                            className="fa-solid fa-users text-xl"
                            style={{ color: 'var(--accent-lavender)' }}
                        />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Recherchez des utilisateurs
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Par nom d'utilisateur, prénom ou nom
                    </p>
                </div>
            )}

            <div className="h-8" />
        </div>
    )

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} initialHeight="70vh" maxHeight="90vh">
            {selectedUser ? renderUserProfileView() : renderSearchView()}
        </BottomSheet>
    )
}
