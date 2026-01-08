'use client'

import { useState, useEffect } from 'react'
import BottomSheet from '../UI/BottomSheet'
import { supabase } from '@/utils/supabase/client'

interface CareerDataEntryModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    currentData: {
        jobTitle?: string
        company?: string
        industry?: string
        experienceYears?: number
        annualIncome?: number
        savingsRate?: number
        netWorthEstimate?: number
        currency?: string
    }
    onSave: (data: any) => void
}

const INDUSTRIES = [
    { value: 'tech', label: 'Technologie' },
    { value: 'finance', label: 'Finance & Banque' },
    { value: 'healthcare', label: 'Santé' },
    { value: 'consulting', label: 'Conseil' },
    { value: 'education', label: 'Éducation' },
    { value: 'retail', label: 'Commerce' },
    { value: 'manufacturing', label: 'Industrie' },
    { value: 'real_estate', label: 'Immobilier' },
    { value: 'media', label: 'Média & Communication' },
    { value: 'legal', label: 'Juridique' },
    { value: 'hospitality', label: 'Hôtellerie & Restauration' },
    { value: 'other', label: 'Autre' },
]

const CURRENCIES = [
    { value: 'EUR', label: '€ Euro', symbol: '€' },
    { value: 'USD', label: '$ Dollar US', symbol: '$' },
    { value: 'GBP', label: '£ Livre Sterling', symbol: '£' },
    { value: 'CHF', label: 'CHF Franc Suisse', symbol: 'CHF' },
]

export default function CareerDataEntryModal({
    isOpen,
    onClose,
    userId,
    currentData,
    onSave
}: CareerDataEntryModalProps) {
    const [formData, setFormData] = useState({
        jobTitle: currentData.jobTitle || '',
        company: currentData.company || '',
        industry: currentData.industry || '',
        experienceYears: currentData.experienceYears || 0,
        annualIncome: currentData.annualIncome || 0,
        savingsRate: currentData.savingsRate || 20,
        netWorthEstimate: currentData.netWorthEstimate || 0,
        currency: currentData.currency || 'EUR',
    })
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'career' | 'finance'>('career')

    // Update form when modal opens
    useEffect(() => {
        setFormData({
            jobTitle: currentData.jobTitle || '',
            company: currentData.company || '',
            industry: currentData.industry || '',
            experienceYears: currentData.experienceYears || 0,
            annualIncome: currentData.annualIncome || 0,
            savingsRate: currentData.savingsRate || 20,
            netWorthEstimate: currentData.netWorthEstimate || 0,
            currency: currentData.currency || 'EUR',
        })
        setError(null)
    }, [currentData, isOpen])

    const getCurrencySymbol = () => {
        return CURRENCIES.find(c => c.value === formData.currency)?.symbol || '€'
    }

    const formatMoney = (value: number): string => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}k`
        }
        return value.toString()
    }

    const handleSave = async () => {
        setIsSaving(true)
        setError(null)

        try {
            const updateData = {
                job_title: formData.jobTitle || null,
                company: formData.company || null,
                industry: formData.industry || null,
                experience_years: formData.experienceYears,
                annual_income: formData.annualIncome || null,
                savings_rate: formData.savingsRate,
                net_worth_estimate: formData.netWorthEstimate || null,
                currency: formData.currency,
                updated_at: new Date().toISOString()
            }

            console.log('[CareerDataEntry] Saving:', updateData)

            const { error: updateError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', userId)

            if (updateError) throw updateError

            console.log('[CareerDataEntry] Saved successfully')
            onSave(formData)
            onClose()
        } catch (err: any) {
            console.error('[CareerDataEntry] Save error:', err)
            setError(err?.message || 'Erreur lors de la sauvegarde')
        } finally {
            setIsSaving(false)
        }
    }

    const inputStyle = {
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        color: 'var(--text-primary)'
    }

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} initialHeight="auto" maxHeight="90vh">
            <div className="px-2">
                <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Mon profil professionnel
                </h2>

                {/* Tab selector */}
                <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                    <button
                        onClick={() => setActiveTab('career')}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: activeTab === 'career' ? 'var(--glass-bg)' : 'transparent',
                            color: activeTab === 'career' ? 'var(--text-primary)' : 'var(--text-muted)',
                            boxShadow: activeTab === 'career' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        <i className="fa-solid fa-briefcase mr-2" />
                        Carrière
                    </button>
                    <button
                        onClick={() => setActiveTab('finance')}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: activeTab === 'finance' ? 'var(--glass-bg)' : 'transparent',
                            color: activeTab === 'finance' ? 'var(--text-primary)' : 'var(--text-muted)',
                            boxShadow: activeTab === 'finance' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        <i className="fa-solid fa-coins mr-2" />
                        Finance
                    </button>
                </div>

                {/* Career Tab */}
                {activeTab === 'career' && (
                    <div className="space-y-4">
                        {/* Job Title */}
                        <div>
                            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                Poste / Métier
                            </label>
                            <input
                                type="text"
                                value={formData.jobTitle}
                                onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl text-sm"
                                style={inputStyle}
                                placeholder="Ex: Développeur Full-Stack"
                            />
                        </div>

                        {/* Company */}
                        <div>
                            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                Entreprise
                            </label>
                            <input
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl text-sm"
                                style={inputStyle}
                                placeholder="Ex: Google, Freelance, Start-up..."
                            />
                        </div>

                        {/* Industry */}
                        <div>
                            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                Secteur d'activité
                            </label>
                            <select
                                value={formData.industry}
                                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl text-sm"
                                style={inputStyle}
                            >
                                <option value="">Sélectionner...</option>
                                {INDUSTRIES.map(ind => (
                                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Experience Years */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                                    Années d'expérience
                                </label>
                                <span className="text-sm font-medium" style={{ color: 'var(--accent-gold)' }}>
                                    {formData.experienceYears} ans
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={40}
                                value={formData.experienceYears}
                                onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: parseInt(e.target.value) }))}
                                className="w-full accent-[var(--accent-gold)]"
                            />
                            <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                <span>Débutant</span>
                                <span>Senior</span>
                                <span>Expert</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Finance Tab */}
                {activeTab === 'finance' && (
                    <div className="space-y-4">
                        {/* Currency */}
                        <div>
                            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                Devise
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {CURRENCIES.map(curr => (
                                    <button
                                        key={curr.value}
                                        onClick={() => setFormData(prev => ({ ...prev, currency: curr.value }))}
                                        className="py-2.5 rounded-xl text-sm font-medium transition-all"
                                        style={{
                                            background: formData.currency === curr.value ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                                            color: formData.currency === curr.value ? 'white' : 'var(--text-secondary)',
                                            border: formData.currency === curr.value ? 'none' : '1px solid var(--border-light)'
                                        }}
                                    >
                                        {curr.symbol}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Annual Income */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                                    Revenu annuel brut
                                </label>
                                <span className="text-sm font-medium" style={{ color: 'var(--accent-gold)' }}>
                                    {formatMoney(formData.annualIncome)} {getCurrencySymbol()}
                                </span>
                            </div>
                            <input
                                type="number"
                                value={formData.annualIncome || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, annualIncome: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 rounded-xl text-sm"
                                style={inputStyle}
                                placeholder="Ex: 50000"
                                step={1000}
                            />
                        </div>

                        {/* Savings Rate */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                                    Taux d'épargne
                                </label>
                                <span className="text-sm font-medium" style={{ color: 'var(--accent-sage)' }}>
                                    {formData.savingsRate}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={80}
                                value={formData.savingsRate}
                                onChange={(e) => setFormData(prev => ({ ...prev, savingsRate: parseInt(e.target.value) }))}
                                className="w-full accent-[var(--accent-sage)]"
                            />
                            <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                <span>0%</span>
                                <span>20%</span>
                                <span>40%</span>
                                <span>60%</span>
                                <span>80%</span>
                            </div>
                        </div>

                        {/* Net Worth Estimate */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                                    Patrimoine net estimé
                                </label>
                                <span className="text-sm font-medium" style={{ color: 'var(--accent-gold)' }}>
                                    {formatMoney(formData.netWorthEstimate)} {getCurrencySymbol()}
                                </span>
                            </div>
                            <input
                                type="number"
                                value={formData.netWorthEstimate || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, netWorthEstimate: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 rounded-xl text-sm"
                                style={inputStyle}
                                placeholder="Ex: 100000"
                                step={5000}
                            />
                            <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                <i className="fa-solid fa-lock mr-1" />
                                Données financières privées par défaut
                            </p>
                        </div>

                        {/* Monthly calculations preview */}
                        {formData.annualIncome > 0 && (
                            <div className="p-4 rounded-2xl" style={{ background: 'rgba(201, 169, 98, 0.06)' }}>
                                <div className="text-[10px] uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                                    Aperçu mensuel
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-lg font-light" style={{ color: 'var(--text-primary)' }}>
                                            {formatMoney(Math.round(formData.annualIncome / 12))} {getCurrencySymbol()}
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Revenu/mois</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-light" style={{ color: 'var(--accent-sage)' }}>
                                            {formatMoney(Math.round((formData.annualIncome / 12) * (formData.savingsRate / 100)))} {getCurrencySymbol()}
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Épargne/mois</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
                            background: 'var(--accent-gold)',
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
