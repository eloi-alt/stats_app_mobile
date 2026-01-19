// ============================================================================
// Groq AI Client for Harmony Score Calculation
// ============================================================================

import Groq from 'groq-sdk'

// Lazy initialization of Groq client to avoid build-time errors
let groqClient: Groq | null = null

export function getGroqClient(): Groq | null {
    if (typeof window === 'undefined') {
        // Server-side: don't initialize
        return null
    }

    if (groqClient) {
        return groqClient
    }

    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY
    if (!apiKey) {
        console.warn('Groq API key not configured. AI Harmony features will be disabled.')
        return null
    }

    try {
        groqClient = new Groq({
            apiKey,
            dangerouslyAllowBrowser: true,
        })
        return groqClient
    } catch (error) {
        console.error('Failed to initialize Groq client:', error)
        return null
    }
}

const groq = { getClient: getGroqClient }
export default groq

// ============================================================================
// Type Definitions for AI Harmony Response (Conseils v3)
// ============================================================================

export interface PillarScore {
    score: number
    status: 'Critique' | 'Préoccupant' | 'Moyen' | 'Bon' | 'Excellent'
    key_metric: string
    honest_assessment: string
}

export interface TrendAnalysis {
    direction: 'Amélioration' | 'Stable' | 'Dégradation'
    delta: number
    insight: string
}

export interface ObjectiveAdjustment {
    pillar: string
    current_objective: string
    recommended_adjustment: 'Augmenter' | 'Maintenir' | 'Réduire'
    new_target: string
    justification: string
}

export interface Conseil {
    priority: number
    type: 'ACTION' | 'RÉDUCTION_OBJECTIF'
    pillar: string
    conseil: string
    impact_attendu: string
    timeline: string
}

export interface Warning {
    severity: 'Info' | 'Attention' | 'Alerte' | 'Critique'
    message: string
}

export interface Archetype {
    name: string
    description: string
    forces: string[]
    faiblesses: string[]
}

export interface HarmonyAIResponse {
    meta: {
        engine: string
        analysis_date: string
        data_quality: 'Complètes' | 'Partielles' | 'Insuffisantes'
    }
    harmony_score: {
        value: number
        tier: 'Dissonance' | 'Frustration' | 'En Construction' | 'Aligné' | 'Souverain'
        trend: 'Convergence' | 'Divergence'
        trend_detail: string
    }
    pillar_scores: {
        vitality: PillarScore
        sovereignty: PillarScore
        connection: PillarScore
        expansion: PillarScore
    }
    weekly_trend: TrendAnalysis
    monthly_trend: TrendAnalysis
    objective_adjustments: ObjectiveAdjustment[]
    conseils: Conseil[]
    warnings: Warning[]
    archetype: Archetype
}

// Legacy response format for backward compatibility
export interface HarmonyAIResponseLegacy {
    meta: {
        engine: string
        user_intent_detected: string
    }
    alignment_metric: {
        harmony_score: number
        objective_performance: number
        tier: 'Dissonance' | 'Frustration' | 'En Construction' | 'Aligné' | 'Souverain'
        trend: 'Convergence' | 'Divergence'
    }
    gap_analysis: {
        vitality_gap: string
        sovereignty_gap: string
        connection_gap: string
        expansion_gap: string
    }
    systemic_diagnosis: {
        primary_friction: string
        hidden_strength: string
        archetype: string
    }
    prescriptive_action: {
        focus_area: string
        strategy_type: 'ACTION' | 'ACCEPTATION'
        concrete_step: string
    }
}

// ============================================================================
// AI Request Types
// ============================================================================

export interface UserGoals {
    health: {
        target_weight?: number
        sleep_hours?: number
        weekly_activity_minutes?: number
        description?: string
    }
    finance: {
        net_worth_target?: number
        monthly_savings?: number
        debt_free_date?: string
        description?: string
    }
    social: {
        close_friends_count?: number
        weekly_interactions?: number
        network_size?: string // 'minimal' | 'moderate' | 'extensive'
        description?: string
    }
    growth: {
        countries_to_visit?: number
        skills_to_learn?: string[]
        career_milestone?: string
        description?: string
    }
}

export interface HarmonyAIRequest {
    health_records: {
        sleep: Array<{
            date: string
            duration: number
            quality: string
        }>
        activity: Array<{
            date: string
            type: string
            duration: number
            intensity: string
        }>
        measurements: {
            weight: number
            hrv?: number
            resting_heart_rate?: number
        }
    }
    assets: {
        total: number
        liquid: number
        real_estate: number
        investments: number
    }
    liabilities: {
        total: number
        mortgages: number
        other_debt: number
    }
    career: {
        position: string
        years_experience: number
        industry: string
        satisfaction?: number
    }
    connections: {
        total: number
        inner_circle: number
        active_monthly: number
    }
    social_activities: Array<{
        date: string
        type: string
        quality: string
    }>
    achievements: Array<{
        title: string
        date: string
        category: string
        rarity: string
    }>
    visited_countries: number
    user_goals: UserGoals
}
