'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/utils/supabase/client'

export interface FriendRequest {
    id: string
    senderId: string
    receiverId: string
    status: 'pending' | 'accepted' | 'rejected'
    createdAt: string
    // Populated sender info
    senderName?: string
    senderUsername?: string
    senderAvatarUrl?: string
}

export interface Friendship {
    id: string
    friendId: string
    rank: 'cercle_proche' | 'amis'
    createdAt: string
    // Populated friend info
    friendName?: string
    friendUsername?: string
    friendAvatarUrl?: string
}

export function useFriendRequests(userId?: string) {
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
    const [friends, setFriends] = useState<Friendship[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Fetch pending requests (requests sent TO this user)
    const fetchPendingRequests = useCallback(async () => {
        if (!userId) return

        const { data, error } = await supabase
            .from('friend_requests')
            .select(`
                id,
                sender_id,
                receiver_id,
                status,
                created_at,
                sender:profiles!friend_requests_sender_id_fkey(
                    first_name,
                    last_name,
                    username,
                    avatar_url
                )
            `)
            .eq('receiver_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[FriendRequests] Error fetching pending:', error)
            return
        }

        const formatted: FriendRequest[] = (data || []).map((req: any) => ({
            id: req.id,
            senderId: req.sender_id,
            receiverId: req.receiver_id,
            status: req.status,
            createdAt: req.created_at,
            senderName: req.sender?.first_name && req.sender?.last_name
                ? `${req.sender.first_name} ${req.sender.last_name}`
                : req.sender?.username || 'Utilisateur',
            senderUsername: req.sender?.username,
            senderAvatarUrl: req.sender?.avatar_url
        }))

        setPendingRequests(formatted)
    }, [userId])

    // Fetch sent requests
    const fetchSentRequests = useCallback(async () => {
        if (!userId) return

        const { data, error } = await supabase
            .from('friend_requests')
            .select('id, sender_id, receiver_id, status, created_at')
            .eq('sender_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[FriendRequests] Error fetching sent:', error)
            return
        }

        const formatted: FriendRequest[] = (data || []).map((req: any) => ({
            id: req.id,
            senderId: req.sender_id,
            receiverId: req.receiver_id,
            status: req.status,
            createdAt: req.created_at
        }))

        setSentRequests(formatted)
    }, [userId])

    // Fetch friendships
    const fetchFriendships = useCallback(async () => {
        if (!userId) return

        const { data, error } = await supabase
            .from('friendships')
            .select(`
                id,
                friend_id,
                rank,
                created_at,
                friend:profiles!friendships_friend_id_fkey(
                    first_name,
                    last_name,
                    username,
                    avatar_url
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[FriendRequests] Error fetching friendships:', error)
            return
        }

        const formatted: Friendship[] = (data || []).map((f: any) => ({
            id: f.id,
            friendId: f.friend_id,
            rank: f.rank,
            createdAt: f.created_at,
            friendName: f.friend?.first_name && f.friend?.last_name
                ? `${f.friend.first_name} ${f.friend.last_name}`
                : f.friend?.username || 'Utilisateur',
            friendUsername: f.friend?.username,
            friendAvatarUrl: f.friend?.avatar_url
        }))

        setFriends(formatted)
    }, [userId])

    // Send friend request
    const sendFriendRequest = useCallback(async (receiverId: string): Promise<{ success: boolean; error?: string }> => {
        if (!userId) {
            console.error('[FriendRequests] sendFriendRequest: No userId')
            return { success: false, error: 'Not authenticated' }
        }

        // Check if trying to add yourself
        if (userId === receiverId) {
            console.error('[FriendRequests] Cannot add yourself as friend')
            return { success: false, error: 'Vous ne pouvez pas vous ajouter vous-même' }
        }

        console.log('[FriendRequests] sendFriendRequest: Starting', { userId, receiverId })

        // Check if already friends
        const { data: existingFriendship, error: friendshipCheckError } = await supabase
            .from('friendships')
            .select('id')
            .or(`and(user_id.eq.${userId},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${userId})`)
            .maybeSingle()

        console.log('[FriendRequests] Existing friendship check:', { existingFriendship, friendshipCheckError })

        if (existingFriendship) {
            return { success: false, error: 'Vous êtes déjà amis' }
        }

        // Check if request already exists (in either direction)
        const { data: existingRequest, error: requestCheckError } = await supabase
            .from('friend_requests')
            .select('id, status, sender_id, receiver_id')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId})`)
            .maybeSingle()

        console.log('[FriendRequests] Existing request check:', { existingRequest, requestCheckError })

        if (existingRequest) {
            // If the other person already sent you a request
            if (existingRequest.sender_id === receiverId && existingRequest.status === 'pending') {
                return { success: false, error: 'Cette personne vous a déjà envoyé une demande. Acceptez-la dans vos notifications !' }
            }
            // If you already sent a request
            if (existingRequest.sender_id === userId) {
                if (existingRequest.status === 'pending') {
                    return { success: false, error: 'Demande déjà envoyée' }
                } else if (existingRequest.status === 'rejected') {
                    return { success: false, error: 'Votre demande a été refusée' }
                }
            }
        }

        // Send request
        const { data: insertData, error: insertError } = await supabase
            .from('friend_requests')
            .insert({
                sender_id: userId,
                receiver_id: receiverId,
                status: 'pending'
            })
            .select()

        console.log('[FriendRequests] Insert result:', { insertData, insertError })

        if (insertError) {
            console.error('[FriendRequests] Error sending request:', insertError)

            // Handle unique constraint violation
            if (insertError.code === '23505') {
                return { success: false, error: 'Une demande existe déjà avec cet utilisateur' }
            }

            return { success: false, error: `Erreur: ${insertError.message}` }
        }

        await fetchSentRequests()
        return { success: true }
    }, [userId, fetchSentRequests])

    // Accept friend request
    const acceptFriendRequest = useCallback(async (requestId: string, senderId: string): Promise<{ success: boolean; error?: string }> => {
        if (!userId) return { success: false, error: 'Not authenticated' }

        // Update request status - the trigger will automatically create friendships
        const { error: updateError } = await supabase
            .from('friend_requests')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', requestId)
            .eq('receiver_id', userId)

        if (updateError) {
            console.error('[FriendRequests] Error accepting:', updateError)
            return { success: false, error: 'Erreur lors de l\'acceptation' }
        }

        // Note: Friendships are created automatically by the trigger
        await fetchPendingRequests()
        await fetchFriendships()
        return { success: true }
    }, [userId, fetchPendingRequests, fetchFriendships])

    // Reject friend request
    const rejectFriendRequest = useCallback(async (requestId: string): Promise<{ success: boolean; error?: string }> => {
        if (!userId) return { success: false, error: 'Not authenticated' }

        const { error } = await supabase
            .from('friend_requests')
            .update({ status: 'rejected', updated_at: new Date().toISOString() })
            .eq('id', requestId)
            .eq('receiver_id', userId)

        if (error) {
            console.error('[FriendRequests] Error rejecting:', error)
            return { success: false, error: 'Erreur lors du refus' }
        }

        await fetchPendingRequests()
        return { success: true }
    }, [userId, fetchPendingRequests])

    // Delete friend (bidirectional)
    const deleteFriend = useCallback(async (friendId: string): Promise<{ success: boolean; error?: string }> => {
        if (!userId) return { success: false, error: 'Not authenticated' }

        // Delete both directions of friendship
        const { error: friendshipError } = await supabase
            .from('friendships')
            .delete()
            .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)

        if (friendshipError) {
            console.error('[FriendRequests] Error deleting friendship:', friendshipError)
            return { success: false, error: 'Erreur lors de la suppression' }
        }

        // Also delete the associated friend_request so user can re-add later
        const { error: requestError } = await supabase
            .from('friend_requests')
            .delete()
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`)

        if (requestError) {
            console.error('[FriendRequests] Error deleting friend request:', requestError)
            // Non-blocking - friendship is already deleted
        }

        await fetchFriendships()
        await fetchSentRequests()
        return { success: true }
    }, [userId, fetchFriendships, fetchSentRequests])

    // Update friend rank (bidirectional)
    const updateFriendRank = useCallback(async (friendId: string, newRank: 'cercle_proche' | 'amis'): Promise<{ success: boolean; error?: string }> => {
        if (!userId) return { success: false, error: 'Not authenticated' }

        // Update both directions of friendship
        const { error } = await supabase
            .from('friendships')
            .update({ rank: newRank })
            .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)

        if (error) {
            console.error('[FriendRequests] Error updating rank:', error)
            return { success: false, error: 'Erreur lors de la mise à jour' }
        }

        await fetchFriendships()
        return { success: true }
    }, [userId, fetchFriendships])

    // Get friend rank
    const getFriendRank = useCallback((friendId: string): 'cercle_proche' | 'amis' | null => {
        const friendship = friends.find(f => f.friendId === friendId)
        return friendship?.rank ?? null
    }, [friends])

    // Check if user is already a friend or has pending request
    const getRelationshipStatus = useCallback((targetUserId: string): 'none' | 'friends' | 'pending_sent' | 'pending_received' => {
        if (friends.some(f => f.friendId === targetUserId)) {
            return 'friends'
        }
        if (sentRequests.some(r => r.receiverId === targetUserId && r.status === 'pending')) {
            return 'pending_sent'
        }
        if (pendingRequests.some(r => r.senderId === targetUserId)) {
            return 'pending_received'
        }
        return 'none'
    }, [friends, sentRequests, pendingRequests])

    // Load all data
    useEffect(() => {
        if (!userId) {
            setIsLoading(false)
            return
        }

        const loadAll = async () => {
            setIsLoading(true)
            await Promise.all([
                fetchPendingRequests(),
                fetchSentRequests(),
                fetchFriendships()
            ])
            setIsLoading(false)
        }

        loadAll()
    }, [userId, fetchPendingRequests, fetchSentRequests, fetchFriendships])

    return {
        pendingRequests,
        sentRequests,
        friends,
        isLoading,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        deleteFriend,
        updateFriendRank,
        getFriendRank,
        getRelationshipStatus,
        refetch: async () => {
            await Promise.all([
                fetchPendingRequests(),
                fetchSentRequests(),
                fetchFriendships()
            ])
        }
    }
}
