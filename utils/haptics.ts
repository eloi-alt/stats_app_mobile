/**
 * Haptic Feedback Utility
 * Provides different vibration patterns for various UI interactions
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection'

interface HapticPatterns {
    [key: string]: number | number[]
}

const HAPTIC_PATTERNS: HapticPatterns = {
    light: 10,           // Quick tap - card interactions
    medium: 25,          // Modal opens, significant navigation
    heavy: 50,           // Major actions, confirmations
    success: [10, 50, 20],  // Success feedback - short-pause-longer
    error: [50, 100, 50],   // Error feedback - long-pause-long
    selection: 5,        // Very subtle - toggle switches, option selection
}

/**
 * Check if haptic feedback is supported
 */
function isHapticSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

/**
 * Trigger a haptic feedback pattern
 * @param type - The type of haptic feedback to trigger
 * @returns boolean - Whether the haptic was triggered successfully
 */
function trigger(type: HapticType = 'light'): boolean {
    if (!isHapticSupported()) {
        return false
    }

    const pattern = HAPTIC_PATTERNS[type]

    try {
        navigator.vibrate(pattern)
        return true
    } catch {
        return false
    }
}

/**
 * Light haptic - for card taps, list item selections
 */
function light(): boolean {
    return trigger('light')
}

/**
 * Medium haptic - for modal opens, navigation changes
 */
function medium(): boolean {
    return trigger('medium')
}

/**
 * Heavy haptic - for significant actions, confirmations
 */
function heavy(): boolean {
    return trigger('heavy')
}

/**
 * Success haptic - for successful operations
 */
function success(): boolean {
    return trigger('success')
}

/**
 * Error haptic - for error states
 */
function error(): boolean {
    return trigger('error')
}

/**
 * Selection haptic - for toggle switches, checkbox selections
 */
function selection(): boolean {
    return trigger('selection')
}

/**
 * Stop any ongoing haptic feedback
 */
function stop(): boolean {
    if (!isHapticSupported()) {
        return false
    }

    try {
        navigator.vibrate(0)
        return true
    } catch {
        return false
    }
}

/**
 * Custom haptic pattern
 * @param pattern - Duration in ms or array of alternating vibration/pause durations
 */
function custom(pattern: number | number[]): boolean {
    if (!isHapticSupported()) {
        return false
    }

    try {
        navigator.vibrate(pattern)
        return true
    } catch {
        return false
    }
}

// Export as namespace-like object
const haptics = {
    trigger,
    light,
    medium,
    heavy,
    success,
    error,
    selection,
    stop,
    custom,
    isSupported: isHapticSupported,
}

export default haptics
export { haptics, trigger, light, medium, heavy, success, error, selection, stop, custom, isHapticSupported }
