// ============================================================================
// AI-Powered Harmony Score Calculator
// Client-side wrapper for /api/analyze-harmony
// ============================================================================

import type { HarmonyAIResponse } from '@/lib/harmony-schemas'
import type { UserProfile } from '@/types/UserProfile'
import type { UserGoals, HarmonyAIRequest } from '@/lib/groq' // Keeping request types

// ============================================================================
// Logic Offloading & Data Transformation
// ============================================================================

/**
 * Transform UserProfile to AI-compatible request format
 * With logic offloading (pre-calculated metrics)
 */
export function transformProfileToAIRequest(
    profile: UserProfile,
    goals?: UserGoals,
    language: string = 'fr'
): HarmonyAIRequest & { language: string } {
    // 1. DATA PRE-CALCULATION (Logic Offloading)

    // Sleep Metrics
    const sleepRecords = profile.moduleA.sleep.slice(0, 7)
    const avgSleepCoordinates = sleepRecords.length > 0
        ? sleepRecords.reduce((sum, s) => sum + s.duration, 0) / sleepRecords.length
        : 0

    // Activity Metrics
    const activityRecords = profile.moduleA.sport.slice(0, 7)
    const weeklyActiveMinutes = activityRecords.reduce((sum, s) => sum + s.duration, 0)

    // Financial Metrics
    const netWorth = profile.moduleC.patrimoine.netWorth
    const liquidityRatio = profile.moduleC.patrimoine.totalAssets > 0
        ? profile.moduleC.patrimoine.liquidAssets / profile.moduleC.patrimoine.totalAssets
        : 0

    // Social Metrics
    const innerCircleCount = profile.moduleE.contacts.filter(c => c.dunbarPriority === 'inner_circle').length

    // Default Goals
    const defaultGoals: UserGoals = {
        health: { target_weight: 75, sleep_hours: 7.5, weekly_activity_minutes: 150 },
        finance: { net_worth_target: 500000, monthly_savings: 2000 },
        social: { close_friends_count: 5, weekly_interactions: 3 },
        growth: { countries_to_visit: 30, skills_to_learn: [] },
    }

    // Construct Payload with PRE-CALC stats + Language
    return {
        language,
        health_records: {
            sleep: sleepRecords.map(s => ({ date: s.date, duration: s.duration, quality: s.quality })),
            activity: activityRecords.map(s => ({ date: s.date, type: s.type, duration: s.duration, intensity: s.intensity })),
            measurements: {
                weight: profile.moduleA.currentStats.currentWeight,
                hrv: profile.moduleA.currentStats.hrv,
                resting_heart_rate: 70, // Default or fetch from measurements
            }
        },
        assets: {
            total: profile.moduleC.patrimoine.totalAssets,
            liquid: profile.moduleC.patrimoine.liquidAssets,
            real_estate: 0, // Simplified for brevity in this context
            investments: 0,
        },
        liabilities: {
            total: profile.moduleC.patrimoine.totalLiabilities,
            mortgages: 0,
            other_debt: 0,
        },
        career: {
            position: profile.moduleC.career.currentPosition,
            years_experience: profile.moduleC.career.totalYearsExperience,
            industry: profile.moduleC.career.industry,
        },
        connections: {
            total: profile.moduleE.stats.totalContacts,
            inner_circle: innerCircleCount,
            active_monthly: profile.moduleE.stats.activeThisMonth,
        },
        social_activities: profile.moduleE.interactions.slice(0, 10).map(i => ({
            date: i.date, type: i.type, quality: i.quality
        })),
        achievements: profile.moduleD.achievements.slice(0, 10).map(a => ({
            title: a.title, date: a.dateAchieved, category: a.category, rarity: a.rarity
        })),
        visited_countries: profile.moduleB.stats.totalCountries,
        user_goals: goals || defaultGoals,
    }
}

// ============================================================================
// API Client
// ============================================================================

/**
 * Calculate Harmony Score using Server-Side API (Llama 3.1)
 */
export async function calculateHarmonyWithAI(
    profile: UserProfile,
    goals?: UserGoals,
    forceRefresh = false,
    language: string = 'fr'
): Promise<HarmonyAIResponse> {
    const requestData = transformProfileToAIRequest(profile, goals, language)

    try {
        const url = forceRefresh ? '/api/analyze-harmony?force=true' : '/api/analyze-harmony'
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()
        return data as HarmonyAIResponse

    } catch (error) {
        console.error('AI Calculation error:', error)
        return generateFallbackResponse(requestData)
    }
}

// ============================================================================
// Fallback Generator
// ============================================================================

function generateFallbackResponse(data: HarmonyAIRequest): HarmonyAIResponse {
    // Minimal fallback implementation
    const today = new Date().toISOString().split('T')[0]
    return {
        meta: { engine: 'Fallback_Local', analysis_date: today, language: 'fr', data_quality: 'Insuffisantes' },
        harmony_score: { value: 50, tier: 'En Construction', trend: 'Convergence', trend_detail: 'Mode hors-ligne' },
        pillar_scores: {
            vitality: { score: 50, status: 'Moyen', key_metric: 'N/A', honest_assessment: 'Données inaccessibles' },
            sovereignty: { score: 50, status: 'Moyen', key_metric: 'N/A', honest_assessment: 'Données inaccessibles' },
            connection: { score: 50, status: 'Moyen', key_metric: 'N/A', honest_assessment: 'Données inaccessibles' },
            expansion: { score: 50, status: 'Moyen', key_metric: 'N/A', honest_assessment: 'Données inaccessibles' }
        },
        weekly_trend: { direction: 'Stable', delta: 0, insight: 'Pas de connexion.' },
        monthly_trend: { direction: 'Stable', delta: 0, insight: 'Pas de connexion.' },
        objective_adjustments: [],
        conseils: [{ priority: 1, type: 'ACTION', pillar: 'Général', conseil: 'Vérifiez votre connexion internet.', impact_attendu: 'Rétablissement service', timeline: 'Immédiat' }],
        warnings: [],
        archetype: { name: 'Inconnu', description: 'Mode dégradé', forces: [], faiblesses: [] }
    }
}

// ============================================================================
// State Management
// ============================================================================

let cachedAIResult: HarmonyAIResponse | null = null

export async function getAIHarmonyData(
    profile: UserProfile,
    goals?: UserGoals,
    forceRefresh = false,
    language: string = 'fr'
): Promise<HarmonyAIResponse> {
    if (!forceRefresh && cachedAIResult) {
        return cachedAIResult
    }

    // The API handles the DB caching logic (checking hashes)
    // We just forward the request. The API returns cached JSON if hash matches.
    cachedAIResult = await calculateHarmonyWithAI(profile, goals, forceRefresh, language)
    return cachedAIResult
}

export function clearAICache(): void {
    cachedAIResult = null
}
