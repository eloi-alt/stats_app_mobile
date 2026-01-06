'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/utils/supabase/client'
import { ThomasMorel } from '@/data/mockData'

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
    isDemo: boolean
}

// Demo friends from mockData
const DEMO_FRIENDS: Friend[] = ThomasMorel.moduleE.contacts.map((c, i) => ({
    id: `demo_friend_${i}`,
    friend_id: c.id,
    status: 'accepted',
    created_at: c.lastInteraction || new Date().toISOString(),
    profile: {
        id: c.id,
        first_name: c.name.split(' ')[0] || '',
        last_name: c.name.split(' ').slice(1).join(' ') || '',
        username: c.name.toLowerCase().replace(/\s+/g, '_'),
        avatar_url: c.avatar || '',
        harmony_score: c.publicStats?.globalPerformance || 50
    }
}))

export function useSocialData(): SocialData {
    const [friends, setFriends] = useState<Friend[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDemo, setIsDemo] = useState(false)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                // No authenticated user - use demo data
                setFriends(DEMO_FRIENDS)
                setIsDemo(true)
                setIsLoading(false)
                return
            }

            // Authenticated user - fetch from Supabase
            setIsDemo(false)
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
                // Transform data to handle Supabase's array format for joined relations
                const transformedData: Friend[] = data.map((item: Record<string, unknown>) => ({
                    ...item,
                    profile: Array.isArray(item.profile) ? item.profile[0] : item.profile
                })) as Friend[]
                setFriends(transformedData)
            }
        } catch (err) {
            console.error('Error fetching social data:', err)
            // On error, fall back to demo data
            setFriends(DEMO_FRIENDS)
            setIsDemo(true)
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
        refetch: fetchData,
        isDemo
    }
}
