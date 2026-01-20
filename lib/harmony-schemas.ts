import { z } from 'zod';

export const PillarScoreSchema = z.object({
    score: z.number(),
    status: z.enum(['Critique', 'Préoccupant', 'Moyen', 'Bon', 'Excellent']),
    key_metric: z.string(),
    honest_assessment: z.string(),
});

export const TrendAnalysisSchema = z.object({
    direction: z.enum(['Amélioration', 'Stable', 'Dégradation']),
    delta: z.number(),
    insight: z.string(),
});

export const ObjectiveAdjustmentSchema = z.object({
    pillar: z.string(),
    current_objective: z.string(),
    recommended_adjustment: z.enum(['Augmenter', 'Maintenir', 'Réduire']),
    new_target: z.string(),
    justification: z.string(),
});

export const ConseilSchema = z.object({
    priority: z.number(),
    type: z.enum(['ACTION', 'RÉDUCTION_OBJECTIF']),
    pillar: z.string(),
    conseil: z.string(),
    impact_attendu: z.string(),
    timeline: z.string(),
});

export const WarningSchema = z.object({
    severity: z.enum(['Info', 'Attention', 'Alerte', 'Critique']),
    message: z.string(),
});

export const ArchetypeSchema = z.object({
    name: z.string(),
    description: z.string(),
    forces: z.array(z.string()),
    faiblesses: z.array(z.string()),
});

export const HarmonyAIResponseSchema = z.object({
    meta: z.object({
        engine: z.string(),
        analysis_date: z.string(),
        language: z.enum(['en', 'fr', 'es']),
        data_quality: z.enum(['Complètes', 'Partielles', 'Insuffisantes']),
    }),
    harmony_score: z.object({
        value: z.number(),
        tier: z.enum(['Dissonance', 'Frustration', 'En Construction', 'Aligné', 'Souverain']),
        trend: z.enum(['Convergence', 'Divergence']),
        trend_detail: z.string(),
    }),
    pillar_scores: z.object({
        vitality: PillarScoreSchema,
        sovereignty: PillarScoreSchema,
        connection: PillarScoreSchema,
        expansion: PillarScoreSchema,
    }),
    weekly_trend: TrendAnalysisSchema,
    monthly_trend: TrendAnalysisSchema,
    objective_adjustments: z.array(ObjectiveAdjustmentSchema),
    conseils: z.array(ConseilSchema),
    warnings: z.array(WarningSchema),
    archetype: ArchetypeSchema,
});

export type HarmonyAIResponse = z.infer<typeof HarmonyAIResponseSchema>;
