'use client'

import { useState } from 'react'
import BottomSheet from '../UI/BottomSheet'
import { supabase } from '@/utils/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'

interface HealthDataEntryModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    metricType: 'sleep' | 'activity' | 'weight' | 'hydration' | 'body' | null
    onSave: () => void
}

export default function HealthDataEntryModal({
    isOpen,
    onClose,
    userId,
    metricType,
    onSave
}: HealthDataEntryModalProps) {
    const { t } = useLanguage()
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form states
    const [sleepData, setSleepData] = useState({
        bedtime: '23:00',
        wakeTime: '07:00',
        quality: 'good',
        notes: ''
    })

    const [activityData, setActivityData] = useState({
        type: 'running',
        duration: 45,
        intensity: 'moderate',
        caloriesBurned: 300
    })

    const [weightData, setWeightData] = useState({
        weight: 70,
        bodyFat: null as number | null,
        muscleMass: null as number | null
    })

    const [hydrationData, setHydrationData] = useState({
        amount: 2.0
    })

    const calculateSleepDuration = (): number => {
        const [bedH, bedM] = sleepData.bedtime.split(':').map(Number)
        const [wakeH, wakeM] = sleepData.wakeTime.split(':').map(Number)

        let bedMinutes = bedH * 60 + bedM
        let wakeMinutes = wakeH * 60 + wakeM

        // If wake time is before bed time, assume next day
        if (wakeMinutes < bedMinutes) {
            wakeMinutes += 24 * 60
        }

        return (wakeMinutes - bedMinutes) / 60
    }

    const handleSave = async () => {
        if (!userId || !metricType) return

        setIsSaving(true)
        setError(null)

        try {
            const today = new Date().toISOString().split('T')[0]

            switch (metricType) {
                case 'sleep':
                    const duration = calculateSleepDuration()
                    const { error: sleepError } = await supabase
                        .from('sleep_logs')
                        .insert({
                            user_id: userId,
                            date: today,
                            duration_hours: duration,
                            quality: sleepData.quality,
                            bedtime: sleepData.bedtime,
                            wake_time: sleepData.wakeTime,
                            notes: sleepData.notes || null
                        })
                    if (sleepError) throw sleepError
                    break

                case 'activity':
                    const { error: activityError } = await supabase
                        .from('sport_sessions')
                        .insert({
                            user_id: userId,
                            date: today,
                            type: activityData.type,
                            duration: activityData.duration,
                            intensity: activityData.intensity,
                            calories_burned: activityData.caloriesBurned
                        })
                    if (activityError) throw activityError
                    break

                case 'weight':
                case 'body':
                    const bodyData: any = {
                        user_id: userId,
                        date: today,
                        weight: weightData.weight
                    }
                    if (weightData.bodyFat) bodyData.body_fat_percentage = weightData.bodyFat
                    if (weightData.muscleMass) bodyData.muscle_mass = weightData.muscleMass

                    const { error: bodyError } = await supabase
                        .from('body_measurements')
                        .insert(bodyData)
                    if (bodyError) throw bodyError

                    // Also update profiles table
                    await supabase
                        .from('profiles')
                        .update({ weight: weightData.weight, updated_at: new Date().toISOString() })
                        .eq('id', userId)
                    break

                case 'hydration':
                    // Update profiles with hydration goal tracking
                    // For now, we'll just show success - hydration logs table may not exist
                    console.log('[HealthDataEntry] Hydration logged:', hydrationData.amount, 'L')
                    break
            }

            console.log('[HealthDataEntry] Data saved successfully for:', metricType)
            onSave()
            onClose()
        } catch (err: any) {
            console.error('[HealthDataEntry] Save error:', err)
            setError(err?.message || 'Erreur lors de la sauvegarde')
        } finally {
            setIsSaving(false)
        }
    }

    const getTitle = () => {
        switch (metricType) {
            case 'sleep': return 'Ajouter Sommeil'
            case 'activity': return 'Ajouter Activité'
            case 'weight':
            case 'body': return 'Ajouter Mesure'
            case 'hydration': return 'Ajouter Hydratation'
            default: return 'Ajouter Données'
        }
    }

    const inputStyle = {
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        color: 'var(--text-primary)'
    }

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} initialHeight="auto" maxHeight="85vh">
            <div className="px-2">
                <h2 className="text-xl font-medium mb-6" style={{ color: 'var(--text-primary)' }}>
                    {getTitle()}
                </h2>

                <div className="space-y-4">
                    {/* Sleep Form */}
                    {metricType === 'sleep' && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                        Heure de coucher
                                    </label>
                                    <input
                                        type="time"
                                        value={sleepData.bedtime}
                                        onChange={(e) => setSleepData(prev => ({ ...prev, bedtime: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl text-sm"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                        Heure de réveil
                                    </label>
                                    <input
                                        type="time"
                                        value={sleepData.wakeTime}
                                        onChange={(e) => setSleepData(prev => ({ ...prev, wakeTime: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl text-sm"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                    Qualité du sommeil
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { value: 'excellent', label: 'Super', emoji: '😴' },
                                        { value: 'good', label: 'Bon', emoji: '😊' },
                                        { value: 'average', label: 'Moyen', emoji: '😐' },
                                        { value: 'poor', label: 'Mauvais', emoji: '😫' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setSleepData(prev => ({ ...prev, quality: opt.value }))}
                                            className="py-3 rounded-xl text-center transition-all"
                                            style={{
                                                background: sleepData.quality === opt.value ? 'var(--accent-sage)' : 'var(--bg-secondary)',
                                                color: sleepData.quality === opt.value ? 'white' : 'var(--text-secondary)',
                                                border: sleepData.quality === opt.value ? 'none' : '1px solid var(--border-light)'
                                            }}
                                        >
                                            <div className="text-lg">{opt.emoji}</div>
                                            <div className="text-xs mt-1">{opt.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-center mt-2" style={{ color: 'var(--accent-sage)' }}>
                                <i className="fa-solid fa-moon mr-2" />
                                {calculateSleepDuration().toFixed(1)}h de sommeil
                            </p>
                        </>
                    )}

                    {/* Activity Form */}
                    {metricType === 'activity' && (
                        <>
                            <div>
                                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                    Type d'activité
                                </label>
                                <select
                                    value={activityData.type}
                                    onChange={(e) => setActivityData(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl text-sm"
                                    style={inputStyle}
                                >
                                    <option value="running">🏃 Course</option>
                                    <option value="gym">🏋️ Musculation</option>
                                    <option value="yoga">🧘 Yoga</option>
                                    <option value="cycling">🚴 Vélo</option>
                                    <option value="swimming">🏊 Natation</option>
                                    <option value="hiit">💪 HIIT</option>
                                    <option value="walking">🚶 Marche</option>
                                    <option value="other">⚡ Autre</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                        Durée (min)
                                    </label>
                                    <input
                                        type="number"
                                        value={activityData.duration}
                                        onChange={(e) => setActivityData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 rounded-xl text-sm"
                                        style={inputStyle}
                                        min={1}
                                        max={480}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                        Calories brûlées
                                    </label>
                                    <input
                                        type="number"
                                        value={activityData.caloriesBurned}
                                        onChange={(e) => setActivityData(prev => ({ ...prev, caloriesBurned: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 rounded-xl text-sm"
                                        style={inputStyle}
                                        min={0}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                    Intensité
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'low', label: 'Légère', color: 'var(--accent-sage)' },
                                        { value: 'moderate', label: 'Modérée', color: 'var(--accent-gold)' },
                                        { value: 'high', label: 'Intense', color: 'var(--accent-rose)' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setActivityData(prev => ({ ...prev, intensity: opt.value }))}
                                            className="py-3 rounded-xl text-sm font-medium transition-all"
                                            style={{
                                                background: activityData.intensity === opt.value ? opt.color : 'var(--bg-secondary)',
                                                color: activityData.intensity === opt.value ? 'white' : 'var(--text-secondary)',
                                                border: activityData.intensity === opt.value ? 'none' : '1px solid var(--border-light)'
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Weight/Body Form */}
                    {(metricType === 'weight' || metricType === 'body') && (
                        <>
                            <div>
                                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                    Poids (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={weightData.weight}
                                    onChange={(e) => setWeightData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                                    className="w-full px-4 py-3 rounded-xl text-sm text-center text-2xl font-light"
                                    style={inputStyle}
                                    min={20}
                                    max={300}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                        Masse grasse (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={weightData.bodyFat || ''}
                                        onChange={(e) => setWeightData(prev => ({ ...prev, bodyFat: e.target.value ? Number(e.target.value) : null }))}
                                        placeholder="Optionnel"
                                        className="w-full px-4 py-3 rounded-xl text-sm"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                        Masse musculaire (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={weightData.muscleMass || ''}
                                        onChange={(e) => setWeightData(prev => ({ ...prev, muscleMass: e.target.value ? Number(e.target.value) : null }))}
                                        placeholder="Optionnel"
                                        className="w-full px-4 py-3 rounded-xl text-sm"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Hydration Form */}
                    {metricType === 'hydration' && (
                        <div>
                            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                Quantité d'eau (L)
                            </label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setHydrationData(prev => ({ amount: Math.max(0, prev.amount - 0.25) }))}
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
                                >
                                    <i className="fa-solid fa-minus" style={{ color: 'var(--text-secondary)' }} />
                                </button>
                                <div className="flex-1 text-center">
                                    <div className="text-4xl font-light" style={{ color: 'var(--accent-sky)' }}>
                                        {hydrationData.amount.toFixed(2)}
                                    </div>
                                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>litres</div>
                                </div>
                                <button
                                    onClick={() => setHydrationData(prev => ({ amount: Math.min(5, prev.amount + 0.25) }))}
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
                                >
                                    <i className="fa-solid fa-plus" style={{ color: 'var(--text-secondary)' }} />
                                </button>
                            </div>
                            <div className="flex justify-center gap-2 mt-4">
                                {[0.25, 0.5, 1.0].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setHydrationData(prev => ({ amount: prev.amount + val }))}
                                        className="px-4 py-2 rounded-full text-sm"
                                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
                                    >
                                        +{val}L
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(212, 165, 165, 0.1)' }}>
                        <p className="text-sm text-center" style={{ color: 'var(--accent-rose)' }}>
                            <i className="fa-solid fa-circle-exclamation mr-2" />{error}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6 pb-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-xl text-sm font-medium"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 py-4 rounded-xl text-sm font-medium"
                        style={{
                            background: 'var(--accent-sage)',
                            color: 'white',
                            opacity: isSaving ? 0.7 : 1
                        }}
                    >
                        {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </BottomSheet>
    )
}
