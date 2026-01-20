import QRCode from 'qrcode'

/**
 * Generate a QR code data URL for a given text
 * @param text - The text to encode in the QR code
 * @param size - The size of the QR code in pixels (default: 256)
 * @returns Promise<string> - Data URL of the generated QR code
 */
export async function generateQRCode(text: string, size: number = 256): Promise<string> {
    try {
        const dataUrl = await QRCode.toDataURL(text, {
            width: size,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })
        return dataUrl
    } catch (error) {
        console.error('[QRCode] Error generating QR code:', error)
        throw error
    }
}

/**
 * Generate a QR code for a user profile
 * @param userId - The user's ID
 * @param username - The user's username (optional, for display)
 * @returns Promise<string> - Data URL of the generated QR code
 */
export async function generateUserProfileQR(userId: string, username?: string): Promise<string> {
    // For now, using a simple format. In production, this could be a deep link or web URL
    const profileUrl = `https://stats.app/user/${userId}`
    return generateQRCode(profileUrl, 256)
}

/**
 * Share a user profile using the native share API (iOS/Android)
 * Falls back to clipboard copy if native share is not available
 * @param userId - The user's ID
 * @param username - The user's username
 * @param displayName - The user's display name
 */
export async function shareUserProfile(
    userId: string,
    username: string | null,
    displayName: string
): Promise<{ success: boolean; method: 'native' | 'clipboard' | 'none' }> {
    const profileUrl = `https://stats.app/user/${userId}`
    const shareText = `Check out ${displayName}${username ? ` (@${username})` : ''}'s profile on STATS App!`

    // Try native share API first (available on iOS, Android, and modern browsers)
    if (navigator.share) {
        try {
            await navigator.share({
                title: `${displayName} - STATS Profile`,
                text: shareText,
                url: profileUrl
            })
            return { success: true, method: 'native' }
        } catch (error) {
            // User cancelled or error occurred
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('[Share] Native share error:', error)
            }
        }
    }

    // Fallback to clipboard
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(`${shareText}\n${profileUrl}`)
            return { success: true, method: 'clipboard' }
        } catch (error) {
            console.error('[Share] Clipboard error:', error)
        }
    }

    return { success: false, method: 'none' }
}
