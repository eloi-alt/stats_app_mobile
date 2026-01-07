'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
    getUserNotifications,
    getFriendNotifications,
    getUnreadCount,
    getRelativeTime,
    markAllAsRead,
    Notification,
} from '@/data/notificationData'
import { useFriendRequests, FriendRequest } from '@/hooks/useFriendRequests'
import { supabase } from '@/utils/supabase/client'
import haptics from '@/utils/haptics'

interface NotificationPanelProps {
    isOpen: boolean
    onClose: () => void
    onRefresh: () => void
}

export default function NotificationPanel({ isOpen, onClose, onRefresh }: NotificationPanelProps) {
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState<'me' | 'requests' | 'friends'>('me')
    const [userId, setUserId] = useState<string | null>(null)
    const panelRef = useRef<HTMLDivElement>(null)

    // Get current user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || null)
        }
        getUser()
    }, [])

    // Friend requests hook
    const {
        pendingRequests,
        acceptFriendRequest,
        rejectFriendRequest,
        refetch: refetchRequests
    } = useFriendRequests(userId || undefined)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose()
            }
        }

        // Add delay to prevent immediate close
        const timeout = setTimeout(() => {
            document.addEventListener('click', handleClickOutside)
        }, 100)

        return () => {
            clearTimeout(timeout)
            document.removeEventListener('click', handleClickOutside)
        }
    }, [isOpen, onClose])

    // Close on escape key
    useEffect(() => {
        if (!isOpen) return

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    const handleMarkAllRead = () => {
        haptics.medium()
        markAllAsRead()
        onRefresh()
    }

    const handleAcceptRequest = useCallback(async (request: FriendRequest) => {
        haptics.success()
        const result = await acceptFriendRequest(request.id, request.senderId)
        if (result.success) {
            refetchRequests()
            onRefresh()
        }
    }, [acceptFriendRequest, refetchRequests, onRefresh])

    const handleRejectRequest = useCallback(async (request: FriendRequest) => {
        haptics.medium()
        const result = await rejectFriendRequest(request.id)
        if (result.success) {
            refetchRequests()
            onRefresh()
        }
    }, [rejectFriendRequest, refetchRequests, onRefresh])

    const userNotifications = getUserNotifications()
    const friendNotifications = getFriendNotifications()
    const totalUnread = getUnreadCount() + pendingRequests.length

    if (!mounted || !isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[99998] flex flex-col items-end justify-start pt-16 px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ background: 'var(--bg-overlay)' }}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className="relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300"
                style={{
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-xl)',
                    maxHeight: 'calc(100vh - 120px)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2
                            className="text-lg font-semibold"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Notifications
                        </h2>
                        <div className="flex items-center gap-2">
                            {totalUnread > 0 && activeTab !== 'requests' && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all active:scale-95 flex items-center gap-1.5"
                                    style={{
                                        background: 'var(--hover-overlay)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <i className="fa-solid fa-check-double text-[9px]" />
                                    Tout lu
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                style={{ background: 'var(--hover-overlay)' }}
                            >
                                <i className="fa-solid fa-xmark text-sm" style={{ color: 'var(--text-muted)' }} />
                            </button>
                        </div>
                    </div>

                    {/* Tabs - 3 tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('me')}
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all"
                            style={{
                                background: activeTab === 'me'
                                    ? 'linear-gradient(135deg, rgba(201, 169, 98, 0.9) 0%, rgba(201, 169, 98, 0.8) 100%)'
                                    : 'var(--hover-overlay)',
                                color: activeTab === 'me' ? 'white' : 'var(--text-secondary)',
                            }}
                        >
                            <i className="fa-solid fa-user mr-1.5" />
                            Moi
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all relative"
                            style={{
                                background: activeTab === 'requests'
                                    ? 'linear-gradient(135deg, rgba(212, 165, 165, 0.9) 0%, rgba(212, 165, 165, 0.8) 100%)'
                                    : 'var(--hover-overlay)',
                                color: activeTab === 'requests' ? 'white' : 'var(--text-secondary)',
                            }}
                        >
                            <i className="fa-solid fa-user-plus mr-1.5" />
                            Demandes
                            {pendingRequests.length > 0 && (
                                <span
                                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] text-white flex items-center justify-center font-bold"
                                    style={{ background: 'var(--accent-rose)' }}
                                >
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('friends')}
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all"
                            style={{
                                background: activeTab === 'friends'
                                    ? 'linear-gradient(135deg, rgba(139, 168, 136, 0.9) 0%, rgba(139, 168, 136, 0.8) 100%)'
                                    : 'var(--hover-overlay)',
                                color: activeTab === 'friends' ? 'white' : 'var(--text-secondary)',
                            }}
                        >
                            <i className="fa-solid fa-users mr-1.5" />
                            Amis
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div
                    className="overflow-y-auto"
                    style={{ maxHeight: 'calc(100vh - 280px)' }}
                >
                    {/* Tab: Me - Personal notifications */}
                    {activeTab === 'me' && (
                        userNotifications.length === 0 ? (
                            <EmptyState icon="fa-bell-slash" title="Aucune notification" />
                        ) : (
                            <div className="py-2">
                                {userNotifications.map((notification) => (
                                    <NotificationItem key={notification.id} notification={notification} />
                                ))}
                            </div>
                        )
                    )}

                    {/* Tab: Requests - Friend requests with accept/reject */}
                    {activeTab === 'requests' && (
                        pendingRequests.length === 0 ? (
                            <EmptyState icon="fa-user-group" title="Aucune demande d'ami" subtitle="Les demandes apparaîtront ici" />
                        ) : (
                            <div className="py-2">
                                {pendingRequests.map((request) => (
                                    <FriendRequestItem
                                        key={request.id}
                                        request={request}
                                        onAccept={() => handleAcceptRequest(request)}
                                        onReject={() => handleRejectRequest(request)}
                                    />
                                ))}
                            </div>
                        )
                    )}

                    {/* Tab: Friends - Friend activity */}
                    {activeTab === 'friends' && (
                        friendNotifications.length === 0 ? (
                            <EmptyState icon="fa-users" title="Aucune activité" />
                        ) : (
                            <div className="py-2">
                                {friendNotifications.map((notification) => (
                                    <NotificationItem key={notification.id} notification={notification} />
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}

// Empty state component
function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
    return (
        <div className="py-12 text-center">
            <i
                className={`fa-solid ${icon} text-3xl mb-3`}
                style={{ color: 'var(--text-muted)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {title}
            </p>
            {subtitle && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {subtitle}
                </p>
            )}
        </div>
    )
}

// Friend request item with accept/reject buttons
function FriendRequestItem({
    request,
    onAccept,
    onReject
}: {
    request: FriendRequest
    onAccept: () => void
    onReject: () => void
}) {
    const [isProcessing, setIsProcessing] = useState(false)

    const handleAccept = async () => {
        setIsProcessing(true)
        await onAccept()
        setIsProcessing(false)
    }

    const handleReject = async () => {
        setIsProcessing(true)
        await onReject()
        setIsProcessing(false)
    }

    return (
        <div
            className="px-5 py-3"
            style={{ background: 'rgba(212, 165, 165, 0.08)' }}
        >
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    {request.senderAvatarUrl ? (
                        <img
                            src={request.senderAvatarUrl}
                            alt={request.senderName}
                            className="w-12 h-12 rounded-full object-cover"
                            style={{ border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        />
                    ) : (
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ background: 'var(--bg-secondary)' }}
                        >
                            <i className="fa-solid fa-user text-lg" style={{ color: 'var(--text-muted)' }} />
                        </div>
                    )}
                    <div
                        className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--accent-rose)' }}
                    >
                        <i className="fa-solid fa-user-plus text-[8px] text-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {request.senderName}
                    </p>
                    {request.senderUsername && (
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            @{request.senderUsername}
                        </p>
                    )}
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Souhaite vous ajouter en ami
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
                        style={{
                            background: 'rgba(220, 80, 80, 0.15)',
                            opacity: isProcessing ? 0.5 : 1
                        }}
                    >
                        <i className="fa-solid fa-xmark text-lg" style={{ color: '#DC5050' }} />
                    </button>
                    <button
                        onClick={handleAccept}
                        disabled={isProcessing}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
                        style={{
                            background: 'rgba(100, 180, 100, 0.15)',
                            opacity: isProcessing ? 0.5 : 1
                        }}
                    >
                        <i className="fa-solid fa-check text-lg" style={{ color: '#64B464' }} />
                    </button>
                </div>
            </div>
        </div>
    )
}

// Individual notification item
function NotificationItem({ notification }: { notification: Notification }) {
    return (
        <div
            className="px-5 py-3 transition-colors"
            style={{
                background: !notification.isRead
                    ? 'rgba(201, 169, 98, 0.08)'
                    : 'transparent',
            }}
        >
            <div className="flex gap-3">
                {/* Icon or Friend Avatar */}
                {notification.friendAvatar ? (
                    <div className="relative flex-shrink-0">
                        <img
                            src={notification.friendAvatar}
                            alt={notification.friendName}
                            className="w-10 h-10 rounded-full object-cover"
                            style={{ border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        />
                        <div
                            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: notification.color }}
                        >
                            <i className={`${notification.icon} text-[8px] text-white`} />
                        </div>
                    </div>
                ) : (
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${notification.color}20` }}
                    >
                        <i
                            className={`${notification.icon} text-sm`}
                            style={{ color: notification.color }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p
                            className="text-sm font-medium truncate"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {notification.title}
                        </p>
                        {!notification.isRead && (
                            <div
                                className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                                style={{ background: 'var(--accent-gold)' }}
                            />
                        )}
                    </div>
                    <p
                        className="text-xs mt-0.5 truncate"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        {notification.description}
                    </p>
                    <p
                        className="text-[10px] mt-1"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {getRelativeTime(notification.timestamp)}
                    </p>
                </div>
            </div>
        </div>
    )
}
