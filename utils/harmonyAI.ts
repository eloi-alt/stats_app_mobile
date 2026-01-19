// ============================================================================
// AI-Powered Harmony Score Calculator
// Based on SQAP (Système de Quantification de l'Alignement Personnel)
// ============================================================================

import { getGroqClient } from '@/lib/groq'
import type {
    HarmonyAIResponse,
    HarmonyAIRequest,
    UserGoals,
} from '@/lib/groq'
import type { UserProfile } from '@/types/UserProfile'

// ============================================================================
// Master Prompt for AI Harmony Calculation
// ============================================================================

const HARMONY_MASTER_PROMPT = `# SYSTÈME D'ANALYSE HARMONY - CONSEILS PERSONNALISÉS

## IDENTITÉ
Tu es un **Conseiller d'Alignement de Vie**, un système d'analyse objective et honnête. Tu n'es PAS un coach motivationnel - tu es un analyste de données rigoureux qui dit la vérité, même quand elle est difficile à entendre.

## PRINCIPES FONDAMENTAUX

### HONNÊTETÉ ABSOLUE
- Sois **brutalement honnête** : si les données montrent un problème, dis-le clairement
- Ne minimise JAMAIS les points négatifs pour "ménager" l'utilisateur
- Si un objectif est irréaliste vu les données, recommande de le **baisser**
- Si l'utilisateur sous-performe gravement, utilise un langage direct ("alarmant", "critique", "échec")
- Si l'utilisateur excelle, félicite-le sincèrement avec des données précises

### ANALYSE BASÉE SUR LES DONNÉES UNIQUEMENT
- Base-toi EXCLUSIVEMENT sur les données JSON fournies
- Cite des chiffres précis dans tes analyses
- Compare les métriques actuelles aux objectifs déclarés
- Identifie les tendances (amélioration/dégradation) sur les périodes disponibles

## STRUCTURE D'ANALYSE

### PILIER A : VITALITÉ (30% du score)
**Données analysées :** sleep[], activity[], measurements
**Métriques clés :**
- Durée moyenne de sommeil vs objectif (7-8h recommandé)
- Fréquence d'activité physique vs objectif
- Évolution du poids vs poids cible
- Qualité du sommeil (% "good"/"excellent")

### PILIER B : SOUVERAINETÉ (25% du score)
**Données analysées :** assets, liabilities, career
**Métriques clés :**
- Net worth actuel vs objectif
- Ratio assets/liabilities
- Progression de carrière
- Marge de sécurité financière

### PILIER C : CONNEXION (20% du score)
**Données analysées :** connections, social_activities
**Métriques clés :**
- Taille du cercle intime vs objectif
- Fréquence des interactions sociales
- Qualité des interactions récentes
- Ratio actifs/total contacts

### PILIER D : EXPANSION (25% du score)
**Données analysées :** achievements, visited_countries
**Métriques clés :**
- Nombre de pays visités vs objectif
- Rythme d'acquisition d'achievements
- Rareté des achievements récents
- Progression vers les milestones de carrière

## CALCUL DU HARMONY SCORE

Le score (0-100) mesure l'ALIGNEMENT entre réalité et objectifs :
- 90-100 : **Souverain** - Objectifs atteints ou dépassés
- 70-89 : **Aligné** - Bonne trajectoire, ajustements mineurs
- 50-69 : **En Construction** - Écarts significatifs mais rectifiables
- 30-49 : **Frustration** - Décalage important, révision nécessaire
- 0-29 : **Dissonance** - Objectifs totalement déconnectés de la réalité

### PÉNALITÉS SYSTÉMIQUES
- **Syndrome d'Icare** (-15pts) : Carrière haute + Santé en chute
- **Inaction Fantasmée** (-10pts) : Grands objectifs + Aucune action récente
- **Prisonnier Doré** (plafonné à 60) : Riche + Isolé + En mauvaise santé

## FORMAT DE RÉPONSE (JSON STRICT)

{
  "meta": {
    "engine": "Harmony_Conseils_v3",
    "analysis_date": "YYYY-MM-DD",
    "data_quality": "string" // "Complètes", "Partielles", "Insuffisantes"
  },
  "harmony_score": {
    "value": 0,
    "tier": "string",
    "trend": "string",
    "trend_detail": "string" // ex: "+5 pts vs mois dernier" ou "-12 pts vs semaine dernière"
  },
  "pillar_scores": {
    "vitality": {
      "score": 0,
      "status": "string", // "Critique", "Préoccupant", "Moyen", "Bon", "Excellent"
      "key_metric": "string", // ex: "Sommeil moyen: 5.2h/nuit (objectif: 8h)"
      "honest_assessment": "string" // Évaluation directe et honnête
    },
    "sovereignty": {
      "score": 0,
      "status": "string",
      "key_metric": "string",
      "honest_assessment": "string"
    },
    "connection": {
      "score": 0,
      "status": "string",
      "key_metric": "string",
      "honest_assessment": "string"
    },
    "expansion": {
      "score": 0,
      "status": "string",
      "key_metric": "string",
      "honest_assessment": "string"
    }
  },
  "weekly_trend": {
    "direction": "string", // "Amélioration", "Stable", "Dégradation"
    "delta": 0, // Points gagnés/perdus
    "insight": "string" // Analyse de la semaine
  },
  "monthly_trend": {
    "direction": "string",
    "delta": 0,
    "insight": "string"
  },
  "objective_adjustments": [
    {
      "pillar": "string",
      "current_objective": "string",
      "recommended_adjustment": "string", // "Augmenter", "Maintenir", "Réduire"
      "new_target": "string",
      "justification": "string" // Basée sur les données
    }
  ],
  "conseils": [
    {
      "priority": 1,
      "type": "string", // "ACTION" ou "RÉDUCTION_OBJECTIF"
      "pillar": "string",
      "conseil": "string", // Conseil précis et actionnable
      "impact_attendu": "string", // ex: "+8 pts Harmony estimé"
      "timeline": "string" // ex: "Cette semaine", "Ce mois", "3 mois"
    }
  ],
  "warnings": [
    {
      "severity": "string", // "Info", "Attention", "Alerte", "Critique"
      "message": "string"
    }
  ],
  "archetype": {
    "name": "string",
    "description": "string",
    "forces": ["string"],
    "faiblesses": ["string"]
  }
}`

// ============================================================================
// Data Transformation Functions
// ============================================================================

/**
 * Transform UserProfile to AI-compatible request format
 */
export function transformProfileToAIRequest(
    profile: UserProfile,
    goals?: UserGoals
): HarmonyAIRequest {
    // Extract recent sleep data (last 7 records)
    const recentSleep = profile.moduleA.sleep.slice(0, 7).map(s => ({
        date: s.date,
        duration: s.duration,
        quality: s.quality,
    }))

    // Extract recent sport activities
    const recentActivity = profile.moduleA.sport.slice(0, 10).map(s => ({
        date: s.date,
        type: s.type,
        duration: s.duration,
        intensity: s.intensity,
    }))

    // Get latest measurements
    const latestMeasurement = profile.moduleA.measurements[0] || {
        weight: 0,
        restingHeartRate: 70,
    }

    // Calculate total assets
    const realEstateTotal = profile.moduleC.patrimoine.realEstate.reduce(
        (sum, r) => sum + r.currentValue,
        0
    )
    const vehiclesTotal = profile.moduleC.patrimoine.vehicles.reduce(
        (sum, v) => sum + v.currentValue,
        0
    )
    const financialTotal = profile.moduleC.patrimoine.financialAssets.reduce(
        (sum, f) => sum + f.currentValue,
        0
    )

    // Calculate total liabilities
    const mortgages = profile.moduleC.patrimoine.realEstate.reduce(
        (sum, r) => sum + (r.mortgageRemaining || 0),
        0
    )
    const otherDebt = profile.moduleC.patrimoine.liabilities.reduce(
        (sum, l) => sum + l.remainingAmount,
        0
    )

    // Extract social data
    const innerCircleCount = profile.moduleE.contacts.filter(
        c => c.dunbarPriority === 'inner_circle'
    ).length
    const activeMonthly = profile.moduleE.stats.activeThisMonth

    // Extract recent social activities
    const recentSocialActivities = profile.moduleE.interactions.slice(0, 10).map(i => ({
        date: i.date,
        type: i.type,
        quality: i.quality,
    }))

    // Extract achievements (last 10)
    const recentAchievements = profile.moduleD.achievements.slice(0, 10).map(a => ({
        title: a.title,
        date: a.dateAchieved,
        category: a.category,
        rarity: a.rarity,
    }))

    // Default goals if not provided
    const defaultGoals: UserGoals = {
        health: {
            target_weight: 75,
            sleep_hours: 7.5,
            weekly_activity_minutes: 150,
            description: 'Maintain good health and energy',
        },
        finance: {
            net_worth_target: 500000,
            monthly_savings: 2000,
            description: 'Financial independence',
        },
        social: {
            close_friends_count: 10,
            weekly_interactions: 3,
            network_size: 'moderate',
            description: 'Maintain meaningful relationships',
        },
        growth: {
            countries_to_visit: 50,
            skills_to_learn: ['leadership'],
            career_milestone: 'Director level',
            description: 'Continuous growth and exploration',
        },
    }

    return {
        health_records: {
            sleep: recentSleep,
            activity: recentActivity,
            measurements: {
                weight: latestMeasurement.weight || profile.moduleA.currentStats.currentWeight,
                hrv: profile.moduleA.currentStats.hrv,
                resting_heart_rate: latestMeasurement.restingHeartRate,
            },
        },
        assets: {
            total: profile.moduleC.patrimoine.totalAssets,
            liquid: profile.moduleC.patrimoine.liquidAssets,
            real_estate: realEstateTotal,
            investments: financialTotal,
        },
        liabilities: {
            total: profile.moduleC.patrimoine.totalLiabilities,
            mortgages,
            other_debt: otherDebt,
        },
        career: {
            position: profile.moduleC.career.currentPosition,
            years_experience: profile.moduleC.career.totalYearsExperience,
            industry: profile.moduleC.career.industry,
        },
        connections: {
            total: profile.moduleE.stats.totalContacts,
            inner_circle: innerCircleCount,
            active_monthly: activeMonthly,
        },
        social_activities: recentSocialActivities,
        achievements: recentAchievements,
        visited_countries: profile.moduleB.stats.totalCountries,
        user_goals: goals || defaultGoals,
    }
}

// ============================================================================
// AI Harmony Calculation
// ============================================================================

/**
 * Calculate Harmony Score using Groq AI
 */
export async function calculateHarmonyWithAI(
    profile: UserProfile,
    goals?: UserGoals
): Promise<HarmonyAIResponse> {
    const requestData = transformProfileToAIRequest(profile, goals)

    // Get Groq client - may be null if API key not configured
    const groq = getGroqClient()
    if (!groq) {
        console.warn('Groq client not available, using fallback calculator')
        return generateFallbackResponse(requestData)
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: HARMONY_MASTER_PROMPT,
                },
                {
                    role: 'user',
                    content: `Analyse ces données utilisateur et calcule le Harmony Score:\n\n${JSON.stringify(requestData, null, 2)}`,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3, // Low temperature for consistent, analytical responses
            max_tokens: 1024,
            response_format: { type: 'json_object' },
        })

        const responseText = completion.choices[0]?.message?.content
        if (!responseText) {
            throw new Error('No response from AI')
        }

        const parsed = JSON.parse(responseText) as HarmonyAIResponse
        return parsed
    } catch (error) {
        console.error('AI Harmony calculation failed:', error)
        // Return fallback response
        return generateFallbackResponse(requestData)
    }
}

/**
 * Generate fallback response when AI fails
 */
function generateFallbackResponse(data: HarmonyAIRequest): HarmonyAIResponse {
    // Simple algorithmic fallback
    const healthScore = calculateHealthScore(data.health_records)
    const financeScore = calculateFinanceScore(data.assets, data.liabilities)
    const socialScore = calculateSocialScore(data.connections, data.social_activities)
    const growthScore = calculateGrowthScore(data.achievements, data.visited_countries)

    // Weighted average
    const harmonyScore = Math.round(
        healthScore * 0.3 + financeScore * 0.25 + socialScore * 0.2 + growthScore * 0.25
    )

    // Determine tier
    type Tier = 'Dissonance' | 'Frustration' | 'En Construction' | 'Aligné' | 'Souverain'
    let tier: Tier = 'En Construction'
    if (harmonyScore >= 90) tier = 'Souverain'
    else if (harmonyScore >= 70) tier = 'Aligné'
    else if (harmonyScore >= 50) tier = 'En Construction'
    else if (harmonyScore >= 30) tier = 'Frustration'
    else tier = 'Dissonance'

    // Helper to get status
    type Status = 'Critique' | 'Préoccupant' | 'Moyen' | 'Bon' | 'Excellent'
    const getStatus = (score: number): Status => {
        if (score >= 85) return 'Excellent'
        if (score >= 70) return 'Bon'
        if (score >= 50) return 'Moyen'
        if (score >= 30) return 'Préoccupant'
        return 'Critique'
    }

    const today = new Date().toISOString().split('T')[0]

    return {
        meta: {
            engine: 'Harmony_Conseils_v3_Fallback',
            analysis_date: today,
            data_quality: 'Partielles',
        },
        harmony_score: {
            value: harmonyScore,
            tier,
            trend: harmonyScore > 50 ? 'Convergence' : 'Divergence',
            trend_detail: 'Analyse de tendance non disponible (mode fallback)',
        },
        pillar_scores: {
            vitality: {
                score: healthScore,
                status: getStatus(healthScore),
                key_metric: `Score santé: ${healthScore}%`,
                honest_assessment: healthScore >= 70
                    ? 'Votre santé semble bien gérée.'
                    : 'Des améliorations sont nécessaires dans ce domaine.',
            },
            sovereignty: {
                score: financeScore,
                status: getStatus(financeScore),
                key_metric: `Score financier: ${financeScore}%`,
                honest_assessment: financeScore >= 70
                    ? 'Votre situation financière est stable.'
                    : 'Votre situation financière nécessite attention.',
            },
            connection: {
                score: socialScore,
                status: getStatus(socialScore),
                key_metric: `Score social: ${socialScore}%`,
                honest_assessment: socialScore >= 70
                    ? 'Vos connexions sociales sont satisfaisantes.'
                    : 'Vos connexions sociales pourraient être renforcées.',
            },
            expansion: {
                score: growthScore,
                status: getStatus(growthScore),
                key_metric: `Score expansion: ${growthScore}%`,
                honest_assessment: growthScore >= 70
                    ? 'Votre croissance personnelle progresse bien.'
                    : 'Votre croissance personnelle pourrait être stimulée.',
            },
        },
        weekly_trend: {
            direction: 'Stable',
            delta: 0,
            insight: 'Analyse hebdomadaire non disponible en mode fallback.',
        },
        monthly_trend: {
            direction: 'Stable',
            delta: 0,
            insight: 'Analyse mensuelle non disponible en mode fallback.',
        },
        objective_adjustments: [],
        conseils: [
            {
                priority: 1,
                type: 'ACTION',
                pillar: healthScore < financeScore && healthScore < socialScore ? 'Vitalité' : 'Général',
                conseil: 'Activez l\'analyse IA pour des conseils personnalisés et détaillés.',
                impact_attendu: 'Accès à des recommandations basées sur vos données',
                timeline: 'Immédiat',
            },
        ],
        warnings: [
            {
                severity: 'Info',
                message: 'Mode fallback actif - Configurez votre clé API Groq pour l\'analyse complète.',
            },
        ],
        archetype: {
            name: 'Profil en analyse',
            description: 'L\'analyse complète de votre archétype nécessite l\'activation de l\'IA.',
            forces: ['À déterminer'],
            faiblesses: ['À déterminer'],
        },
    }
}

// ============================================================================
// Fallback Score Calculators
// ============================================================================

function calculateHealthScore(health: HarmonyAIRequest['health_records']): number {
    let score = 50

    // Sleep quality
    if (health.sleep.length > 0) {
        const avgDuration = health.sleep.reduce((sum, s) => sum + s.duration, 0) / health.sleep.length
        if (avgDuration >= 420) score += 15 // 7+ hours
        else if (avgDuration >= 360) score += 10 // 6+ hours
        else score -= 10 // Less than 6 hours

        const goodSleep = health.sleep.filter(s => s.quality === 'good' || s.quality === 'excellent').length
        score += (goodSleep / health.sleep.length) * 15
    }

    // Activity level
    if (health.activity.length > 0) {
        const weeklyMinutes = health.activity.reduce((sum, a) => sum + a.duration, 0)
        if (weeklyMinutes >= 150) score += 15
        else if (weeklyMinutes >= 75) score += 10
    }

    return Math.min(100, Math.max(0, score))
}

function calculateFinanceScore(
    assets: HarmonyAIRequest['assets'],
    liabilities: HarmonyAIRequest['liabilities']
): number {
    const netWorth = assets.total - liabilities.total

    if (netWorth > 1000000) return 95
    if (netWorth > 500000) return 85
    if (netWorth > 100000) return 70
    if (netWorth > 50000) return 60
    if (netWorth > 0) return 45
    return 25
}

function calculateSocialScore(
    connections: HarmonyAIRequest['connections'],
    activities: HarmonyAIRequest['social_activities']
): number {
    let score = 50

    // Inner circle strength
    if (connections.inner_circle >= 5) score += 20
    else if (connections.inner_circle >= 3) score += 10

    // Activity level
    if (connections.active_monthly >= 10) score += 15
    else if (connections.active_monthly >= 5) score += 10

    // Recent interactions quality
    if (activities.length > 0) {
        const goodInteractions = activities.filter(a => a.quality === 'good' || a.quality === 'great').length
        score += (goodInteractions / activities.length) * 15
    }

    return Math.min(100, Math.max(0, score))
}

function calculateGrowthScore(
    achievements: HarmonyAIRequest['achievements'],
    countriesVisited: number
): number {
    let score = 40

    // Countries exploration
    if (countriesVisited >= 30) score += 25
    else if (countriesVisited >= 15) score += 20
    else if (countriesVisited >= 5) score += 10

    // Achievements
    if (achievements.length > 0) {
        const rareAchievements = achievements.filter(
            a => a.rarity === 'rare' || a.rarity === 'epic' || a.rarity === 'legendary'
        ).length
        score += Math.min(25, rareAchievements * 5)

        // Recent achievement bonus
        const recentDate = new Date()
        recentDate.setMonth(recentDate.getMonth() - 6)
        const recentAchievements = achievements.filter(
            a => new Date(a.date) > recentDate
        ).length
        score += Math.min(10, recentAchievements * 3)
    }

    return Math.min(100, Math.max(0, score))
}

// ============================================================================
// Cached Results and State Management
// ============================================================================

let cachedAIResult: HarmonyAIResponse | null = null
let lastCalculationTime: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

/**
 * Get cached AI result or calculate new one
 */
export async function getAIHarmonyData(
    profile: UserProfile,
    goals?: UserGoals,
    forceRefresh = false
): Promise<HarmonyAIResponse> {
    const now = Date.now()

    if (!forceRefresh && cachedAIResult && now - lastCalculationTime < CACHE_DURATION) {
        return cachedAIResult
    }

    cachedAIResult = await calculateHarmonyWithAI(profile, goals)
    lastCalculationTime = now

    return cachedAIResult
}

/**
 * Clear cached AI results
 */
export function clearAICache(): void {
    cachedAIResult = null
    lastCalculationTime = 0
}
