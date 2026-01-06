'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/utils/supabase/client'

export interface Friend {
    id: string
    friend_id: string
    status: string
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
    isLoading: boolean
    hasAnyFriends: boolean
    friendCount: number
    refetch: () => void
}

export function useSocialData(): SocialData {
    const [friends, setFriends] = useState<Friend[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setIsLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('friends')
                .select(`
                    id,
                    friend_id,
                    status,
                    created_at,
                    profile:profiles!friends_friend_id_fkey (
                        id,
                        first_name,
                        last_name,
                        username,
                        avatar_url,
                        harmony_score
                    )
                `)
                .eq('user_id', user.id)
                .eq('status', 'accepted')

            if (error) {
                // If the join fails, just get basic friend data
                const basicRes = await supabase
                    .from('friends')
                    .select('id, friend_id, status, created_at')
                    .eq('user_id', user.id)
                    .eq('status', 'accepted')

                if (basicRes.data) setFriends(basicRes.data as Friend[])
            } else if (data) {
                setFriends(data as Friend[])
            }
        } catch (err) {
            console.error('Error fetching social data:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const friendCount = friends.length
    const hasAnyFriends = friendCount > 0

    return {
        friends,
        isLoading,
        hasAnyFriends,
        friendCount,
        refetch: fetchData
    }
}
