'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { useFriendRequests, Friendship, FriendRequest } from '@/hooks/useFriendRequests'
import { PrivacySettings, PrivacyCategory } from '@/hooks/usePrivacySettings'
import { canViewFriendData } from '@/utils/permissions'
import { supabase } from '@/utils/supabase/client'

interface FriendContextType {
    // Friend data
    friends: Friendship[]
    pendingRequests: FriendRequest[]
    sentRequests: FriendRequest[]
    isLoading: boolean

    // Friend operations
    sendFriendRequest: (receiverId: string) => Promise<{ success: boolean; error?: string }>
    acceptFriendRequest: (requestId: string, senderId: string) => Promise<{ success: boolean; error?: string }>
    rejectFriendRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>
    deleteFriend: (friendId: string) => Promise<{ success: boolean; error?: string }>
    updateFriendRank: (friendId: string, newRank: 'cercle_proche' | 'amis') => Promise<{ success: boolean; error?: string }>
    getFriendRank: (friendId: string) => 'cercle_proche' | 'amis' | null
    getRelationshipStatus: (targetUserId: string) => 'none' | 'friends' | 'pending_sent' | 'pending_received'
    isFriend: (userId: string) => boolean
    refetch: () => Promise<void>

    // Profile modal
    openFriendProfile: (userId: string) => void
    closeFriendProfile: () => void
    selectedProfileUserId: string | null

    // Current user
    currentUserId: string | null

    // Privacy & Permissions
    friendPrivacySettings: Map<string, PrivacySettings>
    canViewFriendCategory: (friendId: string, category: PrivacyCategory) => boolean
    getFriendPrivacySettings: (friendId: string) => PrivacySettings | null
}

const FriendContext = createContext<FriendContextType | null>(null)

interface FriendProviderProps {
    children: ReactNode
}

export function FriendProvider({ children }: FriendProviderProps) {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null)
    const [friendPrivacySettings, setFriendPrivacySettings] = useState<Map<string, PrivacySettings>>(new Map())

    // Get current user on mount
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUserId(user?.id || null)
        }
        getUser()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUserId(session?.user?.id || null)
        })

        return () => subscription.unsubscribe()
    }, [])

    // Use the friend requests hook
    const {
        friends,
        pendingRequests,
        sentRequests,
        isLoading,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        deleteFriend,
        updateFriendRank,
        getFriendRank,
        getRelationshipStatus,
        refetch: refetchFriends
    } = useFriendRequests(currentUserId || undefined)

    // Load privacy settings for all friends
    useEffect(() => {
        if (friends.length === 0) {
            setFriendPrivacySettings(new Map())
            return
        }

        const loadFriendPrivacySettings = async () => {
            const friendIds = friends.map(f => f.friendId)

            const { data, error } = await supabase
                .from('privacy_settings')
                .select('*')
                .in('user_id', friendIds)

            if (error) {
                console.error('[FriendContext] Error loading friend privacy settings:', error)
                return
            }

            const settingsMap = new Map<string, PrivacySettings>()
            data?.forEach((setting: any) => {
                settingsMap.set(setting.user_id, {
                    userId: setting.user_id,
                    financePublic: setting.finance_public,
                    physioPublic: setting.physio_public,
                    worldPublic: setting.world_public,
                    careerPublic: setting.career_public,
                    socialPublic: setting.social_public
                })
            })

            setFriendPrivacySettings(settingsMap)
        }

        loadFriendPrivacySettings()
    }, [friends])

    // Check if a user is a friend
    const isFriend = useCallback((userId: string): boolean => {
        return friends.some(f => f.friendId === userId)
    }, [friends])

    // Open friend profile modal
    const openFriendProfile = useCallback((userId: string) => {
        if (userId && userId !== currentUserId) {
            setSelectedProfileUserId(userId)
        }
    }, [currentUserId])

    // Close friend profile modal
    const closeFriendProfile = useCallback(() => {
        setSelectedProfileUserId(null)
    }, [])

    // Get privacy settings for a specific friend
    const getFriendPrivacySettings = useCallback((friendId: string): PrivacySettings | null => {
        return friendPrivacySettings.get(friendId) || null
    }, [friendPrivacySettings])

    // Check if current user can view a friend's category
    const canViewFriendCategory = useCallback((friendId: string, category: PrivacyCategory): boolean => {
        const settings = friendPrivacySettings.get(friendId)
        return canViewFriendData(friendId, category, settings || null, friends)
    }, [friendPrivacySettings, friends])

    // Refetch both friends and privacy settings
    const refetch = useCallback(async () => {
        await refetchFriends()
        // Privacy settings will be reloaded automatically via the useEffect
    }, [refetchFriends])

    const value: FriendContextType = {
        friends,
        pendingRequests,
        sentRequests,
        isLoading,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        deleteFriend,
        updateFriendRank,
        getFriendRank,
        getRelationshipStatus,
        isFriend,
        refetch,
        openFriendProfile,
        closeFriendProfile,
        selectedProfileUserId,
        currentUserId,
        friendPrivacySettings,
        canViewFriendCategory,
        getFriendPrivacySettings
    }

    return (
        <FriendContext.Provider value={value}>
            {children}
        </FriendContext.Provider>
    )
}

export function useFriendContext() {
    const context = useContext(FriendContext)
    if (!context) {
        throw new Error('useFriendContext must be used within a FriendProvider')
    }
    return context
}

// Optional hook that doesn't throw if not in provider (for use in shared components)
export function useFriendContextOptional() {
    return useContext(FriendContext)
}
