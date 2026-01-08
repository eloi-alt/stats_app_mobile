/**
 * Notification Data for STATS App
 * TODO: Will be connected to Supabase notifications table
 */

export type NotificationType =
    | 'achievement'
    | 'record'
    | 'country_visit'
    | 'finance'
    | 'health'
    | 'social'
    | 'milestone'

export interface Notification {
    id: string
    type: NotificationType
    title: string
    description: string
    timestamp: string
    isRead: boolean
    icon: string
    color: string
    friendId?: string
    friendName?: string
    friendAvatar?: string
}

// Helper to get relative time
export function getRelativeTime(timestamp: string): string {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins}min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// Empty arrays - will be populated from Supabase
export const USER_NOTIFICATIONS: Notification[] = []
export const FRIEND_NOTIFICATIONS: Notification[] = []

export function getAllNotifications(): Notification[] {
    return []
}

export function getUnreadCount(): number {
    return 0
}

export function getUserNotifications(): Notification[] {
    return []
}

export function getFriendNotifications(): Notification[] {
    return []
}

export function markAllAsRead(): void {
    // TODO: Implement with Supabase
}
