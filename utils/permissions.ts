import { PrivacySettings, PrivacyCategory } from '@/hooks/usePrivacySettings'
import { Friendship } from '@/hooks/useFriendRequests'

/**
 * Check if the current user can view a specific category of data from a friend
 * 
 * @param friendId - The user ID of the friend whose data we want to access
 * @param category - The category of data (finance, physio, world, career, social)
 * @param friendPrivacySettings - The privacy settings of the friend
 * @param friendships - List of current user's friendships
 * @returns true if access is allowed, false otherwise
 */
export function canViewFriendData(
    friendId: string,
    category: PrivacyCategory,
    friendPrivacySettings: PrivacySettings | null,
    friendships: Friendship[]
): boolean {
    // First check: Are we friends?
    const isFriend = friendships.some(f => f.friendId === friendId)
    if (!isFriend) {
        return false
    }

    // Second check: Has the friend made this category public?
    if (!friendPrivacySettings) {
        // If we can't load settings, default to private (secure default)
        return false
    }

    const categoryPublicMap: Record<PrivacyCategory, keyof PrivacySettings> = {
        finance: 'financePublic',
        physio: 'physioPublic',
        world: 'worldPublic',
        career: 'careerPublic',
        social: 'socialPublic'
    }

    const publicKey = categoryPublicMap[category]
    return friendPrivacySettings[publicKey] as boolean
}

/**
 * Get a user-friendly message for why data is not accessible
 */
export function getDataAccessMessage(
    friendId: string,
    category: PrivacyCategory,
    friendPrivacySettings: PrivacySettings | null,
    friendships: Friendship[]
): string {
    const isFriend = friendships.some(f => f.friendId === friendId)

    if (!isFriend) {
        return 'Vous devez être ami avec cet utilisateur pour voir ces données'
    }

    const hasAccess = canViewFriendData(friendId, category, friendPrivacySettings, friendships)

    if (!hasAccess) {
        const categoryLabels: Record<PrivacyCategory, string> = {
            finance: 'finances',
            physio: 'données physio',
            world: 'voyages',
            career: 'carrière',
            social: 'données sociales'
        }
        return `Cet utilisateur a choisi de garder ses ${categoryLabels[category]} privées`
    }

    return ''
}
