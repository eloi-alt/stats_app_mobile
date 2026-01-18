'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/utils/supabase/client'
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

// Demo friends from mockData - shown as inner circle if user has no real inner circle
const DEMO_INNER_CIRCLE: Friend[] = ThomasMorel.moduleE.contacts
    .filter(c => c.dunbarPriority === 'inner_circle')
    .slice(0, 5)
    .map((c, i) => ({
        id: `demo_friend_${i}`,
        friend_id: c.id,
        rank: 'cercle_proche' as const,
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
                setFriends(DEMO_INNER_CIRCLE)
                setIsDemo(true)
                setIsLoading(false)
                return
            }

            // Authenticated user - fetch from Supabase friendships table
            setIsDemo(false)
            const { data, error } = await supabase
                .from('friendships')
                .select(`
                    id,
                    friend_id,
                    rank,
                    created_at,
                    profile:profiles!friendships_friend_id_fkey (
                        id,
                        first_name,
                        last_name,
                        username,
                        avatar_url,
                        harmony_score
                    )
                `)
                .eq('user_id', user.id)

            if (error) {
                console.error('[useSocialData] Error fetching friendships:', error)
                // If the join fails, just get basic friend data
                const basicRes = await supabase
                    .from('friendships')
                    .select('id, friend_id, rank, created_at')
                    .eq('user_id', user.id)

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
            setFriends(DEMO_INNER_CIRCLE)
            setIsDemo(true)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Computed values
    const innerCircleFriends = useMemo(() =>
        friends.filter(f => f.rank === 'cercle_proche'),
        [friends]
    )

    const amiFriends = useMemo(() =>
        friends.filter(f => f.rank === 'amis'),
        [friends]
    )

    const hasRealInnerCircle = !isDemo && innerCircleFriends.length > 0
    const friendCount = friends.length
    const hasAnyFriends = friendCount > 0

    // For SocialView 3D sphere: show demo data if no real inner circle
    const displayInnerCircle = hasRealInnerCircle ? innerCircleFriends : DEMO_INNER_CIRCLE

    return {
        friends,
        innerCircleFriends: displayInnerCircle,
        amiFriends,
        isLoading,
        hasAnyFriends,
        hasRealInnerCircle,
        friendCount,
        refetch: fetchData,
        isDemo
    }
}

