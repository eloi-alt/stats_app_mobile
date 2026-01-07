'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import OnboardingSlide from '@/components/Onboarding/OnboardingSlide'
import AvatarUploader from '@/components/Onboarding/AvatarUploader'
import CountrySelector from '@/components/Onboarding/CountrySelector'

const TOTAL_STEPS = 4

interface ProfileData {
    firstName: string
    lastName: string
    avatarUrl: string
    homeCountry: string
}

// Auto-generate username from first and last name
const generateUsername = (first: string, last: string): string => {
    const clean = (s: string) => s.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z]/g, '');
    const cleanFirst = clean(first);
    const cleanLast = clean(last);
    if (!cleanFirst || !cleanLast) return '';
    return `${cleanFirst}.${cleanLast}`;
}

function OnboardingContent() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [userId, setUserId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const [profileData, setProfileData] = useState<ProfileData>({
        firstName: '',
        lastName: '',
        avatarUrl: '',
        homeCountry: 'FR',
    })
    const [avatarUploaded, setAvatarUploaded] = useState(false)
    // Use ref to ensure saveProfile always gets latest data
    const profileDataRef = useRef(profileData)
    profileDataRef.current = profileData

    // Get current user on mount
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUserId(user.id)

            // Load existing profile data if any
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profile) {
                setProfileData(prev => ({
                    ...prev,
                    firstName: profile.first_name || '',
                    lastName: profile.last_name || '',
                    avatarUrl: profile.avatar_url || '',
                    homeCountry: profile.home_country || 'FR',
                }))
                // Resume from saved step
                if (profile.onboarding_step && profile.onboarding_step > 0 && profile.onboarding_step <= TOTAL_STEPS) {
                    setCurrentStep(profile.onboarding_step)
                }
            }
        }
        getUser()
    }, [router])

    // Save profile data
    const saveProfile = async (step: number, completed: boolean = false) => {
        if (!userId) return

        setIsLoading(true)
        try {
            // Use ref to get the latest data (fixes stale closure issue)
            const data = profileDataRef.current
            console.log('[Onboarding] Saving profile:', {
                step,
                completed,
                avatarUrl: data.avatarUrl,
                firstName: data.firstName,
                lastName: data.lastName
            })

            // Auto-generate username when completing onboarding
            const username = completed
                ? generateUsername(data.firstName, data.lastName)
                : null;

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    first_name: data.firstName,
                    last_name: data.lastName,
                    full_name: `${data.firstName} ${data.lastName}`.trim(),
                    username: username,
                    avatar_url: data.avatarUrl,
                    home_country: data.homeCountry,
                    onboarding_step: step,
                    onboarding_completed: completed,
                    updated_at: new Date().toISOString()
                })

            if (error) {
                console.error('[Onboarding] Save profile error:', error)
                throw error
            }
            console.log('[Onboarding] Profile saved successfully with avatar:', data.avatarUrl)
        } catch (err) {
            console.error('Error saving profile:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleNext = async () => {
        if (currentStep >= TOTAL_STEPS) {
            await saveProfile(TOTAL_STEPS, true)
            router.push('/')
        } else {
            await saveProfile(currentStep + 1)
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSkip = async () => {
        await saveProfile(currentStep, false)
        router.push('/')
    }

    const updateData = (key: keyof ProfileData, value: any) => {
        setProfileData(prev => ({ ...prev, [key]: value }))
    }

    const canProceed = () => {
        switch (currentStep) {
            case 1: return profileData.firstName.length >= 2
            case 2: return profileData.lastName.length >= 2
            case 3: return true // Avatar is optional
            case 4: return true // Home country has default
            default: return true
        }
    }

    const renderSlide = () => {
        const commonProps = {
            currentStep,
            totalSteps: TOTAL_STEPS,
            onNext: handleNext,
            onBack: handleBack,
            onSkip: handleSkip,
            canProceed: canProceed(),
            isLoading,
            showBack: currentStep > 1
        }

        switch (currentStep) {
            case 1:
                return (
                    <OnboardingSlide
                        title="Comment vous appelez-vous ?"
                        subtitle="Entrez votre prénom"
                        icon="fa-user"
                        {...commonProps}
                    >
                        <input
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) => updateData('firstName', e.target.value)}
                            placeholder="Prénom"
                            className="onboarding-input"
                            autoFocus
                        />
                    </OnboardingSlide>
                )

            case 2:
                return (
                    <OnboardingSlide
                        title="Quel est votre nom ?"
                        subtitle="Entrez votre nom de famille"
                        icon="fa-id-card"
                        {...commonProps}
                    >
                        <input
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) => updateData('lastName', e.target.value)}
                            placeholder="Nom"
                            className="onboarding-input"
                            autoFocus
                        />
                    </OnboardingSlide>
                )

            case 3:
                return (
                    <OnboardingSlide
                        title="Photo de profil"
                        subtitle="Ajoutez une photo pour personnaliser votre compte"
                        icon="fa-camera"
                        {...commonProps}
                    >
                        {userId && (
                            <AvatarUploader
                                userId={userId}
                                currentAvatarUrl={profileData.avatarUrl}
                                onUploadComplete={(url) => {
                                    console.log('[Onboarding] Avatar uploaded, URL:', url)
                                    setProfileData(prev => ({ ...prev, avatarUrl: url }))
                                    setAvatarUploaded(true)
                                }}
                                onSkip={() => handleNext()}
                            />
                        )}
                        {avatarUploaded && (
                            <p style={{ color: 'var(--accent-gold)', marginTop: '12px', fontSize: '14px' }}>
                                <i className="fa-solid fa-check" style={{ marginRight: '6px' }} />
                                Photo enregistrée !
                            </p>
                        )}
                    </OnboardingSlide>
                )

            case 4:
                return (
                    <OnboardingSlide
                        title="Votre pays de résidence"
                        subtitle="Où habitez-vous actuellement ?"
                        icon="fa-house"
                        nextLabel="Terminer"
                        {...commonProps}
                    >
                        <CountrySelector
                            value={profileData.homeCountry}
                            onChange={(code) => updateData('homeCountry', code)}
                            placeholder="Sélectionner votre pays"
                        />
                    </OnboardingSlide>
                )

            default:
                return null
        }
    }

    return (
        <div className="onboarding-container">
            <style jsx global>{`
        .onboarding-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          background: var(--bg-primary);
          margin: 0;
          padding: 0;
          z-index: 100;
        }

        .onboarding-input {
          width: 100%;
          padding: 16px;
          border: 2px solid var(--border-light);
          border-radius: 16px;
          font-size: 18px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          text-align: center;
          transition: all 0.2s;
        }

        .onboarding-input:focus {
          outline: none;
          border-color: var(--accent-gold);
          box-shadow: 0 0 0 4px rgba(201, 169, 98, 0.1);
        }
      `}</style>

            {renderSlide()}
        </div>
    )
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <OnboardingContent />
        </Suspense>
    )
}
