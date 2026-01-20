'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useFriendContextOptional } from '@/contexts/FriendContext'
import { ThomasMorel } from '@/data/mockData'

export interface Friend {
    id: string
    friend_id: string
    rank: 'cercle_proche' | 'amis'
    created_at: string
    profile?: {
        id: string
        first_name: string
        last_name: string
        username: string
        avatar_url: string
        harmony_score: number
    }
}

export interface SocialData {
    friends: Friend[]
    innerCircleFriends: Friend[]
    amiFriends: Friend[]
    isLoading: boolean
    hasAnyFriends: boolean
    hasRealInnerCircle: boolean
    friendCount: number
    refetch: () => void
    isDemo: boolean
}

export function useSocialData(): SocialData {
    const friendContext = useFriendContextOptional()
    const [isDemo, setIsDemo] = useState(false)

    // Use friends from FriendContext
    const friends = useMemo(() => {
        if (!friendContext || friendContext.friends.length === 0) {
            return []
        }

        // Transform friendships to Friend format with profiles
        return friendContext.friends.map(friendship => ({
            id: friendship.id,
            friend_id: friendship.friendId,
            rank: friendship.rank,
            created_at: friendship.createdAt,
            profile: friendship.friendUsername ? {
                id: friendship.friendId,
                first_name: friendship.friendName?.split(' ')[0] || '',
                last_name: friendship.friendName?.split(' ').slice(1).join(' ') || '',
                username: friendship.friendUsername,
                avatar_url: friendship.friendAvatarUrl || '',
                harmony_score: 75 // Default value
            } : undefined
        }))
    }, [friendContext?.friends])

    // Computed values
    const innerCircleFriends = useMemo(() =>
        friends.filter(f => f.rank === 'cercle_proche'),
        [friends]
    )

    const amiFriends = useMemo(() =>
        friends.filter(f => f.rank === 'amis'),
        [friends]
    )

    const hasRealInnerCircle = innerCircleFriends.length > 0
    const friendCount = friends.length
    const hasAnyFriends = friendCount > 0
    const isLoading = friendContext?.isLoading ?? true

    const refetch = useCallback(() => {
        if (friendContext) {
            friendContext.refetch()
        }
    }, [friendContext])

    return {
        friends,
        innerCircleFriends,
        amiFriends,
        isLoading,
        hasAnyFriends,
        hasRealInnerCircle,
        friendCount,
        refetch,
        isDemo
    }
}
