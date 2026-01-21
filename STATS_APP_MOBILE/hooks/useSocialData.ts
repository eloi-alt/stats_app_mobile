import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
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

// Demo friends from mockData
const DEMO_FRIENDS: Friend[] = ThomasMorel.moduleE.contacts.slice(0, 8).map((contact, i) => ({
    id: `demo_friend_${i}`,
    friend_id: contact.id,
    rank: contact.dunbarPriority === 'inner_circle' ? 'cercle_proche' : 'amis',
    created_at: contact.lastInteraction,
    profile: {
        id: contact.id,
        first_name: contact.name.split(' ')[0],
        last_name: contact.name.split(' ').slice(1).join(' '),
        username: contact.name.toLowerCase().replace(' ', '.'),
        avatar_url: contact.avatar || '',
        harmony_score: contact.publicStats?.globalPerformance || 75
    }
}))

export function useSocialData(): SocialData {
    const [friends, setFriends] = useState<Friend[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDemo, setIsDemo] = useState(true)

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
                .from('friendships')
                .select(`
          id,
          friend_id,
          rank,
          created_at,
          profiles:friend_id (
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

            if (data) {
                const formattedFriends: Friend[] = data.map((f: any) => ({
                    id: f.id,
                    friend_id: f.friend_id,
                    rank: f.rank,
                    created_at: f.created_at,
                    profile: f.profiles ? {
                        id: f.profiles.id,
                        first_name: f.profiles.first_name,
                        last_name: f.profiles.last_name,
                        username: f.profiles.username,
                        avatar_url: f.profiles.avatar_url,
                        harmony_score: f.profiles.harmony_score || 0
                    } : undefined
                }))
                setFriends(formattedFriends)
            }
        } catch (err) {
            console.error('Error fetching social data:', err)
            setFriends(DEMO_FRIENDS)
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

    const hasRealInnerCircle = innerCircleFriends.length > 0
    const friendCount = friends.length
    const hasAnyFriends = friendCount > 0

    return {
        friends,
        innerCircleFriends,
        amiFriends,
        isLoading,
        hasAnyFriends,
        hasRealInnerCircle,
        friendCount,
        refetch: fetchData,
        isDemo
    }
}
