import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import crypto from 'crypto';
import { HarmonyAIResponseSchema } from '@/lib/harmony-schemas';

// MULTILINGUAL SYSTEM PROMPTS
const getSystemPrompt = (lang: string) => {
    switch (lang) {
        case 'en':
            return `You are a Life Alignment Analyst (Data-Driven). Analyze JSON data and generate a strict JSON report.

Rules:
1. Brutal honesty. If score < 50, say "Failure".
2. No calculations. Use provided metrics.
3. JSON format only.

Example Output:
{
  "meta": { "engine": "Harmony_v4", "analysis_date": "2024-01-01", "language": "en", "data_quality": "Complètes" },
  "harmony_score": { "value": 72, "tier": "Aligné", "trend": "Convergence", "trend_detail": "+2 pts" },
  "pillar_scores": {
    "vitality": { "score": 80, "status": "Bon", "key_metric": "Sleep 7.5h", "honest_assessment": "Solid." },
    "sovereignty": { "score": 45, "status": "Préoccupant", "key_metric": "Savings 5%", "honest_assessment": "Mediocre." },
    "connection": { "score": 60, "status": "Moyen", "key_metric": "Friends 3", "honest_assessment": "Stable." },
    "expansion": { "score": 90, "status": "Excellent", "key_metric": "Trips 4", "honest_assessment": "Exceptional." }
  },
  "weekly_trend": { "direction": "Stable", "delta": 0, "insight": "Maintenance." },
  "monthly_trend": { "direction": "Amélioration", "delta": 5, "insight": "Efforts paying off." },
  "objective_adjustments": [],
  "conseils": [{ "priority": 1, "type": "ACTION", "pillar": "sovereignty", "conseil": "Save 10% auto", "impact_attendu": "+5 pts", "timeline": "This month" }],
  "warnings": [],
  "archetype": { "name": "Builder", "description": "Construction focus", "forces": ["Discipline"], "faiblesses": ["Rigidity"] }
}`;
        case 'es':
            return `Eres un Analista de Alineación de Vida (Basado en Datos). Analiza los datos JSON y genera un informe JSON estricto.

Reglas:
1. Honestidad brutal. Si la puntuación < 50, di "Fracaso".
2. Sin cálculos. Utiliza las métricas proporcionadas.
3. Formato JSON únicamente.

Ejemplo Output:
{
  "meta": { "engine": "Harmony_v4", "analysis_date": "2024-01-01", "language": "es", "data_quality": "Complètes" },
  "harmony_score": { "value": 72, "tier": "Aligné", "trend": "Convergence", "trend_detail": "+2 pts" },
  "pillar_scores": {
    "vitality": { "score": 80, "status": "Bon", "key_metric": "Sleep 7.5h", "honest_assessment": "Sólido." },
    "sovereignty": { "score": 45, "status": "Préoccupant", "key_metric": "Savings 5%", "honest_assessment": "Mediocre." },
    "connection": { "score": 60, "status": "Moyen", "key_metric": "Friends 3", "honest_assessment": "Estable." },
    "expansion": { "score": 90, "status": "Excellent", "key_metric": "Trips 4", "honest_assessment": "Excepcional." }
  },
  "weekly_trend": { "direction": "Stable", "delta": 0, "insight": "Mantenimiento." },
  "monthly_trend": { "direction": "Amélioration", "delta": 5, "insight": "Esfuerzos dando frutos." },
  "objective_adjustments": [],
  "conseils": [{ "priority": 1, "type": "ACTION", "pillar": "sovereignty", "conseil": "Ahorra 10% auto", "impact_attendu": "+5 pts", "timeline": "Este mes" }],
  "warnings": [],
  "archetype": { "name": "Constructor", "description": "Enfoque en construcción", "forces": ["Disciplina"], "faiblesses": ["Rigidez"] }
}`;
        default: // 'fr'
            return `Tu es un Analyste de Vie (Data-Driven). Analyse les données JSON et génère un rapport JSON strict.

Règles:
1. Honnêteté brutale. Si score < 50, dis "Échec".
2. Pas de calculs. Utilise les métriques fournies.
3. Format JSON uniquement.

Exemple Output:
{
  "meta": { "engine": "Harmony_v4", "analysis_date": "2024-01-01", "language": "fr", "data_quality": "Complètes" },
  "harmony_score": { "value": 72, "tier": "Aligné", "trend": "Convergence", "trend_detail": "+2 pts" },
  "pillar_scores": {
    "vitality": { "score": 80, "status": "Bon", "key_metric": "Sleep 7.5h", "honest_assessment": "Solide." },
    "sovereignty": { "score": 45, "status": "Préoccupant", "key_metric": "Savings 5%", "honest_assessment": "Médiocre." },
    "connection": { "score": 60, "status": "Moyen", "key_metric": "Friends 3", "honest_assessment": "Stable." },
    "expansion": { "score": 90, "status": "Excellent", "key_metric": "Trips 4", "honest_assessment": "Exceptionnel." }
  },
  "weekly_trend": { "direction": "Stable", "delta": 0, "insight": "Maintenance." },
  "monthly_trend": { "direction": "Amélioration", "delta": 5, "insight": "Efforts payants." },
  "objective_adjustments": [],
  "conseils": [{ "priority": 1, "type": "ACTION", "pillar": "sovereignty", "conseil": "Épargne 10% auto", "impact_attendu": "+5 pts", "timeline": "Ce mois" }],
  "warnings": [],
  "archetype": { "name": "Bâtisseur", "description": "Focus construction", "forces": ["Discipline"], "faiblesses": ["Rigidité"] }
}`;
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        // Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const requestData = await req.json();
        // Extract language from request, default to 'fr'
        const language = requestData.language || 'fr';

        // 1. Calculate Hash (excluding language to check data change)
        // We create a copy without language to keep hash consistent for same data
        const { language: _lang, ...dataForHash } = requestData;
        const dataString = JSON.stringify(dataForHash);
        const currentHash = crypto.createHash('sha256').update(dataString).digest('hex');

        // 2. Check Cache in DB
        const { data: profile, error: dbError } = await supabase
            .from('profiles')
            .select('harmony_data_hash, harmony_analysis_cache, harmony_last_analyzed_at')
            .eq('id', user.id)
            .single();

        const forceRefresh = req.nextUrl.searchParams.get('force') === 'true';

        // Helper to check language match
        const isSameLanguage = profile?.harmony_analysis_cache?.meta?.language === language;

        // CACHE LOGIC:
        // A. Exact Hash Match AND Language Match
        if (!dbError &&
            profile?.harmony_data_hash === currentHash &&
            profile?.harmony_analysis_cache &&
            isSameLanguage &&
            !forceRefresh
        ) {
            console.log(`Harmony AI Cache HIT (Hash Match - ${language})`);
            return NextResponse.json(profile.harmony_analysis_cache);
        }

        // B. Time Window Match AND Language Match
        const lastAnalyzed = profile?.harmony_last_analyzed_at ? new Date(profile.harmony_last_analyzed_at) : null;
        const now = new Date();
        const hrsSinceLastAnalysis = lastAnalyzed ? (now.getTime() - lastAnalyzed.getTime()) / (1000 * 60 * 60) : 999;
        const CACHE_WINDOW_HOURS = 24;

        if (!dbError &&
            hrsSinceLastAnalysis < CACHE_WINDOW_HOURS &&
            profile?.harmony_analysis_cache &&
            isSameLanguage &&
            !forceRefresh
        ) {
            console.log(`Harmony AI Cache HIT (Freshness Window: ${hrsSinceLastAnalysis.toFixed(1)}h old - ${language})`);
            return NextResponse.json({
                ...profile.harmony_analysis_cache,
                _meta: { ...profile.harmony_analysis_cache.meta, cached_cause: 'freshness_window', hours_old: hrsSinceLastAnalysis.toFixed(1) }
            });
        }

        console.log(`Harmony AI Cache MISS (Hash/Time or Language mismatch: ${isSameLanguage ? 'Same Lang' : 'Diff Lang'}) - Calling Groq (${language})...`);

        // 3. Call Groq AI
        const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY });
        const systemPrompt = getSystemPrompt(language);

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(requestData) },
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.2,
            response_format: { type: 'json_object' },
        });

        const rawContent = completion.choices[0]?.message?.content;
        if (!rawContent) throw new Error('No content from AI');

        // 4. Validate & Type Check
        const parsed = JSON.parse(rawContent);
        // Inject language into meta for validation if AI forgot it (though prompt asks for it)
        if (parsed.meta) parsed.meta.language = language;

        const validatedData = HarmonyAIResponseSchema.parse(parsed);

        // 5. Update DB (Cache)
        await supabase
            .from('profiles')
            .update({
                harmony_data_hash: currentHash,
                harmony_last_analyzed_at: new Date().toISOString(),
                harmony_analysis_cache: validatedData, // Store strictly validated JSON
            })
            .eq('id', user.id);

        return NextResponse.json(validatedData);

    } catch (error: any) {
        console.error('Harmony AI Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
