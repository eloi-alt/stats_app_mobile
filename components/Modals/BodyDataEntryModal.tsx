'use client'

import { useState, useEffect } from 'react'
import BottomSheet from '../UI/BottomSheet'
import { supabase } from '@/utils/supabase/client'

interface BodyDataEntryModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    currentData: {
        dateOfBirth?: string
        gender?: string
        height?: number
        weight?: number
    }
    onSave: (data: any) => void
}

export default function BodyDataEntryModal({
    isOpen,
    onClose,
    userId,
    currentData,
    onSave
}: BodyDataEntryModalProps) {
    // Check if DOB and gender are already set (one-time only)
    const dobAlreadySet = !!currentData.dateOfBirth
    const genderAlreadySet = !!currentData.gender

    const [formData, setFormData] = useState({
        dateOfBirth: currentData.dateOfBirth || '',
        gender: currentData.gender || '',
        height: currentData.height || 170,
        weight: currentData.weight || 70,
    })
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Update form when modal opens
    useEffect(() => {
        setFormData({
            dateOfBirth: currentData.dateOfBirth || '',
            gender: currentData.gender || '',
            height: currentData.height || 170,
            weight: currentData.weight || 70,
        })
        setError(null)
    }, [currentData, isOpen])

    // Calculate IMC/BMI
    const calculateBMI = (): number => {
        if (!formData.height || !formData.weight) return 0
        const heightM = formData.height / 100
        return formData.weight / (heightM * heightM)
    }

    const getBMICategory = (bmi: number): { label: string; color: string } => {
        if (bmi < 18.5) return { label: 'Insuffisant', color: 'var(--accent-sky)' }
        if (bmi < 25) return { label: 'Normal', color: 'var(--accent-sage)' }
        if (bmi < 30) return { label: 'Surpoids', color: 'var(--accent-gold)' }
        return { label: 'Obésité', color: 'var(--accent-rose)' }
    }

    const handleSave = async () => {
        // Validation
        if (!dobAlreadySet && !formData.dateOfBirth) {
            setError('La date de naissance est requise')
            return
        }
        if (!genderAlreadySet && !formData.gender) {
            setError('Le genre est requis')
            return
        }
        if (!formData.height || formData.height < 100 || formData.height > 250) {
            setError('Taille invalide (100-250 cm)')
            return
        }
        if (!formData.weight || formData.weight < 30 || formData.weight > 300) {
            setError('Poids invalide (30-300 kg)')
            return
        }

        setIsSaving(true)
        setError(null)

        try {
            // Build update data - only include DOB and gender if not already set
            const updateData: any = {
                height: formData.height,
                weight: formData.weight,
                updated_at: new Date().toISOString()
            }

            if (!dobAlreadySet && formData.dateOfBirth) {
                updateData.date_of_birth = formData.dateOfBirth
            }
            if (!genderAlreadySet && formData.gender) {
                updateData.gender = formData.gender
            }

            console.log('[BodyDataEntry] Saving:', updateData)

            const { error: updateError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', userId)

            if (updateError) throw updateError

            // Also save to body_measurements for tracking
            const bmi = calculateBMI()
            await supabase
                .from('body_measurements')
                .insert({
                    user_id: userId,
                    date: new Date().toISOString().split('T')[0],
                    weight: formData.weight,
                    height: formData.height,
                    bmi: parseFloat(bmi.toFixed(1))
                })

            console.log('[BodyDataEntry] Saved successfully')
            onSave(formData)
            onClose()
        } catch (err: any) {
            console.error('[BodyDataEntry] Save error:', err)
            setError(err?.message || 'Erreur lors de la sauvegarde')
        } finally {
            setIsSaving(false)
        }
    }

    const bmi = calculateBMI()
    const bmiCategory = getBMICategory(bmi)

    const inputStyle = {
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        color: 'var(--text-primary)'
    }

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} initialHeight="auto" maxHeight="90vh">
            <div className="px-2">
                <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Mes données corporelles
                </h2>

                <div className="space-y-4">
                    {/* DOB - Only editable once */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                                Date de naissance
                            </label>
                            {dobAlreadySet && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(139, 168, 136, 0.1)', color: 'var(--accent-sage)' }}>
                                    <i className="fa-solid fa-lock mr-1" />Défini
                                </span>
                            )}
                        </div>
                        <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                            disabled={dobAlreadySet}
                            className="w-full px-4 py-3 rounded-xl text-sm"
                            style={{
                                ...inputStyle,
                                opacity: dobAlreadySet ? 0.6 : 1,
                                cursor: dobAlreadySet ? 'not-allowed' : 'pointer'
                            }}
                        />
                        {!dobAlreadySet && (
                            <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                ⚠️ Cette information ne peut être modifiée qu'une seule fois
                            </p>
                        )}
                    </div>

                    {/* Gender - Only editable once */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                                Sexe
                            </label>
                            {genderAlreadySet && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(139, 168, 136, 0.1)', color: 'var(--accent-sage)' }}>
                                    <i className="fa-solid fa-lock mr-1" />Défini
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'male', label: 'Homme', icon: 'fa-mars' },
                                { value: 'female', label: 'Femme', icon: 'fa-venus' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => !genderAlreadySet && setFormData(prev => ({ ...prev, gender: option.value }))}
                                    disabled={genderAlreadySet}
                                    className="py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                                    style={{
                                        background: formData.gender === option.value ? 'var(--accent-sage)' : 'var(--bg-secondary)',
                                        color: formData.gender === option.value ? 'white' : 'var(--text-secondary)',
                                        border: formData.gender === option.value ? 'none' : '1px solid var(--border-light)',
                                        opacity: genderAlreadySet ? 0.6 : 1,
                                        cursor: genderAlreadySet ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <i className={`fa-solid ${option.icon}`} />
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        {!genderAlreadySet && (
                            <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                ⚠️ Cette information ne peut être modifiée qu'une seule fois
                            </p>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-1">
                        <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            Modifiable
                        </span>
                        <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
                    </div>

                    {/* Height & Weight - Always editable */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                Taille (cm)
                            </label>
                            <input
                                type="number"
                                value={formData.height}
                                onChange={(e) => setFormData(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 rounded-xl text-sm text-center font-medium"
                                style={inputStyle}
                                min={100}
                                max={250}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                Poids (kg)
                            </label>
                            <input
                                type="number"
                                value={formData.weight}
                                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 rounded-xl text-sm text-center font-medium"
                                style={inputStyle}
                                min={30}
                                max={300}
                            />
                        </div>
                    </div>

                    {/* BMI Preview */}
                    {formData.height > 0 && formData.weight > 0 && (
                        <div className="p-4 rounded-2xl text-center" style={{ background: 'rgba(139, 168, 136, 0.06)' }}>
                            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                                Indice de Masse Corporelle
                            </div>
                            <div className="text-2xl font-light" style={{ color: bmiCategory.color }}>
                                {bmi.toFixed(1)}
                            </div>
                            <div className="text-xs mt-1" style={{ color: bmiCategory.color }}>
                                {bmiCategory.label}
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
