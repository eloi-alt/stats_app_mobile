'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/utils/supabase/client'
import { ThomasMorel } from '@/data/mockData'

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
    sleepRecords: SleepRecord[]
    sportSessions: SportSession[]
    bodyMeasurements: BodyMeasurement[]
    nutritionLogs: NutritionLog[]
    isLoading: boolean
    hasAnyData: boolean
    hasSleepData: boolean
    hasSportData: boolean
    hasBodyData: boolean
    hasNutritionData: boolean
    refetch: () => void
    isDemo: boolean
}

// Calculate weekly/daily aggregates
function calculateMetrics(
    sleepRecords: SleepRecord[],
    sportSessions: SportSession[],
    nutritionLogs: NutritionLog[]
) {
    const today = new Date().toISOString().split('T')[0]
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Filter for last 7 days
    const recentSleep = sleepRecords.filter(r => r.date >= lastWeek)
    const recentSport = sportSessions.filter(s => s.date >= lastWeek)
    const recentNutrition = nutritionLogs.filter(n => n.date >= lastWeek)

    // Average sleep (hours)
    const avgSleep = recentSleep.length > 0
        ? recentSleep.reduce((sum, r) => sum + r.duration, 0) / recentSleep.length / 60
        : null

    // Total activity minutes this week
    const totalActivity = recentSport.reduce((sum, s) => sum + s.duration, 0)

    // Average water intake
    const avgWater = recentNutrition.length > 0
        ? recentNutrition.reduce((sum, n) => sum + (n.water_intake || 0), 0) / recentNutrition.length
        : null

    return {
        avgSleep,
        totalActivity,
        avgWater,
        sleepDataDays: recentSleep.length,
        sportDataDays: recentSport.length
    }
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
    const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([])
    const [sportSessions, setSportSessions] = useState<SportSession[]>([])
    const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([])
    const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDemo, setIsDemo] = useState(false)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                // No authenticated user - use demo data
                setSleepRecords(DEMO_SLEEP_RECORDS)
                setSportSessions(DEMO_SPORT_SESSIONS)
                setBodyMeasurements(DEMO_BODY_MEASUREMENTS)
                setNutritionLogs(DEMO_NUTRITION_LOGS)
                setIsDemo(true)
                setIsLoading(false)
                return
            }

            // Authenticated user - fetch from Supabase
            setIsDemo(false)
            // Fetch all health data in parallel
            const [sleepRes, sportRes, bodyRes, nutritionRes] = await Promise.all([
                supabase.from('sleep_records')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false })
                    .limit(30),
                supabase.from('sport_sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false })
                    .limit(30),
                supabase.from('body_measurements')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false })
                    .limit(30),
                supabase.from('nutrition_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false })
                    .limit(30)
            ])

            if (sleepRes.data) setSleepRecords(sleepRes.data)
            if (sportRes.data) setSportSessions(sportRes.data)
            if (bodyRes.data) setBodyMeasurements(bodyRes.data)
            if (nutritionRes.data) setNutritionLogs(nutritionRes.data)
        } catch (err) {
            console.error('Error fetching health data:', err)
            // On error, fall back to demo data
            setSleepRecords(DEMO_SLEEP_RECORDS)
            setSportSessions(DEMO_SPORT_SESSIONS)
            setBodyMeasurements(DEMO_BODY_MEASUREMENTS)
            setNutritionLogs(DEMO_NUTRITION_LOGS)
            setIsDemo(true)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const hasSleepData = sleepRecords.length > 0
    const hasSportData = sportSessions.length > 0
    const hasBodyData = bodyMeasurements.length > 0
    const hasNutritionData = nutritionLogs.length > 0
    const hasAnyData = hasSleepData || hasSportData || hasBodyData || hasNutritionData

    return {
        sleepRecords,
        sportSessions,
        bodyMeasurements,
        nutritionLogs,
        isLoading,
        hasAnyData,
        hasSleepData,
        hasSportData,
        hasBodyData,
        hasNutritionData,
        refetch: fetchData,
        isDemo
    }
}

// Export metrics calculator for use in views
export { calculateMetrics }
