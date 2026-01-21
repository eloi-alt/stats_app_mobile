import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { ThomasMorel } from '@/data/mockData'

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
    netWorthEstimate: number | null
    pinnedModule: string
    onboardingCompleted: boolean
    harmonyScore: number
    createdAt: string | null
}

export interface ProfileCompleteness {
    isLoading: boolean
    isAuthenticated: boolean
    isDemo: boolean
    profile: ProfileData | null
    isComplete: boolean
    physioComplete: boolean
    proComplete: boolean
    mapComplete: boolean
    refetch: () => void
}

// Demo profile from mockData
const DEMO_PROFILE: ProfileData = {
    id: ThomasMorel.identity.id,
    firstName: ThomasMorel.identity.firstName,
    lastName: ThomasMorel.identity.lastName,
    username: ThomasMorel.identity.displayName.toLowerCase(),
    avatarUrl: ThomasMorel.identity.avatar,
    gender: null,
    dateOfBirth: ThomasMorel.identity.dateOfBirth,
    nationality: ThomasMorel.identity.nationality,
    height: ThomasMorel.moduleA.measurements[0]?.height || null,
    weight: ThomasMorel.moduleA.measurements[0]?.weight || null,
    activityLevel: 3,
    unitsPreference: ThomasMorel.settings.units,
    homeCountry: ThomasMorel.moduleB.homeBase.country,
    currency: ThomasMorel.settings.currency,
    jobTitle: ThomasMorel.moduleC.career.currentPosition,
    company: ThomasMorel.moduleC.career.company,
    industry: ThomasMorel.moduleC.career.industry,
    experienceYears: ThomasMorel.moduleC.career.totalYearsExperience,
    annualIncome: ThomasMorel.moduleC.revenus.totalNetAnnual,
    savingsRate: ThomasMorel.moduleC.revenus.savingsRate,
    netWorthEstimate: ThomasMorel.moduleC.patrimoine.netWorth,
    pinnedModule: ThomasMorel.identity.pinnedModule,
    onboardingCompleted: true,
    harmonyScore: ThomasMorel.performance.overall,
    createdAt: ThomasMorel.identity.joinedDate
}

export function useProfileData(): ProfileCompleteness {
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isDemo, setIsDemo] = useState(false)

    const fetchProfile = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                // Demo mode
                setProfile(DEMO_PROFILE)
                setIsAuthenticated(false)
                setIsDemo(true)
                setIsLoading(false)
                return
            }

            setIsAuthenticated(true)
            setIsDemo(false)

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (data) {
                const mappedProfile: ProfileData = {
                    id: data.id,
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                    username: data.username || '',
                    avatarUrl: data.avatar_url || '',
                    gender: data.gender,
                    dateOfBirth: data.date_of_birth,
                    nationality: data.nationality,
                    height: data.height,
                    weight: data.weight,
                    activityLevel: data.activity_level,
                    unitsPreference: data.units_preference || 'metric',
                    homeCountry: data.home_country,
                    currency: data.currency || 'EUR',
                    jobTitle: data.job_title,
                    company: data.company,
                    industry: data.industry,
                    experienceYears: data.experience_years,
                    annualIncome: data.annual_income,
                    savingsRate: data.savings_rate,
                    netWorthEstimate: data.net_worth_estimate,
                    pinnedModule: data.pinned_module || 'A',
                    onboardingCompleted: data.onboarding_completed || false,
                    harmonyScore: data.harmony_score || 0,
                    createdAt: data.created_at,
                }
                setProfile(mappedProfile)
            }
        } catch (err) {
            console.error('Error in useProfileData:', err)
            setProfile(DEMO_PROFILE)
            setIsDemo(true)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProfile()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchProfile()
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [fetchProfile])

    // Check completeness
    const physioComplete = profile ? !!(profile.height && profile.weight && profile.dateOfBirth) : false
    const proComplete = profile ? !!(profile.jobTitle && profile.industry && profile.annualIncome) : false
    const mapComplete = profile ? !!(profile.homeCountry && profile.nationality) : false
    const isComplete = physioComplete && proComplete && mapComplete

    return {
        isLoading,
        isAuthenticated,
        isDemo,
        profile,
        isComplete,
        physioComplete,
        proComplete,
        mapComplete,
        refetch: fetchProfile
    }
}
