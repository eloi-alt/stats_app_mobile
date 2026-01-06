'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'

export interface ProfileData {
    id: string
    firstName: string
    lastName: string
    username: string
    avatarUrl: string
    gender: string | null
    dateOfBirth: string | null
    nationality: string | null
    height: number | null
    weight: number | null
    activityLevel: number | null
    unitsPreference: string
    homeCountry: string | null
    currency: string
    jobTitle: string | null
    company: string | null
    industry: string | null
    experienceYears: number | null
    annualIncome: number | null
    savingsRate: number | null
    pinnedModule: string
    onboardingStep: number
    onboardingCompleted: boolean
}

export interface ProfileCompleteness {
    isLoading: boolean
    isAuthenticated: boolean
    profile: ProfileData | null
    isComplete: boolean
    physioComplete: boolean
    proComplete: boolean
    mapComplete: boolean
    missingPhysioFields: { key: string; label: string }[]
    missingProFields: { key: string; label: string }[]
    missingMapFields: { key: string; label: string }[]
}

const PHYSIO_FIELDS = [
    { key: 'height', label: 'Taille' },
    { key: 'weight', label: 'Poids' },
    { key: 'gender', label: 'Genre' },
    { key: 'dateOfBirth', label: 'Date de naissance' },
    { key: 'activityLevel', label: 'Niveau d\'activité' },
]

const PRO_FIELDS = [
    { key: 'jobTitle', label: 'Métier' },
    { key: 'industry', label: 'Secteur' },
    { key: 'annualIncome', label: 'Revenu annuel' },
    { key: 'currency', label: 'Devise' },
]

const MAP_FIELDS = [
    { key: 'homeCountry', label: 'Pays de résidence' },
    { key: 'nationality', label: 'Nationalité' },
]

export function useProfileData(): ProfileCompleteness {
    const [state, setState] = useState<ProfileCompleteness>({
        isLoading: true,
        isAuthenticated: false,
        profile: null,
        isComplete: false,
        physioComplete: false,
        proComplete: false,
        mapComplete: false,
        missingPhysioFields: [],
        missingProFields: [],
        missingMapFields: [],
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        isAuthenticated: false,
                    }))
                    return
                }

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching profile:', error)
                }

                if (profile) {
                    const mappedProfile: ProfileData = {
                        id: profile.id,
                        firstName: profile.first_name || '',
                        lastName: profile.last_name || '',
                        username: profile.username || '',
                        avatarUrl: profile.avatar_url || '',
                        gender: profile.gender,
                        dateOfBirth: profile.date_of_birth,
                        nationality: profile.nationality,
                        height: profile.height,
                        weight: profile.weight,
                        activityLevel: profile.activity_level,
                        unitsPreference: profile.units_preference || 'metric',
                        homeCountry: profile.home_country,
                        currency: profile.currency || 'EUR',
                        jobTitle: profile.job_title,
                        company: profile.company,
                        industry: profile.industry,
                        experienceYears: profile.experience_years,
                        annualIncome: profile.annual_income,
                        savingsRate: profile.savings_rate,
                        pinnedModule: profile.pinned_module || 'A',
                        onboardingStep: profile.onboarding_step || 0,
                        onboardingCompleted: profile.onboarding_completed || false,
                    }

                    // Check physio completeness
                    const missingPhysio = PHYSIO_FIELDS.filter(field => {
                        const value = mappedProfile[field.key as keyof ProfileData]
                        return value === null || value === undefined || value === ''
                    })

                    // Check pro completeness
                    const missingPro = PRO_FIELDS.filter(field => {
                        const value = mappedProfile[field.key as keyof ProfileData]
                        return value === null || value === undefined || value === ''
                    })

                    // Check map completeness
                    const missingMap = MAP_FIELDS.filter(field => {
                        const value = mappedProfile[field.key as keyof ProfileData]
                        return value === null || value === undefined || value === ''
                    })

                    setState({
                        isLoading: false,
                        isAuthenticated: true,
                        profile: mappedProfile,
                        isComplete: mappedProfile.onboardingCompleted,
                        physioComplete: missingPhysio.length === 0,
                        proComplete: missingPro.length === 0,
                        mapComplete: missingMap.length === 0,
                        missingPhysioFields: missingPhysio,
                        missingProFields: missingPro,
                        missingMapFields: missingMap,
                    })
                } else {
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        isAuthenticated: true,
                        profile: null,
                    }))
                }
            } catch (err) {
                console.error('Error in useProfileData:', err)
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                }))
            }
        }

        fetchProfile()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchProfile()
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return state
}
