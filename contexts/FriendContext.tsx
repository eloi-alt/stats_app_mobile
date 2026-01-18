'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { useFriendRequests, Friendship, FriendRequest } from '@/hooks/useFriendRequests'
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
}

const FriendContext = createContext<FriendContextType | null>(null)

interface FriendProviderProps {
    children: ReactNode
}

export function FriendProvider({ children }: FriendProviderProps) {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null)

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
        refetch
    } = useFriendRequests(currentUserId || undefined)

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
        currentUserId
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
