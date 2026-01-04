/**
 * Module Data Utility
 * Provides persistent, deterministic data for module history and averages
 * Will be replaced with Supabase integration later
 */

export interface ModuleHistory {
    values: number[]
    weeks: string[]
}

export interface ModuleAverages {
    friends: number
    national: number
    worldwide: number
}

/**
 * Static module history data - 8 weeks of predetermined values
 * Each module has consistent historical data
 */
const STATIC_MODULE_HISTORY: Record<string, ModuleHistory> = {
    'A': { // Health
        values: [78, 82, 79, 85, 88, 84, 90, 92],
        weeks: ['W45', 'W46', 'W47', 'W48', 'W49', 'W50', 'W51', 'W1']
    },
    'B': { // World
        values: [65, 68, 72, 70, 75, 78, 74, 76],
        weeks: ['W45', 'W46', 'W47', 'W48', 'W49', 'W50', 'W51', 'W1']
    },
    'C': { // Finance
        values: [70, 72, 68, 74, 71, 75, 78, 82],
        weeks: ['W45', 'W46', 'W47', 'W48', 'W49', 'W50', 'W51', 'W1']
    },
    'D': { // Achievements
        values: [55, 58, 62, 60, 65, 68, 70, 72],
        weeks: ['W45', 'W46', 'W47', 'W48', 'W49', 'W50', 'W51', 'W1']
    },
    'E': { // Circle
        values: [60, 62, 58, 64, 66, 68, 70, 65],
        weeks: ['W45', 'W46', 'W47', 'W48', 'W49', 'W50', 'W51', 'W1']
    },
}

/**
 * Static comparison averages for each module
 */
const MODULE_AVERAGES: Record<string, ModuleAverages> = {
    'A': { friends: 88, national: 75, worldwide: 70 },
    'B': { friends: 75, national: 65, worldwide: 60 },
    'C': { friends: 72, national: 68, worldwide: 65 },
    'D': { friends: 70, national: 60, worldwide: 55 },
    'E': { friends: 65, national: 55, worldwide: 50 },
}

/**
 * Default history for unknown modules
 */
const DEFAULT_HISTORY: ModuleHistory = {
    values: [50, 52, 54, 53, 55, 57, 58, 60],
    weeks: ['W45', 'W46', 'W47', 'W48', 'W49', 'W50', 'W51', 'W1']
}

/**
 * Default averages for unknown modules
 */
const DEFAULT_AVERAGES: ModuleAverages = {
    friends: 70,
    national: 65,
    worldwide: 60
}

/**
 * Get module history data
 * @param moduleId - The module identifier (A-E)
 * @returns ModuleHistory with values and week labels
 */
export function getModuleHistory(moduleId: string): ModuleHistory {
    return STATIC_MODULE_HISTORY[moduleId] || DEFAULT_HISTORY
}

/**
 * Get module history values only (for chart compatibility)
 * @param moduleId - The module identifier (A-E)
 * @returns Array of number values
 */
export function getModuleHistoryValues(moduleId: string): number[] {
    const history = STATIC_MODULE_HISTORY[moduleId] || DEFAULT_HISTORY
    return history.values
}

/**
 * Get module comparison averages
 * @param moduleId - The module identifier (A-E)
 * @returns ModuleAverages with friends, national, worldwide values
 */
export function getModuleAverages(moduleId: string): ModuleAverages {
    return MODULE_AVERAGES[moduleId] || DEFAULT_AVERAGES
}

/**
 * Get all modules data
 * @returns Record of all module histories
 */
export function getAllModuleHistories(): Record<string, ModuleHistory> {
    return STATIC_MODULE_HISTORY
}

/**
 * Get all module averages
 * @returns Record of all module averages
 */
export function getAllModuleAverages(): Record<string, ModuleAverages> {
    return MODULE_AVERAGES
}
