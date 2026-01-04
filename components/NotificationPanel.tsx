'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
    getUserNotifications,
    getFriendNotifications,
    getUnreadCount,
    getRelativeTime,
    markAllAsRead,
    Notification,
} from '@/data/notificationData'
import haptics from '@/utils/haptics'

interface NotificationPanelProps {
    isOpen: boolean
    onClose: () => void
    onRefresh: () => void
}

export default function NotificationPanel({ isOpen, onClose, onRefresh }: NotificationPanelProps) {
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState<'me' | 'friends'>('me')
    const panelRef = useRef<HTMLDivElement>(null)

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

    const userNotifications = getUserNotifications()
    const friendNotifications = getFriendNotifications()
    const notifications = activeTab === 'me' ? userNotifications : friendNotifications
    const totalUnread = getUnreadCount()

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
                            {totalUnread > 0 && (
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

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('me')}
                            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all"
                            style={{
                                background: activeTab === 'me'
                                    ? 'linear-gradient(135deg, rgba(201, 169, 98, 0.9) 0%, rgba(201, 169, 98, 0.8) 100%)'
                                    : 'var(--hover-overlay)',
                                color: activeTab === 'me' ? 'white' : 'var(--text-secondary)',
                                border: activeTab === 'me' ? '1px solid rgba(201, 169, 98, 0.3)' : '1px solid transparent',
                                boxShadow: activeTab === 'me' ? '0 4px 12px rgba(201, 169, 98, 0.25)' : 'none',
                            }}
                        >
                            <i className="fa-solid fa-user mr-2" />
                            Moi
                            {userNotifications.filter(n => !n.isRead).length > 0 && (
                                <span
                                    className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] text-white"
                                    style={{ background: 'var(--accent-rose)' }}
                                >
                                    {userNotifications.filter(n => !n.isRead).length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('friends')}
                            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all"
                            style={{
                                background: activeTab === 'friends'
                                    ? 'linear-gradient(135deg, rgba(139, 168, 136, 0.9) 0%, rgba(139, 168, 136, 0.8) 100%)'
                                    : 'var(--hover-overlay)',
                                color: activeTab === 'friends' ? 'white' : 'var(--text-secondary)',
                                border: activeTab === 'friends' ? '1px solid rgba(139, 168, 136, 0.3)' : '1px solid transparent',
                                boxShadow: activeTab === 'friends' ? '0 4px 12px rgba(139, 168, 136, 0.25)' : 'none',
                            }}
                        >
                            <i className="fa-solid fa-users mr-2" />
                            Amis
                            {friendNotifications.filter(n => !n.isRead).length > 0 && (
                                <span
                                    className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] text-white"
                                    style={{ background: 'var(--accent-rose)' }}
                                >
                                    {friendNotifications.filter(n => !n.isRead).length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Notification List */}
                <div
                    className="overflow-y-auto"
                    style={{ maxHeight: 'calc(100vh - 280px)' }}
                >
                    {notifications.length === 0 ? (
                        <div className="py-12 text-center">
                            <i
                                className="fa-solid fa-bell-slash text-3xl mb-3"
                                style={{ color: 'var(--text-muted)' }}
                            />
                            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                Aucune notification
                            </p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {notifications.map((notification) => (
                                <NotificationItem key={notification.id} notification={notification} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
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
