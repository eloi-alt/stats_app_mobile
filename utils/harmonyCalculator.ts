// Harmony Calculator with Historical Data and Degressive Coefficients
// Enhanced with AI-powered analysis via Groq
// Coefficients: Friends (0.5) > National (0.3) > Worldwide (0.2)

import { ThomasMorel, userGoals } from '@/data/mockData'
import { getAIHarmonyData, clearAICache } from '@/utils/harmonyAI'
import type { HarmonyAIResponse } from '@/lib/groq'

export interface HarmonyHistoryPoint {
  date: string
  value: number
  friendsAvg: number
  nationalAvg: number
  worldwideAvg: number
}

// Generate historical data (last 12 weeks)
export function generateHarmonyHistory(): HarmonyHistoryPoint[] {
  const history: HarmonyHistoryPoint[] = []
  const today = new Date()

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - (i * 7))

    // Base values with some variation
    const baseValue = 85
    const variation = (Math.random() - 0.5) * 10
    const value = Math.max(0, Math.min(100, baseValue + variation))

    // Friends average (closer to user, higher weight)
    const friendsAvg = value + (Math.random() - 0.5) * 8

    // National average (moderate difference)
    const nationalAvg = value + (Math.random() - 0.5) * 15

    // Worldwide average (more variation)
    const worldwideAvg = value + (Math.random() - 0.5) * 20

    history.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
      friendsAvg: Math.round(Math.max(0, Math.min(100, friendsAvg))),
      nationalAvg: Math.round(Math.max(0, Math.min(100, nationalAvg))),
      worldwideAvg: Math.round(Math.max(0, Math.min(100, worldwideAvg))),
    })
  }

  return history
}

// Calculate Harmony score with degressive coefficients
export function calculateHarmonyScore(
  userScores: { [key: string]: number },
  friendsAvg: { [key: string]: number },
  nationalAvg: { [key: string]: number },
  worldwideAvg: { [key: string]: number }
): number {
  const modules = ['A', 'B', 'C', 'D', 'E']
  let totalWeightedScore = 0
  let totalWeight = 0

  modules.forEach((module) => {
    const userScore = userScores[module] || 0

    // Calculate weighted average with degressive coefficients
    // Friends (0.5) > National (0.3) > Worldwide (0.2)
    const friendsWeight = 0.5
    const nationalWeight = 0.3
    const worldwideWeight = 0.2

    const weightedAvg =
      (friendsAvg[module] || userScore) * friendsWeight +
      (nationalAvg[module] || userScore) * nationalWeight +
      (worldwideAvg[module] || userScore) * worldwideWeight

    // Personal score gets 60% weight, weighted average gets 40%
    const personalWeight = 0.6
    const avgWeight = 0.4

    const moduleScore = userScore * personalWeight + weightedAvg * avgWeight

    totalWeightedScore += moduleScore
    totalWeight += 1
  })

  return Math.round(totalWeightedScore / totalWeight)
}

// Get current Harmony score
export function getCurrentHarmonyScore(): number {
  const userScores = {
    A: ThomasMorel.performance.byModule.A,
    B: ThomasMorel.performance.byModule.B,
    C: ThomasMorel.performance.byModule.C,
    D: ThomasMorel.performance.byModule.D,
    E: ThomasMorel.performance.byModule.E,
  }

  // Mock averages (in real app, these would come from API)
  const friendsAvg = {
    A: 88,
    B: 75,
    C: 72,
    D: 70,
    E: 65,
  }

  const nationalAvg = {
    A: 75,
    B: 65,
    C: 68,
    D: 60,
    E: 55,
  }

  const worldwideAvg = {
    A: 70,
    B: 60,
    C: 65,
    D: 55,
    E: 50,
  }

  return calculateHarmonyScore(userScores, friendsAvg, nationalAvg, worldwideAvg)
}

// =============================================================================
// Objective-Based Harmony Calculation
// =============================================================================

export type HarmonyDimension = 'health' | 'finance' | 'social' | 'career' | 'world'

export interface HarmonyObjective {
  id: string
  dimension: HarmonyDimension
  title: string
  description: string
  target: number
  current: number
  unit: string
  priority: 'high' | 'medium' | 'low'
  deadline: string | null
}

export interface DimensionScores {
  health: number
  finance: number
  social: number
  career: number
  world: number
}

// Calculate progress for a single objective (0-100)
export function calculateObjectiveProgress(objective: HarmonyObjective): number {
  if (objective.target === 0) return 100

  // For weight loss objectives: closer to target is better
  if (objective.id === 'obj_health_1') {
    if (objective.current <= objective.target) return 100
    const overage = objective.current - objective.target
    const tolerance = objective.target * 0.1
    return Math.max(0, 100 - (overage / tolerance) * 50)
  }

  const progress = (objective.current / objective.target) * 100
  return Math.min(100, Math.max(0, progress))
}

// Calculate score for each dimension
export function calculateDimensionScores(objectives: HarmonyObjective[]): DimensionScores {
  const dimensions: HarmonyDimension[] = ['health', 'finance', 'social', 'career', 'world']
  const scores: DimensionScores = { health: 0, finance: 0, social: 0, career: 0, world: 0 }

  dimensions.forEach(dim => {
    const dimObjectives = objectives.filter(o => o.dimension === dim)
    if (dimObjectives.length === 0) {
      scores[dim] = 50
      return
    }

    let totalWeight = 0
    let weightedSum = 0

    dimObjectives.forEach(obj => {
      const weight = obj.priority === 'high' ? 3 : obj.priority === 'medium' ? 2 : 1
      weightedSum += calculateObjectiveProgress(obj) * weight
      totalWeight += weight
    })

    scores[dim] = Math.round(weightedSum / totalWeight)
  })

  return scores
}

// Calculate overall alignment score
export function calculateAlignmentScore(
  dimensionScores: DimensionScores,
  weights: { [key in HarmonyDimension]: number }
): number {
  let totalScore = 0
  let totalWeight = 0

    ; (Object.keys(weights) as HarmonyDimension[]).forEach(dim => {
      totalScore += dimensionScores[dim] * weights[dim]
      totalWeight += weights[dim]
    })

  return Math.round(totalScore / totalWeight)
}

// Generate AI insight (mock for MVP)
export function generateHarmonyInsight(
  overallScore: number,
  dimensionScores: DimensionScores
): string {
  const entries = Object.entries(dimensionScores) as [HarmonyDimension, number][]
  const sorted = entries.sort((a, b) => a[1] - b[1])
  const weakest = sorted[0]
  const strongest = sorted[sorted.length - 1]

  const names: { [key in HarmonyDimension]: string } = {
    health: 'ta santé',
    finance: 'tes finances',
    social: 'ton cercle social',
    career: 'ta carrière',
    world: 'ton exploration du monde'
  }

  let insight = overallScore >= 80
    ? 'Excellent alignement ! '
    : overallScore >= 60
      ? 'Alignement correct, avec marge de progression. '
      : 'Ton alignement mérite plus d\'attention. '

  insight += `${names[strongest[0]].charAt(0).toUpperCase() + names[strongest[0]].slice(1)} est ton point fort (${strongest[1]}%). `

  if (weakest[1] < 60) {
    insight += `Concentre-toi sur ${names[weakest[0]]} (${weakest[1]}%).`
  }

  return insight
}

// Get complete harmony data
export function getHarmonyData() {
  const objectives = ThomasMorel.harmony.objectives as HarmonyObjective[]
  const weights = ThomasMorel.harmony.dimensionWeights as { [key in HarmonyDimension]: number }

  const dimensionScores = calculateDimensionScores(objectives)
  const alignmentScore = calculateAlignmentScore(dimensionScores, weights)
  const aiInsight = generateHarmonyInsight(alignmentScore, dimensionScores)

  return {
    objectives,
    dimensionScores,
    alignmentScore,
    aiInsight,
    weights,
    lastUpdated: ThomasMorel.harmony.lastUpdated
  }
}

// =============================================================================
// Dynamic Historical Data Generation
// =============================================================================

export interface DetailedHistoryPoint {
  date: string
  label: string
  value: number
  dimensions: DimensionScores
}

// Seeded random for consistent demo data
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Generate week history (last 7 days)
export function generateWeekHistory(): DetailedHistoryPoint[] {
  const history: DetailedHistoryPoint[] = []
  const today = new Date()
  const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const seed = date.getDate() + date.getMonth() * 31

    // Slight daily fluctuations
    const baseScore = 65
    const dailyVariation = (seededRandom(seed) - 0.5) * 8

    history.push({
      date: date.toISOString().split('T')[0],
      label: dayLabels[date.getDay()],
      value: Math.round(Math.max(0, Math.min(100, baseScore + dailyVariation))),
      dimensions: {
        health: Math.round(70 + (seededRandom(seed + 1) - 0.5) * 10),
        finance: Math.round(95 + (seededRandom(seed + 2) - 0.5) * 5),
        social: Math.round(55 + (seededRandom(seed + 3) - 0.5) * 15),
        career: Math.round(45 + (seededRandom(seed + 4) - 0.5) * 10),
        world: Math.round(35 + (seededRandom(seed + 5) - 0.5) * 8),
      }
    })
  }

  return history
}

// Generate month history (last 30 days, grouped by week)
export function generateMonthHistory(): DetailedHistoryPoint[] {
  const history: DetailedHistoryPoint[] = []
  const today = new Date()

  for (let i = 4; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - (i * 7))
    const seed = date.getDate() + date.getMonth() * 31

    // Weekly trend
    const weekNum = Math.ceil((today.getDate() - i * 7) / 7)
    const trend = i * 1.5 // Gradual improvement

    history.push({
      date: date.toISOString().split('T')[0],
      label: `S${weekNum}`,
      value: Math.round(Math.max(0, Math.min(100, 60 + trend + (seededRandom(seed) - 0.5) * 6))),
      dimensions: {
        health: Math.round(68 + trend + (seededRandom(seed + 1) - 0.5) * 8),
        finance: Math.round(92 + (seededRandom(seed + 2) - 0.5) * 4),
        social: Math.round(50 + trend * 0.5 + (seededRandom(seed + 3) - 0.5) * 10),
        career: Math.round(40 + trend + (seededRandom(seed + 4) - 0.5) * 8),
        world: Math.round(33 + (seededRandom(seed + 5) - 0.5) * 6),
      }
    })
  }

  return history
}

// Generate year history (12 months with seasonal patterns)
export function generateYearHistory(): DetailedHistoryPoint[] {
  const history: DetailedHistoryPoint[] = []
  const today = new Date()
  const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

  // Seasonal patterns - health dips in winter holidays, finance peaks at year end
  const seasonalHealth = [60, 65, 70, 75, 78, 80, 82, 80, 75, 72, 68, 55]
  const seasonalFinance = [70, 72, 75, 78, 80, 82, 85, 83, 88, 90, 92, 95]
  const seasonalSocial = [45, 48, 52, 55, 60, 65, 70, 72, 58, 54, 50, 55]

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today)
    date.setMonth(date.getMonth() - i)
    const monthIdx = date.getMonth()
    const seed = monthIdx + date.getFullYear() * 12

    const avgScore = Math.round(
      (seasonalHealth[monthIdx] * 0.25 +
        seasonalFinance[monthIdx] * 0.20 +
        seasonalSocial[monthIdx] * 0.20 +
        45 * 0.20 + // Career stable
        35 * 0.15)  // World stable
    )

    history.push({
      date: date.toISOString().split('T')[0],
      label: monthLabels[monthIdx],
      value: avgScore + Math.round((seededRandom(seed) - 0.5) * 4),
      dimensions: {
        health: seasonalHealth[monthIdx] + Math.round((seededRandom(seed + 1) - 0.5) * 5),
        finance: seasonalFinance[monthIdx] + Math.round((seededRandom(seed + 2) - 0.5) * 3),
        social: seasonalSocial[monthIdx] + Math.round((seededRandom(seed + 3) - 0.5) * 8),
        career: 45 + Math.round((seededRandom(seed + 4) - 0.5) * 6),
        world: 35 + Math.round((seededRandom(seed + 5) - 0.5) * 4),
      }
    })
  }

  return history
}

// Get history for selected period
export function getHistoryForPeriod(period: 'week' | 'month' | 'year'): DetailedHistoryPoint[] {
  switch (period) {
    case 'week': return generateWeekHistory()
    case 'month': return generateMonthHistory()
    case 'year': return generateYearHistory()
  }
}

// =============================================================================
// AI Trend Analysis
// =============================================================================

export interface TrendAnalysis {
  summary: string
  details: {
    dimension: HarmonyDimension
    trend: 'up' | 'down' | 'stable'
    change: number
    insight: string
  }[]
  recommendations: string[]
  seasonalNote: string
}

export function generateTrendAnalysis(period: 'week' | 'month' | 'year'): TrendAnalysis {
  const history = getHistoryForPeriod(period)
  const first = history[0]
  const last = history[history.length - 1]

  const dimensionNames: { [key in HarmonyDimension]: string } = {
    health: 'Santé',
    finance: 'Finance',
    social: 'Social',
    career: 'Carrière',
    world: 'Exploration'
  }

  const details = (Object.keys(first.dimensions) as HarmonyDimension[]).map(dim => {
    const change = last.dimensions[dim] - first.dimensions[dim]
    const trend: 'up' | 'down' | 'stable' = change > 3 ? 'up' : change < -3 ? 'down' : 'stable'

    let insight = ''
    if (trend === 'up') {
      insight = `+${change}% - Belle progression ! Continue sur cette lancée.`
    } else if (trend === 'down') {
      insight = `${change}% - Baisse détectée. Revois tes habitudes.`
    } else {
      insight = `Stable - Maintien régulier de tes performances.`
    }

    return { dimension: dim, trend, change, insight }
  })

  // Find best and worst trends
  const sorted = [...details].sort((a, b) => b.change - a.change)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]

  // Seasonal note based on current month
  const month = new Date().getMonth()
  let seasonalNote = ''
  if (month === 11 || month === 0) {
    seasonalNote = '🎄 Période des fêtes : attention à la Santé, mais c\'est normal de profiter ! Les Finances progressent souvent en fin d\'année.'
  } else if (month >= 6 && month <= 8) {
    seasonalNote = '☀️ Été : période idéale pour le Social et l\'Exploration. Profite du beau temps !'
  } else if (month >= 3 && month <= 5) {
    seasonalNote = '🌱 Printemps : moment parfait pour relancer tes objectifs Santé et Carrière.'
  } else {
    seasonalNote = '🍂 Automne : période de rentrée, focus sur la Carrière et la remise en forme.'
  }

  const summary = `Sur cette période, ta ${dimensionNames[best.dimension]} a le plus progressé (${best.change > 0 ? '+' : ''}${best.change}%), tandis que ${dimensionNames[worst.dimension]} nécessite plus d'attention (${worst.change > 0 ? '+' : ''}${worst.change}%).`

  const recommendations = [
    worst.trend === 'down'
      ? `🎯 Objectif prioritaire : Consacre 15 min/jour à ta ${dimensionNames[worst.dimension]}`
      : `✨ Conserve le momentum sur ${dimensionNames[best.dimension]}`,
    '📊 Revois tes objectifs chaque dimanche pour rester aligné',
    '🔄 Automatise tes routines pour des progrès constants'
  ]

  return {
    summary,
    details,
    recommendations,
    seasonalNote
  }
}

// =============================================================================
// Expanded AI Report
// =============================================================================

export interface ExpandedAIReport {
  title: string
  overallAssessment: string
  dimensionAnalysis: {
    dimension: HarmonyDimension
    score: number
    status: string
    strengths: string[]
    improvements: string[]
    nextSteps: string
  }[]
  lifeBalance: string
  monthlyFocus: string
  longtermVision: string
}

export function generateExpandedAIReport(): ExpandedAIReport {
  const harmonyData = getHarmonyData()
  const { dimensionScores, alignmentScore } = harmonyData

  const dimensionNames: { [key in HarmonyDimension]: string } = {
    health: 'Santé & Bien-être',
    finance: 'Finance & Patrimoine',
    social: 'Relations & Social',
    career: 'Carrière & Réalisation',
    world: 'Exploration & Découverte'
  }

  const getStatus = (score: number): string => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Bon'
    if (score >= 40) return 'À améliorer'
    return 'Attention requise'
  }

  const dimensionAnalysis = (Object.keys(dimensionScores) as HarmonyDimension[]).map(dim => ({
    dimension: dim,
    score: dimensionScores[dim],
    status: getStatus(dimensionScores[dim]),
    strengths: [
      dim === 'finance' ? 'Épargne régulière et disciplinée' :
        dim === 'health' ? 'Activité physique régulière' :
          dim === 'social' ? 'Cercle proche solide' :
            dim === 'career' ? 'Vision claire de tes objectifs' :
              'Curiosité et ouverture d\'esprit'
    ],
    improvements: [
      dim === 'social' ? 'Augmenter la fréquence des contacts' :
        dim === 'world' ? 'Planifier le prochain voyage' :
          dim === 'career' ? 'Accélérer le projet startup' :
            dim === 'health' ? 'Améliorer le sommeil' :
              'Diversifier les investissements'
    ],
    nextSteps: dim === 'social'
      ? 'Organise un dîner avec 2-3 amis cette semaine'
      : dim === 'world'
        ? 'Réserve un billet pour ton prochain pays'
        : dim === 'career'
          ? 'Termine le prototype de ta startup ce mois'
          : dim === 'health'
            ? 'Installe une routine sommeil à 22h'
            : 'Revois ton allocation d\'actifs'
  }))

  return {
    title: 'Rapport d\'Alignement Complet',
    overallAssessment: alignmentScore >= 70
      ? `Avec un score de ${alignmentScore}%, tu es sur une excellente trajectoire. Ton mode de vie est globalement aligné avec tes aspirations profondes.`
      : alignmentScore >= 50
        ? `Score de ${alignmentScore}% : des bases solides existent mais certaines dimensions méritent plus d'attention pour atteindre l'équilibre.`
        : `Score de ${alignmentScore}% : un effort significatif est nécessaire. Concentre-toi sur 2-3 objectifs clés maximum.`,
    dimensionAnalysis,
    lifeBalance: 'Ton équilibre vie-travail penche actuellement vers la Finance (+++ investissements). Rééquilibre vers le Social et l\'Exploration pour un bien-être durable.',
    monthlyFocus: 'Ce mois, concentre 60% de ton énergie sur le Social (atteindre 10 proches) et 40% sur la Carnère (avancer le projet startup).',
    longtermVision: 'D\'ici 2027, vise : 30 pays visités, 500k€ patrimoine, startup lancée, 10 relations proches. Tu es à 60% de ce chemin.'
  }
}

// =============================================================================
// AI-Powered Harmony Analysis
// =============================================================================

// Cache for AI result
let cachedAIResult: HarmonyAIResponse | null = null
let isLoadingAI = false

/**
 * Get AI-powered Harmony analysis
 * Returns cached result if available, otherwise triggers async calculation
 */
export async function getAIHarmonyAnalysis(forceRefresh = false): Promise<HarmonyAIResponse | null> {
  if (!forceRefresh && cachedAIResult) {
    return cachedAIResult
  }

  if (isLoadingAI) {
    return cachedAIResult
  }

  try {
    isLoadingAI = true
    cachedAIResult = await getAIHarmonyData(ThomasMorel, userGoals, forceRefresh)
    return cachedAIResult
  } catch (error) {
    console.error('Failed to get AI Harmony analysis:', error)
    return null
  } finally {
    isLoadingAI = false
  }
}

/**
 * Get cached AI result without triggering new calculation
 */
export function getCachedAIResult(): HarmonyAIResponse | null {
  return cachedAIResult
}

/**
 * Check if AI analysis is currently loading
 */
export function isAILoading(): boolean {
  return isLoadingAI
}

/**
 * Clear all AI caches
 */
export function clearAllAICaches(): void {
  cachedAIResult = null
  clearAICache()
}

/**
 * Get AI-powered comprehensive harmony data
 * Combines traditional metrics with AI insights
 */
export interface AIEnhancedHarmonyData {
  // Traditional metrics
  objectives: HarmonyObjective[]
  dimensionScores: DimensionScores
  alignmentScore: number
  aiInsight: string
  weights: { [key in HarmonyDimension]: number }
  lastUpdated: string
  // AI-powered additions (v3 format)
  aiAnalysis: HarmonyAIResponse | null
  isAILoading: boolean
  tier: string
  trend: string
  trendDetail: string
  archetype: string
  archetypeDescription: string
  conseils: Array<{
    priority: number
    type: string
    pillar: string
    conseil: string
    impact_attendu: string
    timeline: string
  }>
  warnings: Array<{
    severity: string
    message: string
  }>
  objectiveAdjustments: Array<{
    pillar: string
    current_objective: string
    recommended_adjustment: string
    new_target: string
    justification: string
  }>
}

export async function getAIEnhancedHarmonyData(forceRefresh = false): Promise<AIEnhancedHarmonyData> {
  // Get traditional data
  const traditionalData = getHarmonyData()

  // Get AI analysis (async)
  const aiAnalysis = await getAIHarmonyAnalysis(forceRefresh)

  // Merge data with new v3 format
  return {
    ...traditionalData,
    aiAnalysis,
    isAILoading: isLoadingAI,
    tier: aiAnalysis?.harmony_score?.tier || 'En Construction',
    trend: aiAnalysis?.harmony_score?.trend || 'Convergence',
    trendDetail: aiAnalysis?.harmony_score?.trend_detail || '',
    archetype: aiAnalysis?.archetype?.name || 'Profil en analyse',
    archetypeDescription: aiAnalysis?.archetype?.description || '',
    conseils: aiAnalysis?.conseils || [],
    warnings: aiAnalysis?.warnings || [],
    objectiveAdjustments: aiAnalysis?.objective_adjustments || [],
  }
}

// Re-export AI types for convenience
export type { HarmonyAIResponse }
