import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { ThomasMorel } from '@/data/mockData'
import { useAuth } from '@/contexts/AuthContext'
import { useVisitor } from '@/contexts/VisitorContext'

// Types for health data
export interface SleepRecord {
    id: string
    date: string
    duration: number
    quality: 'poor' | 'fair' | 'good' | 'excellent'
    deep_sleep_minutes?: number
    rem_sleep_minutes?: number
    awakenings?: number
    bedtime?: string
    wake_time?: string
}

export interface SportSession {
    id: string
    date: string
    duration: number
    type: string
    calories_burned?: number
    intensity: 'low' | 'moderate' | 'high' | 'extreme'
}

export interface BodyMeasurement {
    id: string
    date: string
    weight?: number
    body_fat_percentage?: number
    muscle_mass?: number
    vo2_max?: number
    resting_heart_rate?: number
}

export interface NutritionLog {
    id: string
    date: string
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    water_intake?: number
}

export interface HealthData {
    sleepData: SleepRecord[]
    sportSessions: SportSession[]
    bodyMeasurements: BodyMeasurement[]
    nutritionLogs: NutritionLog[]
    isLoading: boolean
    hasAnyData: boolean
    hasSleepData: boolean
    hasSportData: boolean
    hasBodyData: boolean
    hasNutritionData: boolean
    currentWeight: number
    weightGoal: number
    refetch: () => void
    isDemo: boolean
}

// Demo data from mockData
const DEMO_SLEEP_RECORDS: SleepRecord[] = ThomasMorel.moduleA.sleep.map((s, i) => ({
    id: `demo_sleep_${i}`,
    date: s.date,
    duration: s.duration,
    quality: s.quality as SleepRecord['quality'],
    deep_sleep_minutes: s.deepSleepMinutes,
    rem_sleep_minutes: s.remSleepMinutes,
    awakenings: s.awakenings
}))

const DEMO_SPORT_SESSIONS: SportSession[] = ThomasMorel.moduleA.sport.map((s, i) => ({
    id: `demo_sport_${i}`,
    date: s.date,
    duration: s.duration,
    type: s.type,
    calories_burned: s.caloriesBurned,
    intensity: s.intensity as SportSession['intensity']
}))

const DEMO_BODY_MEASUREMENTS: BodyMeasurement[] = ThomasMorel.moduleA.measurements.map((b, i) => ({
    id: `demo_body_${i}`,
    date: b.date,
    weight: b.weight,
    body_fat_percentage: b.bodyFatPercentage,
    muscle_mass: b.muscleMass,
    vo2_max: b.vo2Max,
    resting_heart_rate: b.restingHeartRate
}))

const DEMO_NUTRITION_LOGS: NutritionLog[] = ThomasMorel.moduleA.nutrition.map((n, i) => ({
    id: `demo_nutrition_${i}`,
    date: n.date,
    calories: n.calories,
    protein: n.protein,
    carbs: n.carbs,
    fat: n.fat,
    water_intake: n.waterIntake
}))

export function useHealthData(): HealthData {
    const { session } = useAuth()
    const { isVisitorMode } = useVisitor()

    const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([])
    const [sportSessions, setSportSessions] = useState<SportSession[]>([])
    const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([])
    const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Determine if we should show demo data
    const isDemo = !session || isVisitorMode

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            if (isDemo) {
                // Visitor or no session - use demo data
                console.log('[useHealthData] Loading demo data (Visitor Mode)')
                setSleepRecords(DEMO_SLEEP_RECORDS)
                setSportSessions(DEMO_SPORT_SESSIONS)
                setBodyMeasurements(DEMO_BODY_MEASUREMENTS)
                setNutritionLogs(DEMO_NUTRITION_LOGS)
            } else {
                // Authenticated user - fetch from Supabase
                const user = session?.user
                if (!user) return // Should not happen if isDemo check passed correctly

                console.log('[useHealthData] Fetching data for user:', user.id)

                // Fetch all health data in parallel
                const [sleepRes, sportRes, bodyRes, nutritionRes] = await Promise.all([
                    supabase.from('sleep_records')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('sleep_date', { ascending: false }) // Fixed sort column name
                        .limit(30),
                    supabase.from('sport_sessions')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('session_date', { ascending: false }) // Fixed sort column name
                        .limit(30),
                    supabase.from('body_measurements')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('measurement_date', { ascending: false }) // Fixed sort column name
                        .limit(30),
                    supabase.from('nutrition_logs')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('date', { ascending: false }) // Kept 'date' assuming nutrition table wasn't detailed
                        .limit(30)
                ])

                // Map Supabase data to standard interfaces
                const sleepMapped: SleepRecord[] = (sleepRes.data || []).map((r: any) => ({
                    id: r.id,
                    date: r.sleep_date, // Map snake_case to standard
                    duration: r.duration_hours, // Keep as hours
                    quality: r.quality_score >= 80 ? 'excellent' : r.quality_score >= 70 ? 'good' : r.quality_score >= 50 ? 'fair' : 'poor',
                    deep_sleep_minutes: r.deep_sleep_minutes,
                    rem_sleep_minutes: r.rem_sleep_minutes,
                    awakenings: r.awakenings,
                    bedtime: r.bedtime,
                    wake_time: r.wake_time
                }))

                const sportMapped: SportSession[] = (sportRes.data || []).map((r: any) => ({
                    id: r.id,
                    date: r.session_date,
                    duration: r.duration_minutes,
                    type: r.type,
                    calories_burned: r.calories_burned,
                    intensity: 'moderate' // Default
                }))

                const bodyMapped: BodyMeasurement[] = (bodyRes.data || []).map((r: any) => ({
                    id: r.id,
                    date: r.measurement_date,
                    weight: r.weight,
                    body_fat_percentage: r.body_fat_percentage,
                    muscle_mass: r.muscle_mass,
                    vo2_max: r.vo2_max,
                    resting_heart_rate: r.resting_heart_rate
                }))

                const nutritionMapped: NutritionLog[] = (nutritionRes.data || []).map((r: any) => ({
                    id: r.id,
                    date: r.log_date || r.date,
                    calories: r.calories,
                    protein: r.protein,
                    carbs: r.carbs,
                    fat: r.fat,
                    water_intake: r.water_intake
                }))

                setSleepRecords(sleepMapped)
                setSportSessions(sportMapped)
                setBodyMeasurements(bodyMapped)
                setNutritionLogs(nutritionMapped)

            }

        } catch (err) {
            console.error('Error fetching health data:', err)
            // On error, fall back to demo data safety net
            setSleepRecords(DEMO_SLEEP_RECORDS)
            setSportSessions(DEMO_SPORT_SESSIONS)
            setBodyMeasurements(DEMO_BODY_MEASUREMENTS)
            setNutritionLogs(DEMO_NUTRITION_LOGS)
        } finally {
            setIsLoading(false)
        }
    }, [isDemo, session])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const hasSleepData = sleepRecords.length > 0
    const hasSportData = sportSessions.length > 0
    const hasBodyData = bodyMeasurements.length > 0
    const hasNutritionData = nutritionLogs.length > 0
    const hasAnyData = hasSleepData || hasSportData || hasBodyData || hasNutritionData

    const currentWeight = bodyMeasurements[0]?.weight || 82 // Default or fallback
    const weightGoal = 75 // Mock goal for now

    return {
        sleepData: sleepRecords,
        sportSessions,
        bodyMeasurements,
        nutritionLogs,
        isLoading,
        hasAnyData,
        hasSleepData,
        hasSportData,
        hasBodyData,
        hasNutritionData,
        currentWeight,
        weightGoal,
        refetch: fetchData,
        isDemo
    }
}
