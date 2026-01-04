/**
 * Notification Data for STATS App
 * Mock data for user and friend notifications - ready for Supabase integration
 */

import { FRIENDS_DATA } from './worldData'

// Notification types
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
    timestamp: string // ISO date string
    isRead: boolean
    icon: string // FontAwesome icon class
    color: string
    // For friend notifications
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

// Friend avatars mapping
const FRIEND_AVATARS: Record<string, string> = {
    'contact_sophie': '/truecircle/Sophie.jpg',
    'contact_lucas': '/truecircle/Lucas.jpg',
    'contact_emma': '/truecircle/Emma.jpg',
    'contact_thomas': '/truecircle/Thomas.jpg',
    'contact_lea': '/truecircle/Lea.jpg',
    'contact_hugo': '/truecircle/Hugo.jpg',
    'contact_camille': '/truecircle/Camille.jpg',
    'contact_antoine': '/truecircle/Antoine.jpg',
    'contact_marie': '/truecircle/Marie.jpg',
    'contact_pierre': '/truecircle/Pierre.jpg',
}

// User's own notifications
export const USER_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif_user_001',
        type: 'achievement',
        title: 'Nouveau badge débloqué !',
        description: 'Globe-trotter : 12 pays visités',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2h ago
        isRead: false,
        icon: 'fa-solid fa-trophy',
        color: '#C9A962',
    },
    {
        id: 'notif_user_002',
        type: 'record',
        title: 'Record personnel battu',
        description: 'Meilleure semaine de sommeil : 8h15 de moyenne',
        timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), // 8h ago
        isRead: false,
        icon: 'fa-solid fa-bed',
        color: '#8BA888',
    },
    {
        id: 'notif_user_003',
        type: 'finance',
        title: 'Objectif atteint',
        description: 'Épargne mensuelle : 2 500€ ce mois',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
        isRead: true,
        icon: 'fa-solid fa-piggy-bank',
        color: '#C9A962',
    },
    {
        id: 'notif_user_004',
        type: 'milestone',
        title: 'Milestone Finance',
        description: 'Patrimoine net : 100 000€ atteint',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
        isRead: true,
        icon: 'fa-solid fa-chart-line',
        color: '#C9A962',
    },
    {
        id: 'notif_user_005',
        type: 'health',
        title: '30 jours consécutifs',
        description: 'Série de 10 000 pas quotidiens !',
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
        isRead: true,
        icon: 'fa-solid fa-shoe-prints',
        color: '#8BA888',
    },
]

// Friend notifications - dynamically generated based on FRIENDS_DATA
export const FRIEND_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif_friend_001',
        type: 'country_visit',
        title: 'Sophie a visité un nouveau pays',
        description: 'Nouvelle-Zélande ajoutée à sa carte',
        timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), // 1h ago
        isRead: false,
        icon: 'fa-solid fa-plane',
        color: '#A5C4D4',
        friendId: 'contact_sophie',
        friendName: 'Sophie',
        friendAvatar: FRIEND_AVATARS['contact_sophie'],
    },
    {
        id: 'notif_friend_002',
        type: 'achievement',
        title: 'Lucas a débloqué un badge',
        description: 'Aventurier Africain : 5 pays du continent',
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), // 4h ago
        isRead: false,
        icon: 'fa-solid fa-medal',
        color: '#B8A5D4',
        friendId: 'contact_lucas',
        friendName: 'Lucas',
        friendAvatar: FRIEND_AVATARS['contact_lucas'],
    },
    {
        id: 'notif_friend_003',
        type: 'record',
        title: 'Emma bat un record',
        description: 'Marathon de Paris en 3h42',
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), // 12h ago
        isRead: false,
        icon: 'fa-solid fa-running',
        color: '#8BA888',
        friendId: 'contact_emma',
        friendName: 'Emma',
        friendAvatar: FRIEND_AVATARS['contact_emma'],
    },
    {
        id: 'notif_friend_004',
        type: 'country_visit',
        title: 'Thomas a visité la Chine',
        description: 'Première visite en Asie de l\'Est',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
        isRead: true,
        icon: 'fa-solid fa-earth-asia',
        color: '#A5C4D4',
        friendId: 'contact_thomas',
        friendName: 'Thomas',
        friendAvatar: FRIEND_AVATARS['contact_thomas'],
    },
    {
        id: 'notif_friend_005',
        type: 'milestone',
        title: 'Hugo atteint 20 pays',
        description: 'Badge Explorateur Confirmé débloqué',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
        isRead: true,
        icon: 'fa-solid fa-globe',
        color: '#B8A5D4',
        friendId: 'contact_hugo',
        friendName: 'Hugo',
        friendAvatar: FRIEND_AVATARS['contact_hugo'],
    },
    {
        id: 'notif_friend_006',
        type: 'finance',
        title: 'Antoine investit 10 000€',
        description: 'Premier investissement immobilier',
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
        isRead: true,
        icon: 'fa-solid fa-building',
        color: '#C9A962',
        friendId: 'contact_antoine',
        friendName: 'Antoine',
        friendAvatar: FRIEND_AVATARS['contact_antoine'],
    },
    {
        id: 'notif_friend_007',
        type: 'achievement',
        title: 'Camille débloque Voyageuse Solo',
        description: '5 pays visités en solo cette année',
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
        isRead: true,
        icon: 'fa-solid fa-person-walking-luggage',
        color: '#D4A5A5',
        friendId: 'contact_camille',
        friendName: 'Camille',
        friendAvatar: FRIEND_AVATARS['contact_camille'],
    },
    {
        id: 'notif_friend_008',
        type: 'health',
        title: 'Marie atteint 100 séances de yoga',
        description: 'Badge Zen Master débloqué',
        timestamp: new Date(Date.now() - 6 * 86400000).toISOString(), // 6 days ago
        isRead: true,
        icon: 'fa-solid fa-spa',
        color: '#8BA888',
        friendId: 'contact_marie',
        friendName: 'Marie',
        friendAvatar: FRIEND_AVATARS['contact_marie'],
    },
]

// Get all notifications sorted by timestamp
export function getAllNotifications(): Notification[] {
    return [...USER_NOTIFICATIONS, ...FRIEND_NOTIFICATIONS]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Get unread count
export function getUnreadCount(): number {
    return [...USER_NOTIFICATIONS, ...FRIEND_NOTIFICATIONS]
        .filter(n => !n.isRead).length
}

// Get user notifications only
export function getUserNotifications(): Notification[] {
    return USER_NOTIFICATIONS
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Get friend notifications only
export function getFriendNotifications(): Notification[] {
    return FRIEND_NOTIFICATIONS
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Mark all notifications as read
export function markAllAsRead(): void {
    USER_NOTIFICATIONS.forEach(n => { n.isRead = true });
    FRIEND_NOTIFICATIONS.forEach(n => { n.isRead = true });
}
